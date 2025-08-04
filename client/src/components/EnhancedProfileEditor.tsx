import { useState, useEffect, useCallback } from "react";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
  Minus,
  CheckCircle,
  RefreshCw,
  ArrowLeft,
  ArrowRight
} from "lucide-react";
import ChurchLookupModal from "./ChurchLookupModal";
import { ObjectUploader } from "./ObjectUploader";
import type { UploadResult } from "@uppy/core";
import { ACTIVE_BIBLE_TRANSLATIONS } from "../../../shared/bible-translations";

interface UserProfile {
  id: string;
  firstName: string | null;
  lastName: string | null;
  bio: string | null;
  profileImageUrl: string | null;
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
  showMobile: boolean | null;
  showGender: boolean | null;
  showDenomination: boolean | null;
  showSpiritualGifts: boolean | null;
  zipCode: string | null;
  city: string | null;
  state: string | null;
  languagePreference: string | null;
  customLanguage: string | null;
  preferredBibleTranslation: string | null;
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

const LANGUAGES = [
  { value: "English", label: "🇺🇸 English" },
  { value: "Spanish", label: "🇪🇸 Español (Spanish)" },
  { value: "French", label: "🇫🇷 Français (French)" },
  { value: "Portuguese", label: "🇵🇹 Português (Portuguese)" },
  { value: "German", label: "🇩🇪 Deutsch (German)" },
  { value: "Italian", label: "🇮🇹 Italiano (Italian)" },
  { value: "Dutch", label: "🇳🇱 Nederlands (Dutch)" },
  { value: "Russian", label: "🇷🇺 Русский (Russian)" },
  { value: "Chinese", label: "🇨🇳 中文 (Chinese)" },
  { value: "Korean", label: "🇰🇷 한국어 (Korean)" },
  { value: "Japanese", label: "🇯🇵 日本語 (Japanese)" },
  { value: "Farsi", label: "🇮🇷 فارسی (Farsi)" },
  { value: "Armenian", label: "🇦🇲 Հայերեն (Armenian)" },
  { value: "Arabic", label: "🇸🇦 العربية (Arabic)" },
  { value: "Hebrew", label: "🇮🇱 עברית (Hebrew)" },
  { value: "Hindi", label: "🇮🇳 हिन्दी (Hindi)" },
  { value: "Other", label: "🌐 Other" }
];

// Removed hardcoded BIBLE_TRANSLATIONS - now using centralized system from shared/bible-translations.ts

export default function EnhancedProfileEditor({ profile, onSave, isLoading }: EnhancedProfileEditorProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Partial<UserProfile>>(profile);
  const [selectedMinistries, setSelectedMinistries] = useState<string[]>(profile.ministryInterests || []);
  const [selectedGoals, setSelectedGoals] = useState<string[]>(profile.growthGoals || []);
  const [favoriteVerses, setFavoriteVerses] = useState<string[]>(profile.favoriteScriptures || []);
  const [verseTexts, setVerseTexts] = useState<{ [key: number]: { text: string; reference: string; version: string } }>({});
  const [showChurchLookup, setShowChurchLookup] = useState(false);
  const [currentTab, setCurrentTab] = useState("basic");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [verseLoadingStates, setVerseLoadingStates] = useState<{ [key: number]: boolean }>({});
  const [verseTimeouts, setVerseTimeouts] = useState<{ [key: number]: NodeJS.Timeout }>({});
  const [verseValidation, setVerseValidation] = useState<{ [key: number]: { isValid: boolean; message: string; suggestion?: string } }>({});
  const [showGiftsAssessment, setShowGiftsAssessment] = useState(false);
  const [showGiftsInfoModal, setShowGiftsInfoModal] = useState(false);
  const [giftVerses, setGiftVerses] = useState<{ [key: string]: string }>({});
  const [loadingVerses, setLoadingVerses] = useState(false);
  const [aiGiftSuggestions, setAiGiftSuggestions] = useState<any>(null);
  const [loadingAiAnalysis, setLoadingAiAnalysis] = useState(false);

  // Auto-save mutation for preferences
  const [saving, setSaving] = useState(false);
  
  const autoSavePreference = async (field: string, value: string) => {
    try {
      setSaving(true);
      
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,  // Include all existing form data
          [field]: value
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Update the form data to reflect the saved value
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));

      // Invalidate query cache to refresh profile data in parent component
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      
    } catch (error) {
      // Silent error handling - could add toast notification here if needed
    } finally {
      setSaving(false);
    }
  };

  const autoSaveTranslation = (translation: string) => {
    // Use the correct database field name for Bible translation preference
    autoSavePreference('bibleTranslationPreference', translation);
  };

  const autoSaveSmallGroup = (smallGroup: string) => {
    autoSavePreference('smallGroup', smallGroup);
  };

  // Update formData when profile prop changes
  useEffect(() => {
    // Only initialize if formData is empty or if this is the first load
    // Don't overwrite formData if user has made changes
    if (!formData.id || formData.id !== profile.id) {
      // Initialize all fields with database defaults when null
      const initializedProfile = {
        ...profile,
        // Apply database schema defaults for privacy settings when null
        showBioPublicly: profile.showBioPublicly ?? true,
        showChurchAffiliation: profile.showChurchAffiliation ?? true,
        shareWithGroup: profile.shareWithGroup ?? true,
        showAgeRange: profile.showAgeRange ?? false,
        showLocation: profile.showLocation ?? false,
        showMobile: profile.showMobile ?? false,
        showGender: profile.showGender ?? false,
        showDenomination: profile.showDenomination ?? true,
        showSpiritualGifts: profile.showSpiritualGifts ?? true,
        // Initialize core profile fields
        publicSharing: profile.publicSharing ?? false,
        volunteerInterest: profile.volunteerInterest ?? false,
        spiritualGifts: profile.spiritualGifts || [],
        spiritualProfile: profile.spiritualProfile || null,
        // Initialize language preference to English if null
        languagePreference: profile.languagePreference || "English",
        // Initialize bible translation to user's actual preference (no hardcoded fallback)
        preferredBibleTranslation: profile.preferredBibleTranslation || "",
        // Initialize small group to not_interested if null
        smallGroup: profile.smallGroup || "not_interested",
      };
      
      setFormData(initializedProfile);
      setSelectedMinistries(profile.ministryInterests || []);
      setSelectedGoals(profile.growthGoals || []);
    }
    
    // Handle favorite verses - they might be strings or objects
    const verses = profile.favoriteScriptures || [];
    const verseRefs: string[] = [];
    const verseTextsData: { [key: number]: { text: string; reference: string; version: string } } = {};
    
    if (Array.isArray(verses)) {
      verses.forEach((verse: any, index: number) => {
        if (typeof verse === 'string') {
          verseRefs.push(verse);
        } else if (verse && typeof verse === 'object' && verse.reference) {
          verseRefs.push(verse.reference);
          verseTextsData[index] = {
            text: verse.text || '',
            reference: verse.reference,
            version: verse.version || profile.preferredBibleTranslation || 'NIV'
          };
        }
      });
    }
    
    setFavoriteVerses(verseRefs);
    setVerseTexts(verseTextsData);
  }, [profile]);

  // Spiritual Gifts Data - defined early for use in functions
  const spiritualGiftsData = {
    "Leadership": {
      description: "The ability to guide, direct, and organize groups toward God's purposes",
      scripture: "Romans 12:8",
      soapThemes: ["Leading by example", "Vision casting", "Team building"],
      ministryContext: "Leading teams, organizing events, church leadership"
    },
    "Teaching": {
      description: "The gift of communicating God's truth clearly and effectively",
      scripture: "1 Corinthians 12:28",
      soapThemes: ["Bible study insights", "Discipleship moments", "Learning revelations"],
      ministryContext: "Bible study leadership, discipleship, children's ministry"
    },
    "Encouragement": {
      description: "The ability to uplift, comfort, and motivate others in their faith",
      scripture: "Romans 12:8",
      soapThemes: ["Uplifting others", "Comfort in trials", "Motivational insights"],
      ministryContext: "Counseling, prayer ministry, small group support"
    },
    "Service": {
      description: "The gift of practical help and meeting the physical needs of others",
      scripture: "1 Peter 4:10",
      soapThemes: ["Acts of service", "Helping others", "Practical ministry"],
      ministryContext: "Volunteer coordination, practical assistance, community service"
    },
    "Giving": {
      description: "The ability to contribute resources generously and cheerfully",
      scripture: "Romans 12:8",
      soapThemes: ["Generosity insights", "Financial stewardship", "Blessing others"],
      ministryContext: "Financial support, resource sharing, missions funding"
    },
    "Mercy": {
      description: "The gift of showing compassion and care for those who suffer",
      scripture: "Romans 12:8",
      soapThemes: ["Compassion for others", "Care for suffering", "Healing ministry"],
      ministryContext: "Hospital visitation, grief support, care ministry"
    },
    "Hospitality": {
      description: "The gift of creating welcoming spaces and serving others",
      scripture: "1 Peter 4:9",
      soapThemes: ["Welcoming others", "Creating community", "Serving guests"],
      ministryContext: "Event hosting, newcomer ministry, fellowship coordination"
    },
    "Helps": {
      description: "The gift of supporting and assisting others in ministry",
      scripture: "1 Corinthians 12:28",
      soapThemes: ["Supporting ministry", "Behind-the-scenes service", "Team assistance"],
      ministryContext: "Administrative support, technical assistance, ministry coordination"
    },
    "Faith": {
      description: "The gift of extraordinary trust in God's power and promises",
      scripture: "1 Corinthians 12:9",
      soapThemes: ["Trusting God", "Faith in trials", "Believing for miracles"],
      ministryContext: "Prayer ministry, missions, faith-building ministry"
    },
    "Discernment": {
      description: "The gift of distinguishing between truth and error, good and evil",
      scripture: "1 Corinthians 12:10",
      soapThemes: ["Spiritual insight", "Wisdom in decisions", "Discerning God's will"],
      ministryContext: "Counseling, leadership advisory, spiritual direction"
    },
    "Wisdom": {
      description: "The gift of applying biblical knowledge to practical life situations",
      scripture: "1 Corinthians 12:8",
      soapThemes: ["Practical wisdom", "Sound judgment", "Biblical application"],
      ministryContext: "Counseling, teaching, leadership advisory"
    },
    "Intercession": {
      description: "The gift of sustained prayer for others and their needs",
      scripture: "1 Timothy 2:1",
      soapThemes: ["Prayer for others", "Spiritual warfare", "Intercession ministry"],
      ministryContext: "Prayer ministry, spiritual warfare, prayer groups"
    },
    "Administration": {
      description: "The gift of organizing and coordinating ministry activities",
      scripture: "1 Corinthians 12:28",
      soapThemes: ["Organization", "Planning", "Ministry coordination"],
      ministryContext: "Event planning, administrative support, ministry management"
    },
    "Evangelism": {
      description: "The gift of sharing the gospel effectively with non-believers",
      scripture: "Ephesians 4:11",
      soapThemes: ["Sharing faith", "Witnessing opportunities", "Evangelistic conversations"],
      ministryContext: "Outreach ministry, missions, evangelistic events"
    }
  };

  const handleSave = () => {
    // Build complete verse objects with both reference and text
    const completeVerses = favoriteVerses
      .filter(verse => verse && verse.trim() !== '') // Filter out empty verses
      .map((verse, index) => {
        // If we have verse text for this index, save both reference and text
        if (verseTexts[index]) {
          return {
            reference: verse,
            text: verseTexts[index].text,
            version: verseTexts[index].version
          };
        }
        // Otherwise, just save the reference (for backward compatibility)
        return verse;
      });

    // Ensure ALL fields are properly included in the save data
    const saveData = {
      ...formData,
      ministryInterests: selectedMinistries,
      growthGoals: selectedGoals,
      favoriteScriptures: completeVerses,
      volunteerInterest: formData.volunteerInterest,
      spiritualGifts: formData.spiritualGifts,
      spiritualProfile: formData.spiritualProfile,
      publicSharing: formData.publicSharing,
      customLanguage: formData.customLanguage,
      bibleTranslationPreference: formData.preferredBibleTranslation, // ✅ CRITICAL: Fix field name to match database schema
      // Ensure all privacy settings are included
      showBioPublicly: formData.showBioPublicly,
      showChurchAffiliation: formData.showChurchAffiliation,
      shareWithGroup: formData.shareWithGroup,
      showAgeRange: formData.showAgeRange,
      showLocation: formData.showLocation,
      showMobile: formData.showMobile,
      showGender: formData.showGender,
      showDenomination: formData.showDenomination,
      showSpiritualGifts: formData.showSpiritualGifts
    };
    
    
    onSave(saveData);
  };

  // Photo upload handlers
  const handleGetUploadParameters = async () => {
    try {
      const response = await fetch("/api/profile/photo/upload", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        throw new Error(`Upload URL request failed: ${response.status}`);
      }
      
      const data = await response.json();
      if (!data.uploadURL) {
        throw new Error("Failed to get upload URL");
      }
      
      return {
        method: "PUT" as const,
        url: data.uploadURL,
      };
    } catch (error) {

      throw error;
    }
  };

  const handlePhotoUploadComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    setIsUploadingPhoto(true);
    try {
      if (result.successful && result.successful.length > 0) {
        const uploadedFile = result.successful[0];
        const photoURL = uploadedFile.uploadURL;

        // Update profile with the uploaded photo
        const response = await fetch("/api/profile/photo", {
          method: "PUT",
          credentials: "include",
          body: JSON.stringify({ photoURL }),
          headers: { "Content-Type": "application/json" },
        });
        
        if (!response.ok) {
          throw new Error(`Photo update failed: ${response.status}`);
        }
        
        const data = await response.json();

        if (data.success) {
          setFormData(prev => ({
            ...prev,
            profileImageUrl: data.objectPath
          }));
          
          // Also call the parent's onSave to update the profile
          onSave({
            ...formData,
            profileImageUrl: data.objectPath
          });
        }
      }
    } catch (error) {

    } finally {
      setIsUploadingPhoto(false);
    }
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



  // Profile completion calculation - focused on essential fields only
  const calculateProfileCompletion = () => {
    const fields = [
      formData.firstName,
      formData.lastName,
      formData.bio,
      formData.ageRange,
      formData.gender,
      formData.languagePreference,
      formData.churchAffiliation,
      formData.spiritualStage,
      formData.preferredBibleTranslation,
      formData.city,
      formData.state,
      selectedMinistries.length > 0,
      selectedGoals.length > 0,
      favoriteVerses.length > 0,
      formData.spiritualProfile || formData.spiritualGifts
    ];
    
    const completed = fields.filter(field => {
      if (typeof field === 'boolean') return field;
      if (typeof field === 'string') return field && field.trim() !== '';
      return Boolean(field);
    }).length;
    
    return Math.round((completed / fields.length) * 100);
  };

  const tabs = ["basic", "spiritual", "gifts", "engagement", "growth", "privacy"];
  const tabLabels = ["Basic", "Spiritual", "Gifts", "Community", "Growth", "Privacy"];

  const goToNextTab = () => {
    const currentIndex = tabs.indexOf(currentTab);
    if (currentIndex < tabs.length - 1) {
      setCurrentTab(tabs[currentIndex + 1]);
    }
  };

  const goToPrevTab = () => {
    const currentIndex = tabs.indexOf(currentTab);
    if (currentIndex > 0) {
      setCurrentTab(tabs[currentIndex - 1]);
    }
  };

  const completionPercentage = calculateProfileCompletion();

  // Load scripture verses for spiritual gifts
  const loadGiftVerses = useCallback(async () => {
    if (loadingVerses || Object.keys(giftVerses).length > 0) return;
    
    setLoadingVerses(true);
    const verses: { [key: string]: string } = {};
    
    try {
      // Use local scripture references instead of external API
      for (const [gift, data] of Object.entries(spiritualGiftsData)) {
        verses[gift] = data.scripture || '';
      }
      setGiftVerses(verses);
    } catch (error) {

    } finally {
      setLoadingVerses(false);
    }
  }, [loadingVerses, giftVerses, spiritualGiftsData]);

  // AI-powered SOAP journal analysis for gift suggestions
  const analyzeJournalingPatterns = async () => {
    if (!profile.id || loadingAiAnalysis) return;
    
    setLoadingAiAnalysis(true);
    try {
      const response = await fetch('/api/ai/analyze-spiritual-gifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: profile.id })
      });
      
      if (response.ok) {
        const analysis = await response.json();
        setAiGiftSuggestions(analysis);
      }
    } catch (error) {

    } finally {
      setLoadingAiAnalysis(false);
    }
  };

  // Load verses when component mounts
  useEffect(() => {
    loadGiftVerses();
  }, [loadGiftVerses]);

  // Load AI analysis when user has spiritual profile
  useEffect(() => {
    if (formData.spiritualProfile && !aiGiftSuggestions) {
      analyzeJournalingPatterns();
    }
  }, [formData.spiritualProfile]);

  // Tab navigation component
  const TabNavigation = ({ currentTabIndex }: { currentTabIndex: number }) => {
    const nextTabName = currentTabIndex < tabLabels.length - 1 ? tabLabels[currentTabIndex + 1] : null;
    
    return (
      <div className="flex flex-col sm:flex-row justify-between gap-3 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={goToPrevTab}
          disabled={currentTabIndex === 0}
          className="flex items-center justify-center gap-2 w-full sm:w-auto order-2 sm:order-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>
        <Button
          type="button"
          onClick={goToNextTab}
          disabled={currentTabIndex === tabLabels.length - 1}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white w-full sm:w-auto order-1 sm:order-2"
        >
          <span className="hidden sm:inline">{nextTabName ? `Next: ${nextTabName}` : "Save Profile"}</span>
          <span className="sm:hidden">{nextTabName ? `Next` : "Save"}</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    );
  };

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

      const currentTranslation = formData.preferredBibleTranslation || 'NIV';
      const response = await fetch('/api/bible/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          reference: trimmedVerse,
          version: currentTranslation
        })
      });

      
      if (response.ok) {
        const verseData = await response.json();

        if (verseData.text) {
          setVerseTexts(prev => ({
            ...prev,
            [index]: {
              text: verseData.text,
              reference: verseData.reference,
              version: verseData.version || currentTranslation
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

  // Spiritual Gifts Assessment Logic - Each gift now has multiple questions for accuracy
  const spiritualGiftsQuestions = [
    // Leadership questions (3 questions)
    { id: 'leadership1', question: 'People naturally look to me for direction and guidance', gift: 'Leadership' },
    { id: 'leadership2', question: 'I enjoy taking charge of projects and seeing them through', gift: 'Leadership' },
    { id: 'leadership3', question: 'Others often ask me to lead groups or initiatives', gift: 'Leadership' },
    
    // Teaching questions (3 questions)
    { id: 'teaching1', question: 'I love explaining biblical truths to help others understand', gift: 'Teaching' },
    { id: 'teaching2', question: 'I enjoy breaking down complex concepts into simple terms', gift: 'Teaching' },
    { id: 'teaching3', question: 'People tell me I have a gift for making things clear', gift: 'Teaching' },
    
    // Administration questions (2 questions)
    { id: 'administration1', question: 'I enjoy organizing people and resources for ministry projects', gift: 'Administration' },
    { id: 'administration2', question: 'I excel at planning events and managing details', gift: 'Administration' },
    
    // Mercy questions (2 questions)
    { id: 'mercy1', question: 'I am drawn to comfort and care for those who are suffering', gift: 'Mercy' },
    { id: 'mercy2', question: 'I feel deeply moved by others\' pain and want to help', gift: 'Mercy' },
    
    // Service questions (2 questions)
    { id: 'service1', question: 'I find joy in practical acts of service behind the scenes', gift: 'Service' },
    { id: 'service2', question: 'I prefer helping others rather than being in the spotlight', gift: 'Service' },
    
    // Evangelism questions (2 questions)
    { id: 'evangelism1', question: 'I enjoy sharing the gospel with non-believers', gift: 'Evangelism' },
    { id: 'evangelism2', question: 'I look for opportunities to tell others about Jesus', gift: 'Evangelism' },
    
    // Encouragement questions (2 questions)
    { id: 'encouragement1', question: 'I naturally encourage and build up others in their faith', gift: 'Encouragement' },
    { id: 'encouragement2', question: 'People say I help them feel better about themselves and their situation', gift: 'Encouragement' },
    
    // Giving questions (2 questions)
    { id: 'giving1', question: 'I feel called to be generous with my resources for ministry', gift: 'Giving' },
    { id: 'giving2', question: 'I get excited about supporting good causes financially', gift: 'Giving' },
    
    // Hospitality questions (2 questions)
    { id: 'hospitality1', question: 'I love welcoming and making people feel at home', gift: 'Hospitality' },
    { id: 'hospitality2', question: 'I enjoy hosting others and creating comfortable environments', gift: 'Hospitality' },
    
    // Helps questions (2 questions)
    { id: 'helps1', question: 'I love assisting others in completing their ministry tasks', gift: 'Helps' },
    { id: 'helps2', question: 'I find satisfaction in supporting others\' ministries', gift: 'Helps' },
    
    // Faith questions (2 questions)
    { id: 'faith1', question: 'I have strong faith that God will provide and work miracles', gift: 'Faith' },
    { id: 'faith2', question: 'I trust God completely even in difficult circumstances', gift: 'Faith' },
    
    // Discernment questions (2 questions)
    { id: 'discernment1', question: 'I can often sense spiritual truth or deception', gift: 'Discernment' },
    { id: 'discernment2', question: 'I can tell when something doesn\'t feel spiritually right', gift: 'Discernment' },
    
    // Wisdom questions (2 questions)
    { id: 'wisdom1', question: 'People seek me out for wise counsel and advice', gift: 'Wisdom' },
    { id: 'wisdom2', question: 'I often know the right thing to do in difficult situations', gift: 'Wisdom' },
    
    // Intercession questions (2 questions)
    { id: 'intercession1', question: 'I spend significant time in prayer for others', gift: 'Intercession' },
    { id: 'intercession2', question: 'I feel called to pray regularly for specific people and situations', gift: 'Intercession' }
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
    
    // Calculate average scores per gift (since gifts have different numbers of questions)
    const giftQuestionCounts: Record<string, number> = {};
    questions.forEach(q => {
      giftQuestionCounts[q.gift] = (giftQuestionCounts[q.gift] || 0) + 1;
    });
    
    const averageScores: Record<string, number> = {};
    Object.entries(scores).forEach(([gift, totalScore]) => {
      averageScores[gift] = totalScore / giftQuestionCounts[gift];
    });
    
    // Get top 3 gifts based on average scores (more accurate)
    const topGifts = Object.entries(averageScores)
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
      {/* Profile Completion Progress */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Profile Completion
          </h3>
          <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
            {completionPercentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
        {completionPercentage < 100 && (
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            Complete your profile to unlock all features and better connect with your community!
          </p>
        )}
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 gap-0.5 h-auto p-1">
          <TabsTrigger value="basic" className="flex flex-col items-center gap-1 text-xs px-1 py-2 h-auto min-h-[3rem]">
            <User className="w-3 h-3" />
            <span className="text-[10px] leading-tight text-center">Info</span>
          </TabsTrigger>
          <TabsTrigger value="spiritual" className="flex flex-col items-center gap-1 text-xs px-1 py-2 h-auto min-h-[3rem]">
            <Church className="w-3 h-3" />
            <span className="text-[10px] leading-tight text-center">Faith</span>
          </TabsTrigger>
          <TabsTrigger value="gifts" className="flex flex-col items-center gap-1 text-xs px-1 py-2 h-auto min-h-[3rem]">
            <Sparkles className="w-3 h-3" />
            <span className="text-[10px] leading-tight text-center">Gifts</span>
          </TabsTrigger>
          <TabsTrigger value="engagement" className="flex flex-col items-center gap-1 text-xs px-1 py-2 h-auto min-h-[3rem]">
            <Users className="w-3 h-3" />
            <span className="text-[10px] leading-tight text-center">Social</span>
          </TabsTrigger>
          <TabsTrigger value="growth" className="flex flex-col items-center gap-1 text-xs px-1 py-2 h-auto min-h-[3rem]">
            <Target className="w-3 h-3" />
            <span className="text-[10px] leading-tight text-center">Growth</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex flex-col items-center gap-1 text-xs px-1 py-2 h-auto min-h-[3rem]">
            <Shield className="w-3 h-3" />
            <span className="text-[10px] leading-tight text-center">Privacy</span>
          </TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic" className="space-y-6">
          {/* Profile Photo Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                <Camera className="w-5 h-5 text-purple-600" />
                Profile Photo
              </CardTitle>
              <CardDescription>
                Upload a beautiful profile photo to help others connect with you in your faith community
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                {/* Current Profile Photo Display */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-gradient-to-r from-purple-400 to-blue-400 dark:from-purple-600 dark:to-blue-600 shadow-lg hover:shadow-xl transition-all duration-200">
                      <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900">
                        {formData.profileImageUrl ? (
                          <img 
                            src={formData.profileImageUrl} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Upload indicator overlay */}
                    {isUploadingPhoto && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Upload Button */}
                <div className="flex-1">
                  <div className="space-y-3">
                    <ObjectUploader
                      maxNumberOfFiles={1}
                      maxFileSize={5 * 1024 * 1024} // 5MB limit
                      onGetUploadParameters={handleGetUploadParameters}
                      onComplete={handlePhotoUploadComplete}
                      buttonClassName="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                      <div className="flex items-center gap-2">
                        <Camera className="w-4 h-4" />
                        {isUploadingPhoto ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Uploading...</span>
                          </>
                        ) : (
                          "Upload Photo"
                        )}
                      </div>
                    </ObjectUploader>
                    
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                      <p className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-1">
                        📸 Photo Guidelines
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        • Recommended: 400x400px or larger<br/>
                        • Maximum file size: 5MB<br/>
                        • Supported formats: JPG, PNG, GIF
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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
                  {formData.mobileNumber && !formData.phoneVerified && (
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
                  {formData.mobileNumber && formData.phoneVerified && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded text-green-700 dark:text-green-300 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      Verified
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Get prayer alerts, event reminders, and secure access
                </p>
              </div>

              <div>
                <Label htmlFor="languagePreference">Language Preference</Label>
                <Select 
                  value={formData.languagePreference || "English"} 
                  onValueChange={(value) => {
                    setFormData({...formData, languagePreference: value});
                    // Clear custom language if not selecting "Other"
                    if (value !== "Other") {
                      setFormData(prev => ({...prev, languagePreference: value, customLanguage: null}));
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map(lang => (
                      <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* Show custom language input when "Other" is selected */}
                {formData.languagePreference === "Other" && (
                  <div className="mt-2">
                    <Input
                      placeholder="Please specify your language"
                      value={formData.customLanguage || ""}
                      onChange={(e) => setFormData({...formData, customLanguage: e.target.value})}
                      className="text-sm"
                    />
                  </div>
                )}
                
                <p className="text-xs text-muted-foreground mt-1">
                  Your preferred language for app content and communications
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
          
          <TabNavigation currentTabIndex={0} />
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
                  <div className="flex flex-col sm:flex-row gap-2">
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
                      className="w-full sm:w-auto whitespace-nowrap"
                    >
                      <span className="hidden sm:inline">Find Churches</span>
                      <span className="sm:hidden">Find Church</span>
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter your church name or use "Find Churches" to discover local congregations
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <Label htmlFor="preferredBibleTranslation">Preferred Bible Translation</Label>
                  <Select 
                    value={formData.preferredBibleTranslation || ""} 
                    onValueChange={(value) => {
                      setFormData(prev => ({...prev, preferredBibleTranslation: value}));
                      // Auto-save the translation preference immediately
                      autoSaveTranslation(value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select translation" />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTIVE_BIBLE_TRANSLATIONS.map(translation => (
                        <SelectItem key={translation.code} value={translation.code}>{translation.displayName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Default Bible version for scripture lookups {saving ? '(saving...)' : ''}
                  </p>
                </div>
                <div>
                  <Label htmlFor="smallGroup">Small Group Participation</Label>
                  <Select 
                    value={formData.smallGroup || "not_interested"} 
                    onValueChange={(value) => {
                      setFormData(prev => ({...prev, smallGroup: value}));
                      // Auto-save the small group preference immediately
                      autoSaveSmallGroup(value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your small group status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="interested">Interested - Want to join a small group</SelectItem>
                      <SelectItem value="looking_for_info">Looking for Info - Want to learn more about groups</SelectItem>
                      <SelectItem value="current_member">Current Member - Already in a small group</SelectItem>
                      <SelectItem value="not_interested">Not Interested - Not looking to join right now</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your interest level in Bible study and fellowship groups {saving ? '(saving...)' : ''}
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
                    className="w-full sm:w-auto bg-purple-50 hover:bg-purple-100 border-purple-300 text-purple-700 dark:bg-purple-900/20 dark:hover:bg-purple-900/40 dark:border-purple-600 dark:text-purple-300"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Favorite Verse
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <TabNavigation currentTabIndex={1} />
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
                            {formData.spiritualProfile.profileLabel || "Beginner Believer with Heart for Service"}
                          </h4>
                          <p className="text-gray-700 dark:text-gray-300 text-sm">
                            {formData.spiritualProfile.profileDescription || 
                             "You are at the beginning of an exciting spiritual journey, with a natural inclination toward encouragement, service, and hospitality. Your heart desires to support others and create welcoming environments in your faith community."}
                          </p>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-3">
                            Your Top Spiritual Gifts:
                          </h5>
                          <div className="space-y-4">
                            {(formData.spiritualProfile.topGifts || formData.spiritualGifts || formData.spiritualProfile.dominantGifts || []).map((gift, index) => (
                              <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <Badge className="bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900 dark:text-purple-100">
                                      #{index + 1} {gift}
                                    </Badge>
                                    {spiritualGiftsData[gift as keyof typeof spiritualGiftsData] && (
                                      <Badge variant="outline" className="text-xs">
                                        {spiritualGiftsData[gift as keyof typeof spiritualGiftsData].scripture}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                
                                {spiritualGiftsData[gift as keyof typeof spiritualGiftsData] && (
                                  <div className="space-y-2">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                      {spiritualGiftsData[gift as keyof typeof spiritualGiftsData].description}
                                    </p>
                                    
                                    {loadingVerses ? (
                                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                                        <div className="flex items-center gap-2">
                                          <RefreshCw className="w-3 h-3 animate-spin text-blue-600" />
                                          <p className="text-xs text-blue-600 dark:text-blue-300">Loading Scripture...</p>
                                        </div>
                                      </div>
                                    ) : giftVerses[gift] ? (
                                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                                        <p className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-1">
                                          {spiritualGiftsData[gift as keyof typeof spiritualGiftsData].scripture}
                                        </p>
                                        <p className="text-sm italic text-blue-700 dark:text-blue-300">
                                          "{giftVerses[gift]}"
                                        </p>
                                      </div>
                                    ) : (
                                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                                        <p className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-1">
                                          {spiritualGiftsData[gift as keyof typeof spiritualGiftsData].scripture}
                                        </p>
                                        <p className="text-xs text-blue-600 dark:text-blue-300">
                                          Scripture reference available
                                        </p>
                                      </div>
                                    )}
                                    
                                    <div className="grid grid-cols-1 gap-3 text-xs">
                                      <div>
                                        <p className="font-medium text-gray-800 dark:text-gray-200 mb-1">SOAP Journal Themes:</p>
                                        <div className="flex flex-wrap gap-1">
                                          {spiritualGiftsData[gift as keyof typeof spiritualGiftsData].soapThemes.map((theme, i) => (
                                            <span key={i} className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded-full text-xs">
                                              {theme}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                      <div>
                                        <p className="font-medium text-gray-800 dark:text-gray-200 mb-1">Ministry Context:</p>
                                        <p className="text-gray-600 dark:text-gray-400">
                                          {spiritualGiftsData[gift as keyof typeof spiritualGiftsData].ministryContext}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-gray-800 dark:text-gray-200">
                            Serving Style:
                          </h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {formData.spiritualProfile.servingStyle || 
                             "Beginner believer focused on encouragement, service, and hospitality - actively seeking opportunities to support others and create welcoming environments in the faith community."}
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

                  {/* AI Analysis Section */}
                  {aiGiftSuggestions && (
                    <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-green-500 dark:bg-green-600 rounded-full flex items-center justify-center">
                          <Brain className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                            AI Analysis of Your SOAP Journals
                          </h4>
                          <p className="text-sm text-green-800 dark:text-green-200">
                            {aiGiftSuggestions.message}
                          </p>
                          {aiGiftSuggestions.suggestedGifts && aiGiftSuggestions.suggestedGifts.length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs font-medium text-green-800 dark:text-green-200 mb-2">
                                Gifts reflected in your journaling:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {aiGiftSuggestions.suggestedGifts.map((gift: string, i: number) => (
                                  <Badge key={i} className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-100">
                                    {gift}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <Button
                      type="button"
                      className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto"
                      onClick={() => window.location.href = '/spiritual-assessment-results?returnTo=profile'}
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">View Full Results</span>
                      <span className="sm:hidden">View Results</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-300 dark:hover:bg-purple-900/20 w-full sm:w-auto"
                      onClick={() => {
                        // Detect assessment type and redirect accordingly
                        const assessmentLength = formData.assessmentData?.responses?.length || 0;
                        const isFullAssessment = assessmentLength >= 100; // 120-question assessment
                        
                        if (isFullAssessment) {
                          window.location.href = '/spiritual-assessment';
                        } else {
                          setShowGiftsAssessment(true);
                        }
                      }}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Retake Assessment</span>
                      <span className="sm:hidden">Retake</span>
                    </Button>
                    {(() => {
                      const assessmentLength = formData.assessmentData?.responses?.length || 0;
                      const isFullAssessment = assessmentLength >= 100;
                      
                      // Only show "Take Full Assessment" if they haven't taken it yet
                      if (!isFullAssessment) {
                        return (
                          <Button
                            type="button"
                            className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
                            onClick={() => window.location.href = '/spiritual-assessment'}
                          >
                            <Target className="w-4 h-4 mr-2" />
                            <span className="hidden sm:inline">Take Full Assessment</span>
                            <span className="sm:hidden">Full Test</span>
                          </Button>
                        );
                      }
                      return null;
                    })()}
                    <Button
                      type="button"
                      variant="outline"
                      className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 w-full sm:w-auto"
                      onClick={() => setShowGiftsInfoModal(true)}
                    >
                      <span className="hidden sm:inline">Learn More</span>
                      <span className="sm:hidden">Info</span>
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
                  <div className="mt-6 flex flex-wrap gap-3">
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
                      onClick={() => setShowGiftsInfoModal(true)}
                    >
                      Learn About Gifts
                    </Button>
                    {formData.spiritualProfile && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={analyzeJournalingPatterns}
                        disabled={loadingAiAnalysis}
                        className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-300"
                      >
                        {loadingAiAnalysis ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Brain className="w-4 h-4 mr-2" />
                        )}
                        {loadingAiAnalysis ? 'Analyzing...' : 'AI Analysis'}
                      </Button>
                    )}
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
          
          <TabNavigation currentTabIndex={2} />
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                  {MINISTRY_INTERESTS.map(interest => (
                    <div key={interest} className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
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
                      <Label htmlFor={interest} className="text-sm cursor-pointer flex-1">{interest}</Label>
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
          
          <TabNavigation currentTabIndex={3} />
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  {GROWTH_GOALS.map(goal => (
                    <div key={goal} className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
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
                      <Label htmlFor={goal} className="text-sm cursor-pointer flex-1">{goal}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Smart Reading Plan Prompt */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                      Bible Reading Plan
                    </h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                      You can choose a Bible reading plan later. This will auto-update when you join a group or select a plan.
                    </p>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      className="border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-300"
                      onClick={() => window.open('/reading-plans', '_blank')}
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Explore Reading Plans
                    </Button>
                  </div>
                </div>
              </div>

              {/* Smart Prayer Request Prompt */}
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <Heart className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-1">
                      Prayer Requests
                    </h4>
                    <p className="text-sm text-purple-800 dark:text-purple-200 mb-3">
                      You can submit prayer requests anytime from the Prayer Wall. Share your needs with your church or small group when you're ready.
                    </p>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      className="border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-300"
                      onClick={() => window.open('/prayer-wall', '_blank')}
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      Visit Prayer Wall
                    </Button>
                  </div>
                </div>
              </div>


            </CardContent>
          </Card>
          
          <TabNavigation currentTabIndex={4} />
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
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex-1">
                    <Label htmlFor="showBioPublicly" className="font-medium text-gray-900 dark:text-gray-100">Show bio publicly</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Let others see your bio and testimony</p>
                  </div>
                  <Switch
                    id="showBioPublicly"
                    checked={formData.showBioPublicly === true}
                    onCheckedChange={(checked) => setFormData({...formData, showBioPublicly: checked})}
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex-1">
                    <Label htmlFor="showChurchAffiliation" className="font-medium text-gray-900 dark:text-gray-100">Show church affiliation</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Display your church or community</p>
                  </div>
                  <Switch
                    id="showChurchAffiliation"
                    checked={formData.showChurchAffiliation === true}
                    onCheckedChange={(checked) => setFormData({...formData, showChurchAffiliation: checked})}
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex-1">
                    <Label htmlFor="shareWithGroup" className="font-medium text-gray-900 dark:text-gray-100">Share with small group</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Allow small group members to see more details</p>
                  </div>
                  <Switch
                    id="shareWithGroup"
                    checked={formData.shareWithGroup === true}
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
                    checked={formData.showAgeRange === true}
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
                    checked={formData.showLocation === true}
                    onCheckedChange={(checked) => setFormData({...formData, showLocation: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="showMobile" className="font-medium">Show mobile number</Label>
                    <p className="text-sm text-gray-600">Display your phone number publicly</p>
                  </div>
                  <Switch
                    id="showMobile"
                    checked={formData.showMobile === true}
                    onCheckedChange={(checked) => setFormData({...formData, showMobile: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="showGender" className="font-medium">Show gender</Label>
                    <p className="text-sm text-gray-600">Display your gender publicly</p>
                  </div>
                  <Switch
                    id="showGender"
                    checked={formData.showGender === true}
                    onCheckedChange={(checked) => setFormData({...formData, showGender: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="showDenomination" className="font-medium">Show denomination</Label>
                    <p className="text-sm text-gray-600">Display your denomination publicly</p>
                  </div>
                  <Switch
                    id="showDenomination"
                    checked={formData.showDenomination === true}
                    onCheckedChange={(checked) => setFormData({...formData, showDenomination: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="showSpiritualGifts" className="font-medium">Show spiritual gifts</Label>
                    <p className="text-sm text-gray-600">Display your spiritual gifts assessment results</p>
                  </div>
                  <Switch
                    id="showSpiritualGifts"
                    checked={formData.showSpiritualGifts === true}
                    onCheckedChange={(checked) => setFormData({...formData, showSpiritualGifts: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="publicSharing" className="font-medium">Share SOAP journal entries publicly</Label>
                    <p className="text-sm text-gray-600">Allow your spiritual reflections to inspire the community</p>
                  </div>
                  <Switch
                    id="publicSharing"
                    checked={formData.publicSharing === true}
                    onCheckedChange={(checked) => setFormData({...formData, publicSharing: checked})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <TabNavigation currentTabIndex={5} />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2 pt-6 border-t">
        <Button 
          onClick={handleSave}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <Heart className="w-4 h-4" />
          {isLoading ? "Saving..." : "Save Changes"}
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
          // Update the formData with the assessment results using functional update
          setFormData(prevFormData => ({
            ...prevFormData, 
            spiritualGifts: profile.topGifts || [],
            spiritualProfile: profile
          }));
          setShowGiftsAssessment(false);
        }}
      />

      {/* Spiritual Gifts Info Modal */}
      <Dialog open={showGiftsInfoModal} onOpenChange={setShowGiftsInfoModal}>
        <DialogContent className="max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
              About Spiritual Gifts
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 text-center">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Your spiritual gifts are special abilities God gives you to help and serve others! 
            </p>
            
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-4 rounded-lg">
              <p className="text-sm text-purple-800 dark:text-purple-200">
                These might be things like being good at encouraging people, leading groups, teaching, or showing compassion.
              </p>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Think of them as your spiritual superpowers - areas where you naturally shine and can make the biggest impact!
            </p>
            
            <div className="pt-4">
              <Button 
                onClick={() => setShowGiftsInfoModal(false)}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                Got It!
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
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
  const [showResults, setShowResults] = useState(false);
  const [initialResults, setInitialResults] = useState<any>(null);
  const [showExpandedAssessment, setShowExpandedAssessment] = useState(false);
  const [assessmentType, setAssessmentType] = useState<'quick' | 'expanded'>('quick');
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
      const score = responses[q.id];
      if (score !== undefined && score !== null) {
        if (!scores[q.gift]) scores[q.gift] = 0;
        scores[q.gift] += score;
      }
    });
    
    // Get top 3 gifts based on actual scores
    const topGifts = Object.entries(scores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([gift]) => gift);
    
    // Calculate overall engagement level from actual responses
    const responseValues = Object.values(responses).filter(val => val !== undefined && val !== null);
    const totalScore = responseValues.reduce((sum, score) => sum + score, 0);
    const averageScore = responseValues.length > 0 ? totalScore / responseValues.length : 0;
    

    
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
    onError: (error) => {

      // Calculate the profile locally if API fails
      const responses = form.getValues().responses;
      if (responses && Object.keys(responses).length > 0) {
        const profile = calculateSpiritualProfile(responses, questionsToUse);

        onComplete({ ...profile, success: true });
      } else {

      }
    }
  });

  // Extended questions for comprehensive assessment
  const expandedQuestions = [
    ...spiritualGiftsQuestions,
    // Additional 25 questions for deeper assessment (90 more would be added in production)
    { id: 'strategic_thinking', question: 'I naturally think about long-term ministry strategy and planning', gift: 'Strategic Leadership' },
    { id: 'conflict_resolution', question: 'I feel equipped to help resolve conflicts between people', gift: 'Peacemaking' },
    { id: 'spiritual_warfare', question: 'I understand spiritual battles and feel called to intercede', gift: 'Spiritual Warfare' },
    { id: 'prayer_leader', question: 'Others often ask me to pray for them or lead prayer sessions', gift: 'Prayer Leadership' },
    { id: 'worship_leading', question: 'I feel called to lead others in worship and praise', gift: 'Worship Leading' },
    { id: 'biblical_storytelling', question: 'I love sharing Bible stories in engaging, memorable ways', gift: 'Biblical Storytelling' },
    { id: 'youth_connection', question: 'I naturally connect with and understand young people', gift: 'Youth Ministry' },
    { id: 'senior_ministry', question: 'I feel called to minister to and care for elderly believers', gift: 'Senior Ministry' },
    { id: 'small_group_leading', question: 'I thrive at facilitating meaningful small group discussions', gift: 'Small Group Leadership' },
    { id: 'missions_mobilizing', question: 'I inspire others to engage in missionary work', gift: 'Missions Mobilization' },
    { id: 'church_planting', question: 'I dream about starting new churches or ministries', gift: 'Church Planting' },
    { id: 'discipleship_making', question: 'I excel at mentoring new believers in their faith journey', gift: 'Discipleship' },
    { id: 'apologetics', question: 'I enjoy defending the Christian faith with reason and evidence', gift: 'Apologetics' },
    { id: 'creative_worship', question: 'I create original content for worship (songs, art, poetry)', gift: 'Creative Worship' },
    { id: 'technology_ministry', question: 'I use technology to enhance ministry and reach people', gift: 'Technology Ministry' },
    { id: 'social_justice', question: 'I feel called to fight injustice and serve the marginalized', gift: 'Social Justice' },
    { id: 'financial_stewardship', question: 'I help others understand biblical principles of money management', gift: 'Financial Stewardship' },
    { id: 'marriage_ministry', question: 'I love helping couples build strong, biblical marriages', gift: 'Marriage Ministry' },
    { id: 'grief_counseling', question: 'I feel equipped to walk with people through loss and grief', gift: 'Grief Ministry' },
    { id: 'recovery_ministry', question: 'I have a heart for helping people overcome addictions', gift: 'Recovery Ministry' },
    { id: 'prophetic_insight', question: 'I often receive insights about future direction for ministry', gift: 'Prophetic Insight' },
    { id: 'cross_cultural', question: 'I easily adapt and minister across different cultures', gift: 'Cross-Cultural Ministry' },
    { id: 'business_ministry', question: 'I see opportunities to use business for kingdom purposes', gift: 'Business Ministry' },
    { id: 'special_needs', question: 'I feel called to minister to people with disabilities', gift: 'Special Needs Ministry' },
    { id: 'prison_ministry', question: 'I have a heart for ministering to incarcerated individuals', gift: 'Prison Ministry' }
  ];

  const questionsToUse = assessmentType === 'expanded' ? expandedQuestions : spiritualGiftsQuestions;
  const totalPages = Math.ceil(questionsToUse.length / questionsPerPage);
  const currentQuestions = questionsToUse.slice(
    currentPage * questionsPerPage,
    (currentPage + 1) * questionsPerPage
  );

  const onSubmit = (data: SpiritualGiftsForm) => {

    const responses = data.responses || {};
    
    // Only count responses for questions that actually exist in the current assessment type
    const validQuestionIds = questionsToUse.map(q => q.id);
    const validResponses = Object.fromEntries(
      Object.entries(responses).filter(([id]) => validQuestionIds.includes(id))
    );
    const answeredQuestions = Object.keys(validResponses).length;
    

    
    // Check if all questions are answered
    if (answeredQuestions < questionsToUse.length) {

      
      // For expanded assessment, don't auto-submit until all questions are done
      if (assessmentType === 'expanded' && answeredQuestions < questionsToUse.length) {
        alert(`Please answer all ${questionsToUse.length} questions before completing the assessment. You have answered ${answeredQuestions} so far.`);
        return;
      }
    }
    
    const profile = calculateSpiritualProfile(validResponses, questionsToUse);
    
    // Store results and show them to the user
    setInitialResults(profile);
    setShowResults(true);
    
    const enrichedData = {
      responses: validResponses,
      profile
    };
    
    // Try API submission, but fall back to local completion
    assessmentMutation.mutate(enrichedData);
  };

  // Results Display Component
  const ResultsDisplay = () => (
    <div className="space-y-6">
      <DialogHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-white" />
        </div>
        <DialogTitle className="text-2xl font-bold">Your Spiritual Gifts Profile</DialogTitle>
        <DialogDescription>
          Here are your initial results from the 30-question assessment
        </DialogDescription>
      </DialogHeader>
      
      {initialResults && (
        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
            <CardContent className="p-6">
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-purple-800">{initialResults.profileLabel}</h3>
                <p className="text-purple-600">{initialResults.profileDescription}</p>
                <Badge className="bg-purple-100 text-purple-700 border-purple-200 px-3 py-1">
                  {initialResults.servingStyle}
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Your Top 3 Spiritual Gifts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {initialResults.topGifts.map((gift: string, index: number) => (
                  <div key={gift} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <span className="font-medium">{gift}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <h4 className="text-lg font-semibold text-blue-800">Want a deeper understanding of your spiritual gifts?</h4>
                <p className="text-blue-600">Continue to the full 120-question discovery for:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Refined rankings (1–20)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Shadow gifts & hidden strengths</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Ministry role matchings</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Leadership development insights</span>
                  </div>
                </div>
                <div className="flex gap-3 justify-center pt-4">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      onComplete(initialResults);
                    }}
                  >
                    Use These Results
                  </Button>
                  <Button 
                    className="bg-gradient-to-r from-blue-500 to-indigo-500"
                    onClick={() => {
                      setShowResults(false);
                      setAssessmentType('expanded');
                      // Continue from where quick assessment left off (30 questions = 6 pages)
                      const quickAssessmentPages = Math.ceil(spiritualGiftsQuestions.length / questionsPerPage);
                      setCurrentPage(quickAssessmentPages);
                    }}
                  >
                    Take Full Assessment (55 Questions)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );

  if (showResults) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <ResultsDisplay />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold">
            {assessmentType === 'quick' ? 'Spiritual Gifts Assessment' : 'Deep Spiritual Gifts Discovery'}
          </DialogTitle>
          <DialogDescription>
            {assessmentType === 'quick' 
              ? 'Discover your God-given spiritual gifts and find your perfect ministry fit (30 questions)'
              : 'Comprehensive spiritual gifts analysis for deeper ministry insights (120 questions)'
            }
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
                  type="button"
                  disabled={assessmentMutation.isPending}
                  className="bg-gradient-to-r from-purple-500 to-blue-500"
                  onClick={() => {
                    const formData = form.getValues();
                    
                    // Force trigger submission even with validation errors
                    const responses = formData.responses || {};
                    onSubmit({ responses });
                  }}
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