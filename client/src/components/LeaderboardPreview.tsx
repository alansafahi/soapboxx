import React, { useState, useEffect } from 'react';
import { Trophy, Crown, Medal, Award, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Link } from 'wouter';

interface LeaderboardEntry {
  rank: number;
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  score: number;
  profileImageUrl?: string;
}

export default function LeaderboardPreview() {
  const [topUsers, setTopUsers] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopUsers = async () => {
      try {
        const response = await fetch('/api/leaderboard', {
          credentials: 'include',
        });
        if (response.ok) {
          const data: LeaderboardEntry[] = await response.json();
          setTopUsers(data.slice(0, 3)); // Get top 3 users
        }
      } catch (error) {
        console.warn('Could not fetch leaderboard preview');
      } finally {
        setLoading(false);
      }
    };

    fetchTopUsers();
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <Trophy className="w-4 h-4 text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="h-5 w-5 text-purple-600" />
            🔝 Top Community Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-2 animate-pulse">
                <div className="w-8 h-8 bg-purple-200 dark:bg-purple-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-purple-200 dark:bg-purple-700 rounded w-3/4"></div>
                </div>
                <div className="h-4 bg-purple-200 dark:bg-purple-700 rounded w-12"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (topUsers.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="h-5 w-5 text-purple-600" />
            🔝 Top Community Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Trophy className="w-12 h-12 mx-auto mb-2 text-purple-300" />
            <p className="text-sm text-muted-foreground">
              Join a church to see community rankings!
            </p>
            <Link href="/churches">
              <Button variant="outline" size="sm" className="mt-2">
                Browse Churches
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="h-5 w-5 text-purple-600" />
          🔝 Top Community Members
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {topUsers.map((user) => (
          <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/50 dark:hover:bg-purple-800/30 transition-colors">
            <div className="flex-shrink-0 relative">
              {getRankIcon(user.rank)}
            </div>
            <div className="flex-shrink-0 w-8 h-8">
              <img
                className="w-full h-full rounded-full border border-purple-200 dark:border-purple-600 object-cover"
                src={user.avatarUrl || user.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName + ' ' + user.lastName)}&background=8b5cf6&color=fff&size=32`}
                alt={`${user.firstName} ${user.lastName}`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-muted-foreground">
                {user.rank === 1 && "Community Champion"}
                {user.rank === 2 && "Engagement Leader"}
                {user.rank === 3 && "Active Contributor"}
              </p>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                {user.score}
              </span>
              <p className="text-xs text-muted-foreground">pts</p>
            </div>
          </div>
        ))}
        
        <div className="pt-2 border-t border-purple-200 dark:border-purple-700">
          <Link href="/leaderboard">
            <Button variant="ghost" size="sm" className="w-full justify-between text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
              🔄 See Full Leaderboard
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}