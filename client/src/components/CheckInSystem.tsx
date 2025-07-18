import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, isToday, startOfDay } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/use-toast";

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

// Icons
import {
  CheckCircle,
  Clock,
  Heart,
  Sunrise,
  Users,
  MapPin,
  Calendar,
  Flame,
  QrCode,
  Camera,
  Smile,
  MessageCircle,
  TrendingUp,
  Star,
  Brain,
} from "lucide-react";
import MoodCheckIn from "./MoodCheckIn";
import QrScanner from "qr-scanner";

interface CheckIn {
  id: number;
  userId: string;
  churchId?: number;
  eventId?: number;
  checkInType: string;
  mood?: string;
  moodEmoji?: string;
  notes?: string;
  prayerIntent?: string;
  isPhysicalAttendance: boolean;
  qrCodeId?: string;
  location?: string;
  streakCount: number;
  pointsEarned: number;
  createdAt: string;
}

interface Event {
  id: number;
  title: string;
  eventDate: string;
  location?: string;
  isOnline?: boolean;
}

// 4-Pillar Comprehensive Mood System matching AI Check-In
const moodCategories = [
  {
    title: "💙 Emotional & Spiritual Support",
    description: "Express your struggles and need for comfort",
    moods: [
      { value: "anxious", emoji: "😰", label: "Anxious" },
      { value: "depressed", emoji: "😞", label: "Depressed" },
      { value: "lonely", emoji: "😔", label: "Lonely" },
      { value: "grieving", emoji: "💔", label: "Grieving" },
      { value: "fearful", emoji: "😨", label: "Fearful" },
      { value: "overwhelmed", emoji: "😵", label: "Overwhelmed" },
      { value: "doubtful", emoji: "🤔", label: "Doubtful" },
      { value: "angry", emoji: "😠", label: "Angry" },
    ]
  },
  {
    title: "🌱 Growth & Transformation",
    description: "Mark your spiritual formation journey",
    moods: [
      { value: "seeking-direction", emoji: "🧭", label: "Seeking Direction" },
      { value: "repentant", emoji: "🙏", label: "Repentant" },
      { value: "motivated", emoji: "🔥", label: "Motivated" },
      { value: "curious", emoji: "🤓", label: "Curious" },
      { value: "determined", emoji: "💪", label: "Determined" },
      { value: "reflective", emoji: "🤲", label: "Reflective" },
      { value: "inspired", emoji: "✨", label: "Inspired" },
      { value: "focused", emoji: "🎯", label: "Focused" },
    ]
  },
  {
    title: "🏠 Life Situations",
    description: "Navigate life's challenges with faith",
    moods: [
      { value: "celebrating", emoji: "🎉", label: "Celebrating" },
      { value: "in-transition", emoji: "🚪", label: "In Transition" },
      { value: "healing", emoji: "🩹", label: "Healing" },
      { value: "parenting-challenges", emoji: "👨‍👩‍👧‍👦", label: "Parenting Challenges" },
      { value: "work-stress", emoji: "💼", label: "Work Stress" },
      { value: "relationship-issues", emoji: "💕", label: "Relationship Issues" },
      { value: "financial-concerns", emoji: "💰", label: "Financial Concerns" },
      { value: "health-concerns", emoji: "🏥", label: "Health Concerns" },
    ]
  },
  {
    title: "⛪ Faith & Worship",
    description: "Express your spiritual state and connection",
    moods: [
      { value: "grateful", emoji: "🙌", label: "Grateful" },
      { value: "peaceful", emoji: "🕊️", label: "Peaceful" },
      { value: "joyful", emoji: "😊", label: "Joyful" },
      { value: "blessed", emoji: "😇", label: "Blessed" },
      { value: "prayerful", emoji: "🙏", label: "Prayerful" },
      { value: "worshipful", emoji: "🎵", label: "Worshipful" },
      { value: "hopeful", emoji: "🌅", label: "Hopeful" },
      { value: "content", emoji: "😌", label: "Content" },
    ]
  }
];

// Flattened mood options for easier access
const moodOptions = moodCategories.flatMap(category => 
  category.moods.map(mood => ({
    ...mood,
    category: category.title
  }))
);

const checkInTypes = [
  { value: "Sunday Service", icon: Users, description: "Attending Sunday Service" },
  { value: "Daily Devotional", icon: Sunrise, description: "Starting Daily Devotional" },
  { value: "Prayer Time", icon: Heart, description: "Prayer Time" },
  { value: "Spiritual Check-In", icon: Star, description: "Spiritual Check-In (mood-based)" },
  { value: "Custom", icon: MessageCircle, description: "Custom Check-In" },
];

export default function CheckInSystem() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [showCheckInDialog, setShowCheckInDialog] = useState(false);
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [showMoodCheckIn, setShowMoodCheckIn] = useState(false);
  const [selectedType, setSelectedType] = useState("Spiritual Check-In");
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [prayerIntent, setPrayerIntent] = useState("");
  const [customType, setCustomType] = useState("");
  
  // QR Scanner state
  const [manualQrCode, setManualQrCode] = useState("");
  const [isValidatingQr, setIsValidatingQr] = useState(false);
  const [qrValidationResult, setQrValidationResult] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);

  // Get today's check-in status
  const { data: todayCheckIn } = useQuery({
    queryKey: ["/api/checkins/today"],
    enabled: !!user,
  });

  // Get user's check-in streak
  const { data: streakData } = useQuery({
    queryKey: ["/api/checkins/streak"],
    enabled: !!user,
  });

  // Get today's events for context
  const { data: todayEvents } = useQuery({
    queryKey: ["/api/events/today"],
    enabled: !!user,
  });

  // Get recent check-ins
  const { data: recentCheckIns } = useQuery({
    queryKey: ["/api/checkins/recent"],
    enabled: !!user,
  });

  const checkInMutation = useMutation({
    mutationFn: async (checkInData: any) => {
      const response = await fetch("/api/checkins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "Referer": window.location.href,
        },
        body: JSON.stringify(checkInData),
        credentials: "include",
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text}`);
      }

      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Check-in Complete!",
        description: `Earned ${data.pointsEarned} points! Streak: ${data.streakCount} days`,
      });
      setShowCheckInDialog(false);
      setNotes("");
      setPrayerIntent("");
      setSelectedMoods([]);
      setCustomType("");
      queryClient.invalidateQueries({ queryKey: ["/api/checkins"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/score"] });
    },
    onError: (error: any) => {
      toast({
        title: "Check-in Failed",
        description: error.message || "Unable to complete check-in",
        variant: "destructive",
      });
    },
  });

  const handleCheckIn = () => {
    const moodString = selectedMoods.join(', ');
    const moodEmojis = selectedMoods.map(mood => moodOptions.find(m => m.value === mood)?.emoji).filter(Boolean).join('');
    
    const checkInData = {
      checkInType: selectedType === "Custom" ? customType : selectedType,
      mood: moodString,
      moodEmoji: moodEmojis,
      notes: notes.trim() || undefined,
      prayerIntent: prayerIntent.trim() || undefined,
      isPhysicalAttendance: false,
    };

    checkInMutation.mutate(checkInData);
  };

  const handleQrCheckIn = (qrCodeId: string) => {
    const moodString = selectedMoods.join(', ');
    const moodEmojis = selectedMoods.map(mood => moodOptions.find(m => m.value === mood)?.emoji).filter(Boolean).join('');
    
    const checkInData = {
      checkInType: "Physical Attendance",
      isPhysicalAttendance: true,
      qrCodeId,
      mood: moodString,
      moodEmoji: moodEmojis,
      notes: notes.trim() || undefined,
    };

    checkInMutation.mutate(checkInData);
  };

  // QR Scanner Functions
  const startQrScanner = async () => {
    if (videoRef.current) {
      try {
        qrScannerRef.current = new QrScanner(
          videoRef.current,
          (result) => {
            if (result?.data) {
              handleQrCodeDetected(result.data);
            }
          },
          {
            highlightScanRegion: true,
            highlightCodeOutline: true,
            preferredCamera: 'environment', // Use back camera on mobile
          }
        );
        
        await qrScannerRef.current.start();
      } catch (error) {
        toast({
          title: "Camera Error",
          description: "Unable to access camera. Please check permissions and try again.",
          variant: "destructive",
        });
      }
    }
  };

  const stopQrScanner = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
  };

  const handleQrCodeDetected = async (qrData: string) => {
    setIsValidatingQr(true);
    stopQrScanner();
    
    try {
      // Validate QR code with the server
      const response = await apiRequest("POST", "/api/qr-codes/validate", {
        qrCodeId: qrData
      });
      
      if (response.ok) {
        const result = await response.json();
        setQrValidationResult(result);
        
        // Auto-submit check-in if QR code is valid
        if (result.isValid) {
          await submitQrCheckIn(result);
        }
      } else {
        toast({
          title: "Invalid QR Code",
          description: "This QR code is not valid for check-in.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Validation Error",
        description: "Failed to validate QR code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsValidatingQr(false);
    }
  };

  const handleManualQrSubmit = async () => {
    if (!manualQrCode.trim()) {
      toast({
        title: "Enter QR Code",
        description: "Please enter a QR code to continue.",
        variant: "destructive",
      });
      return;
    }
    
    await handleQrCodeDetected(manualQrCode.trim());
  };

  const submitQrCheckIn = async (qrResult: any) => {
    try {
      const checkInData = {
        checkInType: qrResult.eventId ? "Event Attendance" : "Church Check-In",
        isPhysicalAttendance: true,
        qrCodeId: qrResult.qrCodeId,
        location: qrResult.location,
        eventId: qrResult.eventId,
        notes: `QR Check-in at ${qrResult.location}`,
      };

      await checkInMutation.mutateAsync(checkInData);
      setShowQrScanner(false);
      setManualQrCode("");
      setQrValidationResult(null);
    } catch (error) {
      toast({
        title: "Check-in Failed",
        description: "Failed to complete QR check-in. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Start scanner when modal opens
  useEffect(() => {
    if (showQrScanner) {
      const timer = setTimeout(() => {
        startQrScanner();
      }, 100); // Small delay to ensure video element is rendered
      
      return () => {
        clearTimeout(timer);
        stopQrScanner();
      };
    }
  }, [showQrScanner]);

  const canCheckInToday = !todayCheckIn;
  const streak = streakData?.streak || 0;

  return (
    <div className="space-y-6">
      {/* Main Check-In Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-0 shadow-md hover:shadow-lg transition-all duration-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-blue-600" />
                Daily Check-In
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Share your spiritual journey today
              </p>
            </div>
            {streak > 0 && (
              <motion.div 
                className="text-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <motion.div 
                  className="flex items-center gap-1 text-orange-600"
                  animate={{ 
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "loop",
                    ease: "easeInOut"
                  }}
                >
                  <motion.div
                    animate={{ 
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{ 
                      duration: 1.5,
                      repeat: Infinity,
                      repeatType: "loop",
                      ease: "easeInOut"
                    }}
                  >
                    <Flame className="w-5 h-5" />
                  </motion.div>
                  <span className="font-bold text-lg">{streak}</span>
                </motion.div>
                <p className="text-xs text-muted-foreground">day streak</p>
              </motion.div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {canCheckInToday ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Dialog open={showCheckInDialog} onOpenChange={setShowCheckInDialog}>
                  <DialogTrigger asChild>
                    <Button 
                      size="lg" 
                      className="h-16 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <div className="text-center">
                        <CheckCircle className="w-6 h-6 mx-auto mb-1" />
                        <div>Virtual Check-In</div>
                      </div>
                    </Button>
                  </DialogTrigger>
                  
                  <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Daily Spiritual Check-In</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      {/* Check-In Type Selection */}
                      <div>
                        <label className="text-sm font-medium mb-3 block">
                          What are you checking in for?
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                          {checkInTypes.map((type) => {
                            const Icon = type.icon;
                            return (
                              <button
                                key={type.value}
                                onClick={() => setSelectedType(type.value)}
                                className={`p-3 rounded-lg border text-left transition-colors ${
                                  selectedType === type.value
                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <Icon className="w-5 h-5 text-blue-600" />
                                  <div>
                                    <div className="font-medium">{type.value}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {type.description}
                                    </div>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                        
                        {selectedType === "Custom" && (
                          <Input
                            placeholder="Enter custom check-in reason..."
                            value={customType}
                            onChange={(e) => setCustomType(e.target.value)}
                            className="mt-3"
                          />
                        )}
                      </div>

                      {/* Comprehensive Mood Selection */}
                      <div>
                        <label className="text-sm font-medium mb-3 block">
                          How are you feeling? (Optional)
                        </label>
                        
                        {/* Selected moods display */}
                        {selectedMoods.length > 0 && (
                          <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                            <div className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                              Selected feelings ({selectedMoods.join(', ').length}/150 characters):
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {selectedMoods.map((moodValue) => {
                                const mood = moodOptions.find(m => m.value === moodValue);
                                return mood ? (
                                  <span key={moodValue} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-800 rounded text-xs">
                                    {mood.emoji} {mood.label}
                                    <button
                                      onClick={() => setSelectedMoods(prev => prev.filter(m => m !== moodValue))}
                                      className="ml-1 text-blue-600 hover:text-blue-800"
                                    >
                                      ×
                                    </button>
                                  </span>
                                ) : null;
                              })}
                            </div>
                            {selectedMoods.length > 0 && (
                              <button
                                onClick={() => setSelectedMoods([])}
                                className="text-xs text-blue-600 hover:text-blue-800 mt-2"
                              >
                                Clear all
                              </button>
                            )}
                          </div>
                        )}
                        
                        <div className="space-y-4 max-h-60 overflow-y-auto">
                          {moodCategories.map((category) => (
                            <div key={category.title} className="space-y-2">
                              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {category.title}
                              </div>
                              <div className="grid grid-cols-4 gap-2">
                                {category.moods.map((mood) => {
                                  const isSelected = selectedMoods.includes(mood.value);
                                  const wouldExceedLimit = !isSelected && (selectedMoods.join(', ') + ', ' + mood.label).length > 150;
                                  
                                  return (
                                    <button
                                      key={mood.value}
                                      onClick={() => {
                                        if (isSelected) {
                                          setSelectedMoods(prev => prev.filter(m => m !== mood.value));
                                        } else if (!wouldExceedLimit) {
                                          setSelectedMoods(prev => [...prev, mood.value]);
                                        }
                                      }}
                                      disabled={wouldExceedLimit}
                                      className={`p-2 rounded-lg border text-center transition-colors ${
                                        isSelected
                                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                                          : wouldExceedLimit
                                          ? "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
                                          : "border-gray-200 hover:border-gray-300"
                                      }`}
                                    >
                                      <div className="text-lg mb-1">{mood.emoji}</div>
                                      <div className="text-xs leading-tight">{mood.label}</div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Notes */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Personal Reflection (Optional)
                        </label>
                        <Textarea
                          placeholder="Share what's on your heart today..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="resize-none"
                          rows={2}
                        />
                      </div>

                      {/* Prayer Intent */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Prayer Intent (Optional)
                        </label>
                        <Input
                          placeholder="e.g., 'Praying for peace today'"
                          value={prayerIntent}
                          onChange={(e) => setPrayerIntent(e.target.value)}
                        />
                      </div>

                      <Button 
                        onClick={handleCheckIn}
                        disabled={checkInMutation.isPending || (selectedType === "Custom" && !customType.trim())}
                        className="w-full"
                      >
                        {checkInMutation.isPending ? "Checking In..." : "Complete Check-In"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button 
                  variant="outline"
                  size="lg"
                  className="h-16"
                  onClick={() => setShowQrScanner(true)}
                >
                  <div className="text-center">
                    <QrCode className="w-6 h-6 mx-auto mb-1" />
                    <div>QR Check-In</div>
                  </div>
                </Button>

                <Button 
                  variant="outline"
                  size="lg"
                  className="h-16 border-purple-200 hover:bg-purple-50"
                  onClick={() => setShowMoodCheckIn(true)}
                >
                  <div className="text-center">
                    <Brain className="w-6 h-6 mx-auto mb-1 text-purple-600" />
                    <div className="text-purple-700">AI Mood Check-In</div>
                  </div>
                </Button>
              </div>
              
              <p className="text-sm text-center text-muted-foreground">
                Check in once daily to build your spiritual journey streak
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center py-6">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h3 className="font-medium text-lg mb-2">Already Checked In Today!</h3>
                <p className="text-muted-foreground mb-4">
                  You checked in {format(new Date(todayCheckIn.createdAt), "h:mm a")}
                </p>
                <Badge variant="secondary" className="mb-2">
                  {todayCheckIn.checkInType}
                </Badge>
                {todayCheckIn.moodEmoji && (
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="text-2xl">{todayCheckIn.moodEmoji}</span>
                    <span className="text-sm text-muted-foreground capitalize">
                      {todayCheckIn.mood}
                    </span>
                  </div>
                )}
                {todayCheckIn.notes && (
                  <p className="text-sm italic mt-2 text-muted-foreground">
                    "{todayCheckIn.notes}"
                  </p>
                )}
              </div>
              
              {/* AI Mood Check-In button always available */}
              <div className="flex justify-center">
                <Button 
                  variant="outline"
                  size="lg"
                  className="h-16 border-purple-200 hover:bg-purple-50"
                  onClick={() => setShowMoodCheckIn(true)}
                >
                  <div className="text-center">
                    <Brain className="w-6 h-6 mx-auto mb-1 text-purple-600" />
                    <div className="text-purple-700">AI Mood Check-In</div>
                  </div>
                </Button>
              </div>
              
              <p className="text-sm text-center text-muted-foreground">
                AI Mood Check-In is available anytime for personalized spiritual guidance
              </p>
            </div>
          )}
        </CardContent>
      </Card>



      {/* Today's Events Context */}
      {todayEvents && todayEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Today's Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todayEvents.map((event: Event) => (
                <div key={event.id} className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className="flex-1">
                    <h4 className="font-medium">{event.title}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Clock className="w-4 h-4" />
                      {format(new Date(event.eventDate), "h:mm a")}
                      {event.location && (
                        <>
                          <MapPin className="w-4 h-4 ml-2" />
                          {event.location}
                        </>
                      )}
                    </div>
                  </div>
                  {event.isOnline && <Badge variant="secondary">Online</Badge>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}



      {/* QR Scanner Modal */}
      {showQrScanner && (
        <Dialog open={showQrScanner} onOpenChange={(open) => {
          if (!open) {
            stopQrScanner();
            setShowQrScanner(false);
            setManualQrCode("");
            setQrValidationResult(null);
          }
        }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                QR Code Check-In
              </DialogTitle>
              <DialogDescription>
                Position the QR code within the camera frame or enter manually
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Camera Scanner */}
              <div className="relative bg-black rounded-lg overflow-hidden aspect-square">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />
                
                {/* Scanning overlay */}
                <div className="absolute inset-0 border-2 border-blue-500 rounded-lg">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-48 h-48 border-2 border-white rounded-lg relative">
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-400 rounded-tl-lg"></div>
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-400 rounded-tr-lg"></div>
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-400 rounded-bl-lg"></div>
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-400 rounded-br-lg"></div>
                      
                      {/* Scanning line animation */}
                      <div className="absolute inset-x-0 top-0 h-1 bg-blue-400 animate-pulse"></div>
                    </div>
                  </div>
                </div>
                
                {/* Status indicators */}
                {isValidatingQr && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                      <p>Validating QR Code...</p>
                    </div>
                  </div>
                )}
                
                {qrValidationResult && !qrValidationResult.isValid && (
                  <div className="absolute inset-0 bg-red-500 bg-opacity-50 flex items-center justify-center">
                    <div className="text-white text-center">
                      <p className="font-semibold">Invalid QR Code</p>
                      <p className="text-sm">Please try scanning again</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Manual Entry */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Or enter QR code manually:</label>
                <div className="flex gap-2">
                  <Input
                    value={manualQrCode}
                    onChange={(e) => setManualQrCode(e.target.value)}
                    placeholder="Enter QR code here..."
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleManualQrSubmit}
                    disabled={!manualQrCode.trim() || isValidatingQr}
                    size="sm"
                  >
                    Submit
                  </Button>
                </div>
              </div>
              
              {/* QR Validation Result */}
              {qrValidationResult && (
                <div className={`p-3 rounded-lg ${qrValidationResult.isValid 
                  ? 'bg-green-50 border border-green-200 dark:bg-green-950 dark:border-green-800' 
                  : 'bg-red-50 border border-red-200 dark:bg-red-950 dark:border-red-800'
                }`}>
                  <div className="flex items-center gap-2">
                    {qrValidationResult.isValid ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Camera className="w-5 h-5 text-red-600" />
                    )}
                    <div className="flex-1">
                      <p className={`font-medium ${qrValidationResult.isValid ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                        {qrValidationResult.isValid ? 'Valid QR Code' : 'Invalid QR Code'}
                      </p>
                      {qrValidationResult.isValid && (
                        <p className="text-sm text-green-600 dark:text-green-300">
                          {qrValidationResult.location}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Close Button */}
              <Button 
                variant="outline" 
                onClick={() => setShowQrScanner(false)}
                className="w-full"
              >
                Close Scanner
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* AI Mood Check-In Modal */}
      {showMoodCheckIn && (
        <Dialog open={showMoodCheckIn} onOpenChange={setShowMoodCheckIn}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>AI Mood Check-In</DialogTitle>
              <DialogDescription>
                Share how you're feeling to receive personalized spiritual guidance
              </DialogDescription>
            </DialogHeader>
            <MoodCheckIn 
              onComplete={() => {
                setShowMoodCheckIn(false);
                // Refresh data after mood check-in
                queryClient.invalidateQueries({ queryKey: ["/api/checkins/today"] });
                queryClient.invalidateQueries({ queryKey: ["/api/checkins/streak"] });
                queryClient.invalidateQueries({ queryKey: ["/api/checkins/recent"] });
                queryClient.invalidateQueries({ queryKey: ["/api/mood-checkins/recent"] });
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}