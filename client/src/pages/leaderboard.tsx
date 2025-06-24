import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Trophy, Flame, Heart, Crown, Church, Medal, Target, Users, HandHeart, Home, MessageSquare, ArrowLeft } from "lucide-react";

interface LeaderboardEntry {
  id: number;
  rank: number;
  score: number;
  entityName: string;
  userId?: string;
  churchId?: number;
}

interface UserScore {
  totalPoints: number;
  weeklyPoints: number;
  monthlyPoints: number;
  currentStreak: number;
  faithfulnessScore: number;
  prayerChampionPoints: number;
  serviceHours: number;
  isAnonymous: boolean;
}

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState("weekly-faithfulness");
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Fetch user score
  const { data: userScore } = useQuery<UserScore>({
    queryKey: ["/api/users/score"],
  });

  // Fetch leaderboards based on active tab
  const { data: leaderboard, isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: [`/api/leaderboard/${activeTab}`],
  });

  const handleAnonymousToggle = async (checked: boolean) => {
    try {
      await fetch("/api/users/score/anonymous", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAnonymous: checked }),
      });
      setIsAnonymous(checked);
    } catch (error) {
    }
  };

  useEffect(() => {
    if (userScore) {
      setIsAnonymous(userScore.isAnonymous);
    }
  }, [userScore]);

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case "weekly-faithfulness": return <Trophy className="h-4 w-4" />;
      case "streaks": return <Flame className="h-4 w-4" />;
      case "prayer-champions": return <Heart className="h-4 w-4" />;
      case "service": return <Users className="h-4 w-4" />;
      case "church-vs-church": return <Church className="h-4 w-4" />;
      case "seasonal": return <Target className="h-4 w-4" />;
      default: return <Trophy className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Top Navigation */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Back Button and Title */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost" 
                size="sm"
                onClick={() => window.location.href = '/'}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </Button>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Community Leaderboards</h1>
            </div>

            {/* Quick Navigation */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/'}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Home</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/chat'}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Messages</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/profile'}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="text-center space-y-2 mt-4">
          <p className="text-muted-foreground">
            Celebrate spiritual growth and community engagement
          </p>
        </div>

        {/* User Score Overview */}
        {userScore && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Your Progress
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Grace Mode</span>
                  <Switch
                    checked={isAnonymous}
                    onCheckedChange={handleAnonymousToggle}
                  />
                </div>
              </CardTitle>
              <CardDescription>
                Track your spiritual journey and community contributions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{userScore.weeklyPoints}</p>
                  <p className="text-sm text-muted-foreground">Weekly Points</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-500">{userScore.currentStreak}</p>
                  <p className="text-sm text-muted-foreground">Day Streak</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{userScore.totalPoints}</p>
                  <p className="text-sm text-muted-foreground">Total Points</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{userScore.faithfulnessScore}</p>
                  <p className="text-sm text-muted-foreground">Faithfulness</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Leaderboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="weekly-faithfulness" className="flex items-center gap-2">
              {getTabIcon("weekly-faithfulness")}
              <span className="hidden sm:inline">Weekly</span>
            </TabsTrigger>
            <TabsTrigger value="streaks" className="flex items-center gap-2">
              {getTabIcon("streaks")}
              <span className="hidden sm:inline">Streaks</span>
            </TabsTrigger>
            <TabsTrigger value="prayer-champions" className="flex items-center gap-2">
              {getTabIcon("prayer-champions")}
              <span className="hidden sm:inline">Prayer</span>
            </TabsTrigger>
            <TabsTrigger value="service" className="flex items-center gap-2">
              {getTabIcon("service")}
              <span className="hidden sm:inline">Service</span>
            </TabsTrigger>
            <TabsTrigger value="church-vs-church" className="flex items-center gap-2">
              {getTabIcon("church-vs-church")}
              <span className="hidden sm:inline">Churches</span>
            </TabsTrigger>
            <TabsTrigger value="seasonal" className="flex items-center gap-2">
              {getTabIcon("seasonal")}
              <span className="hidden sm:inline">Seasonal</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="weekly-faithfulness">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Weekly Faithfulness Leaders
                </CardTitle>
                <CardDescription>
                  Top performers in weekly spiritual engagement activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LeaderboardList entries={leaderboard} isLoading={isLoading} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="streaks">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                  Streak Champions
                </CardTitle>
                <CardDescription>
                  Longest active streaks for daily spiritual practices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LeaderboardList entries={leaderboard} isLoading={isLoading} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prayer-champions">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HandHeart className="h-5 w-5 text-red-500" />
                  Prayer Champions
                </CardTitle>
                <CardDescription>
                  Most active in prayer requests and community support
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LeaderboardList entries={leaderboard} isLoading={isLoading} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="service">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  Service Leaders
                </CardTitle>
                <CardDescription>
                  Most hours dedicated to community service and outreach
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LeaderboardList entries={leaderboard} isLoading={isLoading} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="church-vs-church">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Church className="h-5 w-5 text-purple-500" />
                  Church vs Church
                </CardTitle>
                <CardDescription>
                  Friendly competition between church communities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LeaderboardList entries={leaderboard} isLoading={isLoading} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seasonal">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-500" />
                  Seasonal Challenge
                </CardTitle>
                <CardDescription>
                  Current seasonal spiritual growth challenge leaderboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LeaderboardList entries={leaderboard} isLoading={isLoading} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function LeaderboardList({ entries, isLoading }: { entries?: LeaderboardEntry[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4 rounded-lg bg-muted/50 animate-pulse">
            <div className="w-8 h-8 bg-muted rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-1/3" />
              <div className="h-3 bg-muted rounded w-1/5" />
            </div>
            <div className="h-6 bg-muted rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No leaderboard data available yet.</p>
        <p className="text-sm">Start engaging with the community to see rankings!</p>
      </div>
    );
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
    return <span className="text-sm font-medium">{rank}</span>;
  };

  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-8 h-8">
              {getRankIcon(entry.rank)}
            </div>
            <div>
              <p className="font-medium">{entry.entityName}</p>
              <p className="text-sm text-muted-foreground">
                Rank #{entry.rank}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg">{entry.score}</p>
            <p className="text-sm text-muted-foreground">points</p>
          </div>
        </div>
      ))}
    </div>
  );
}