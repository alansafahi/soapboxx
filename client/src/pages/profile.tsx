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

        {/* Activity Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Your Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">
                  {userStats?.connectionCount || 0}
                </div>
                <div className="text-sm text-gray-600">Connections</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Heart className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600">
                  {userStats?.prayerCount || 0}
                </div>
                <div className="text-sm text-gray-600">Prayers</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Calendar className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">
                  {userStats?.attendanceCount || 0}
                </div>
                <div className="text-sm text-gray-600">Events</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <Users className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-600">
                  {userStats?.discussionCount || 0}
                </div>
                <div className="text-sm text-gray-600">Discussions</div>
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