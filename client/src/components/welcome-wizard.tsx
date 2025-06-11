import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Church, 
  Heart, 
  Music, 
  Users, 
  BookOpen, 
  Coffee, 
  Gamepad2, 
  Palette, 
  Camera, 
  Dumbbell,
  Code,
  Utensils,
  MapPin,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Sparkles,
  Target,
  X,
  HelpCircle,
  Calendar,
  Info,
  Mail,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface WelcomeWizardProps {
  onComplete: () => void;
}

interface WizardData {
  denomination: string;
  denominationCustom?: string;
  interests: string[];
  ageGroup: string;
  churchSize: string;
  musicStyle: string;
  meetingStyle: string;
  emailVerified?: boolean;
}

const denominations = [
  // Main Denominations
  { id: "non-denominational", label: "Non-Denominational", description: "Community-focused worship", category: "main" },
  { id: "baptist", label: "Baptist", description: "Traditional evangelical approach", category: "main" },
  { id: "methodist", label: "Methodist", description: "Social justice and service", category: "main" },
  { id: "presbyterian", label: "Presbyterian", description: "Reformed theological tradition", category: "main" },
  { id: "pentecostal", label: "Pentecostal", description: "Spirit-filled worship", category: "main" },
  { id: "evangelical", label: "Evangelical", description: "Bible-centered evangelical faith", category: "main" },
  { id: "assemblies-of-god", label: "Assemblies of God", description: "Pentecostal movement with strong missions focus", category: "main" },
  { id: "orthodox-eastern", label: "Orthodox (Eastern)", description: "Ancient Eastern Christian tradition", category: "main" },
  { id: "seventh-day-adventist", label: "Seventh-day Adventist", description: "Sabbath-observing Protestant denomination", category: "main" },
  { id: "episcopal", label: "Episcopal", description: "Anglican tradition", category: "main" },
  { id: "lutheran", label: "Lutheran", description: "Grace-centered teaching", category: "main" },
  { id: "catholic", label: "Catholic", description: "Traditional Catholic mass", category: "main" },
  
  // Other Traditions
  { id: "reformed", label: "Reformed", description: "Calvinist theological roots; often overlaps with Presbyterian", category: "other" },
  { id: "charismatic", label: "Charismatic", description: "Spirit-filled worship, distinct from Pentecostal", category: "other" },
  { id: "church-of-christ", label: "Church of Christ", description: "Non-instrumental, New Testament-centered", category: "other" },
  { id: "ame", label: "AME (African Methodist Episcopal)", description: "Historic Black denomination with Methodist roots", category: "other" },
  { id: "mennonite", label: "Mennonite / Anabaptist", description: "Peace-oriented, simple-living Christian tradition", category: "other" },
  { id: "quaker", label: "Quaker (Friends)", description: "Emphasizes silence, inner light, and pacifism", category: "other" },
  { id: "messianic-jewish", label: "Messianic Jewish", description: "Jewish believers in Jesus (Yeshua)", category: "other" },
  { id: "foursquare", label: "Foursquare", description: "Christ-centered Pentecostal tradition", category: "other" },
  { id: "coptic-orthodox", label: "Coptic Orthodox", description: "Ancient Egyptian Christian tradition", category: "other" },
  { id: "other-specify", label: "Other (Please Specify)", description: "Freeform option for full inclusivity", category: "other" },
  
  // Exploring
  { id: "exploring", label: "Still Exploring", description: "Open to different traditions", category: "main" }
];

const ministryCategories = [
  {
    id: "life-stage",
    title: "Life Stage Ministries",
    description: "Age and life stage focused communities",
    icon: Users,
    interests: [
      { id: "youth", label: "Youth Ministry", description: "Teens and high school students", icon: Users, color: "bg-blue-100 text-blue-700" },
      { id: "college-young-adults", label: "College & Young Adults", description: "Post-high school, transitional life phase", icon: Users, color: "bg-indigo-100 text-indigo-700" },
      { id: "mens-ministry", label: "Men's Ministry", description: "Brotherhood, accountability, retreats", icon: Users, color: "bg-gray-100 text-gray-700" },
      { id: "womens-ministry", label: "Women's Ministry", description: "Fellowship, mentorship, prayer circles", icon: Users, color: "bg-pink-100 text-pink-700" },
      { id: "singles-ministry", label: "Singles Ministry", description: "Community and discipleship for unmarried adults", icon: Users, color: "bg-purple-100 text-purple-700" },
      { id: "marriage-ministry", label: "Marriage Ministry", description: "Support for couples, counseling, enrichment", icon: Heart, color: "bg-red-100 text-red-700" },
      { id: "family", label: "Family Ministry", description: "Families with children of all ages", icon: Users, color: "bg-teal-100 text-teal-700" },
      { id: "childrens-ministry", label: "Children's Ministry", description: "Sunday school, VBS, family outreach", icon: Users, color: "bg-yellow-100 text-yellow-700" },
      { id: "seniors-ministry", label: "Seniors Ministry", description: "Connection and care for older adults", icon: Users, color: "bg-orange-100 text-orange-700" }
    ]
  },
  {
    id: "spiritual-growth",
    title: "Spiritual Growth",
    description: "Deepen your faith and biblical understanding",
    icon: BookOpen,
    interests: [
      { id: "bible-study", label: "Bible Study", description: "In-depth scripture exploration", icon: BookOpen, color: "bg-green-100 text-green-700" },
      { id: "prayer", label: "Prayer Groups", description: "Corporate and personal prayer", icon: Heart, color: "bg-pink-100 text-pink-700" },
      { id: "intercessory-prayer", label: "Intercessory Prayer", description: "Focused prayer warriors for church needs", icon: Heart, color: "bg-rose-100 text-rose-700" },
      { id: "small-groups", label: "Small Groups", description: "Intimate fellowship and study", icon: Users, color: "bg-yellow-100 text-yellow-700" },
      { id: "discipleship", label: "Mentorship & Discipleship", description: "1-on-1 spiritual guidance", icon: BookOpen, color: "bg-blue-100 text-blue-700" },
      { id: "leadership-development", label: "Leadership Development", description: "Equip future pastors, elders, and volunteers", icon: Target, color: "bg-purple-100 text-purple-700" },
      { id: "theology-apologetics", label: "Theology & Apologetics", description: "Deep study, defending the faith", icon: BookOpen, color: "bg-indigo-100 text-indigo-700" },
      { id: "missions", label: "Missions", description: "Local and global Gospel outreach", icon: MapPin, color: "bg-cyan-100 text-cyan-700" },
      { id: "evangelism-outreach", label: "Evangelism & Outreach", description: "Sharing the Gospel locally and abroad", icon: MapPin, color: "bg-teal-100 text-teal-700" }
    ]
  },
  {
    id: "creative-service",
    title: "Creative & Service",
    description: "Use your talents to serve and create",
    icon: Palette,
    interests: [
      { id: "music", label: "Music & Worship", description: "Leading worship through music", icon: Music, color: "bg-purple-100 text-purple-700" },
      { id: "arts", label: "Arts & Creativity", description: "Visual arts, drama, and creative expression", icon: Palette, color: "bg-rose-100 text-rose-700" },
      { id: "technology", label: "Tech Ministry", description: "Digital tools and online presence", icon: Code, color: "bg-cyan-100 text-cyan-700" },
      { id: "media-production", label: "Media & Production", description: "Livestream, A/V, lighting", icon: Camera, color: "bg-gray-100 text-gray-700" },
      { id: "social-media", label: "Social Media & Content", description: "Posts, videos, digital outreach", icon: Code, color: "bg-blue-100 text-blue-700" },
      { id: "hospitality", label: "Hospitality & Welcome", description: "Greeters, ushers, coffee teams", icon: Coffee, color: "bg-orange-100 text-orange-700" },
      { id: "event-planning", label: "Event Planning", description: "Organize retreats, holidays, conferences", icon: Calendar, color: "bg-green-100 text-green-700" },
      { id: "fellowship", label: "Fellowship Events", description: "Social gatherings and community building", icon: Coffee, color: "bg-yellow-100 text-yellow-700" },
      { id: "facilities", label: "Facilities & Grounds", description: "Maintenance, setup, decor", icon: Dumbbell, color: "bg-teal-100 text-teal-700" }
    ]
  },
  {
    id: "community-outreach",
    title: "Community Outreach",
    description: "Serve others and share God's love",
    icon: Heart,
    interests: [
      { id: "community-service", label: "Community Service", description: "Local volunteer opportunities", icon: Heart, color: "bg-red-100 text-red-700" },
      { id: "care-counseling", label: "Care & Counseling", description: "Mental health, grief, addiction recovery", icon: Heart, color: "bg-pink-100 text-pink-700" },
      { id: "benevolence", label: "Benevolence Ministry", description: "Financial aid, food pantry, housing support", icon: Heart, color: "bg-rose-100 text-rose-700" },
      { id: "visitation", label: "Visitation Ministry", description: "Hospital/homebound visits, elder care", icon: Heart, color: "bg-orange-100 text-orange-700" },
      { id: "sports", label: "Sports & Recreation", description: "Athletic programs and fitness", icon: Dumbbell, color: "bg-blue-100 text-blue-700" },
      { id: "recovery", label: "Recovery & Support", description: "Addiction recovery and life restoration", icon: Heart, color: "bg-purple-100 text-purple-700" }
    ]
  }
];

const ageGroups = [
  { id: "13-17", label: "13-17", description: "Teen & Student Ministry" },
  { id: "18-25", label: "18-25", description: "College & Young Adult" },
  { id: "26-35", label: "26-35", description: "Young Professional" },
  { id: "36-50", label: "36-50", description: "Family & Career" },
  { id: "51-65", label: "51-65", description: "Mature Adult" },
  { id: "65+", label: "65+", description: "Senior Ministry" }
];

const churchSizes = [
  { id: "house", label: "House/Micro Church (1-50)", description: "Close-knit, often home-based" },
  { id: "small", label: "Small Church (51-200)", description: "Intimate community feel" },
  { id: "medium", label: "Medium Church (201-500)", description: "Balanced programs & groups" },
  { id: "large", label: "Large Church (501-1,999)", description: "Expanded ministries" },
  { id: "mega", label: "Mega Church (2,000-9,999)", description: "Large scale, multi-service" },
  { id: "multisite", label: "Multisite Network (10,000+)", description: "Multi-campus, global reach" }
];

const musicStyles = [
  { id: "contemporary", label: "Contemporary", description: "Modern worship music" },
  { id: "traditional", label: "Traditional", description: "Hymns and classical" },
  { id: "blended", label: "Blended", description: "Mix of both styles" },
  { id: "no-preference", label: "No Preference", description: "Open to any style" }
];

const meetingStyles = [
  { id: "in-person", label: "In-Person Only", description: "Traditional gathering" },
  { id: "hybrid", label: "Hybrid", description: "Both in-person and online" },
  { id: "flexible", label: "Flexible", description: "Multiple service options" }
];

export default function WelcomeWizard({ onComplete }: WelcomeWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardData, setWizardData] = useState<WizardData>({
    denomination: "",
    denominationCustom: "",
    interests: [],
    ageGroup: "",
    churchSize: "",
    musicStyle: "",
    meetingStyle: ""
  });
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [showOtherTraditions, setShowOtherTraditions] = useState(false);
  const [showDenominationDisclaimer, setShowDenominationDisclaimer] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [churchSearchQuery, setChurchSearchQuery] = useState("");
  const [joiningChurchId, setJoiningChurchId] = useState<number | null>(null);
  const [emailVerificationToken, setEmailVerificationToken] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const steps = [
    "Welcome",
    "Email Verification",
    "Denomination",
    "Interests",
    "Preferences",
    "Recommendations"
  ];

  const { data: churches } = useQuery({
    queryKey: ["/api/churches"],
  });

  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // Check email verification status on mount
  const { data: emailStatus } = useQuery({
    queryKey: ['/api/auth/email-verification-status'],
    enabled: !!user,
  });

  // Email verification mutations
  const sendVerificationEmail = useMutation({
    mutationFn: async () => {
      if (!user?.email) {
        throw new Error("User email not found");
      }
      return await apiRequest("POST", "/api/auth/send-verification", { 
        email: user.email 
      });
    },
    onSuccess: async () => {
      setEmailSent(true);
      
      // In development, fetch the verification token for easy testing
      try {
        const tokenData = await apiRequest("GET", "/api/auth/dev/verification-token");
        if (tokenData.token) {
          setEmailVerificationToken(tokenData.token.substring(0, 6)); // Use first 6 chars as demo
          toast({
            title: "Verification Email Sent",
            description: `Development mode: Token auto-filled for testing (${tokenData.email})`,
          });
        } else {
          toast({
            title: "Verification Email Sent",
            description: "Check your inbox for the verification email.",
          });
        }
      } catch {
        toast({
          title: "Verification Email Sent",
          description: "Check your inbox for the verification email.",
        });
      }
    },
    onError: (error: any) => {
      if (error.message === "Email is already verified") {
        setWizardData(prev => ({ ...prev, emailVerified: true }));
        toast({
          title: "Email Already Verified",
          description: "Your email is already verified. Proceeding to next step.",
        });
        setCurrentStep(2); // Move to denomination step
      } else {
        toast({
          title: "Unable to Send Email",
          description: error.message || "Failed to send verification email",
          variant: "destructive",
        });
      }
    }
  });

  const verifyEmail = useMutation({
    mutationFn: async (token: string) => {
      return await apiRequest("POST", "/api/auth/verify-email", { token });
    },
    onSuccess: () => {
      setWizardData(prev => ({ ...prev, emailVerified: true }));
      toast({
        title: "Email Verified",
        description: "Your email has been verified successfully!",
      });
      setCurrentStep(2); // Move to denomination step
    },
    onError: (error: any) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid verification token",
        variant: "destructive",
      });
    }
  });

  const generateRecommendations = useMutation({
    mutationFn: async (data: WizardData) => {
      // Simulate AI-powered matching based on preferences
      const churchList = Array.isArray(churches) ? churches : [];
      const scored = churchList.map((church: any) => {
        let score = 0;
        
        // Denomination matching
        if (data.denomination === "exploring" || church.denomination === data.denomination) {
          score += 30;
        }
        
        // Size preference
        const memberCount = church.memberCount || 300;
        if (
          (data.churchSize === "house" && memberCount <= 50) ||
          (data.churchSize === "small" && memberCount > 50 && memberCount <= 200) ||
          (data.churchSize === "medium" && memberCount > 200 && memberCount <= 500) ||
          (data.churchSize === "large" && memberCount > 500 && memberCount <= 1999) ||
          (data.churchSize === "mega" && memberCount > 1999 && memberCount <= 9999) ||
          (data.churchSize === "multisite" && memberCount > 9999)
        ) {
          score += 20;
        }
        
        // Interest-based scoring
        const churchPrograms = [
          church.hasYouthMinistry && "youth",
          church.hasMusic && "music",
          church.hasBibleStudy && "bible-study",
          church.hasCommunityService && "community-service",
          church.hasSmallGroups && "small-groups"
        ].filter(Boolean);
        
        const matchingInterests = data.interests.filter(interest => 
          churchPrograms.includes(interest)
        );
        score += matchingInterests.length * 10;
        
        // Location bonus (assuming all are nearby for demo)
        score += 15;
        
        return { ...church, score, matchingInterests };
      });
      
      return scored
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);
    },
    onSuccess: (data) => {
      setRecommendations(data);
      setCurrentStep(4);
    }
  });

  const completeOnboarding = useMutation({
    mutationFn: async (data: WizardData) => {
      return await apiRequest("POST", "/api/auth/complete-onboarding", data);
    },
    onSuccess: () => {
      toast({
        title: "Welcome to Soapbox!",
        description: "Your preferences have been saved. Start exploring!",
      });
      // Use setTimeout to ensure the toast shows before closing
      setTimeout(() => {
        onComplete();
      }, 1000);
    }
  });

  // Load all churches for search functionality
  const { data: allChurches = [] } = useQuery({
    queryKey: ["/api/churches"],
    enabled: currentStep >= 4, // Only load when needed
  });

  // Filter churches based on search query
  const filteredChurches = churchSearchQuery.length > 0 
    ? allChurches.filter((church: any) => 
        church.name.toLowerCase().includes(churchSearchQuery.toLowerCase()) ||
        church.denomination?.toLowerCase().includes(churchSearchQuery.toLowerCase()) ||
        church.address?.toLowerCase().includes(churchSearchQuery.toLowerCase()) ||
        church.city?.toLowerCase().includes(churchSearchQuery.toLowerCase())
      )
    : [];

  const joinChurch = useMutation({
    mutationFn: async (churchId: number) => {
      console.log("Joining church with ID:", churchId);
      setJoiningChurchId(churchId);
      return await apiRequest("POST", `/api/churches/${churchId}/join`);
    },
    onSuccess: (_, churchId) => {
      console.log("Successfully joined church:", churchId);
      setJoiningChurchId(null);
      toast({
        title: "Church Joined Successfully!",
        description: "You've connected with this church. You can add more churches or complete setup.",
      });
      // Don't auto-complete onboarding - let user choose to add more churches or finish
    },
    onError: (error) => {
      console.error("Error joining church:", error);
      setJoiningChurchId(null);
      toast({
        title: "Error Joining Church",
        description: "Please try again or skip for now.",
        variant: "destructive",
      });
    }
  });

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateWizardData = (field: keyof WizardData, value: any) => {
    setWizardData(prev => ({ ...prev, [field]: value }));
  };

  const toggleInterest = (interestId: string) => {
    setWizardData(prev => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter(id => id !== interestId)
        : [...prev.interests, interestId]
    }));
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return true; // Welcome step
      case 1: return wizardData.emailVerified === true; // Email verification step
      case 2: { // Denomination step
        if (wizardData.denomination === "") return false;
        if (wizardData.denomination === "other-specify") {
          return wizardData.denominationCustom !== undefined && wizardData.denominationCustom.trim() !== "";
        }
        return true;
      }
      case 3: return wizardData.interests.length > 0; // Interests step
      case 4: return wizardData.ageGroup !== "" && wizardData.churchSize !== ""; // Preferences step
      default: return true;
    }
  };

  // Set email verification status from server
  useEffect(() => {
    if (emailStatus?.emailVerified && !wizardData.emailVerified) {
      setWizardData(prev => ({ ...prev, emailVerified: true }));
    }
  }, [emailStatus, wizardData.emailVerified]);

  // Auto-advance when email is verified
  useEffect(() => {
    if (currentStep === 1 && wizardData.emailVerified) {
      setTimeout(() => setCurrentStep(2), 1000); // Brief delay for UX
    }
  }, [currentStep, wizardData.emailVerified]);

  // Add escape key handler
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onComplete();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onComplete]);

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl my-8"
      >
        <Card className="border-0 shadow-2xl max-h-[90vh] flex flex-col">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 flex-1 justify-center">
                <img 
                  src="/attached_assets/SoapBx logo_1749686036591.jpeg" 
                  alt="SoapBox Logo" 
                  className="h-10 w-10 rounded-full object-cover"
                />
                <CardTitle className="text-2xl font-bold text-[#5A2671]">
                  Welcome to SoapBox Super App
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onComplete}
                className="absolute top-4 right-4 h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              <div className="flex justify-center gap-2">
                {steps.map((step, index) => (
                  <div
                    key={step}
                    className={`h-2 w-12 rounded-full transition-colors ${
                      index <= currentStep ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600">Step {currentStep + 1} of {steps.length}</p>
              <Progress value={progress} className="w-full" />
            </div>
          </CardHeader>

          <CardContent className="px-8 pb-8 flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col h-full"
              >
                {currentStep === 0 && (
                  <div className="text-center space-y-6">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="w-24 h-24 mx-auto bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center"
                    >
                      <Sparkles className="h-12 w-12 text-white" />
                    </motion.div>
                    <div className="space-y-4">
                      <h2 className="text-3xl font-bold text-gray-900">Find Your Spiritual Home</h2>
                      <p className="text-lg text-gray-600 max-w-md mx-auto">
                        Let's help you discover churches and groups that match your faith journey and interests.
                      </p>
                      <div className="flex justify-center gap-6 mt-8">
                        <div className="text-center">
                          <Target className="h-8 w-8 mx-auto text-primary mb-2" />
                          <p className="text-sm font-medium">Personalized</p>
                        </div>
                        <div className="text-center">
                          <Heart className="h-8 w-8 mx-auto text-primary mb-2" />
                          <p className="text-sm font-medium">Community</p>
                        </div>
                        <div className="text-center">
                          <Church className="h-8 w-8 mx-auto text-primary mb-2" />
                          <p className="text-sm font-medium">Faith</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
                          wizardData.emailVerified ? 'bg-green-500' : 'bg-[#5A2671]'
                        }`}
                      >
                        {wizardData.emailVerified ? (
                          <CheckCircle className="h-8 w-8 text-white" />
                        ) : (
                          <Mail className="h-8 w-8 text-white" />
                        )}
                      </motion.div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {wizardData.emailVerified ? 'Email Verified!' : 'Verify Your Email'}
                      </h2>
                      <p className="text-gray-600">
                        {wizardData.emailVerified 
                          ? 'Your email is verified. Moving to the next step...'
                          : 'To ensure secure access to SoapBox features, please verify your email address.'
                        }
                      </p>
                    </div>

                    {wizardData.emailVerified ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <div className="text-sm text-green-800">
                            <p className="font-medium">Email verification complete!</p>
                            <p>Automatically proceeding to denomination selection...</p>
                          </div>
                        </div>
                      </div>
                    ) : !emailSent ? (
                      <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div className="text-sm text-blue-800">
                              <p className="font-medium mb-1">Why verify your email?</p>
                              <ul className="space-y-1 text-xs">
                                <li>• Secure account recovery</li>
                                <li>• Important church notifications</li>
                                <li>• Prayer request updates</li>
                                <li>• Event reminders</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <Button
                          onClick={() => sendVerificationEmail.mutate()}
                          disabled={sendVerificationEmail.isPending}
                          className="w-full bg-[#5A2671] hover:bg-[#4A1F5A] text-white py-3"
                        >
                          {sendVerificationEmail.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Sending Verification Email...
                            </>
                          ) : (
                            <>
                              <Mail className="mr-2 h-4 w-4" />
                              Send Verification Email
                            </>
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <div className="text-sm text-green-800">
                              <p className="font-medium">Verification email sent!</p>
                              <p>Check your inbox and enter the verification code below.</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="verification-token" className="text-sm font-medium">
                            Verification Code
                          </Label>
                          <Input
                            id="verification-token"
                            type="text"
                            placeholder="Enter 6-digit code"
                            value={emailVerificationToken}
                            onChange={(e) => setEmailVerificationToken(e.target.value)}
                            className="text-center text-lg tracking-widest"
                            maxLength={6}
                          />
                        </div>

                        <div className="flex space-x-3">
                          <Button
                            onClick={() => verifyEmail.mutate(emailVerificationToken)}
                            disabled={!emailVerificationToken || emailVerificationToken.length !== 6 || verifyEmail.isPending}
                            className="flex-1 bg-[#5A2671] hover:bg-[#4A1F5A] text-white"
                          >
                            {verifyEmail.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Verifying...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Verify Email
                              </>
                            )}
                          </Button>
                          
                          <Button
                            variant="outline"
                            onClick={() => sendVerificationEmail.mutate()}
                            disabled={sendVerificationEmail.isPending}
                            className="border-[#5A2671] text-[#5A2671] hover:bg-[#5A2671] hover:text-white"
                          >
                            {sendVerificationEmail.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Resend"
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold mb-2">What's Your Denomination?</h2>
                      <p className="text-gray-600">Choose the tradition that resonates with you</p>
                    </div>
                    <RadioGroup 
                      value={wizardData.denomination} 
                      onValueChange={(value) => updateWizardData("denomination", value)}
                      className="space-y-3"
                    >
                      {/* Main Denominations */}
                      {denominations.filter(d => d.category === 'main').map((denom, index) => (
                        <motion.div
                          key={denom.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <RadioGroupItem value={denom.id} id={denom.id} />
                          <Label htmlFor={denom.id} className="flex-1 cursor-pointer">
                            <div className="font-medium">{denom.label}</div>
                            <div className="text-sm text-gray-600">{denom.description}</div>
                          </Label>
                        </motion.div>
                      ))}

                      {/* Other Traditions - Collapsible */}
                      <Collapsible open={showOtherTraditions} onOpenChange={setShowOtherTraditions}>
                        <CollapsibleTrigger asChild>
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                          >
                            <div>
                              <div className="font-medium">Other Traditions</div>
                              <div className="text-sm text-gray-600">Additional denominations and movements</div>
                            </div>
                            <ChevronDown className={`h-4 w-4 transition-transform ${showOtherTraditions ? 'rotate-180' : ''}`} />
                          </motion.div>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-3 mt-3">
                          {denominations.filter(d => d.category === 'other').map((denom, index) => (
                            <motion.div
                              key={denom.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors ml-4"
                            >
                              <RadioGroupItem value={denom.id} id={denom.id} />
                              <Label htmlFor={denom.id} className="flex-1 cursor-pointer">
                                <div className="font-medium">{denom.label}</div>
                                <div className="text-sm text-gray-600">{denom.description}</div>
                              </Label>
                            </motion.div>
                          ))}
                        </CollapsibleContent>
                      </Collapsible>
                    </RadioGroup>

                    {/* Custom denomination input for "Other" selection */}
                    {wizardData.denomination === "other-specify" && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4"
                      >
                        <Label htmlFor="custom-denomination" className="text-sm font-medium">
                          Please specify your denomination or tradition:
                        </Label>
                        <Input
                          id="custom-denomination"
                          value={wizardData.denominationCustom || ""}
                          onChange={(e) => updateWizardData("denominationCustom", e.target.value)}
                          placeholder="Enter your denomination..."
                          className="mt-2"
                        />
                      </motion.div>
                    )}

                    {/* Denomination Disclaimer */}
                    <div className="text-center space-y-3">
                      <button
                        type="button"
                        onClick={() => setShowDenominationDisclaimer(!showDenominationDisclaimer)}
                        className="text-sm text-[#5A2671] hover:text-[#6B3280] transition-colors flex items-center justify-center gap-2 mx-auto"
                      >
                        <HelpCircle className="h-4 w-4" />
                        Don't see your denomination? Learn why
                        <ChevronDown className={`h-3 w-3 transition-transform ${showDenominationDisclaimer ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {showDenominationDisclaimer && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-gray-50 border rounded-lg p-4 text-left max-w-md mx-auto"
                        >
                          <div className="space-y-3 text-sm text-gray-700">
                            <p>
                              We currently support a wide range of Christian denominations, including Protestant, Catholic, and Orthodox traditions.
                            </p>
                            <p>
                              At this time, we do not support onboarding for churches affiliated with:
                            </p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                              <li>The Church of Jesus Christ of Latter-day Saints (LDS)</li>
                              <li>Jehovah's Witnesses</li>
                            </ul>
                            <p>
                              This is due to significant structural and doctrinal differences with our platform's current features.
                            </p>
                            <p className="text-[#5A2671] font-medium">
                              We remain open to expanding support in the future and deeply respect all expressions of faith.
                            </p>
                          </div>
                        </motion.div>
                      )}
                      
                      <p className="text-sm text-gray-500">
                        Don't see your tradition? Choose 'Other' and specify.
                      </p>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold mb-2">What Ministry Areas Interest You?</h2>
                      <p className="text-gray-600">Choose areas where you'd like to get involved (select multiple)</p>
                    </div>
                    
                    <div className="space-y-4">
                      {ministryCategories.map((category, categoryIndex) => (
                        <motion.div
                          key={category.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: categoryIndex * 0.1 }}
                          className="border rounded-lg overflow-hidden"
                        >
                          {/* Category Header */}
                          <button
                            type="button"
                            onClick={() => toggleCategory(category.id)}
                            className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="p-2 rounded-lg bg-[#5A2671]/10 text-[#5A2671]">
                                <category.icon className="h-5 w-5" />
                              </div>
                              <div className="text-left">
                                <h3 className="font-semibold text-gray-900">{category.title}</h3>
                                <p className="text-sm text-gray-600">{category.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                {category.interests.filter(interest => wizardData.interests.includes(interest.id)).length} selected
                              </Badge>
                              <ChevronDown 
                                className={`h-4 w-4 transition-transform ${
                                  expandedCategories.includes(category.id) ? 'rotate-180' : ''
                                }`} 
                              />
                            </div>
                          </button>

                          {/* Category Content */}
                          {expandedCategories.includes(category.id) && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="p-4 bg-white"
                            >
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {category.interests.map((interest, interestIndex) => (
                                  <motion.div
                                    key={interest.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: interestIndex * 0.03 }}
                                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                      wizardData.interests.includes(interest.id)
                                        ? "border-[#5A2671] bg-[#5A2671]/5"
                                        : "border-gray-200 hover:border-gray-300"
                                    }`}
                                    onClick={() => toggleInterest(interest.id)}
                                  >
                                    <div className="flex items-start space-x-3">
                                      <div className={`p-1.5 rounded-md ${interest.color} flex-shrink-0`}>
                                        <interest.icon className="h-4 w-4" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-medium text-gray-900 truncate">{interest.label}</h4>
                                        <p className="text-xs text-gray-600 mt-1">{interest.description}</p>
                                      </div>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </motion.div>
                      ))}
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-gray-500">
                        Selected: {wizardData.interests.length} ministry area{wizardData.interests.length !== 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Click category headers to expand and explore ministries
                      </p>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-8">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold mb-2">Your Preferences</h2>
                      <p className="text-gray-600">Help us find the perfect church community for you</p>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold mb-3">Age Group</h3>
                        <RadioGroup 
                          value={wizardData.ageGroup} 
                          onValueChange={(value) => updateWizardData("ageGroup", value)}
                          className="grid grid-cols-2 gap-3"
                        >
                          {ageGroups.map((group) => (
                            <div key={group.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                              <RadioGroupItem value={group.id} id={group.id} />
                              <Label htmlFor={group.id} className="cursor-pointer">
                                <div className="font-medium">{group.label}</div>
                                <div className="text-sm text-gray-600">{group.description}</div>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-3">Church Size</h3>
                        <RadioGroup 
                          value={wizardData.churchSize} 
                          onValueChange={(value) => updateWizardData("churchSize", value)}
                          className="space-y-2"
                        >
                          {churchSizes.map((size) => (
                            <div key={size.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                              <RadioGroupItem value={size.id} id={size.id} />
                              <Label htmlFor={size.id} className="cursor-pointer">
                                <div className="font-medium">{size.label}</div>
                                <div className="text-sm text-gray-600">{size.description}</div>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold mb-2">Find Your Church Community</h2>
                      <p className="text-gray-600">Connect with a church that matches your preferences</p>
                    </div>

                    {/* Search Section */}
                    <div className="space-y-4">
                      <div className="relative">
                        <Input
                          placeholder="Search churches by name or location..."
                          value={churchSearchQuery}
                          onChange={(e) => setChurchSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                    
                    {/* Smart Suggestions */}
                    {!churchSearchQuery && recommendations.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900">Suggested for You</h3>
                        {recommendations.slice(0, 3).map((church, index) => (
                          <motion.div
                            key={church.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 border rounded-lg hover:shadow-sm transition-all"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{church.name}</h4>
                                <p className="text-sm text-gray-600">{church.denomination}</p>
                                <p className="text-xs text-gray-500 mt-1">{church.address}</p>
                              </div>
                              <Badge variant="secondary" className="bg-[#5A2671]/10 text-[#5A2671] text-xs">
                                {church.score}% Match
                              </Badge>
                            </div>
                            
                            <Button
                              onClick={() => joinChurch.mutate(church.id)}
                              disabled={joiningChurchId === church.id}
                              size="sm"
                              className="w-full mt-3"
                            >
                              {joiningChurchId === church.id ? "Connecting..." : "Join This Church"}
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {/* Search Results */}
                    {churchSearchQuery && (
                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900">Search Results</h3>
                        {filteredChurches.length > 0 ? (
                          <div className="space-y-3">
                            {filteredChurches.slice(0, 5).map((church, index) => (
                              <motion.div
                                key={church.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.05 }}
                                className="p-4 border rounded-lg hover:shadow-sm transition-all"
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex-1">
                                    <h4 className="font-medium text-gray-900">{church.name}</h4>
                                    <p className="text-sm text-gray-600">{church.denomination}</p>
                                    <p className="text-xs text-gray-500 mt-1">{church.address}</p>
                                  </div>
                                </div>
                                
                                <Button
                                  onClick={() => joinChurch.mutate(church.id)}
                                  disabled={joiningChurchId === church.id}
                                  size="sm"
                                  className="w-full mt-3"
                                >
                                  {joiningChurchId === church.id ? "Connecting..." : "Join This Church"}
                                </Button>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6">
                            <Church className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                            <p className="text-gray-500 text-sm">No churches found matching your search.</p>
                            <p className="text-xs text-gray-400 mt-1">Try a different search term or skip for now.</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* No Suggestions Fallback */}
                    {!churchSearchQuery && recommendations.length === 0 && (
                      <div className="text-center py-8">
                        <Church className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                        <h3 className="font-medium text-gray-900 mb-2">No Church Suggestions Yet</h3>
                        <p className="text-sm text-gray-500 mb-4">Try searching for churches in your area or browse all available churches.</p>
                        <Button
                          onClick={() => setChurchSearchQuery("")}
                          variant="outline"
                          size="sm"
                        >
                          Browse All Churches
                        </Button>
                      </div>
                    )}
                    
                    {/* Skip Option */}
                    <div className="text-center pt-4 border-t">
                      <Button variant="ghost" onClick={onComplete} className="text-gray-600">
                        I'll join a church later
                      </Button>
                      <p className="text-xs text-gray-400 mt-2">You can always connect with churches from the Churches tab</p>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </CardContent>
          
          <div className="px-8 pb-6 border-t bg-gray-50/50">
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
              
              {currentStep < 3 ? (
                <Button
                  onClick={nextStep}
                  disabled={!canProceed()}
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : currentStep === 3 ? (
                <Button
                  onClick={() => generateRecommendations.mutate(wizardData)}
                  disabled={!canProceed() || generateRecommendations.isPending}
                  className="flex items-center gap-2"
                >
                  {generateRecommendations.isPending ? "Finding..." : "Find Churches"}
                  <Target className="h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  onClick={async () => {
                    console.log("Complete Setup clicked - forcing refresh");
                    // Force invalidate all user-related queries to sync state
                    await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
                    await queryClient.invalidateQueries({ queryKey: ["/api/auth/2fa/onboarding-status"] });
                    // Add a small delay to ensure queries refresh
                    setTimeout(() => {
                      console.log("Calling onComplete after delay");
                      onComplete();
                    }, 500);
                  }} 
                  variant="outline"
                >
                  Complete Setup
                </Button>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}