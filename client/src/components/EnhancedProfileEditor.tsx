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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Progress } from "./ui/progress";
import { Form, FormControl, FormField, FormItem, FormLabel } from "./ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
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
  Globe,
  Sparkles,
  ExternalLink,
  Plus,
  Minus
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
  spiritualGifts: string[] | null;
  spiritualProfile: {
    profileLabel?: string;
    profileDescription?: string;
    servingStyle?: string;
    topGifts?: string[];
    averageScore?: number;
    engagementLevel?: string;
  } | null;
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
      favoriteScriptures: favoriteVerses,
      spiritualGifts: formData.spiritualGifts,
      spiritualProfile: formData.spiritualProfile
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
  const [verseValidation, setVerseValidation] = useState<{ [key: number]: { isValid: boolean; message: string; suggestion?: string } }>({});
  const [showGiftsAssessment, setShowGiftsAssessment] = useState(false);

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
      console.log('Looking up verse:', trimmedVerse);
      const response = await fetch('/api/bible/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: trimmedVerse })
      });
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const verseData = await response.json();
        console.log('Verse data received:', verseData);
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

  const validateVerseReference = (reference: string): { isValid: boolean; message: string; suggestion?: string } => {
    const trimmed = reference.trim();
    
    if (!trimmed) {
      return { isValid: true, message: "" };
    }

    // Check for complete verse reference (Book Chapter:Verse)
    const completePattern = /^[1-3]?\s*[A-Za-z]+\s+\d+:\d+/;
    if (completePattern.test(trimmed)) {
      return { isValid: true, message: "✓ Complete reference" };
    }

    // Check for incomplete chapter reference (Book Chapter)
    const chapterPattern = /^[1-3]?\s*[A-Za-z]+\s+\d+$/;
    if (chapterPattern.test(trimmed)) {
      return { 
        isValid: false, 
        message: "Add verse number for specific verse",
        suggestion: `${trimmed}:1`
      };
    }

    // Check for book only
    const bookPattern = /^[1-3]?\s*[A-Za-z]+$/;
    if (bookPattern.test(trimmed)) {
      return { 
        isValid: false, 
        message: "Add chapter and verse number",
        suggestion: `${trimmed} 1:1`
      };
    }

    return { 
      isValid: false, 
      message: "Enter format: Book Chapter:Verse (e.g., John 3:16)"
    };
  };

  const handleVerseChange = (index: number, value: string) => {
    updateFavoriteVerse(index, value);
    
    // Validate the reference
    const validation = validateVerseReference(value);
    setVerseValidation(prev => ({
      ...prev,
      [index]: validation
    }));
    
    // Clear any existing timeout
    if (verseTimeouts[index]) {
      clearTimeout(verseTimeouts[index]);
    }

    // Only lookup if it's a reasonable reference (has some structure)
    const hasStructure = /^[1-3]?\s*[A-Za-z]+\s+\d+/.test(value.trim());
    if (hasStructure) {
      // Set a new timeout to lookup the verse after user stops typing
      const timeout = setTimeout(() => {
        lookupVerse(value, index);
      }, 800); // Wait 800ms after user stops typing

      setVerseTimeouts(prev => ({
        ...prev,
        [index]: timeout
      }));
    } else {
      // Clear verse text for incomplete references
      setVerseTexts(prev => {
        const updated = { ...prev };
        delete updated[index];
        return updated;
      });
    }
  };

  const handleSuggestionClick = (index: number, suggestion: string) => {
    updateFavoriteVerse(index, suggestion);
    setVerseValidation(prev => ({
      ...prev,
      [index]: { isValid: true, message: "✓ Complete reference" }
    }));
    lookupVerse(suggestion, index);
  };

  // Spiritual Gifts Assessment Logic
  const spiritualGiftsQuestions = [
    { id: 'administration', question: 'I enjoy organizing people and resources for ministry projects', gift: 'Administration' },
    { id: 'leadership', question: 'People naturally look to me for direction and guidance', gift: 'Leadership' },
    { id: 'teaching', question: 'I love explaining biblical truths to help others understand', gift: 'Teaching' },
    { id: 'mercy', question: 'I am drawn to comfort and care for those who are suffering', gift: 'Mercy' },
    { id: 'evangelism', question: 'I enjoy sharing the gospel with non-believers', gift: 'Evangelism' },
    { id: 'service', question: 'I find joy in practical acts of service behind the scenes', gift: 'Service' },
    { id: 'giving', question: 'I feel called to be generous with my resources for ministry', gift: 'Giving' },
    { id: 'hospitality', question: 'I love welcoming and making people feel at home', gift: 'Hospitality' },
    { id: 'encouragement', question: 'I naturally encourage and build up others in their faith', gift: 'Encouragement' },
    { id: 'discernment', question: 'I can often sense spiritual truth or deception', gift: 'Discernment' },
    { id: 'wisdom', question: 'People seek me out for wise counsel and advice', gift: 'Wisdom' },
    { id: 'faith', question: 'I have strong faith that God will provide and work miracles', gift: 'Faith' },
    { id: 'helps', question: 'I love assisting others in completing their ministry tasks', gift: 'Helps' },
    { id: 'knowledge', question: 'I enjoy deep study of Scripture and theological concepts', gift: 'Knowledge' },
    { id: 'prophecy', question: 'I feel called to speak truth and challenge others spiritually', gift: 'Prophecy' },
    // Additional questions to expand to 30 total (expanding the assessment as requested)
    { id: 'counseling', question: 'I feel called to help people work through personal problems', gift: 'Counseling' },
    { id: 'intercession', question: 'I spend significant time in prayer for others', gift: 'Intercession' },
    { id: 'music', question: 'I use musical abilities to worship and minister to others', gift: 'Music' },
    { id: 'craftsmanship', question: 'I enjoy creating things with my hands for ministry use', gift: 'Craftsmanship' },
    { id: 'healing', question: 'I have seen God work through me to bring healing to others', gift: 'Healing' },
    { id: 'miracles', question: 'I believe God works supernatural miracles through faithful believers', gift: 'Miracles' },
    { id: 'tongues', question: 'I have been given a prayer language or ability to speak in tongues', gift: 'Tongues' },
    { id: 'interpretation', question: 'I can understand and interpret spiritual messages', gift: 'Interpretation' },
    { id: 'apostleship', question: 'I feel called to plant new churches or ministries', gift: 'Apostleship' },
    { id: 'pastoring', question: 'I love shepherding and caring for a group of believers', gift: 'Pastoring' },
    { id: 'missions', question: 'I feel called to serve God in cross-cultural ministry', gift: 'Missions' },
    { id: 'volunteerism', question: 'I enjoy volunteering for various church and community needs', gift: 'Volunteerism' },
    { id: 'coordination', question: 'I excel at coordinating events and bringing people together', gift: 'Coordination' },
    { id: 'mentoring', question: 'I enjoy investing in and developing other people', gift: 'Mentoring' },
    { id: 'creativity', question: 'I use creative arts to express worship and minister to others', gift: 'Creativity' }
  ];

  const spiritualGiftsSchema = z.object({
    responses: z.record(z.number().min(1).max(5))
  });

  type SpiritualGiftsForm = z.infer<typeof spiritualGiftsSchema>;

  const calculateSpiritualProfile = (responses: Record<string, number>, questions: any[]) => {
    const scores: Record<string, number> = {};
    
    // Calculate scores for each spiritual gift category
    questions.forEach(q => {
      const score = responses[q.id] || 1;
      if (!scores[q.gift]) scores[q.gift] = 0;
      scores[q.gift] += score;
    });
    
    // Get top 3 gifts
    const topGifts = Object.entries(scores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([gift]) => gift);
    
    // Calculate overall engagement level
    const totalScore = Object.values(responses).reduce((sum, score) => sum + score, 0);
    const averageScore = totalScore / Object.keys(responses).length;
    
    // Determine spiritual profile label (encouraging and inclusive)
    let profileLabel = "";
    let profileDescription = "";
    let servingStyle = "";
    
    if (averageScore >= 4.5) {
      profileLabel = "Kingdom Champion";
      profileDescription = "Highly gifted leader with strong calling to serve";
      servingStyle = "Leadership & High-Impact Ministry";
    } else if (averageScore >= 4.0) {
      profileLabel = "Faithful Servant";
      profileDescription = "Dedicated volunteer with clear spiritual gifts";
      servingStyle = "Active Ministry Participation";
    } else if (averageScore >= 3.5) {
      profileLabel = "Growing Disciple";
      profileDescription = "Developing gifts with heart to serve";
      servingStyle = "Ministry Support & Growth";
    } else if (averageScore >= 2.5) {
      profileLabel = "Willing Helper";
      profileDescription = "Ready to serve in practical, supportive ways";
      servingStyle = "Behind-the-Scenes Support";
    } else {
      profileLabel = "Humble Servant";
      profileDescription = "Heart to help with essential support ministry";
      servingStyle = "Practical Service & Foundation Support";
    }
    
    return {
      topGifts,
      profileLabel,
      profileDescription,
      servingStyle,
      averageScore: Math.round(averageScore * 10) / 10,
      engagementLevel: averageScore >= 3.5 ? "High" : averageScore >= 2.5 ? "Moderate" : "Supportive"
    };
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Basic
          </TabsTrigger>
          <TabsTrigger value="spiritual" className="flex items-center gap-2">
            <Church className="w-4 h-4" />
            Spiritual
          </TabsTrigger>
          <TabsTrigger value="gifts" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Gifts
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
                      onClick={() => {
                        // TODO: Implement SMS verification modal
                        alert('Mobile verification coming soon! This will open an SMS verification flow to confirm your number for security and notifications.');
                      }}
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
                  <p className="text-xs text-muted-foreground mt-1">
                    Your Bible study or fellowship group - helps connect you with others in similar life stages or interests
                  </p>
                </div>
              </div>

              <div>
                <Label>Favorite Bible Verses</Label>
                <div className="space-y-2">
                  {favoriteVerses.map((verse, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            placeholder="e.g., John 3:16 or Jeremiah 29:11"
                            value={verse}
                            onChange={(e) => handleVerseChange(index, e.target.value)}
                            className={`pr-10 ${verseValidation[index] && !verseValidation[index].isValid && verse.trim() ? 'border-amber-300 focus:border-amber-400' : ''}`}
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

                      {/* Validation Message */}
                      {verseValidation[index] && verse.trim() && (
                        <div className={`text-xs flex items-center gap-2 ${
                          verseValidation[index].isValid 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-amber-600 dark:text-amber-400'
                        }`}>
                          <span>{verseValidation[index].message}</span>
                          {verseValidation[index].suggestion && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                              onClick={() => handleSuggestionClick(index, verseValidation[index].suggestion!)}
                            >
                              Try: {verseValidation[index].suggestion}
                            </Button>
                          )}
                        </div>
                      )}

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

        {/* Spiritual Gifts Tab */}
        <TabsContent value="gifts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Spiritual Gifts Assessment
              </CardTitle>
              <CardDescription>
                Discover your unique spiritual gifts to serve the Kingdom more effectively
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {formData.spiritualProfile ? (
                // Show completed assessment results
                <div className="bg-gradient-to-r from-green-50 to-purple-50 dark:from-green-900/20 dark:to-purple-900/20 p-6 rounded-lg border border-green-200 dark:border-green-700">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-green-500 dark:bg-green-600 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                        Assessment Complete! 🎉
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-purple-800 dark:text-purple-200 text-xl">
                            {formData.spiritualProfile.profileLabel}
                          </h4>
                          <p className="text-gray-700 dark:text-gray-300 text-sm">
                            {formData.spiritualProfile.profileDescription}
                          </p>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                            Your Top Spiritual Gifts:
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {formData.spiritualProfile.topGifts?.map((gift, index) => (
                              <Badge key={index} className="bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900 dark:text-purple-100">
                                {gift}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-gray-800 dark:text-gray-200">
                            Serving Style:
                          </h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {formData.spiritualProfile.servingStyle}
                          </p>
                        </div>
                        {formData.spiritualProfile.averageScore && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-800 dark:text-gray-200">
                              Engagement Level:
                            </h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {formData.spiritualProfile.engagementLevel} ({formData.spiritualProfile.averageScore}/5.0)
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-300"
                      onClick={() => setShowGiftsAssessment(true)}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Retake Assessment
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300"
                      onClick={() => {
                        alert('Spiritual gifts are special abilities given by God to serve others and build up the church. Use your results to find ministry opportunities that match your calling!');
                      }}
                    >
                      Learn More
                    </Button>
                  </div>
                </div>
              ) : (
                // Show assessment invitation
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-6 rounded-lg border border-purple-200 dark:border-purple-700">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-purple-500 dark:bg-purple-600 rounded-full flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
                        Uncover Your Spiritual Gifts
                      </h3>
                      <p className="text-purple-800 dark:text-purple-200 mb-4 leading-relaxed">
                        Understanding your spiritual gifts helps you serve God and others with purpose and passion. Our comprehensive assessment will help identify your unique calling and ministry potential.
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-purple-700 dark:text-purple-300">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span>Comprehensive 30-question assessment</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-purple-700 dark:text-purple-300">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span>Personalized results with detailed explanations</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-purple-700 dark:text-purple-300">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span>Ministry matching and service opportunities</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex gap-3">
                    <Button
                      type="button"
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                      onClick={() => setShowGiftsAssessment(true)}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Take Assessment
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-300"
                      onClick={() => {
                        alert('Spiritual gifts are special abilities given by God to serve others and build up the church. Our assessment will help you discover your primary gifts like Leadership, Teaching, Mercy, Service, and more!');
                      }}
                    >
                      Learn About Gifts
                    </Button>
                  </div>
                </div>
              )}

              {/* Spiritual Gifts Results Section */}
              <div>
                <Label htmlFor="spiritualGifts">My Spiritual Gifts (Optional)</Label>
                <p className="text-xs text-muted-foreground mb-3">
                  After completing your assessment, add your top spiritual gifts here
                </p>
                <div className="space-y-2">
                  {(formData.spiritualGifts || []).map((gift, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="e.g., Teaching, Leadership, Compassion"
                        value={gift}
                        onChange={(e) => {
                          const newGifts = [...(formData.spiritualGifts || [])];
                          newGifts[index] = e.target.value;
                          setFormData({...formData, spiritualGifts: newGifts});
                        }}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newGifts = (formData.spiritualGifts || []).filter((_, i) => i !== index);
                          setFormData({...formData, spiritualGifts: newGifts});
                        }}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFormData({
                        ...formData, 
                        spiritualGifts: [...(formData.spiritualGifts || []), '']
                      });
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Gift
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

      {/* Spiritual Gifts Assessment Modal */}
      <SpiritualGiftsAssessmentModal 
        open={showGiftsAssessment}
        onClose={() => setShowGiftsAssessment(false)}
        onComplete={(profile) => {
          // Update the formData with the assessment results
          setFormData({
            ...formData, 
            spiritualGifts: profile.topGifts || [],
            spiritualProfile: profile
          });
          setShowGiftsAssessment(false);
        }}
      />
    </div>
  );
};

// Spiritual Gifts Assessment Modal Component
const SpiritualGiftsAssessmentModal = ({ 
  open, 
  onClose, 
  onComplete 
}: { 
  open: boolean; 
  onClose: () => void; 
  onComplete: (profile: any) => void; 
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const questionsPerPage = 5;

  const spiritualGiftsQuestions = [
    { id: 'administration', question: 'I enjoy organizing people and resources for ministry projects', gift: 'Administration' },
    { id: 'leadership', question: 'People naturally look to me for direction and guidance', gift: 'Leadership' },
    { id: 'teaching', question: 'I love explaining biblical truths to help others understand', gift: 'Teaching' },
    { id: 'mercy', question: 'I am drawn to comfort and care for those who are suffering', gift: 'Mercy' },
    { id: 'evangelism', question: 'I enjoy sharing the gospel with non-believers', gift: 'Evangelism' },
    { id: 'service', question: 'I find joy in practical acts of service behind the scenes', gift: 'Service' },
    { id: 'giving', question: 'I feel called to be generous with my resources for ministry', gift: 'Giving' },
    { id: 'hospitality', question: 'I love welcoming and making people feel at home', gift: 'Hospitality' },
    { id: 'encouragement', question: 'I naturally encourage and build up others in their faith', gift: 'Encouragement' },
    { id: 'discernment', question: 'I can often sense spiritual truth or deception', gift: 'Discernment' },
    { id: 'wisdom', question: 'People seek me out for wise counsel and advice', gift: 'Wisdom' },
    { id: 'faith', question: 'I have strong faith that God will provide and work miracles', gift: 'Faith' },
    { id: 'helps', question: 'I love assisting others in completing their ministry tasks', gift: 'Helps' },
    { id: 'knowledge', question: 'I enjoy deep study of Scripture and theological concepts', gift: 'Knowledge' },
    { id: 'prophecy', question: 'I feel called to speak truth and challenge others spiritually', gift: 'Prophecy' },
    // Additional questions expanding to 30 total
    { id: 'counseling', question: 'I feel called to help people work through personal problems', gift: 'Counseling' },
    { id: 'intercession', question: 'I spend significant time in prayer for others', gift: 'Intercession' },
    { id: 'music', question: 'I use musical abilities to worship and minister to others', gift: 'Music' },
    { id: 'craftsmanship', question: 'I enjoy creating things with my hands for ministry use', gift: 'Craftsmanship' },
    { id: 'healing', question: 'I have seen God work through me to bring healing to others', gift: 'Healing' },
    { id: 'miracles', question: 'I believe God works supernatural miracles through faithful believers', gift: 'Miracles' },
    { id: 'tongues', question: 'I have been given a prayer language or ability to speak in tongues', gift: 'Tongues' },
    { id: 'interpretation', question: 'I can understand and interpret spiritual messages', gift: 'Interpretation' },
    { id: 'apostleship', question: 'I feel called to plant new churches or ministries', gift: 'Apostleship' },
    { id: 'pastoring', question: 'I love shepherding and caring for a group of believers', gift: 'Pastoring' },
    { id: 'missions', question: 'I feel called to serve God in cross-cultural ministry', gift: 'Missions' },
    { id: 'volunteerism', question: 'I enjoy volunteering for various church and community needs', gift: 'Volunteerism' },
    { id: 'coordination', question: 'I excel at coordinating events and bringing people together', gift: 'Coordination' },
    { id: 'mentoring', question: 'I enjoy investing in and developing other people', gift: 'Mentoring' },
    { id: 'creativity', question: 'I use creative arts to express worship and minister to others', gift: 'Creativity' }
  ];

  const spiritualGiftsSchema = z.object({
    responses: z.record(z.number().min(1).max(5))
  });

  type SpiritualGiftsForm = z.infer<typeof spiritualGiftsSchema>;

  const calculateSpiritualProfile = (responses: Record<string, number>, questions: any[]) => {
    const scores: Record<string, number> = {};
    
    // Calculate scores for each spiritual gift category
    questions.forEach(q => {
      const score = responses[q.id] || 1;
      if (!scores[q.gift]) scores[q.gift] = 0;
      scores[q.gift] += score;
    });
    
    // Get top 3 gifts
    const topGifts = Object.entries(scores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([gift]) => gift);
    
    // Calculate overall engagement level
    const totalScore = Object.values(responses).reduce((sum, score) => sum + score, 0);
    const averageScore = totalScore / Object.keys(responses).length;
    
    // Determine spiritual profile label
    let profileLabel = "";
    let profileDescription = "";
    let servingStyle = "";
    
    if (averageScore >= 4.5) {
      profileLabel = "Kingdom Champion";
      profileDescription = "Highly gifted leader with strong calling to serve";
      servingStyle = "Leadership & High-Impact Ministry";
    } else if (averageScore >= 4.0) {
      profileLabel = "Faithful Servant";
      profileDescription = "Dedicated volunteer with clear spiritual gifts";
      servingStyle = "Active Ministry Participation";
    } else if (averageScore >= 3.5) {
      profileLabel = "Growing Disciple";
      profileDescription = "Developing gifts with heart to serve";
      servingStyle = "Ministry Support & Growth";
    } else if (averageScore >= 2.5) {
      profileLabel = "Willing Helper";
      profileDescription = "Ready to serve in practical, supportive ways";
      servingStyle = "Behind-the-Scenes Support";
    } else {
      profileLabel = "Humble Servant";
      profileDescription = "Heart to help with essential support ministry";
      servingStyle = "Practical Service & Foundation Support";
    }
    
    return {
      topGifts,
      profileLabel,
      profileDescription,
      servingStyle,
      averageScore: Math.round(averageScore * 10) / 10,
      engagementLevel: averageScore >= 3.5 ? "High" : averageScore >= 2.5 ? "Moderate" : "Supportive"
    };
  };

  const form = useForm<SpiritualGiftsForm>({
    resolver: zodResolver(spiritualGiftsSchema),
    defaultValues: {
      responses: {}
    }
  });

  const assessmentMutation = useMutation({
    mutationFn: (data: SpiritualGiftsForm) => 
      apiRequest('/api/volunteers/spiritual-gifts-assessment', 'POST', data),
    onSuccess: (profile) => {
      onComplete(profile);
    },
    onError: () => {
      // Calculate the profile locally if API fails
      const responses = form.getValues().responses;
      if (responses && Object.keys(responses).length > 0) {
        const profile = calculateSpiritualProfile(responses, spiritualGiftsQuestions);
        onComplete({ ...profile, success: true });
      }
    }
  });

  const totalPages = Math.ceil(spiritualGiftsQuestions.length / questionsPerPage);
  const currentQuestions = spiritualGiftsQuestions.slice(
    currentPage * questionsPerPage,
    (currentPage + 1) * questionsPerPage
  );

  const onSubmit = (data: SpiritualGiftsForm) => {
    const profile = calculateSpiritualProfile(data.responses, spiritualGiftsQuestions);
    const enrichedData = {
      ...data,
      profile
    };
    assessmentMutation.mutate(enrichedData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold">Spiritual Gifts Assessment</DialogTitle>
          <DialogDescription>
            Discover your God-given spiritual gifts and find your perfect ministry fit (30 questions)
          </DialogDescription>
          <Progress value={(currentPage + 1) / totalPages * 100} className="mt-4" />
          <p className="text-sm text-gray-600 mt-2">
            Page {currentPage + 1} of {totalPages}
          </p>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              {currentQuestions.map((q) => (
                <FormField
                  key={q.id}
                  control={form.control}
                  name={`responses.${q.id}`}
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between items-start mb-2">
                        <FormLabel className="text-base font-medium text-gray-900 dark:text-gray-100 flex-1 pr-4">
                          {q.question}
                        </FormLabel>
                        <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs font-medium px-2 py-1 rounded-md whitespace-nowrap">
                          {q.gift}
                        </Badge>
                      </div>
                      <FormControl>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm text-gray-500">Strongly Disagree</span>
                          <div className="flex space-x-2">
                            {[1, 2, 3, 4, 5].map((value) => (
                              <button
                                key={value}
                                type="button"
                                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors font-medium ${
                                  field.value === value
                                    ? 'bg-purple-500 border-purple-500 text-white shadow-lg'
                                    : 'border-gray-300 hover:border-purple-300 hover:bg-purple-50 text-gray-700'
                                }`}
                                onClick={() => field.onChange(value)}
                              >
                                {value}
                              </button>
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">Strongly Agree</span>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              ))}
            </div>

            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
              >
                Previous
              </Button>
              
              {currentPage < totalPages - 1 ? (
                <Button
                  type="button"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={assessmentMutation.isPending}
                  className="bg-gradient-to-r from-purple-500 to-blue-500"
                >
                  {assessmentMutation.isPending ? "Processing..." : "Complete Assessment"}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};