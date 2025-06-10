import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  BookOpen, 
  Play, 
  Pause, 
  Volume2, 
  Share2, 
  Heart, 
  Flame, 
  Heart as HandHeart, 
  Award,
  Calendar,
  Target,
  Users,
  MessageCircle,
  Clock,
  CheckCircle,
  Star
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface DailyVerse {
  id: number;
  date: Date;
  verseReference: string;
  verseText: string;
  verseTextNiv?: string;
  verseTextKjv?: string;
  verseTextEsv?: string;
  verseTextNlt?: string;
  theme?: string;
  reflectionPrompt?: string;
  guidedPrayer?: string;
  backgroundImageUrl?: string;
  audioUrl?: string;
}

interface UserBibleStreak {
  id: number;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastReadDate?: Date;
  totalDaysRead: number;
  versesMemorized: number;
  graceDaysUsed: number;
}

interface BibleBadge {
  id: number;
  name: string;
  description: string;
  iconUrl?: string;
  earnedAt: Date;
  badge: {
    id: number;
    name: string;
    description: string;
    iconUrl?: string;
    requirement: any;
  };
}

export function DailyBibleFeature() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedVersion, setSelectedVersion] = useState<string>("niv");
  const [reflection, setReflection] = useState("");
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [showMeditativeMode, setShowMeditativeMode] = useState(false);
  const [emotionalReaction, setEmotionalReaction] = useState<string>("");
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareText, setShareText] = useState("");
  const [hasReadToday, setHasReadToday] = useState(false);

  // Fetch daily verse
  const { data: dailyVerse, isLoading: verseLoading } = useQuery<DailyVerse>({
    queryKey: ["/api/bible/daily-verse"],
  });

  // Fetch user streak
  const { data: streak, isLoading: streakLoading } = useQuery<UserBibleStreak>({
    queryKey: ["/api/bible/streak"],
  });

  // Fetch user badges
  const { data: badges } = useQuery<BibleBadge[]>({
    queryKey: ["/api/bible/badges"],
  });

  // Record bible reading mutation
  const recordReadingMutation = useMutation({
    mutationFn: async (data: {
      dailyVerseId: number;
      reflectionText?: string;
      emotionalReaction?: string;
      audioListened?: boolean;
    }) => {
      return await apiRequest("/api/bible/reading", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bible/streak"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bible/badges"] });
      setHasReadToday(true);
      toast({
        title: "Reading Recorded",
        description: "Your daily Bible reading has been recorded! Keep up the great work.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to record reading. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Share verse mutation
  const shareVerseMutation = useMutation({
    mutationFn: async (data: {
      dailyVerseId: number;
      platform: string;
      shareText: string;
    }) => {
      return await apiRequest("/api/bible/share", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: () => {
      setShowShareDialog(false);
      toast({
        title: "Verse Shared",
        description: "Your verse has been shared successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to share verse. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getVerseText = () => {
    if (!dailyVerse) return "";
    switch (selectedVersion) {
      case "kjv":
        return dailyVerse.verseTextKjv || dailyVerse.verseText;
      case "esv":
        return dailyVerse.verseTextEsv || dailyVerse.verseText;
      case "nlt":
        return dailyVerse.verseTextNlt || dailyVerse.verseText;
      default:
        return dailyVerse.verseTextNiv || dailyVerse.verseText;
    }
  };

  const handleMarkAsRead = () => {
    if (!dailyVerse) return;
    
    recordReadingMutation.mutate({
      dailyVerseId: dailyVerse.id,
      reflectionText: reflection,
      emotionalReaction,
      audioListened: isAudioPlaying,
    });
  };

  const handleShare = (platform: string) => {
    if (!dailyVerse) return;
    
    const defaultShareText = `"${getVerseText()}" - ${dailyVerse.verseReference} 🙏 #DailyBible #SoapBoxSuperApp`;
    setShareText(shareText || defaultShareText);
    
    shareVerseMutation.mutate({
      dailyVerseId: dailyVerse.id,
      platform,
      shareText: shareText || defaultShareText,
    });
  };

  const handleAudioToggle = () => {
    setIsAudioPlaying(!isAudioPlaying);
    // In a real implementation, this would control actual audio playback
  };

  const handleEmotionalReaction = (reaction: string) => {
    setEmotionalReaction(reaction);
  };

  const getStreakMessage = () => {
    if (!streak) return "Start your journey today";
    if (streak.currentStreak === 0) return "Ready to begin your streak";
    if (streak.currentStreak === 1) return "Great start! Keep it going";
    if (streak.currentStreak < 7) return `${streak.currentStreak} days strong!`;
    if (streak.currentStreak < 30) return `Amazing ${streak.currentStreak}-day streak!`;
    return `Incredible ${streak.currentStreak}-day journey!`;
  };

  const MeditativeMode = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-b from-blue-900 to-purple-900 z-50 flex items-center justify-center p-6"
    >
      <div className="max-w-2xl text-center text-white">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="mb-8"
        >
          <h2 className="text-2xl font-light mb-4">Breathe and Reflect</h2>
          <p className="text-lg opacity-90">Inhale: "The Lord is..."</p>
          <p className="text-lg opacity-90">Exhale: "My Shepherd"</p>
        </motion.div>
        
        <motion.div
          className="mb-8 p-6 bg-white/10 rounded-lg backdrop-blur-sm"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-xl font-light leading-relaxed">
            {getVerseText()}
          </p>
          <p className="text-sm opacity-75 mt-4">— {dailyVerse?.verseReference}</p>
        </motion.div>

        <Button
          onClick={() => setShowMeditativeMode(false)}
          variant="outline"
          className="bg-white/20 border-white/30 text-white hover:bg-white/30"
        >
          End Meditation
        </Button>
      </div>
    </motion.div>
  );

  if (verseLoading || streakLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <AnimatePresence>
        {showMeditativeMode && <MeditativeMode />}
      </AnimatePresence>

      {/* Header with Streak Info */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Daily Bible</h1>
        <p className="text-gray-600">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
        
        {streak && (
          <div className="mt-4 flex items-center justify-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{streak.currentStreak}</div>
              <div className="text-sm text-gray-500">Current Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{streak.longestStreak}</div>
              <div className="text-sm text-gray-500">Best Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{streak.totalDaysRead}</div>
              <div className="text-sm text-gray-500">Total Days</div>
            </div>
          </div>
        )}
        
        <p className="text-lg text-blue-600 font-medium mt-2">{getStreakMessage()}</p>
      </motion.div>

      {/* Daily Verse Card */}
      {dailyVerse && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 border-0 shadow-xl">
            {dailyVerse.backgroundImageUrl && (
              <div
                className="absolute inset-0 bg-cover bg-center opacity-20"
                style={{ backgroundImage: `url(${dailyVerse.backgroundImageUrl})` }}
              />
            )}
            
            <CardHeader className="relative">
              <div className="flex items-center justify-between">
                <div>
                  {dailyVerse.theme && (
                    <Badge variant="secondary" className="mb-2">
                      {dailyVerse.theme}
                    </Badge>
                  )}
                  <CardTitle className="text-xl text-gray-800">
                    {dailyVerse.verseReference}
                  </CardTitle>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Select value={selectedVersion} onValueChange={setSelectedVersion}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="niv">NIV</SelectItem>
                      <SelectItem value="kjv">KJV</SelectItem>
                      <SelectItem value="esv">ESV</SelectItem>
                      <SelectItem value="nlt">NLT</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {dailyVerse.audioUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAudioToggle}
                      className="bg-white/80"
                    >
                      {isAudioPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="relative space-y-6">
              <div className="text-lg leading-relaxed text-gray-800 font-medium">
                "{getVerseText()}"
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center justify-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMeditativeMode(true)}
                  className="bg-white/80"
                >
                  <PrayingHands className="h-4 w-4 mr-2" />
                  Pause & Reflect
                </Button>
                
                <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="bg-white/80">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Share This Verse</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Textarea
                        value={shareText}
                        onChange={(e) => setShareText(e.target.value)}
                        placeholder="Add your thoughts..."
                        className="min-h-20"
                      />
                      <div className="flex space-x-2">
                        <Button onClick={() => handleShare("soapbox")} className="flex-1">
                          <Users className="h-4 w-4 mr-2" />
                          SoapBox
                        </Button>
                        <Button onClick={() => handleShare("facebook")} variant="outline" className="flex-1">
                          Share External
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Emotional Reactions */}
              <div className="flex items-center justify-center space-x-4">
                <span className="text-sm text-gray-600">How does this make you feel?</span>
                <div className="flex space-x-2">
                  {[
                    { emoji: "🔥", value: "fire", label: "Inspired" },
                    { emoji: "🙏", value: "pray", label: "Prayerful" },
                    { emoji: "💖", value: "heart", label: "Loved" },
                    { emoji: "☮️", value: "peace", label: "Peaceful" }
                  ].map((reaction) => (
                    <Button
                      key={reaction.value}
                      variant={emotionalReaction === reaction.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleEmotionalReaction(reaction.value)}
                      className="px-3"
                    >
                      <span className="text-lg mr-1">{reaction.emoji}</span>
                      {reaction.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Reflection & Prayer Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Tabs defaultValue="reflection" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="reflection">Reflection</TabsTrigger>
            <TabsTrigger value="prayer">Guided Prayer</TabsTrigger>
          </TabsList>
          
          <TabsContent value="reflection" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Reflect & Journal</CardTitle>
                {dailyVerse?.reflectionPrompt && (
                  <p className="text-gray-600">{dailyVerse.reflectionPrompt}</p>
                )}
              </CardHeader>
              <CardContent>
                <Textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="Write your thoughts and reflections here..."
                  className="min-h-32 resize-none"
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="prayer" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Guided Prayer</CardTitle>
              </CardHeader>
              <CardContent>
                {dailyVerse?.guidedPrayer ? (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-gray-800 leading-relaxed italic">
                      {dailyVerse.guidedPrayer}
                    </p>
                  </div>
                ) : (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-gray-800 leading-relaxed italic">
                      Heavenly Father, thank you for your Word that guides and strengthens us. 
                      Help us to apply what we've read today in our lives. May your truth transform 
                      our hearts and minds. In Jesus' name, Amen.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Mark as Read Button */}
      {!hasReadToday && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <Button
            onClick={handleMarkAsRead}
            disabled={recordReadingMutation.isPending}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3"
          >
            {recordReadingMutation.isPending ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Recording...
              </div>
            ) : (
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Mark as Read
              </div>
            )}
          </Button>
        </motion.div>
      )}

      {/* Badges Section */}
      {badges && badges.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Your Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {badges.map((badge) => (
                  <motion.div
                    key={badge.id}
                    whileHover={{ scale: 1.05 }}
                    className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200"
                  >
                    <div className="text-2xl mb-2">🏆</div>
                    <h3 className="font-semibold text-sm">{badge.badge.name}</h3>
                    <p className="text-xs text-gray-600 mt-1">{badge.badge.description}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Earned {format(new Date(badge.earnedAt), "MMM d")}
                    </p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Community Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        <Card className="bg-gradient-to-r from-green-50 to-blue-50">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                You're not alone in this journey
              </h3>
              <p className="text-gray-600">
                Join thousands of believers reading God's Word daily
              </p>
              <div className="flex items-center justify-center mt-4 space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">2,847</div>
                  <div className="text-sm text-gray-500">Read today</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">15,392</div>
                  <div className="text-sm text-gray-500">This week</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}