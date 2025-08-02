import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { Switch } from "./ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  User, 
  Heart, 
  Target, 
  Brain, 
  Shield, 
  Church,
  Users,
  BookOpen,
  MessageSquare,
  Camera,
  Globe
} from "lucide-react";
import ChurchLookupModal from "./ChurchLookupModal";

interface UserProfile {
  id: string;
  firstName: string | null;
  lastName: string | null;
  bio: string | null;
  coverPhotoUrl: string | null;
  mobileNumber: string | null;
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
  prayerPrompt: string | null;
  growthGoals: string[] | null;
  currentReadingPlan: string | null;
  showBioPublicly: boolean | null;
  showChurchAffiliation: boolean | null;
  shareWithGroup: boolean | null;
  showAgeRange: boolean | null;
  showLocation: boolean | null;
  zipCode: string | null;
  city: string | null;
  state: string | null;
}

interface EnhancedProfileEditorProps {
  profile: UserProfile;
  onSave: (updates: Partial<UserProfile>) => void;
  isLoading: boolean;
}

const AGE_RANGES = ["18-24", "25-34", "35-44", "45-54", "55-64", "65+"];
const SPIRITUAL_STAGES = [
  { value: "exploring_faith", label: "Exploring Faith" },
  { value: "new_believer", label: "New Believer" },
  { value: "active_disciple", label: "Active Disciple" },
  { value: "leader", label: "Leader" },
  { value: "elder", label: "Elder" }
];
const MINISTRY_INTERESTS = [
  "Youth Ministry", "Worship & Music", "Missions & Outreach", "Media & Technology",
  "Teaching & Education", "Children's Ministry", "Prayer Ministry", "Community Service",
  "Counseling & Care", "Evangelism", "Leadership", "Small Groups"
];
const GROWTH_GOALS = [
  "Read Bible Daily", "Pray More Consistently", "Find a Mentor", "Join a Small Group",
  "Serve in Ministry", "Share Faith More", "Attend Church Regularly", "Study Theology",
  "Practice Spiritual Disciplines"
];

export default function EnhancedProfileEditor({ profile, onSave, isLoading }: EnhancedProfileEditorProps) {
  const [formData, setFormData] = useState<Partial<UserProfile>>(profile);
  const [selectedMinistries, setSelectedMinistries] = useState<string[]>(profile.ministryInterests || []);
  const [selectedGoals, setSelectedGoals] = useState<string[]>(profile.growthGoals || []);
  const [favoriteVerses, setFavoriteVerses] = useState<string[]>(profile.favoriteScriptures || []);
  const [verseTexts, setVerseTexts] = useState<{ [key: number]: { text: string; reference: string; version: string } }>({});
  const [showChurchLookup, setShowChurchLookup] = useState(false);

  const handleSave = () => {
    onSave({
      ...formData,
      ministryInterests: selectedMinistries,
      growthGoals: selectedGoals,
      favoriteScriptures: favoriteVerses
    });
  };

  const addFavoriteVerse = () => {
    setFavoriteVerses([...favoriteVerses, ""]);
  };

  const updateFavoriteVerse = (index: number, value: string) => {
    const updated = [...favoriteVerses];
    updated[index] = value;
    setFavoriteVerses(updated);
  };

  const removeFavoriteVerse = (index: number) => {
    setFavoriteVerses(favoriteVerses.filter((_, i) => i !== index));
    // Remove corresponding verse text
    const newVerseTexts = { ...verseTexts };
    delete newVerseTexts[index];
    setVerseTexts(newVerseTexts);
  };

  const [verseLoadingStates, setVerseLoadingStates] = useState<{ [key: number]: boolean }>({});
  const [verseTimeouts, setVerseTimeouts] = useState<{ [key: number]: NodeJS.Timeout }>({});

  const lookupVerse = async (verse: string, index: number) => {
    const trimmedVerse = verse.trim();
    
    // Clear any existing timeout for this index
    if (verseTimeouts[index]) {
      clearTimeout(verseTimeouts[index]);
    }

    if (!trimmedVerse) {
      // Clear verse text if input is empty
      setVerseTexts(prev => {
        const updated = { ...prev };
        delete updated[index];
        return updated;
      });
      return;
    }

    // Set loading state
    setVerseLoadingStates(prev => ({ ...prev, [index]: true }));

    try {
      const response = await fetch('/api/bible/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: trimmedVerse })
      });
      
      if (response.ok) {
        const verseData = await response.json();
        if (verseData.text) {
          setVerseTexts(prev => ({
            ...prev,
            [index]: {
              text: verseData.text,
              reference: verseData.reference,
              version: verseData.version || 'NIV'
            }
          }));
        }
      } else {
        // Clear verse text if not found
        setVerseTexts(prev => {
          const updated = { ...prev };
          delete updated[index];
          return updated;
        });
      }
    } catch (error) {
      console.error('Failed to lookup verse:', error);
      // Clear verse text on error
      setVerseTexts(prev => {
        const updated = { ...prev };
        delete updated[index];
        return updated;
      });
    } finally {
      setVerseLoadingStates(prev => ({ ...prev, [index]: false }));
    }
  };

  const handleVerseChange = (index: number, value: string) => {
    updateFavoriteVerse(index, value);
    
    // Clear any existing timeout
    if (verseTimeouts[index]) {
      clearTimeout(verseTimeouts[index]);
    }

    // Set a new timeout to lookup the verse after user stops typing
    const timeout = setTimeout(() => {
      lookupVerse(value, index);
    }, 800); // Wait 800ms after user stops typing

    setVerseTimeouts(prev => ({
      ...prev,
      [index]: timeout
    }));
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Basic
          </TabsTrigger>
          <TabsTrigger value="spiritual" className="flex items-center gap-2">
            <Church className="w-4 h-4" />
            Spiritual
          </TabsTrigger>
          <TabsTrigger value="engagement" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Community
          </TabsTrigger>
          <TabsTrigger value="growth" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Growth
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Privacy
          </TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Your core profile details - help others get to know you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName || ""}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName || ""}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Bio / Spiritual Testimony</Label>
                <Textarea
                  id="bio"
                  placeholder="Share a bit about your faith journey..."
                  value={formData.bio || ""}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ageRange">Age Range (Optional)</Label>
                  <Select 
                    value={formData.ageRange || ""} 
                    onValueChange={(value) => setFormData({...formData, ageRange: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select age range" />
                    </SelectTrigger>
                    <SelectContent>
                      {AGE_RANGES.map(range => (
                        <SelectItem key={range} value={range}>{range}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="gender">Gender (Optional)</Label>
                  <Select 
                    value={formData.gender || ""} 
                    onValueChange={(value) => setFormData({...formData, gender: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="mobileNumber">Mobile Number (Optional)</Label>
                <div className="flex gap-2">
                  <Input
                    id="mobileNumber"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={formData.mobileNumber || ""}
                    onChange={(e) => setFormData({...formData, mobileNumber: e.target.value})}
                    className="flex-1"
                  />
                  {formData.mobileNumber && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {/* SMS verification logic will be added */}}
                    >
                      Verify
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Get prayer alerts, event reminders, and secure access
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city || ""}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state || ""}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode">Zip Code</Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode || ""}
                    onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Spiritual Profile Tab */}
        <TabsContent value="spiritual" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Church className="w-5 h-5" />
                Spiritual Profile
              </CardTitle>
              <CardDescription>
                Share your faith background and spiritual journey
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="churchAffiliation">Church/Community</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      id="churchAffiliation"
                      placeholder="e.g., Grace Community Church - Downtown Campus"
                      value={formData.churchAffiliation || ""}
                      onChange={(e) => setFormData({...formData, churchAffiliation: e.target.value})}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowChurchLookup(true)}
                    >
                      Find Churches
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter your church name or use "Find Churches" to discover local congregations
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="spiritualStage">Where are you in your faith journey?</Label>
                  <Select 
                    value={formData.spiritualStage || ""} 
                    onValueChange={(value) => setFormData({...formData, spiritualStage: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {SPIRITUAL_STAGES.map(stage => (
                        <SelectItem key={stage.value} value={stage.value}>{stage.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="smallGroup">Small Group</Label>
                  <Input
                    id="smallGroup"
                    placeholder="e.g., Young Adults Life Group"
                    value={formData.smallGroup || ""}
                    onChange={(e) => setFormData({...formData, smallGroup: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label>Favorite Bible Verses</Label>
                <div className="space-y-2">
                  {favoriteVerses.map((verse, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex gap-2">
                        <div className="relative">
                          <Input
                            placeholder="e.g., John 3:16 or Jeremiah 29:11"
                            value={verse}
                            onChange={(e) => handleVerseChange(index, e.target.value)}
                            className="pr-10"
                          />
                          {verseLoadingStates[index] && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            </div>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeFavoriteVerse(index)}
                        >
                          Remove
                        </Button>
                      </div>
                      {verseTexts[index] && (
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700 shadow-sm">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center">
                              <BookOpen className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-blue-900 dark:text-blue-100 leading-relaxed mb-2">
                                "{verseTexts[index].text}"
                              </p>
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                                  — {verseTexts[index].reference}
                                </p>
                                <Badge variant="outline" className="text-xs text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-600">
                                  {verseTexts[index].version}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addFavoriteVerse}
                  >
                    Add Favorite Verse
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Community Engagement Tab */}
        <TabsContent value="engagement" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Community Engagement
              </CardTitle>
              <CardDescription>
                Share your ministry interests and volunteer availability
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Ministry Interests</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {MINISTRY_INTERESTS.map(interest => (
                    <div key={interest} className="flex items-center space-x-2">
                      <Checkbox
                        id={interest}
                        checked={selectedMinistries.includes(interest)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedMinistries([...selectedMinistries, interest]);
                          } else {
                            setSelectedMinistries(selectedMinistries.filter(i => i !== interest));
                          }
                        }}
                      />
                      <Label htmlFor={interest} className="text-sm">{interest}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="volunteerInterest"
                  checked={formData.volunteerInterest || false}
                  onCheckedChange={(checked) => setFormData({...formData, volunteerInterest: checked})}
                />
                <Label htmlFor="volunteerInterest">I'm interested in volunteering opportunities</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Growth & Goals Tab */}
        <TabsContent value="growth" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Spiritual Growth & AI Features
              </CardTitle>
              <CardDescription>
                Set goals and let AI help personalize your experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Personal Growth Goals</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  {GROWTH_GOALS.map(goal => (
                    <div key={goal} className="flex items-center space-x-2">
                      <Checkbox
                        id={goal}
                        checked={selectedGoals.includes(goal)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedGoals([...selectedGoals, goal]);
                          } else {
                            setSelectedGoals(selectedGoals.filter(g => g !== goal));
                          }
                        }}
                      />
                      <Label htmlFor={goal} className="text-sm">{goal}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="currentReadingPlan">Current Reading Plan</Label>
                <Input
                  id="currentReadingPlan"
                  placeholder="e.g., Bible in a Year, Daily Devotional"
                  value={formData.currentReadingPlan || ""}
                  onChange={(e) => setFormData({...formData, currentReadingPlan: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="prayerPrompt">Current Prayer Request</Label>
                <Textarea
                  id="prayerPrompt"
                  placeholder="How can our community pray for you?"
                  value={formData.prayerPrompt || ""}
                  onChange={(e) => setFormData({...formData, prayerPrompt: e.target.value})}
                  className="min-h-[80px]"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="publicSharing"
                  checked={formData.publicSharing || false}
                  onCheckedChange={(checked) => setFormData({...formData, publicSharing: checked})}
                />
                <Label htmlFor="publicSharing">Allow public sharing of my SOAP journal entries</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Settings Tab */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Privacy Settings
              </CardTitle>
              <CardDescription>
                Control what information is visible to others
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="showBioPublicly" className="font-medium">Show bio publicly</Label>
                    <p className="text-sm text-gray-600">Let others see your bio and testimony</p>
                  </div>
                  <Switch
                    id="showBioPublicly"
                    checked={formData.showBioPublicly ?? true}
                    onCheckedChange={(checked) => setFormData({...formData, showBioPublicly: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="showChurchAffiliation" className="font-medium">Show church affiliation</Label>
                    <p className="text-sm text-gray-600">Display your church or community</p>
                  </div>
                  <Switch
                    id="showChurchAffiliation"
                    checked={formData.showChurchAffiliation ?? true}
                    onCheckedChange={(checked) => setFormData({...formData, showChurchAffiliation: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="shareWithGroup" className="font-medium">Share with small group</Label>
                    <p className="text-sm text-gray-600">Allow small group members to see more details</p>
                  </div>
                  <Switch
                    id="shareWithGroup"
                    checked={formData.shareWithGroup ?? true}
                    onCheckedChange={(checked) => setFormData({...formData, shareWithGroup: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="showAgeRange" className="font-medium">Show age range</Label>
                    <p className="text-sm text-gray-600">Display your age range publicly</p>
                  </div>
                  <Switch
                    id="showAgeRange"
                    checked={formData.showAgeRange ?? false}
                    onCheckedChange={(checked) => setFormData({...formData, showAgeRange: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="showLocation" className="font-medium">Show location</Label>
                    <p className="text-sm text-gray-600">Display your city and state</p>
                  </div>
                  <Switch
                    id="showLocation"
                    checked={formData.showLocation ?? false}
                    onCheckedChange={(checked) => setFormData({...formData, showLocation: checked})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2 pt-6 border-t">
        <Button 
          onClick={handleSave}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <Heart className="w-4 h-4" />
          {isLoading ? "Saving..." : "Save Profile"}
        </Button>
      </div>

      {/* Church Lookup Modal */}
      <ChurchLookupModal
        open={showChurchLookup}
        onOpenChange={setShowChurchLookup}
        onSelectChurch={(church) => {
          setFormData(prev => ({
            ...prev,
            churchAffiliation: church.name,
            denomination: church.denomination
          }));
        }}
      />
    </div>
  );
}