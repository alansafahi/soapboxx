import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Award, 
  TrendingUp, 
  Plus, 
  Heart, 
  MessageCircle,
  Calendar,
  Users,
  Trophy,
  Star,
  Target,
  Flame,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';

interface BadgeProgress {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'prayer' | 'community' | 'growth' | 'service';
  currentProgress: number;
  maxProgress: number;
  isUnlocked: boolean;
  reward?: string;
  color: string;
}

interface AnsweredPrayer {
  id: number;
  prayerId: number;
  userId: string;
  userName: string;
  testimony: string;
  answeredAt: string;
  category: string;
  reactions: {
    praise: number;
    heart: number;
    fire: number;
  };
  comments: number;
}

interface PrayerTrend {
  category: string;
  count: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

interface AnalyticsFilters {
  timeframe: 'week' | 'month' | 'year';
  ageGroup: 'all' | 'youth' | 'adults' | 'seniors';
  geography: 'all' | 'local' | 'regional';
  topic: 'all' | 'health' | 'family' | 'career' | 'spiritual' | 'youth';
}

export default function PrayerAnalyticsBadges() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<AnalyticsFilters>({
    timeframe: 'month',
    ageGroup: 'all',
    geography: 'all',
    topic: 'all'
  });
  const [selectedAnsweredPrayer, setSelectedAnsweredPrayer] = useState<AnsweredPrayer | null>(null);
  const [newTestimonyDialog, setNewTestimonyDialog] = useState(false);

  // Fetch badge progress
  const { data: badgeProgress = [] } = useQuery({
    queryKey: ['/api/prayer-analytics/badges', user?.id],
    queryFn: () => apiRequest('GET', `/api/prayer-analytics/badges/${user?.id}`),
    enabled: !!user?.id,
  });

  // Fetch answered prayers
  const { data: answeredPrayers = [] } = useQuery({
    queryKey: ['/api/prayer-analytics/answered-prayers'],
    queryFn: () => apiRequest('GET', '/api/prayer-analytics/answered-prayers'),
  });

  // Fetch prayer trends with filters
  const { data: prayerTrends = [] } = useQuery({
    queryKey: ['/api/prayer-analytics/trends', filters],
    queryFn: () => apiRequest('GET', `/api/prayer-analytics/trends?${new URLSearchParams(filters as any).toString()}`),
  });

  // Submit answered prayer testimony
  const submitTestimonyMutation = useMutation({
    mutationFn: async (data: { prayerId: number; testimony: string; answeredAt: string; category: string }) => {
      return await apiRequest('POST', '/api/prayer-analytics/answered-prayer-testimony', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/prayer-analytics/answered-prayers'] });
      setNewTestimonyDialog(false);
      toast({
        title: "Testimony Submitted",
        description: "Thank you for sharing your answered prayer!",
      });
    }
  });

  // React to answered prayer
  const reactToAnsweredPrayerMutation = useMutation({
    mutationFn: async ({ testimonyId, reactionType }: { testimonyId: number; reactionType: string }) => {
      return await apiRequest('POST', '/api/prayer-analytics/react-answered-prayer', { testimonyId, reactionType });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/prayer-analytics/answered-prayers'] });
    }
  });

  const getBadgeIcon = (icon: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      '🏆': <Trophy className="w-5 h-5" />,
      '🙏': <Heart className="w-5 h-5" />,
      '⭐': <Star className="w-5 h-5" />,
      '🎯': <Target className="w-5 h-5" />,
      '🔥': <Flame className="w-5 h-5" />,
      '⚡': <Zap className="w-5 h-5" />
    };
    return icons[icon] || <Award className="w-5 h-5" />;
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return '↑';
      case 'down': return '↓';
      case 'stable': return '→';
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      case 'stable': return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        {/* Enhanced Prayer Badges with Progress */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-600" />
              Prayer Badges
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {badgeProgress.map((badge: BadgeProgress) => (
                <div key={badge.id} className={`p-4 rounded-lg border-2 ${
                  badge.isUnlocked 
                    ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-300' 
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                }`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      badge.isUnlocked ? badge.color : 'bg-gray-300'
                    }`}>
                      {getBadgeIcon(badge.icon)}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm flex items-center gap-2">
                        {badge.name}
                        {badge.isUnlocked && (
                          <Badge variant="secondary" className="text-xs">
                            Earned!
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {badge.description}
                      </div>
                    </div>
                  </div>
                  
                  {!badge.isUnlocked && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Progress</span>
                        <span className="font-semibold">
                          {badge.currentProgress}/{badge.maxProgress}
                        </span>
                      </div>
                      <Progress 
                        value={(badge.currentProgress / badge.maxProgress) * 100} 
                        className="h-2"
                      />
                      <div className="text-xs text-purple-600 font-medium">
                        {badge.maxProgress - badge.currentProgress} more to unlock!
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Interactive Answered Prayers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center text-white text-xs">✓</div>
              Answered Prayers
            </h3>
            <Dialog open={newTestimonyDialog} onOpenChange={setNewTestimonyDialog}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Testimony
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Share Your Answered Prayer</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a prayer request" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prayer1">Job interview prayer</SelectItem>
                      <SelectItem value="prayer2">Health healing request</SelectItem>
                      <SelectItem value="prayer3">Family reconciliation</SelectItem>
                    </SelectContent>
                  </Select>
                  <textarea 
                    className="w-full p-3 border rounded-lg resize-none h-32"
                    placeholder="Share how God answered your prayer..."
                  />
                  <Button 
                    onClick={() => submitTestimonyMutation.mutate({ prayerId: 1, testimony: "Test testimony" })}
                    disabled={submitTestimonyMutation.isPending}
                  >
                    {submitTestimonyMutation.isPending ? "Submitting..." : "Share Testimony"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-green-600">{answeredPrayers.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Answered this month</div>
            </div>
            
            <div className="space-y-3">
              <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">Recent testimonies:</div>
              {answeredPrayers.slice(0, 3).map((prayer: AnsweredPrayer) => (
                <div 
                  key={prayer.id}
                  className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                  onClick={() => setSelectedAnsweredPrayer(prayer)}
                >
                  <div className="text-sm font-medium">{prayer.testimony.substring(0, 60)}...</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    By {prayer.userName} • {prayer.category}
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs">
                    <span className="flex items-center gap-1">
                      🙏 {prayer.reactions.praise}
                    </span>
                    <span className="flex items-center gap-1">
                      ❤️ {prayer.reactions.heart}
                    </span>
                    <span className="flex items-center gap-1">
                      💬 {prayer.comments}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Prayer Trends with Filtering */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              Prayer Trends
            </h3>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Select 
                value={filters.timeframe} 
                onValueChange={(value: any) => setFilters(prev => ({ ...prev, timeframe: value }))}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
              <Select 
                value={filters.topic} 
                onValueChange={(value: any) => setFilters(prev => ({ ...prev, topic: value }))}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Topics</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="family">Family</SelectItem>
                  <SelectItem value="career">Career</SelectItem>
                  <SelectItem value="spiritual">Spiritual</SelectItem>
                  <SelectItem value="youth">Youth</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {prayerTrends.map((trend: PrayerTrend) => (
                <div key={trend.category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize">{trend.category} Prayers</span>
                    <span className={`font-medium ${getTrendColor(trend.trend)}`}>
                      {getTrendIcon(trend.trend)} {Math.abs(trend.change)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-500" 
                      style={{width: `${trend.percentage}%`}}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {trend.count} prayers • {trend.percentage}% of total
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Answered Prayer Detail Dialog */}
      <Dialog open={!!selectedAnsweredPrayer} onOpenChange={() => setSelectedAnsweredPrayer(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Answered Prayer Testimony</DialogTitle>
          </DialogHeader>
          {selectedAnsweredPrayer && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="font-semibold text-green-800 dark:text-green-200 mb-2">
                  {selectedAnsweredPrayer.category} Prayer Answered
                </div>
                <div className="text-gray-700 dark:text-gray-300">
                  {selectedAnsweredPrayer.testimony}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Shared by {selectedAnsweredPrayer.userName} • {new Date(selectedAnsweredPrayer.answeredAt).toLocaleDateString()}
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => reactToAnsweredPrayerMutation.mutate({ id: selectedAnsweredPrayer.id, reaction: 'praise' })}
                >
                  🙏 Praise ({selectedAnsweredPrayer.reactions.praise})
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => reactToAnsweredPrayerMutation.mutate({ id: selectedAnsweredPrayer.id, reaction: 'heart' })}
                >
                  ❤️ Love ({selectedAnsweredPrayer.reactions.heart})
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => reactToAnsweredPrayerMutation.mutate({ id: selectedAnsweredPrayer.id, reaction: 'fire' })}
                >
                  🔥 Fire ({selectedAnsweredPrayer.reactions.fire})
                </Button>
              </div>
              
              <div className="border-t pt-4">
                <div className="text-sm font-medium mb-2">Comments ({selectedAnsweredPrayer.comments})</div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  <div className="text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="font-medium">Sarah M:</span> Praise God! This is so encouraging!
                  </div>
                  <div className="text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="font-medium">Pastor Tom:</span> What a wonderful testimony of God's faithfulness.
                  </div>
                </div>
                <div className="mt-2">
                  <input 
                    type="text" 
                    placeholder="Add a comment..."
                    className="w-full p-2 border rounded text-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}