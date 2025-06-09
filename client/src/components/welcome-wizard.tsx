import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
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
  Sparkles,
  Target
} from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface WelcomeWizardProps {
  onComplete: () => void;
}

interface WizardData {
  denomination: string;
  interests: string[];
  ageGroup: string;
  churchSize: string;
  musicStyle: string;
  meetingStyle: string;
}

const denominations = [
  { id: "non-denominational", label: "Non-Denominational", description: "Community-focused worship" },
  { id: "baptist", label: "Baptist", description: "Traditional evangelical approach" },
  { id: "methodist", label: "Methodist", description: "Social justice and service" },
  { id: "presbyterian", label: "Presbyterian", description: "Reformed theological tradition" },
  { id: "pentecostal", label: "Pentecostal", description: "Spirit-filled worship" },
  { id: "episcopal", label: "Episcopal", description: "Anglican tradition" },
  { id: "lutheran", label: "Lutheran", description: "Grace-centered teaching" },
  { id: "catholic", label: "Catholic", description: "Traditional Catholic mass" },
  { id: "exploring", label: "Still Exploring", description: "Open to different traditions" }
];

const interests = [
  { id: "youth", label: "Youth Ministry", icon: Users, color: "bg-blue-100 text-blue-700" },
  { id: "music", label: "Music & Worship", icon: Music, color: "bg-purple-100 text-purple-700" },
  { id: "bible-study", label: "Bible Study", icon: BookOpen, color: "bg-green-100 text-green-700" },
  { id: "community-service", label: "Community Service", icon: Heart, color: "bg-red-100 text-red-700" },
  { id: "small-groups", label: "Small Groups", icon: Users, color: "bg-yellow-100 text-yellow-700" },
  { id: "fellowship", label: "Fellowship Events", icon: Coffee, color: "bg-orange-100 text-orange-700" },
  { id: "missions", label: "Missions", icon: MapPin, color: "bg-indigo-100 text-indigo-700" },
  { id: "prayer", label: "Prayer Groups", icon: Heart, color: "bg-pink-100 text-pink-700" },
  { id: "family", label: "Family Ministry", icon: Users, color: "bg-teal-100 text-teal-700" },
  { id: "sports", label: "Sports & Recreation", icon: Dumbbell, color: "bg-gray-100 text-gray-700" },
  { id: "arts", label: "Arts & Creativity", icon: Palette, color: "bg-rose-100 text-rose-700" },
  { id: "technology", label: "Tech Ministry", icon: Code, color: "bg-cyan-100 text-cyan-700" }
];

const ageGroups = [
  { id: "18-25", label: "18-25", description: "College & Young Adult" },
  { id: "26-35", label: "26-35", description: "Young Professional" },
  { id: "36-50", label: "36-50", description: "Family & Career" },
  { id: "51-65", label: "51+", description: "Mature Adult" }
];

const churchSizes = [
  { id: "small", label: "Small (50-200)", description: "Intimate community feel" },
  { id: "medium", label: "Medium (200-800)", description: "Balanced programs and community" },
  { id: "large", label: "Large (800+)", description: "Diverse ministries and resources" }
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
    interests: [],
    ageGroup: "",
    churchSize: "",
    musicStyle: "",
    meetingStyle: ""
  });
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const { toast } = useToast();

  const steps = [
    "Welcome",
    "Denomination",
    "Interests",
    "Preferences",
    "Recommendations"
  ];

  const { data: churches } = useQuery({
    queryKey: ["/api/churches"],
  });

  const generateRecommendations = useMutation({
    mutationFn: async (data: WizardData) => {
      // Simulate AI-powered matching based on preferences
      const churchList = churches || [];
      const scored = churchList.map((church: any) => {
        let score = 0;
        
        // Denomination matching
        if (data.denomination === "exploring" || church.denomination === data.denomination) {
          score += 30;
        }
        
        // Size preference
        const memberCount = church.memberCount || 300;
        if (
          (data.churchSize === "small" && memberCount <= 200) ||
          (data.churchSize === "medium" && memberCount > 200 && memberCount <= 800) ||
          (data.churchSize === "large" && memberCount > 800)
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

  const joinChurch = useMutation({
    mutationFn: async (churchId: number) => {
      return await apiRequest(`/api/churches/${churchId}/join`, { method: "POST" });
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "You've joined the church community. Welcome!",
      });
      onComplete();
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

  const canProceed = () => {
    switch (currentStep) {
      case 0: return true;
      case 1: return wizardData.denomination !== "";
      case 2: return wizardData.interests.length > 0;
      case 3: return wizardData.ageGroup !== "" && wizardData.churchSize !== "";
      default: return true;
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-0 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Church className="h-8 w-8 text-primary" />
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Welcome to Soapbox
              </CardTitle>
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

          <CardContent className="px-8 pb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="min-h-[400px] flex flex-col"
              >
                {currentStep === 0 && (
                  <div className="text-center space-y-6">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="w-24 h-24 mx-auto bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center"
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
                      <h2 className="text-2xl font-bold mb-2">What's Your Denomination?</h2>
                      <p className="text-gray-600">Choose the tradition that resonates with you</p>
                    </div>
                    <RadioGroup 
                      value={wizardData.denomination} 
                      onValueChange={(value) => updateWizardData("denomination", value)}
                      className="space-y-3"
                    >
                      {denominations.map((denom) => (
                        <motion.div
                          key={denom.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: denominations.indexOf(denom) * 0.1 }}
                          className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <RadioGroupItem value={denom.id} id={denom.id} />
                          <Label htmlFor={denom.id} className="flex-1 cursor-pointer">
                            <div className="font-medium">{denom.label}</div>
                            <div className="text-sm text-gray-600">{denom.description}</div>
                          </Label>
                        </motion.div>
                      ))}
                    </RadioGroup>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold mb-2">What Interests You?</h2>
                      <p className="text-gray-600">Select activities and ministries you'd like to participate in</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {interests.map((interest, index) => {
                        const Icon = interest.icon;
                        const isSelected = wizardData.interests.includes(interest.id);
                        return (
                          <motion.div
                            key={interest.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:scale-105 ${
                              isSelected 
                                ? 'border-primary bg-primary/5' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => toggleInterest(interest.id)}
                          >
                            <div className="flex flex-col items-center text-center space-y-2">
                              <div className={`p-2 rounded-full ${interest.color}`}>
                                <Icon className="h-5 w-5" />
                              </div>
                              <span className="text-sm font-medium">{interest.label}</span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                    <p className="text-sm text-gray-500 text-center">
                      Selected: {wizardData.interests.length} {wizardData.interests.length === 1 ? 'interest' : 'interests'}
                    </p>
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

                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold mb-2">Your Recommendations</h2>
                      <p className="text-gray-600">Churches that match your preferences</p>
                    </div>
                    
                    {recommendations.length > 0 ? (
                      <div className="space-y-4">
                        {recommendations.map((church, index) => (
                          <motion.div
                            key={church.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-6 border rounded-lg hover:shadow-md transition-shadow"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h3 className="text-lg font-semibold">{church.name}</h3>
                                <p className="text-gray-600">{church.denomination}</p>
                                <p className="text-sm text-gray-500">{church.address}</p>
                              </div>
                              <Badge variant="secondary" className="bg-green-100 text-green-700">
                                {church.score}% Match
                              </Badge>
                            </div>
                            
                            {church.matchingInterests?.length > 0 && (
                              <div className="mb-4">
                                <p className="text-sm font-medium mb-2">Matching Interests:</p>
                                <div className="flex flex-wrap gap-2">
                                  {church.matchingInterests.map((interest: string) => {
                                    const interestData = interests.find(i => i.id === interest);
                                    return (
                                      <Badge key={interest} variant="outline" className="text-xs">
                                        {interestData?.label}
                                      </Badge>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                            
                            <Button
                              onClick={() => joinChurch.mutate(church.id)}
                              disabled={joinChurch.isPending}
                              className="w-full"
                            >
                              {joinChurch.isPending ? "Joining..." : "Join This Church"}
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Church className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">No recommendations available yet.</p>
                      </div>
                    )}
                    
                    <div className="text-center">
                      <Button variant="outline" onClick={onComplete}>
                        Skip for Now
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-between mt-8">
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
                <Button onClick={onComplete} variant="outline">
                  Complete Setup
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}