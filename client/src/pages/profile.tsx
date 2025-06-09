import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { LogOut, Mail, Calendar, Users, Heart } from "lucide-react";
import MobileNav from "@/components/mobile-nav";

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  const { data: userStats } = useQuery({
    queryKey: ['/api/users/stats'],
    enabled: !!user,
  });

  const { data: achievements } = useQuery({
    queryKey: ['/api/users/achievements'],
    enabled: !!user,
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-faith-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const getUserDisplayName = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.firstName) {
      return user.firstName;
    }
    if (user.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-1">Manage your account and view your activity</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-6">
              <Avatar className="w-20 h-20">
                <AvatarImage src={user.profileImageUrl} />
                <AvatarFallback className="text-2xl">
                  {getUserDisplayName().charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">{getUserDisplayName()}</h2>
                {user.email && (
                  <p className="text-gray-600 flex items-center space-x-2 mt-1">
                    <Mail className="w-4 h-4" />
                    <span>{user.email}</span>
                  </p>
                )}
                <p className="text-sm text-gray-500 flex items-center space-x-2 mt-2">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/api/logout'}
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Your Activity - Comprehensive Badge System */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>Your Activity</span>
              <div className="text-sm font-normal text-gray-500">Track your spiritual journey</div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            
            {/* Your Spiritual Journey */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center text-purple-700">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3l1.09 3.26L16 6.11l-3.26 1.09L12 10l-1.09-3.26L8 6.11l3.26-1.09L12 3zm2.54 5L13 10.54l3.26 1.09L17 15l1.09-3.26L21.5 11l-3.26-1.09L17 7l-1.09 3.26L14.5 11l1.09-3.26z"/>
                </svg>
                Your Spiritual Journey
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                  <div className="text-2xl mb-2">📖</div>
                  <div className="text-lg font-bold text-purple-700">
                    {userStats?.inspirationsRead || 0}
                  </div>
                  <div className="text-xs text-purple-600">Daily Inspirations</div>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                  <div className="text-2xl mb-2">🙏</div>
                  <div className="text-lg font-bold text-blue-700">
                    {userStats?.prayersOffered || 0}
                  </div>
                  <div className="text-xs text-blue-600">Prayers Offered</div>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                  <div className="text-2xl mb-2">🔥</div>
                  <div className="text-lg font-bold text-green-700">0</div>
                  <div className="text-xs text-green-600">Devotional Streak</div>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
                  <div className="text-2xl mb-2">✝️</div>
                  <div className="text-lg font-bold text-yellow-700">0</div>
                  <div className="text-xs text-yellow-600">Scripture Shared</div>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg border border-pink-200">
                  <div className="text-2xl mb-2">✍️</div>
                  <div className="text-lg font-bold text-pink-700">0</div>
                  <div className="text-xs text-pink-600">Reflections</div>
                </div>
              </div>
            </div>

            {/* Community Engagement */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center text-blue-700">
                <Users className="w-5 h-5 mr-2" />
                Community Engagement
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                  <div className="text-2xl mb-2">💬</div>
                  <div className="text-lg font-bold text-blue-700">
                    {userStats?.discussionCount || 0}
                  </div>
                  <div className="text-xs text-blue-600">Discussion Posts</div>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                  <div className="text-2xl mb-2">📅</div>
                  <div className="text-lg font-bold text-green-700">
                    {userStats?.attendanceCount || 0}
                  </div>
                  <div className="text-xs text-green-600">Events Attended</div>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                  <div className="text-2xl mb-2">🤝</div>
                  <div className="text-lg font-bold text-purple-700">
                    {userStats?.connectionCount || 0}
                  </div>
                  <div className="text-xs text-purple-600">Connections</div>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                  <div className="text-2xl mb-2">👋</div>
                  <div className="text-lg font-bold text-orange-700">0</div>
                  <div className="text-xs text-orange-600">Welcome Ambassador</div>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200">
                  <div className="text-2xl mb-2">🎯</div>
                  <div className="text-lg font-bold text-red-700">0</div>
                  <div className="text-xs text-red-600">Event Organizer</div>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg border border-teal-200">
                  <div className="text-2xl mb-2">🌟</div>
                  <div className="text-lg font-bold text-teal-700">0</div>
                  <div className="text-xs text-teal-600">Mentor</div>
                </div>
              </div>
            </div>

            {/* Achievement Progress */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center text-green-700">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97 0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1 0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66Z"/>
                </svg>
                Achievement Progress
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <div className="text-center p-3 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
                  <div className="text-2xl mb-2">🏆</div>
                  <div className="text-lg font-bold text-yellow-700">1</div>
                  <div className="text-xs text-yellow-600">Level</div>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                  <div className="text-2xl mb-2">⭐</div>
                  <div className="text-lg font-bold text-blue-700">0</div>
                  <div className="text-xs text-blue-600">Total Points</div>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                  <div className="text-2xl mb-2">📈</div>
                  <div className="text-lg font-bold text-green-700">0</div>
                  <div className="text-xs text-green-600">Consistency</div>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                  <div className="text-2xl mb-2">🎓</div>
                  <div className="text-lg font-bold text-purple-700">0</div>
                  <div className="text-xs text-purple-600">Learning Journey</div>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200">
                  <div className="text-2xl mb-2">💝</div>
                  <div className="text-lg font-bold text-red-700">0</div>
                  <div className="text-xs text-red-600">Generosity Heart</div>
                </div>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Achievements */}
        {achievements && achievements.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                    <div className="text-2xl">🏆</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{achievement.achievementType}</h4>
                      <p className="text-sm text-gray-600">
                        Earned {new Date(achievement.earnedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Your account is managed through Replit authentication. To update your profile information, 
              please visit your Replit account settings.
            </p>
            <div className="pt-4 border-t">
              <Button 
                variant="destructive" 
                onClick={() => window.location.href = '/api/logout'}
                className="w-full flex items-center justify-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out of SoapBox</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <MobileNav />
    </div>
  );
}