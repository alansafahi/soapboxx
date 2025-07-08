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
        setLeaderboard(leaderboardData);

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
          console.warn('Streaks data not available:', streakError);
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
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <Trophy className="w-5 h-5 text-blue-500" />;
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
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-xl">Loading Community Leaderboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center p-8 text-red-300">
            <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h2 className="text-2xl font-bold mb-2">Oops!</h2>
            <p>Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Trophy className="w-12 h-12 text-yellow-500 mr-3" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Community Engagement Leaderboard
            </h1>
          </div>
          <p className="text-lg text-blue-200 max-w-2xl mx-auto">
            Celebrating our most active community members! Points are earned through discussions (5pts), 
            SOAP entries (3pts), prayer requests (2pts), and events created (4pts).
          </p>
        </div>

        {leaderboard.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-24 h-24 mx-auto mb-6 text-blue-300 opacity-50" />
            <h2 className="text-2xl font-bold mb-4">Join a Church Community</h2>
            <p className="text-blue-200 mb-6">
              To see the engagement leaderboard, you need to be a member of a church community. 
              Join a church to connect with fellow believers and track community engagement!
            </p>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 max-w-md mx-auto">
              <h3 className="text-lg font-semibold mb-3 text-yellow-400">Getting Started</h3>
              <ul className="text-left text-blue-200 space-y-2">
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
            <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-white/20">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-black/20 border-b border-white/20">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-blue-200 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-blue-200 uppercase tracking-wider">
                        Community Member
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-blue-200 uppercase tracking-wider">
                        Engagement Score
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {leaderboard.map((entry) => (
                      <tr 
                        key={entry.id} 
                        className="hover:bg-white/5 transition-colors duration-200 group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className={`flex items-center justify-center w-12 h-12 rounded-full ${getRankColor(entry.rank)} font-bold text-lg mr-3`}>
                              {entry.rank <= 3 ? getRankIcon(entry.rank) : entry.rank}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div 
                              className="flex-shrink-0 w-12 h-12 mr-4 cursor-pointer hover:scale-105 transition-transform"
                              onClick={() => handleProfileClick(entry.id)}
                            >
                              <img
                                className="w-full h-full rounded-full border-2 border-white/20 object-cover"
                                src={entry.avatarUrl || entry.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(entry.firstName + ' ' + entry.lastName)}&background=6366f1&color=fff&size=48`}
                                alt={`${entry.firstName} ${entry.lastName}`}
                              />
                            </div>
                            <div 
                              className="cursor-pointer hover:text-yellow-300 transition-colors flex-grow"
                              onClick={() => handleProfileClick(entry.id)}
                            >
                              <div className="flex items-center gap-2">
                                <p className="text-lg font-semibold text-white">
                                  {entry.firstName} {entry.lastName}
                                </p>
                                {hasStreak(entry.id, entry.rank) && (
                                  <Flame className="w-4 h-4 text-orange-500" title="On a streak!" />
                                )}
                              </div>
                              {entry.rank <= 3 && (
                                <p className="text-sm text-blue-200">
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
                            <span className="text-2xl font-bold text-yellow-400 mr-2 group-hover:text-yellow-300 transition-colors">
                              {entry.score}
                            </span>
                            <span className="text-sm text-blue-200">points</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-8 text-center">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold mb-4 text-yellow-400">How to Earn Points</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl mb-2">💬</div>
                    <div className="font-semibold">Discussions</div>
                    <div className="text-blue-200">5 points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-2">📖</div>
                    <div className="font-semibold">SOAP Entries</div>
                    <div className="text-blue-200">3 points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-2">🙏</div>
                    <div className="font-semibold">Prayer Requests</div>
                    <div className="text-blue-200">2 points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-2">📅</div>
                    <div className="font-semibold">Events Created</div>
                    <div className="text-blue-200">4 points</div>
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