import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Trophy, 
  Heart, 
  Users, 
  Calendar, 
  MessageCircle, 
  Target,
  Award,
  TrendingUp,
  Star,
  Crown,
  Zap,
  Shield
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { UserAchievement } from "@shared/schema";

interface UserStats {
  attendanceCount: number;
  prayerCount: number;
  connectionCount: number;
  discussionCount: number;
  totalPoints: number;
  currentStreak: number;
  level: number;
  experiencePoints: number;
  nextLevelXP: number;
}

interface Achievement {
  type: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  progress: number;
  maxProgress: number;
  isUnlocked: boolean;
  level: number;
}

export default function ProgressTracker() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>("overview");
  const [celebratingAchievement, setCelebratingAchievement] = useState<Achievement | null>(null);

  // Fetch user stats
  const { data: userStats } = useQuery<UserStats>({
    queryKey: ["/api/users/stats"],
  });

  // Fetch user achievements
  const { data: achievements = [] } = useQuery<UserAchievement[]>({
    queryKey: ["/api/users/achievements"],
  });

  // Calculate user level based on total points
  const calculateLevel = (points: number) => {
    return Math.floor(Math.sqrt(points / 100)) + 1;
  };

  // Calculate experience for current level
  const calculateLevelProgress = (points: number) => {
    const level = calculateLevel(points);
    const currentLevelThreshold = Math.pow(level - 1, 2) * 100;
    const nextLevelThreshold = Math.pow(level, 2) * 100;
    const progressInLevel = points - currentLevelThreshold;
    const totalNeededForLevel = nextLevelThreshold - currentLevelThreshold;
    
    return {
      level,
      currentXP: progressInLevel,
      nextLevelXP: totalNeededForLevel,
      progress: (progressInLevel / totalNeededForLevel) * 100
    };
  };

  // Transform achievements data into display format
  const formatAchievements = (): Achievement[] => {
    const achievementDefinitions = [
      {
        type: "prayer_warrior",
        name: "Prayer Warrior",
        description: "Pray for community prayer requests",
        icon: Heart,
        color: "from-red-500 to-pink-500",
        maxProgress: 50,
      },
      {
        type: "community_builder",
        name: "Community Builder",
        description: "Start discussions and engage with others",
        icon: Users,
        color: "from-blue-500 to-indigo-500",
        maxProgress: 25,
      },
      {
        type: "faithful_attendee",
        name: "Faithful Attendee",
        description: "Attend church events regularly",
        icon: Calendar,
        color: "from-green-500 to-emerald-500",
        maxProgress: 20,
      },
      {
        type: "social_butterfly",
        name: "Social Butterfly",
        description: "Connect with other community members",
        icon: MessageCircle,
        color: "from-purple-500 to-violet-500",
        maxProgress: 30,
      },
      {
        type: "spiritual_mentor",
        name: "Spiritual Mentor",
        description: "Guide and support others in their journey",
        icon: Crown,
        color: "from-yellow-500 to-orange-500",
        maxProgress: 10,
      },
      {
        type: "dedicated_servant",
        name: "Dedicated Servant",
        description: "Serve consistently in various capacities",
        icon: Shield,
        color: "from-teal-500 to-cyan-500",
        maxProgress: 15,
      }
    ];

    return achievementDefinitions.map(def => {
      const userAchievement = achievements.find(a => a.achievementType === def.type);
      return {
        ...def,
        progress: userAchievement?.progress || 0,
        isUnlocked: userAchievement?.isUnlocked || false,
        level: userAchievement?.achievementLevel || 1,
      };
    });
  };

  const formattedAchievements = formatAchievements();
  const levelInfo = userStats ? calculateLevelProgress(userStats.totalPoints || 0) : null;

  // Check for new achievements
  useEffect(() => {
    const newlyUnlocked = formattedAchievements.find(
      achievement => achievement.isUnlocked && achievement.progress >= achievement.maxProgress
    );
    
    if (newlyUnlocked && !celebratingAchievement) {
      setCelebratingAchievement(newlyUnlocked);
      setTimeout(() => setCelebratingAchievement(null), 4000);
    }
  }, [formattedAchievements, celebratingAchievement]);

  const categories = [
    { id: "overview", label: "Overview", icon: TrendingUp },
    { id: "achievements", label: "Achievements", icon: Trophy },
    { id: "progress", label: "Progress", icon: Target },
    { id: "stats", label: "Stats", icon: Award },
  ];

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "bg-green-500";
    if (progress >= 75) return "bg-blue-500";
    if (progress >= 50) return "bg-yellow-500";
    return "bg-gray-400";
  };

  if (!userStats) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
              Your Spiritual Journey
            </span>
            {levelInfo && (
              <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                Level {levelInfo.level}
              </Badge>
            )}
          </CardTitle>
          
          {/* Level Progress Bar */}
          {levelInfo && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>{levelInfo.currentXP} XP</span>
                <span>{levelInfo.nextLevelXP} XP to next level</span>
              </div>
              <Progress 
                value={levelInfo.progress} 
                className="h-3"
              />
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Category Navigation */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex-1 transition-all duration-200 ${
                    selectedCategory === category.id 
                      ? "bg-white shadow-sm" 
                      : "hover:bg-gray-200"
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {category.label}
                </Button>
              );
            })}
          </div>

          {/* Overview Tab */}
          {selectedCategory === "overview" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Heart className="w-6 h-6 text-red-500" />
                    <span className="text-2xl font-bold text-gray-800">{userStats.prayerCount}</span>
                  </div>
                  <p className="text-sm text-gray-600">Prayers Offered</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Calendar className="w-6 h-6 text-green-500" />
                    <span className="text-2xl font-bold text-gray-800">{userStats.attendanceCount}</span>
                  </div>
                  <p className="text-sm text-gray-600">Events Attended</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-purple-50 to-violet-50 p-4 rounded-lg border border-purple-100"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Users className="w-6 h-6 text-purple-500" />
                    <span className="text-2xl font-bold text-gray-800">{userStats.connectionCount}</span>
                  </div>
                  <p className="text-sm text-gray-600">Connections Made</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-100"
                >
                  <div className="flex items-center justify-between mb-2">
                    <MessageCircle className="w-6 h-6 text-yellow-500" />
                    <span className="text-2xl font-bold text-gray-800">{userStats.discussionCount}</span>
                  </div>
                  <p className="text-sm text-gray-600">Discussions Started</p>
                </motion.div>
              </div>

              {/* Recent Achievements */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Recent Achievements</h3>
                <div className="space-y-2">
                  {formattedAchievements
                    .filter(achievement => achievement.isUnlocked)
                    .slice(0, 3)
                    .map((achievement, index) => {
                      const Icon = achievement.icon;
                      return (
                        <motion.div
                          key={achievement.type}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${achievement.color} flex items-center justify-center`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{achievement.name}</p>
                            <p className="text-sm text-gray-600">Level {achievement.level}</p>
                          </div>
                          <Badge variant="secondary">Unlocked</Badge>
                        </motion.div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* Achievements Tab */}
          {selectedCategory === "achievements" && (
            <div className="grid grid-cols-1 gap-4">
              {formattedAchievements.map((achievement, index) => {
                const Icon = achievement.icon;
                const progressPercentage = (achievement.progress / achievement.maxProgress) * 100;
                
                return (
                  <motion.div
                    key={achievement.type}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                      achievement.isUnlocked 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${achievement.color} flex items-center justify-center ${
                        !achievement.isUnlocked ? 'opacity-60' : ''
                      }`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-gray-900">{achievement.name}</h3>
                          {achievement.isUnlocked && (
                            <Badge className="bg-green-100 text-green-800">
                              <Trophy className="w-3 h-3 mr-1" />
                              Level {achievement.level}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              {achievement.progress} / {achievement.maxProgress}
                            </span>
                            <span className="text-gray-600">
                              {Math.round(progressPercentage)}%
                            </span>
                          </div>
                          <Progress 
                            value={progressPercentage} 
                            className={`h-2 ${getProgressColor(progressPercentage)}`}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Progress Tab */}
          {selectedCategory === "progress" && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="relative inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mb-4">
                  <div className="w-28 h-28 rounded-full bg-white flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-800">{levelInfo?.level}</div>
                      <div className="text-xs text-gray-600">Level</div>
                    </div>
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {levelInfo && levelInfo.level >= 10 ? 'Spiritual Leader' :
                   levelInfo && levelInfo.level >= 5 ? 'Growing Believer' : 'New Journey'}
                </h2>
                <p className="text-gray-600">
                  {userStats.totalPoints} total experience points earned
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Progress Breakdown</h3>
                {formattedAchievements.map((achievement, index) => {
                  const Icon = achievement.icon;
                  const progressPercentage = (achievement.progress / achievement.maxProgress) * 100;
                  
                  return (
                    <motion.div
                      key={achievement.type}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${achievement.color} flex items-center justify-center`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900">{achievement.name}</span>
                          <span className="text-sm text-gray-600">{Math.round(progressPercentage)}%</span>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stats Tab */}
          {selectedCategory === "stats" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg">
                  <Zap className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-800">{userStats.currentStreak}</div>
                  <div className="text-sm text-gray-600">Day Streak</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-100 rounded-lg">
                  <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-800">{userStats.totalPoints}</div>
                  <div className="text-sm text-gray-600">Total Points</div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">Activity Breakdown</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Heart className="w-5 h-5 text-red-500" />
                      <span className="text-sm font-medium">Prayer Participation</span>
                    </div>
                    <span className="text-sm font-bold text-red-600">{userStats.prayerCount}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-green-500" />
                      <span className="text-sm font-medium">Event Attendance</span>
                    </div>
                    <span className="text-sm font-bold text-green-600">{userStats.attendanceCount}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5 text-purple-500" />
                      <span className="text-sm font-medium">Community Connections</span>
                    </div>
                    <span className="text-sm font-bold text-purple-600">{userStats.connectionCount}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <MessageCircle className="w-5 h-5 text-blue-500" />
                      <span className="text-sm font-medium">Discussions Created</span>
                    </div>
                    <span className="text-sm font-bold text-blue-600">{userStats.discussionCount}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievement Celebration Modal */}
      <AnimatePresence>
        {celebratingAchievement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.5, y: 50 }}
              className="bg-white rounded-2xl p-8 max-w-sm mx-4 text-center"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 0.6,
                  repeat: Infinity,
                  repeatDelay: 1
                }}
                className={`w-20 h-20 rounded-full bg-gradient-to-r ${celebratingAchievement.color} flex items-center justify-center mx-auto mb-4`}
              >
                <celebratingAchievement.icon className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Achievement Unlocked!</h2>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{celebratingAchievement.name}</h3>
              <p className="text-gray-600 mb-4">{celebratingAchievement.description}</p>
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                Level {celebratingAchievement.level}
              </Badge>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}