import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import SmartScriptureTextarea from "@/components/SmartScriptureTextarea";
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
  Book,
  Users,
  MessageSquare,
  Target,
  Edit2
} from "lucide-react";
import { format } from "date-fns";

interface UserProfile {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  bio: string | null;
  mobileNumber: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  country: string | null;
  denomination: string | null;
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
      console.log('Sending profile update:', data);
      const response = await apiRequest("/api/users/profile", {
        method: "PUT",
        body: data,
      });
      console.log('Profile update response:', response);
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
      
      console.error('Profile update error:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
    onSuccess: async (data) => {
      console.log('Profile update response:', data);
      
      // Clear local updates on successful save
      setLocalProfileUpdates({});
      
      // Gentle cache refresh without invalidating auth state
      try {
        console.log('🔄 Updating profile cache...');
        
        // Update the cache data directly instead of invalidating
        queryClient.setQueryData(["/api/auth/user"], (oldData: any) => {
          if (!oldData) return oldData;
          return { ...oldData, ...data.user };
        });
        
        // Refresh only if needed, without forcing re-authentication
        setTimeout(async () => {
          await queryClient.refetchQueries({ 
            queryKey: ["/api/auth/user"],
            exact: true 
          });
        }, 500);
        
        console.log('✅ Profile cache updated successfully');
      } catch (error) {
        console.error('Cache update error:', error);
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
            {/* Profile Header Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                  {/* Profile Picture */}
                  <div className="relative">
                    {(profile?.profileImageUrl || profileData.profileImageUrl) ? (
                      <div className="h-32 w-32 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                        <img 
                          src={isEditing ? (profileData.profileImageUrl || profile?.profileImageUrl || '') : (profile?.profileImageUrl || '')} 
                          alt={displayName}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-32 w-32 rounded-full bg-purple-600 flex items-center justify-center">
                        <span className="text-2xl font-semibold text-white">{userInitials}</span>
                      </div>
                    )}
                    {isEditing && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute bottom-0 right-0 rounded-full p-2"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </div>

                  {/* Basic Info */}
                  <div className="flex-1 space-y-4">
                    {isEditing ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            value={profileData.firstName || ""}
                            onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                            placeholder="Enter your first name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            value={profileData.lastName || ""}
                            onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                            placeholder="Enter your last name"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="bio">Bio</Label>
                          <Textarea
                            id="bio"
                            value={profileData.bio || ""}
                            onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                            placeholder="Tell us about yourself and your faith journey..."
                            rows={3}
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{displayName}</h2>
                          <p className="text-muted-foreground flex items-center gap-2 mt-1">
                            <Mail className="h-4 w-4" />
                            {profile?.email || "No email provided"}
                          </p>
                        </div>
                        {displayProfile?.bio && (
                          <p className="text-gray-600 dark:text-gray-300">{displayProfile.bio}</p>
                        )}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          Member since {profile?.createdAt ? format(new Date(profile.createdAt), "MMMM yyyy") : "Unknown"}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email || ""}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="your.email@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="mobileNumber">Mobile Number</Label>
                      <Input
                        id="mobileNumber"
                        type="tel"
                        value={profileData.mobileNumber || ""}
                        onChange={(e) => setProfileData(prev => ({ ...prev, mobileNumber: e.target.value }))}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{displayProfile?.email || "Not provided"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{displayProfile?.mobileNumber || "Not provided"}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="address">Street Address</Label>
                      <Input
                        id="address"
                        value={profileData.address || ""}
                        onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="123 Main Street"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={profileData.city || ""}
                          onChange={(e) => setProfileData(prev => ({ ...prev, city: e.target.value }))}
                          placeholder="Your City"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          value={profileData.state || ""}
                          onChange={(e) => setProfileData(prev => ({ ...prev, state: e.target.value }))}
                          placeholder="CA"
                        />
                      </div>
                      <div>
                        <Label htmlFor="zipCode">ZIP Code</Label>
                        <Input
                          id="zipCode"
                          value={profileData.zipCode || ""}
                          onChange={(e) => setProfileData(prev => ({ ...prev, zipCode: e.target.value }))}
                          placeholder="12345"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    {displayProfile?.address || displayProfile?.city ? (
                      <p className="text-gray-600 dark:text-gray-300">
                        {displayProfile?.address && `${displayProfile.address}, `}
                        {displayProfile?.city && `${displayProfile.city}, `}
                        {displayProfile?.state && `${displayProfile.state} `}
                        {displayProfile?.zipCode}
                      </p>
                    ) : (
                      <p className="text-muted-foreground">No address provided</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Faith Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Church className="h-5 w-5" />
                  Faith & Interests
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="denomination">Denomination</Label>
                      <Select 
                        value={profileData.denomination || ""} 
                        onValueChange={(value) => setProfileData(prev => ({ ...prev, denomination: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your denomination" />
                        </SelectTrigger>
                        <SelectContent>
                          {DENOMINATIONS.map((denom) => (
                            <SelectItem key={denom} value={denom}>{denom}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Spiritual Interests</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {SPIRITUAL_INTERESTS.map((interest) => (
                          <Badge
                            key={interest}
                            variant={selectedInterests.includes(interest) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => toggleInterest(interest)}
                          >
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Denomination</p>
                      <p className="text-gray-900 dark:text-white">
                        {displayProfile?.denomination || "Not specified"}
                      </p>
                    </div>
                    {displayProfile?.interests && displayProfile.interests.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Spiritual Interests</p>
                        <div className="flex flex-wrap gap-2">
                          {displayProfile.interests.map((interest) => (
                            <Badge key={interest} variant="secondary">
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {isEditing && (
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveProfile}
                  disabled={updateProfileMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {updateProfileMutation.isPending ? "Saving..." : "Save Profile"}
                </Button>
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
                    <Book className="h-8 w-8 text-orange-500" />
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
    </div>
  );
}