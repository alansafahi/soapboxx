import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, isToday, startOfDay } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
import MoodCheckIn from "@/components/MoodCheckIn";

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

const moodOptions = [
  { value: "joyful", emoji: "😊", label: "Joyful" },
  { value: "peaceful", emoji: "😌", label: "Peaceful" },
  { value: "grateful", emoji: "🙏", label: "Grateful" },
  { value: "hopeful", emoji: "🌟", label: "Hopeful" },
  { value: "contemplative", emoji: "🤔", label: "Contemplative" },
  { value: "struggling", emoji: "😔", label: "Struggling" },
  { value: "seeking", emoji: "🔍", label: "Seeking" },
  { value: "blessed", emoji: "✨", label: "Blessed" },
];

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
  const [selectedMood, setSelectedMood] = useState("");
  const [notes, setNotes] = useState("");
  const [prayerIntent, setPrayerIntent] = useState("");
  const [customType, setCustomType] = useState("");

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
      const response = await apiRequest("POST", "/api/checkins", checkInData);
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Check-in Successful! 🎉",
        description: `You've earned ${data.pointsEarned} points! Streak: ${data.streakCount} days`,
      });
      setShowCheckInDialog(false);
      setNotes("");
      setPrayerIntent("");
      setSelectedMood("");
      setCustomType("");
      queryClient.invalidateQueries({ queryKey: ["/api/checkins"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/score"] });
    },
    onError: (error) => {
      toast({
        title: "Check-in Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCheckIn = () => {
    const checkInData = {
      checkInType: selectedType === "Custom" ? customType : selectedType,
      mood: selectedMood,
      moodEmoji: moodOptions.find(m => m.value === selectedMood)?.emoji,
      notes: notes.trim() || undefined,
      prayerIntent: prayerIntent.trim() || undefined,
      isPhysicalAttendance: false,
    };

    checkInMutation.mutate(checkInData);
  };

  const handleQrCheckIn = (qrCodeId: string) => {
    const checkInData = {
      checkInType: "Physical Attendance",
      isPhysicalAttendance: true,
      qrCodeId,
      mood: selectedMood,
      moodEmoji: moodOptions.find(m => m.value === selectedMood)?.emoji,
      notes: notes.trim() || undefined,
    };

    checkInMutation.mutate(checkInData);
  };

  const canCheckInToday = !todayCheckIn;
  const streak = streakData?.streak || 0;

  return (
    <div className="space-y-6">
      {/* Main Check-In Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-2">
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
              <div className="text-center">
                <div className="flex items-center gap-1 text-orange-600">
                  <Flame className="w-5 h-5" />
                  <span className="font-bold text-lg">{streak}</span>
                </div>
                <p className="text-xs text-muted-foreground">day streak</p>
              </div>
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

                      {/* Mood Selection */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          How are you feeling? (Optional)
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {moodOptions.map((mood) => (
                            <button
                              key={mood.value}
                              onClick={() => setSelectedMood(mood.value === selectedMood ? "" : mood.value)}
                              className={`p-2 rounded-lg border text-center transition-colors ${
                                selectedMood === mood.value
                                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <div className="text-lg mb-1">{mood.emoji}</div>
                              <div className="text-xs leading-tight">{mood.label}</div>
                            </button>
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

      {/* Recent Check-Ins */}
      {recentCheckIns && recentCheckIns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Recent Check-Ins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentCheckIns.slice(0, 5).map((checkIn: CheckIn) => (
                <div key={checkIn.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{checkIn.checkInType}</Badge>
                      {checkIn.moodEmoji && (
                        <span className="text-lg">{checkIn.moodEmoji}</span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {format(new Date(checkIn.createdAt), "MMM d, h:mm a")}
                      {checkIn.isPhysicalAttendance && (
                        <Badge variant="secondary" className="ml-2">Physical</Badge>
                      )}
                    </div>
                    {checkIn.notes && (
                      <p className="text-sm mt-1 italic">"{checkIn.notes}"</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-orange-600">
                      <Flame className="w-4 h-4" />
                      <span className="font-medium">{checkIn.streakCount}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      +{checkIn.pointsEarned} pts
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* QR Scanner Modal */}
      {showQrScanner && (
        <Dialog open={showQrScanner} onOpenChange={setShowQrScanner}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>QR Code Check-In</DialogTitle>
            </DialogHeader>
            <div className="text-center py-8">
              <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                QR code scanning would be implemented here with a camera library
              </p>
              <Input 
                placeholder="Or enter QR code manually"
                className="mb-4"
              />
              <Button onClick={() => setShowQrScanner(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* AI Mood Check-In Modal */}
      {showMoodCheckIn && (
        <Dialog open={showMoodCheckIn} onOpenChange={setShowMoodCheckIn}>
          <DialogContent className="max-w-lg">
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