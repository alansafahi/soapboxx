import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useToast } from "../hooks/use-toast";
import { apiRequest } from "../lib/queryClient";
import SmartScriptureTextarea from "../components/SmartScriptureTextarea";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Church, 
  Heart, 
  Camera, 
  Save,
  Calendar,
  Trophy,
  Flame,
  BookOpen,
  Users,
  MessageSquare,
  Target,
  Edit2,
  CheckCircle,
  Shield,
  Globe,
  Sparkles
} from "lucide-react";
import { format } from "date-fns";
import EnhancedProfileEditor from "../components/EnhancedProfileEditor";
import { SMSVerificationModal } from "../components/SMSVerificationModal";
import ProfileVerificationRing from "../components/ProfileVerificationRing";

interface UserProfile {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  role?: string | null;
  profileImageUrl: string | null;
  coverPhotoUrl: string | null;
  bio: string | null;
  mobileNumber: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  country: string | null;
  
  // Enhanced Profile Fields
  ageRange: string | null;
  gender: string | null;
  churchAffiliation: string | null;
  denomination: string | null;
  spiritualStage: string | null;
  favoriteScriptures: string[] | null;
  ministryInterests: string[] | null;
  volunteerInterest: boolean | null;
  smallGroup: string | null;
  socialLinks: Record<string, string> | null;
  publicSharing: boolean | null;
  spiritualScore: number | null;
  prayerPrompt: string | null;
  growthGoals: string[] | null;
  currentReadingPlan: string | null;
  languagePreference: string | null;
  customLanguage: string | null;
  spiritualGifts: string[] | null;
  
  // Verification Status
  emailVerified: boolean | null;
  phoneVerified: boolean | null;
  
  // Privacy Settings
  showBioPublicly: boolean | null;
  showChurchAffiliation: boolean | null;
  shareWithGroup: boolean | null;
  showAgeRange: boolean | null;
  showLocation: boolean | null;
  showMobile: boolean | null;
  showGender: boolean | null;
  showDenomination: boolean | null;
  showSpiritualGifts: boolean | null;
  
  // Legacy
  interests: string[] | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

interface UserStats {
  prayerCount: number;
  discussionCount: number;
  attendanceCount: number;
  connectionCount: number;
  inspirationsRead: number;
  prayersOffered: number;
}

const DENOMINATIONS = [
  "Catholic",
  "Protestant", 
  "Baptist",
  "Methodist",
  "Presbyterian",
  "Lutheran",
  "Pentecostal",
  "Episcopalian",
  "Orthodox",
  "Non-denominational",
  "Other"
];

const AGE_RANGES = [
  "18-24",
  "25-34", 
  "35-44",
  "45-54",
  "55-64",
  "65+"
];

const SPIRITUAL_STAGES = [
  "exploring_faith",
  "new_believer", 
  "active_disciple",
  "leader",
  "elder"
];

const MINISTRY_INTERESTS = [
  "Youth Ministry",
  "Worship & Music",
  "Missions & Outreach",
  "Media & Technology", 
  "Teaching & Education",
  "Children's Ministry",
  "Prayer Ministry",
  "Community Service",
  "Counseling & Care",
  "Evangelism",
  "Leadership",
  "Small Groups"
];

const GROWTH_GOALS = [
  "Read Bible Daily",
  "Pray More Consistently", 
  "Find a Mentor",
  "Join a Small Group",
  "Serve in Ministry",
  "Share Faith More",
  "Attend Church Regularly",
  "Study Theology",
  "Practice Spiritual Disciplines"
];

const SPIRITUAL_INTERESTS = [
  "Bible Study",
  "Prayer",
  "Worship",
  "Community Service",
  "Youth Ministry",
  "Missions",
  "Music Ministry",
  "Teaching",
  "Counseling",
  "Evangelism",
  "Social Justice",
  "Meditation",
  "Discipleship",
  "Leadership"
];

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<Partial<UserProfile>>({});
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [localProfileUpdates, setLocalProfileUpdates] = useState<Partial<UserProfile>>({});
  const [showSMSVerification, setShowSMSVerification] = useState(false);

  // Fetch user profile data
  const { data: profile, isLoading: profileLoading } = useQuery<UserProfile>({
    queryKey: ["/api/auth/user"],
  });



  // Fetch user stats
  const { data: stats } = useQuery<UserStats>({
    queryKey: ["/api/users/stats"],
  });

  // Fetch user achievements
  const { data: achievements } = useQuery({
    queryKey: ["/api/users/achievements"],
  });

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<UserProfile>) => {
      const response = await apiRequest("PUT", "/api/users/profile", data);
      return response;
    },
    onMutate: async (updatedData) => {
      // Immediate local state update for instant UI feedback
      setLocalProfileUpdates(prev => ({ ...prev, ...updatedData }));
      
      // Also update React Query cache
      await queryClient.cancelQueries({ queryKey: ["/api/auth/user"] });
      const previousProfile = queryClient.getQueryData(["/api/auth/user"]);
      
      queryClient.setQueryData(["/api/auth/user"], (oldUser: any) => {
        if (!oldUser) return oldUser;
        return { ...oldUser, ...updatedData };
      });
      
      return { previousProfile };
    },
    onError: (error, _, context) => {
      // Rollback local state on error
      setLocalProfileUpdates({});
      if (context?.previousProfile) {
        queryClient.setQueryData(["/api/auth/user"], context.previousProfile);
      }
      
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
    onSuccess: async (data) => {
      // Clear local updates on successful save
      setLocalProfileUpdates({});
      
      // Update the cache with the returned user data
      try {
        queryClient.setQueryData(["/api/auth/user"], (oldData: any) => {
          if (!oldData) return oldData;
          return { ...oldData, ...data.user };
        });
      } catch (error) {

      }
      
      toast({
        title: "Profile Updated", 
        description: "Your profile has been successfully updated.",
      });
      
      setIsEditing(false);
    },
  });

  // Image upload handler
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // For now, we'll use a simple base64 conversion
    // In production, you'd upload to a proper file storage service
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      setProfileData(prev => ({ ...prev, profileImageUrl: imageUrl }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = () => {
    const updatedData = {
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      email: profileData.email,
      bio: profileData.bio,
      mobileNumber: profileData.mobileNumber,
      address: profileData.address,
      city: profileData.city,
      state: profileData.state,
      zipCode: profileData.zipCode,
      country: profileData.country,
      denomination: profileData.denomination,
      profileImageUrl: profileData.profileImageUrl,
      interests: selectedInterests,
    };
    updateProfileMutation.mutate(updatedData);
  };

  const handleEditToggle = () => {
    if (!isEditing) {
      // Initialize form data when entering edit mode
      setProfileData({
        firstName: profile?.firstName || "",
        lastName: profile?.lastName || "",
        email: profile?.email || "",
        bio: profile?.bio || "",
        mobileNumber: profile?.mobileNumber || "",
        address: profile?.address || "",
        city: profile?.city || "",
        state: profile?.state || "",
        zipCode: profile?.zipCode || "",
        country: profile?.country || "United States",
        denomination: profile?.denomination || "",
        profileImageUrl: profile?.profileImageUrl || "",
      });
      setSelectedInterests(profile?.interests || []);
    }
    setIsEditing(!isEditing);
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  // Merge server data with local updates for immediate UI feedback
  const displayProfile = { ...profile, ...localProfileUpdates };
  
  const displayName = displayProfile?.firstName && displayProfile?.lastName 
    ? `${displayProfile.firstName} ${displayProfile.lastName}`
    : displayProfile?.firstName || displayProfile?.email || "Anonymous User";

  const userInitials = displayProfile?.firstName && displayProfile?.lastName
    ? `${displayProfile.firstName[0]}${displayProfile.lastName[0]}`
    : displayProfile?.firstName?.[0] || displayProfile?.email?.[0] || "A";





  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
          <div className="flex gap-2">
            {isEditing && (
              <Button
                onClick={handleSaveProfile}
                disabled={updateProfileMutation.isPending}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            )}
            <Button
              onClick={handleEditToggle}
              variant={isEditing ? "outline" : "default"}
              className="flex items-center gap-2"
            >
              {isEditing ? (
                <>
                  Cancel
                </>
              ) : (
                <>
                  <Edit2 className="h-4 w-4" />
                  Edit Profile
                </>
              )}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            {/* Verification Status Card */}
            {(profile?.emailVerified !== true || profile?.phoneVerified !== true) && (
              <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-medium text-orange-800 dark:text-orange-200 mb-3">
                        Complete Your Account Verification
                      </h3>
                      <div className="text-sm text-orange-700 dark:text-orange-300">
                        {profile?.emailVerified !== true && profile?.phoneVerified !== true && "Please verify your email and mobile number"}
                        {profile?.emailVerified === true && profile?.phoneVerified !== true && "Please verify your mobile number"}
                        {profile?.emailVerified !== true && profile?.phoneVerified === true && "Please verify your email address"}
                      </div>
                      {profile?.phoneVerified !== true && (
                        <p className="text-sm text-orange-600 dark:text-orange-300 mt-3">
                          Add your mobile number to get prayer alerts, event reminders, and secure access.
                        </p>
                      )}
                    </div>
                    {profile?.phoneVerified !== true && (
                      <Button 
                        size="sm" 
                        className="bg-orange-600 hover:bg-orange-700"
                        onClick={() => setShowSMSVerification(true)}
                      >
                        Verify Mobile
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {!isEditing ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    <div className="relative">
                      {profile?.profileImageUrl ? (
                        <div className="relative w-32 h-32">
                          <ProfileVerificationRing
                            emailVerified={profile?.emailVerified === true}
                            phoneVerified={profile?.phoneVerified === true}
                            size="lg"
                            className="w-full h-full"
                          >
                            <div className="h-32 w-32 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                              <img 
                                src={profile.profileImageUrl} 
                                alt={displayName}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          </ProfileVerificationRing>
                        </div>
                      ) : (
                        <div className="relative w-32 h-32">
                          <ProfileVerificationRing
                            emailVerified={profile?.emailVerified === true}
                            phoneVerified={profile?.phoneVerified === true}
                            size="lg"
                            className="w-full h-full"
                          >
                            <div className="h-32 w-32 rounded-full bg-purple-600 flex items-center justify-center">
                              <span className="text-2xl font-semibold text-white">{userInitials}</span>
                            </div>
                          </ProfileVerificationRing>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{displayName}</h2>


                        </div>
                        <div className="space-y-1 mt-1">
                          <div className="text-muted-foreground flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <span>{profile?.email || "No email provided"}</span>
                            {profile?.emailVerified === true && (
                              <Badge variant="outline" className="text-xs text-green-600 border-green-200 bg-green-50 dark:bg-green-900/20">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          
                          {profile?.mobileNumber && (
                            <div className="text-muted-foreground flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              <span>{profile.mobileNumber}</span>
                              {profile?.phoneVerified === true && (
                                <Badge variant="outline" className="text-xs text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                                  <Shield className="w-3 h-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                              {!profile?.phoneVerified && profile?.mobileNumber && (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="text-xs text-orange-600 border-orange-200 hover:bg-orange-50"
                                  onClick={() => setShowSMSVerification(true)}
                                >
                                  Verify
                                </Button>
                              )}
                            </div>
                          )}

                          {profile?.city && profile?.state && profile?.showLocation && (
                            <div className="text-muted-foreground flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>{profile.city}, {profile.state} {profile.zipCode}</span>
                            </div>
                          )}


                        </div>
                      </div>

                      {profile?.bio && (
                        <p className="text-gray-600 dark:text-gray-300">{profile.bio}</p>
                      )}

                      {/* Spiritual Profile Section */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {profile?.ageRange && profile?.showAgeRange && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Age Range:</span>
                            <Badge variant="secondary">{profile.ageRange}</Badge>
                          </div>
                        )}
                        
                        {profile?.gender && profile?.showGender && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Gender:</span>
                            <Badge variant="secondary">
                              {profile.gender === 'prefer_not_to_say' ? 'Prefer not to say' : 
                               profile.gender === 'male' ? 'Male' : 'Female'}
                            </Badge>
                          </div>
                        )}

                        {profile?.spiritualStage && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Faith Journey:</span>
                            <Badge variant="outline" className="text-purple-600 border-purple-200">
                              {profile.spiritualStage.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                            </Badge>
                          </div>
                        )}

                        {profile?.denomination && profile?.showDenomination && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Denomination:</span>
                            <Badge variant="outline">{profile.denomination}</Badge>
                          </div>
                        )}
                      </div>

                      {/* Church Affiliation Section */}
                      {profile?.churchAffiliation && profile?.showChurchAffiliation && (
                        <div className="border-t pt-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Church className="h-4 w-4 text-purple-600" />
                            <span className="text-sm font-medium">Church/Community:</span>
                          </div>
                          <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                            <p className="font-medium text-purple-800 dark:text-purple-200">
                              {profile.churchAffiliation}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Language Preference */}
                      {profile?.languagePreference && (
                        <div className="border-t pt-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Globe className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium">Language Preference:</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-blue-600 border-blue-200">
                              {profile.languagePreference === "Other" && profile.customLanguage ? 
                                `🌐 ${profile.customLanguage}` : 
                                profile.languagePreference === "English" ? "🇺🇸 English" :
                                profile.languagePreference === "Spanish" ? "🇪🇸 Español" :
                                profile.languagePreference === "French" ? "🇫🇷 Français" :
                                profile.languagePreference === "Portuguese" ? "🇵🇹 Português" :
                                profile.languagePreference === "German" ? "🇩🇪 Deutsch" :
                                profile.languagePreference === "Italian" ? "🇮🇹 Italiano" :
                                profile.languagePreference === "Dutch" ? "🇳🇱 Nederlands" :
                                profile.languagePreference === "Russian" ? "🇷🇺 Русский" :
                                profile.languagePreference === "Chinese" ? "🇨🇳 中文" :
                                profile.languagePreference === "Korean" ? "🇰🇷 한국어" :
                                profile.languagePreference === "Japanese" ? "🇯🇵 日本語" :
                                profile.languagePreference === "Farsi" ? "🇮🇷 فارسی" :
                                profile.languagePreference === "Armenian" ? "🇦🇲 Հայերեն" :
                                profile.languagePreference === "Arabic" ? "🇸🇦 العربية" :
                                profile.languagePreference === "Hebrew" ? "🇮🇱 עברית" :
                                profile.languagePreference === "Hindi" ? "🇮🇳 हिन्दी" :
                                profile.languagePreference
                              }
                            </Badge>
                          </div>
                        </div>
                      )}

                      {/* Spiritual Gifts */}
                      {profile?.spiritualGifts && profile.spiritualGifts.length > 0 && (
                        <div className="border-t pt-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Sparkles className="h-4 w-4 text-yellow-600" />
                              <span className="text-sm font-medium">Spiritual Gifts:</span>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => window.location.href = '/spiritual-assessment-results'}
                              className="text-xs px-3 py-1 h-7 text-purple-600 border-purple-200 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                            >
                              View Full Results
                            </Button>
                          </div>
                          <div className="space-y-3">
                            <div className="flex flex-wrap gap-2">
                              {profile.spiritualGifts.slice(0, 5).map((gift, index) => (
                                <Badge key={index} variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
                                  {gift}
                                </Badge>
                              ))}
                              {profile.spiritualGifts.length > 5 && (
                                <Badge variant="outline" className="text-gray-500 border-gray-200">
                                  +{profile.spiritualGifts.length - 5} more
                                </Badge>
                              )}
                            </div>
                            {/* View Full Results Button */}
                            <div className="pt-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => window.location.href = '/spiritual-assessment-results'}
                                className="text-sm px-4 py-2 text-purple-600 border-purple-200 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                              >
                                <BookOpen className="w-4 h-4 mr-2" />
                                View Full Assessment Results
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Growth Goals */}
                      {profile?.growthGoals && profile.growthGoals.length > 0 && (
                        <div className="border-t pt-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Target className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium">Growth Goals:</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {profile.growthGoals.slice(0, 4).map((goal, index) => (
                              <Badge key={index} variant="outline" className="text-green-600 border-green-200 bg-green-50 dark:bg-green-900/20">
                                {goal}
                              </Badge>
                            ))}
                            {profile.growthGoals.length > 4 && (
                              <Badge variant="outline" className="text-gray-500 border-gray-200">
                                +{profile.growthGoals.length - 4} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Ministry Interests */}
                      {profile?.ministryInterests && profile.ministryInterests.length > 0 && (
                        <div className="border-t pt-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Heart className="h-4 w-4 text-purple-600" />
                            <span className="text-sm font-medium">Ministry Interests:</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {profile.ministryInterests.map((interest, index) => (
                              <Badge key={index} variant="outline" className="text-purple-600 border-purple-200 bg-purple-50 dark:bg-purple-900/20">
                                {interest}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Favorite Scriptures */}
                      {profile?.favoriteScriptures && profile.favoriteScriptures.length > 0 && (
                        <div className="border-t pt-4">
                          <div className="flex items-center gap-2 mb-2">
                            <BookOpen className="h-4 w-4 text-indigo-600" />
                            <span className="text-sm font-medium">Favorite Scriptures:</span>
                          </div>
                          <div className="space-y-2">
                            {profile.favoriteScriptures.slice(0, 3).map((scripture, index) => (
                              <div key={index} className="bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded text-sm">
                                <span className="font-medium text-indigo-700 dark:text-indigo-300">
                                  {typeof scripture === 'string' ? scripture : scripture.reference || 'Scripture'}
                                </span>
                                {typeof scripture === 'object' && scripture.text && (
                                  <p className="text-indigo-600 dark:text-indigo-400 mt-1 text-xs italic">
                                    "{scripture.text}"
                                  </p>
                                )}
                              </div>
                            ))}
                            {profile.favoriteScriptures.length > 3 && (
                              <p className="text-xs text-gray-500">+{profile.favoriteScriptures.length - 3} more verses</p>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-sm text-muted-foreground border-t pt-4">
                        <Calendar className="h-4 w-4" />
                        Member since {profile?.createdAt ? format(new Date(profile.createdAt), "MMMM yyyy") : "Unknown"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Button
                    onClick={() => setIsEditing(false)}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    Cancel
                  </Button>
                </div>
                <EnhancedProfileEditor 
                  profile={profile || {} as any}
                  onSave={(updates) => {
                    updateProfileMutation.mutate(updates);
                    // Don't exit edit mode here - let the mutation's onSuccess handle it
                  }}
                  isLoading={updateProfileMutation.isPending}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Heart className="h-8 w-8 text-red-500" />
                    <div>
                      <p className="text-2xl font-bold">{stats?.prayersOffered || 0}</p>
                      <p className="text-sm text-muted-foreground">Prayers Offered</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold">{stats?.discussionCount || 0}</p>
                      <p className="text-sm text-muted-foreground">Discussions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">{stats?.attendanceCount || 0}</p>
                      <p className="text-sm text-muted-foreground">Events Attended</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Users className="h-8 w-8 text-purple-500" />
                    <div>
                      <p className="text-2xl font-bold">{stats?.connectionCount || 0}</p>
                      <p className="text-sm text-muted-foreground">Connections</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-8 w-8 text-orange-500" />
                    <div>
                      <p className="text-2xl font-bold">{stats?.inspirationsRead || 0}</p>
                      <p className="text-sm text-muted-foreground">Inspirations Read</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Target className="h-8 w-8 text-indigo-500" />
                    <div>
                      <p className="text-2xl font-bold">{stats?.prayerCount || 0}</p>
                      <p className="text-sm text-muted-foreground">Prayer Requests</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Achievements
                </CardTitle>
                <CardDescription>
                  Your spiritual journey milestones and community contributions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {achievements && Array.isArray(achievements) && achievements.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {achievements.map((achievement: any) => (
                      <div
                        key={achievement.id}
                        className="flex items-center space-x-3 p-4 rounded-lg border bg-card"
                      >
                        <Trophy className="h-8 w-8 text-yellow-500" />
                        <div>
                          <p className="font-medium">{achievement.achievementType}</p>
                          <p className="text-sm text-muted-foreground">
                            Level {achievement.achievementLevel}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No achievements yet</p>
                    <p className="text-sm">Start engaging with the community to earn achievements!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* SMS Verification Modal */}
      <SMSVerificationModal 
        isOpen={showSMSVerification}
        onClose={() => setShowSMSVerification(false)}
        phoneNumber={profile?.mobileNumber || ''}
        onVerificationComplete={() => {
          queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
          setShowSMSVerification(false);
          toast({
            title: "Phone Verified!",
            description: "Your phone number has been successfully verified.",
          });
        }}
        mode="profile"
      />
    </div>
  );
}