import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Star, CheckCircle, Users, MessageCircle } from "lucide-react";
import type { UserAchievement } from "../../../shared/schema";

export default function AchievementTracker() {
  const { user } = useAuth();

  // Fetch user achievements
  const { data: achievements = [], isLoading } = useQuery<UserAchievement[]>({
    queryKey: ["/api/users/achievements"],
    enabled: !!user,
  });

  // Fetch user stats for progress calculation
  const { data: userStats } = useQuery({
    queryKey: ["/api/users/stats"],
    enabled: !!user,
  });

  const getAchievementIcon = (type: string) => {
    switch (type) {
      case 'community_builder':
        return <MessageCircle className="w-6 h-6 text-white" />;
      case 'prayer_warrior':
        return <Star className="w-6 h-6 text-white" />;
      case 'social_butterfly':
        return <Users className="w-6 h-6 text-white" />;
      default:
        return <Star className="w-6 h-6 text-white" />;
    }
  };

  const getAchievementColor = (type: string) => {
    switch (type) {
      case 'community_builder':
        return 'from-faith-gold to-yellow-600';
      case 'prayer_warrior':
        return 'from-green-500 to-green-600';
      case 'social_butterfly':
        return 'from-purple-500 to-purple-600';
      default:
        return 'from-faith-gold to-yellow-600';
    }
  };

  const getAchievementTitle = (type: string) => {
    switch (type) {
      case 'community_builder':
        return 'Community Builder';
      case 'prayer_warrior':
        return 'Prayer Warrior';
      case 'social_butterfly':
        return 'Social Butterfly';
      default:
        return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const getAchievementDescription = (type: string, progress: number, maxProgress: number) => {
    switch (type) {
      case 'community_builder':
        return `${progress}/${maxProgress} discussions participated`;
      case 'prayer_warrior':
        return `${progress}/${maxProgress} prayer requests submitted`;
      case 'social_butterfly':
        return `${progress}/${maxProgress} connections made`;
      default:
        return `${progress}/${maxProgress} completed`;
    }
  };

  // Mock current achievement in progress
  const currentAchievement = {
    type: 'community_builder',
    progress: userStats?.discussionCount || 0,
    maxProgress: 10,
  };

  const progressPercentage = (currentAchievement.progress / currentAchievement.maxProgress) * 100;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Journey</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Badge Progress */}
        <div className="text-center">
          <div className={`w-16 h-16 bg-gradient-to-br ${getAchievementColor(currentAchievement.type)} rounded-full flex items-center justify-center mx-auto mb-3`}>
            {getAchievementIcon(currentAchievement.type)}
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">
            {getAchievementTitle(currentAchievement.type)}
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            {getAchievementDescription(currentAchievement.type, currentAchievement.progress, currentAchievement.maxProgress)}
          </p>
          
          {/* Progress Bar */}
          <Progress value={progressPercentage} className="w-full h-2 mb-4" />
          
          <p className="text-xs text-gray-500">
            {currentAchievement.maxProgress - currentAchievement.progress} more to unlock this badge!
          </p>
        </div>
        
        {/* Recent Achievements */}
        <div className="space-y-3 pt-4 border-t border-gray-100">
          <h4 className="font-medium text-gray-900 text-sm">Recent Achievements</h4>
          
          {achievements.length === 0 ? (
            <div className="text-center py-4">
              <Star className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">No achievements yet</p>
              <p className="text-xs text-gray-500">Start participating to earn your first badge!</p>
            </div>
          ) : (
            achievements.slice(0, 3).map((achievement) => (
              <div key={achievement.id} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {getAchievementTitle(achievement.achievementType)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Level {achievement.achievementLevel}
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Unlocked
                </Badge>
              </div>
            ))
          )}
          
          {/* Sample achievements if none exist */}
          {achievements.length === 0 && (
            <>
              <div className="flex items-center space-x-3 opacity-50">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <Star className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Prayer Warrior</p>
                  <p className="text-xs text-gray-500">Submit 5 prayer requests</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  Locked
                </Badge>
              </div>
              
              <div className="flex items-center space-x-3 opacity-50">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Social Butterfly</p>
                  <p className="text-xs text-gray-500">Connect with 20 members</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  Locked
                </Badge>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
