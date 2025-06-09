import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Trophy, Flame, Heart, Hands, Crown, Church, Medal, Target } from "lucide-react";

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
      console.error("Failed to update anonymous mode:", error);
    }
  };

  useEffect(() => {
    if (userScore) {
      setIsAnonymous(userScore.isAnonymous);
    }
  }, [userScore]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
    return <span className="text-sm font-medium">{rank}</span>;
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case "weekly-faithfulness": return <Trophy className="h-4 w-4" />;
      case "streaks": return <Flame className="h-4 w-4" />;
      case "prayer-champions": return <Heart className="h-4 w-4" />;
      case "service": return <Hands className="h-4 w-4" />;
      case "church-vs-church": return <Church className="h-4 w-4" />;
      case "seasonal": return <Target className="h-4 w-4" />;
      default: return <Trophy className="h-4 w-4" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Community Leaderboards</h1>
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
              {isAnonymous ? "Your progress is private" : "Visible to community"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{userScore.totalPoints}</div>
                <div className="text-sm text-muted-foreground">Total Points</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{userScore.weeklyPoints}</div>
                <div className="text-sm text-muted-foreground">This Week</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{userScore.currentStreak}</div>
                <div className="text-sm text-muted-foreground">Current Streak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{userScore.serviceHours}</div>
                <div className="text-sm text-muted-foreground">Service Hours</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
          <TabsTrigger value="weekly-faithfulness" className="flex items-center gap-1">
            {getTabIcon("weekly-faithfulness")}
            <span className="hidden sm:inline">Weekly</span>
          </TabsTrigger>
          <TabsTrigger value="streaks" className="flex items-center gap-1">
            {getTabIcon("streaks")}
            <span className="hidden sm:inline">Streaks</span>
          </TabsTrigger>
          <TabsTrigger value="prayer-champions" className="flex items-center gap-1">
            {getTabIcon("prayer-champions")}
            <span className="hidden sm:inline">Prayer</span>
          </TabsTrigger>
          <TabsTrigger value="service" className="flex items-center gap-1">
            {getTabIcon("service")}
            <span className="hidden sm:inline">Service</span>
          </TabsTrigger>
          <TabsTrigger value="church-vs-church" className="flex items-center gap-1">
            {getTabIcon("church-vs-church")}
            <span className="hidden sm:inline">Churches</span>
          </TabsTrigger>
          <TabsTrigger value="seasonal" className="flex items-center gap-1">
            {getTabIcon("seasonal")}
            <span className="hidden sm:inline">Seasonal</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="weekly-faithfulness">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Weekly Faithfulness Score
              </CardTitle>
              <CardDescription>
                Based on daily activities: prayers, devotionals, check-ins, and donations
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
                Most consistent daily devotionals and prayer habits
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
                <Heart className="h-5 w-5 text-red-500" />
                Prayer Champions
              </CardTitle>
              <CardDescription>
                Most encouraging members based on prayer responses and comments
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
                <Hands className="h-5 w-5 text-blue-500" />
                Service & Volunteering
              </CardTitle>
              <CardDescription>
                Community service hours and volunteer contributions
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
                Top churches by total community activity this month
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
  );
}

function LeaderboardList({ entries, isLoading }: { entries?: LeaderboardEntry[], isLoading: boolean }) {
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
    return <span className="text-sm font-medium text-muted-foreground">#{rank}</span>;
  };

  return (
    <div className="space-y-2">
      {entries.map((entry, index) => (
        <div
          key={entry.id}
          className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
            entry.rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' : 'bg-card hover:bg-muted/50'
          }`}
        >
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-8 h-8">
              {getRankIcon(entry.rank)}
            </div>
            <div>
              <p className="font-medium">{entry.entityName}</p>
              {entry.rank <= 3 && (
                <Badge variant="secondary" className="text-xs">
                  {entry.rank === 1 ? "Champion" : entry.rank === 2 ? "Runner-up" : "3rd Place"}
                </Badge>
              )}
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