import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Crown, Medal, TrendingUp, Users, Gift } from "lucide-react";

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
  referralCount?: number;
  referralPoints?: number;
  referralTier?: string;
}

export default function LeaderboardWidget() {
  // Fetch user score
  const { data: userScore } = useQuery<UserScore>({
    queryKey: ["/api/users/score"],
  });

  // Fetch user referral stats
  const { data: referralStats } = useQuery({
    queryKey: ["/api/referrals/stats"],
  });

  // Fetch weekly faithfulness leaderboard (top 3)
  const { data: weeklyLeaderboard } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/leaderboard/weekly-faithfulness"],
  });

  // Fetch referral leaderboard
  const { data: referralLeaderboard } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/leaderboard/referrals"],
  });

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-4 w-4 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-4 w-4 text-gray-400" />;
    if (rank === 3) return <Medal className="h-4 w-4 text-amber-600" />;
    return <span className="text-xs font-medium text-muted-foreground">#{rank}</span>;
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="h-5 w-5 text-soapbox-purple" />
          Community Rankings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* User's Current Stats */}
        {userScore && (
          <div className="bg-white/60 rounded-lg p-3 border border-purple-100">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Your Progress</span>
              <Badge variant="secondary" className="text-xs">
                {userScore.isAnonymous ? "Private" : "Public"}
              </Badge>
            </div>
            <div className="grid grid-cols-4 gap-3 text-center">
              <div>
                <div className="text-lg font-bold text-soapbox-purple">{userScore.weeklyPoints}</div>
                <div className="text-xs text-gray-500">This Week</div>
              </div>
              <div>
                <div className="text-lg font-bold text-soapbox-purple">{userScore.currentStreak}</div>
                <div className="text-xs text-gray-500">Day Streak</div>
              </div>
              <div>
                <div className="text-lg font-bold text-soapbox-purple">{referralStats?.totalReferrals || 0}</div>
                <div className="text-xs text-gray-500">Referrals</div>
              </div>
              <div>
                <div className="text-lg font-bold text-soapbox-purple">{userScore.totalPoints}</div>
                <div className="text-xs text-gray-500">Total Points</div>
              </div>
            </div>
            
            {/* Referral Tier Badge */}
            {referralStats?.currentTier && (
              <div className="mt-3 flex items-center justify-center">
                <Badge variant="outline" className="bg-gradient-to-r from-purple-100 to-pink-100 border-purple-300">
                  <Gift className="h-3 w-3 mr-1" />
                  {referralStats.currentTier} Advocate
                </Badge>
              </div>
            )}
          </div>
        )}

        {/* Top 3 Weekly Leaders */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Weekly Leaders</span>
          </div>
          
          {weeklyLeaderboard && weeklyLeaderboard.length > 0 ? (
            <div className="space-y-2">
              {weeklyLeaderboard.slice(0, 3).map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between bg-white/60 rounded-lg p-2 border border-blue-100"
                >
                  <div className="flex items-center gap-2">
                    {getRankIcon(entry.rank)}
                    <span className="text-sm font-medium text-gray-800">
                      {entry.entityName}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-blue-600">
                    {entry.score}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white/60 rounded-lg p-3 border border-blue-100 text-center">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">
                No rankings yet this week
              </p>
              <p className="text-xs text-gray-400">
                Start engaging to see leaders!
              </p>
            </div>
          )}
        </div>

        {/* Top Referrers Section */}
        {referralLeaderboard && referralLeaderboard.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Top Referrers</span>
            </div>
            
            <div className="space-y-2">
              {referralLeaderboard.slice(0, 3).map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-2 border border-purple-100"
                >
                  <div className="flex items-center gap-2">
                    {getRankIcon(entry.rank)}
                    <span className="text-sm font-medium text-gray-800">
                      {entry.entityName}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-purple-600" />
                    <span className="text-sm font-bold text-purple-600">
                      {entry.score}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View Full Leaderboard Button */}
        <Button
          onClick={() => window.location.href = '/leaderboard'}
          variant="outline"
          size="sm"
          className="w-full bg-white/80 hover:bg-white border-blue-200 text-blue-700 hover:text-blue-800"
        >
          View Full Leaderboard
        </Button>
      </CardContent>
    </Card>
  );
}