import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Trophy, Star, Award, Zap, Heart, Book, Hands, MessageCircle } from 'lucide-react';

interface Milestone {
  id: string;
  name: string;
  description: string;
  category: 'reading' | 'prayer' | 'journaling' | 'community' | 'service' | 'streaks';
  type: 'count' | 'streak' | 'points' | 'time_based';
  threshold: number;
  badge: string;
  currentValue: number;
  isAchieved: boolean;
  progressPercentage: number;
  achievedAt: string | null;
  celebrationMessage?: {
    title: string;
    message: string;
    actionUrl?: string;
  };
}

const categoryIcons = {
  reading: Book,
  prayer: Heart,
  journaling: MessageCircle,
  community: MessageCircle,
  service: Hands,
  streaks: Zap
};

const categoryColors = {
  reading: 'bg-blue-100 text-blue-800',
  prayer: 'bg-purple-100 text-purple-800',
  journaling: 'bg-green-100 text-green-800',
  community: 'bg-orange-100 text-orange-800',
  service: 'bg-pink-100 text-pink-800',
  streaks: 'bg-yellow-100 text-yellow-800'
};

export function MilestoneCelebration() {
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebratingMilestone, setCelebratingMilestone] = useState<Milestone | null>(null);

  const { data: milestonesData, isLoading } = useQuery({
    queryKey: ['/api/milestones'],
    refetchInterval: 30000, // Check for new achievements every 30 seconds
  });

  const milestones = milestonesData?.milestones || [];

  // Check for newly achieved milestones
  useEffect(() => {
    const recentlyAchieved = milestones.find((milestone: Milestone) => 
      milestone.isAchieved && 
      milestone.achievedAt &&
      new Date(milestone.achievedAt).getTime() > Date.now() - 60000 // Within last minute
    );

    if (recentlyAchieved && !showCelebration) {
      setCelebratingMilestone(recentlyAchieved);
      setShowCelebration(true);
      
      // Auto-hide celebration after 10 seconds
      setTimeout(() => {
        setShowCelebration(false);
      }, 10000);
    }
  }, [milestones, showCelebration]);

  const achievedMilestones = milestones.filter((m: Milestone) => m.isAchieved);
  const inProgressMilestones = milestones
    .filter((m: Milestone) => !m.isAchieved)
    .sort((a: Milestone, b: Milestone) => b.progressPercentage - a.progressPercentage);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-24 bg-gray-200 rounded-lg animate-pulse" />
        <div className="h-32 bg-gray-200 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Celebration Modal */}
      {showCelebration && celebratingMilestone && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full mx-auto bg-gradient-to-br from-purple-600 to-pink-600 text-white border-0">
            <CardHeader className="text-center">
              <div className="text-6xl mb-4">{celebratingMilestone.badge}</div>
              <CardTitle className="text-2xl text-white">
                {celebratingMilestone.celebrationMessage?.title || celebratingMilestone.name}
              </CardTitle>
              <CardDescription className="text-purple-100">
                {celebratingMilestone.celebrationMessage?.message || celebratingMilestone.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Trophy className="w-5 h-5" />
                <span className="font-semibold">Achievement Unlocked!</span>
              </div>
              <Button 
                onClick={() => setShowCelebration(false)}
                className="bg-white text-purple-600 hover:bg-purple-50"
              >
                Continue Journey
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Achievements Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span>Your Spiritual Journey</span>
          </CardTitle>
          <CardDescription>
            Celebrating your growth in faith and community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{achievedMilestones.length}</div>
              <div className="text-sm text-gray-600">Achievements</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{inProgressMilestones.length}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      {achievedMilestones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-gold-500" />
              <span>Recent Achievements</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {achievedMilestones.slice(0, 5).map((milestone: Milestone) => {
                const IconComponent = categoryIcons[milestone.category];
                return (
                  <div key={milestone.id} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl">{milestone.badge}</div>
                    <div className="flex-grow">
                      <div className="font-semibold text-green-800">{milestone.name}</div>
                      <div className="text-sm text-green-600">{milestone.description}</div>
                    </div>
                    <Badge className={categoryColors[milestone.category]}>
                      {milestone.category}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Toward Next Milestones */}
      {inProgressMilestones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-blue-500" />
              <span>Your Next Achievements</span>
            </CardTitle>
            <CardDescription>
              Keep growing in your spiritual journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inProgressMilestones.slice(0, 4).map((milestone: Milestone) => {
                const IconComponent = categoryIcons[milestone.category];
                return (
                  <div key={milestone.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="text-xl">{milestone.badge}</div>
                        <div>
                          <div className="font-semibold">{milestone.name}</div>
                          <div className="text-sm text-gray-600">{milestone.description}</div>
                        </div>
                      </div>
                      <Badge className={categoryColors[milestone.category]}>
                        {milestone.category}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{milestone.currentValue} / {milestone.threshold}</span>
                        <span>{Math.round(milestone.progressPercentage)}%</span>
                      </div>
                      <Progress value={milestone.progressPercentage} className="h-2" />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Milestone Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Milestone Categories</CardTitle>
          <CardDescription>
            Different ways to grow in your spiritual journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(categoryIcons).map(([category, IconComponent]) => {
              const categoryMilestones = milestones.filter((m: Milestone) => m.category === category);
              const achievedCount = categoryMilestones.filter((m: Milestone) => m.isAchieved).length;
              const totalCount = categoryMilestones.length;
              
              return (
                <div key={category} className="text-center p-4 bg-gray-50 rounded-lg">
                  <IconComponent className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                  <div className="font-semibold capitalize">{category}</div>
                  <div className="text-sm text-gray-600">{achievedCount}/{totalCount}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default MilestoneCelebration;