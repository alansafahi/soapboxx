import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Crown, Flame, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

// Define the structure of our leaderboard data
interface LeaderboardEntry {
  rank: number;
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  score: number;
  profileImageUrl?: string;
}

// User streak information
interface UserStreak {
  userId: string;
  currentStreak: number;
  isActive: boolean;
}

const Leaderboard: React.FC = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userStreaks, setUserStreaks] = useState<UserStreak[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch leaderboard data
        const leaderboardResponse = await fetch('/api/leaderboard', {
          credentials: 'include',
        });
        if (!leaderboardResponse.ok) {
          throw new Error('Failed to fetch leaderboard data.');
        }
        const leaderboardData: LeaderboardEntry[] = await leaderboardResponse.json();
        // Show only top 5 leaders
        setLeaderboard(leaderboardData.slice(0, 5));

        // Fetch user streaks data for streak icons
        try {
          const streaksResponse = await fetch('/api/user-streaks', {
            credentials: 'include',
          });
          if (streaksResponse.ok) {
            const streaksData: UserStreak[] = await streaksResponse.json();
            setUserStreaks(streaksData);
          }
        } catch (streakError) {
          // Don't fail if streaks API isn't available, just continue without streak data
          // Streaks data not available - using default
        }
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-4 h-4 text-white" />;
      case 2:
        return <Medal className="w-4 h-4 text-white" />;
      case 3:
        return <Award className="w-4 h-4 text-white" />;
      default:
        return <Trophy className="w-4 h-4 text-blue-500" />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 3:
        return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white';
    }
  };

  // Check if user has a streak (7+ days or top 20%)
  const hasStreak = (userId: string, rank: number) => {
    const userStreak = userStreaks.find(s => s.userId === userId);
    const isTopPercentile = rank <= Math.ceil(leaderboard.length * 0.2); // Top 20%
    const hasActiveStreak = userStreak && userStreak.isActive && userStreak.currentStreak >= 7;
    return isTopPercentile || hasActiveStreak;
  };

  // Handle profile click
  const handleProfileClick = (userId: string) => {
    // Navigate to user profile page
    window.location.href = `/profile/${userId}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-purple-900 dark:via-blue-900 dark:to-indigo-900 text-gray-900 dark:text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 dark:border-white mx-auto mb-4"></div>
            <p className="text-xl text-gray-800 dark:text-white">Loading Community Leaderboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-purple-900 dark:via-blue-900 dark:to-indigo-900 text-gray-900 dark:text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center p-8 text-red-600 dark:text-red-300">
            <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h2 className="text-2xl font-bold mb-2">Oops!</h2>
            <p>Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-purple-900 dark:via-blue-900 dark:to-indigo-900 text-gray-900 dark:text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Trophy className="w-12 h-12 text-yellow-500 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900 dark:bg-gradient-to-r dark:from-yellow-400 dark:to-orange-500 dark:bg-clip-text dark:text-transparent">
              Community Engagement Board
            </h1>
          </div>
          <p className="text-sm text-gray-700 dark:text-blue-200 max-w-2xl mx-auto">
            Celebrating our most active community members! Points are earned through 
            discussions (20pts), SOAP entries (15pts), prayer requests (25pts), and events attended (25pts).
          </p>
        </div>

        {leaderboard.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-24 h-24 mx-auto mb-6 text-blue-300 opacity-50" />
            <h2 className="text-2xl font-bold mb-4">Join a Church Community</h2>
            <p className="text-gray-700 dark:text-blue-200 mb-6">
              To see the engagement leaderboard, you need to be a member of a church community. 
              Join a church to connect with fellow believers and track community engagement!
            </p>
            <div className="bg-white border border-gray-200 dark:bg-white/10 dark:backdrop-blur-md rounded-xl p-6 dark:border-white/20 max-w-md mx-auto">
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-yellow-400">Getting Started</h3>
              <ul className="text-left text-gray-700 dark:text-blue-200 space-y-2">
                <li>• Browse and join a church in the Churches section</li>
                <li>• Start participating in discussions</li>
                <li>• Share SOAP journal entries</li>
                <li>• Submit prayer requests</li>
                <li>• Create community events</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white border border-gray-200 dark:bg-white/10 dark:backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden dark:border-white/20">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-black/20 border-b border-gray-200 dark:border-white/20">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800 dark:text-blue-200 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800 dark:text-blue-200 uppercase tracking-wider">
                        Community Member
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-800 dark:text-blue-200 uppercase tracking-wider">
                        Engagement Score
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                    {leaderboard.map((entry) => (
                      <tr 
                        key={entry.id} 
                        className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors duration-200 group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${getRankColor(entry.rank)} font-semibold text-sm mr-3`}>
                              {entry.rank <= 3 ? getRankIcon(entry.rank) : entry.rank}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div 
                              className="flex-shrink-0 w-10 h-10 mr-3 cursor-pointer hover:scale-105 transition-transform"
                              onClick={() => handleProfileClick(entry.id)}
                            >
                              <img
                                className="w-full h-full rounded-full border-2 border-white/20 object-cover"
                                src={entry.avatarUrl || entry.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(entry.firstName + ' ' + entry.lastName)}&background=6366f1&color=fff&size=40`}
                                alt={`${entry.firstName} ${entry.lastName}`}
                              />
                            </div>
                            <div 
                              className="cursor-pointer hover:text-yellow-300 transition-colors flex-grow"
                              onClick={() => handleProfileClick(entry.id)}
                            >
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {entry.firstName} {entry.lastName}
                                </p>
                                {hasStreak(entry.id, entry.rank) && (
                                  <div title="On a streak!">
                                    <Flame className="w-4 h-4 text-orange-500" />
                                  </div>
                                )}
                              </div>
                              {entry.rank <= 3 && (
                                <p className="text-sm text-gray-600 dark:text-blue-200">
                                  {entry.rank === 1 && "🏆 Community Champion"}
                                  {entry.rank === 2 && "🥈 Engagement Leader"}
                                  {entry.rank === 3 && "🥉 Active Contributor"}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end">
                            <span className="text-lg font-semibold text-yellow-400 mr-2 group-hover:text-yellow-300 transition-colors">
                              {entry.score}
                            </span>
                            <span className="text-xs text-gray-600 dark:text-blue-200">points</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 text-center">
              <div className="bg-white/90 dark:bg-white/10 backdrop-blur-md rounded-lg p-4 border border-gray-200 dark:border-white/20">
                <h3 className="text-sm font-semibold mb-3 text-gray-900 dark:text-yellow-400">How to Earn Points</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="text-center">
                    <div className="text-lg mb-1">💬</div>
                    <div className="font-medium text-gray-900 dark:text-white">Discussions</div>
                    <div className="text-gray-600 dark:text-blue-200">20 points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg mb-1">🙏</div>
                    <div className="font-medium text-gray-900 dark:text-white">Prayer Requests</div>
                    <div className="text-gray-600 dark:text-blue-200">25 points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg mb-1">📖</div>
                    <div className="font-medium text-gray-900 dark:text-white">SOAP Entries</div>
                    <div className="text-gray-600 dark:text-blue-200">15 points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg mb-1">🎯</div>
                    <div className="font-medium text-gray-900 dark:text-white">Events Attended</div>
                    <div className="text-gray-600 dark:text-blue-200">25 points</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;