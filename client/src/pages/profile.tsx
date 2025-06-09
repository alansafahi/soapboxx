import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Settings, 
  Award, 
  Calendar, 
  MessageSquare, 
  Heart, 
  Church, 
  MapPin, 
  Phone, 
  Mail, 
  Edit,
  Trophy,
  Target,
  Activity,
  Bell,
  Shield,
  Globe
} from "lucide-react";

const profileFormSchema = z.object({
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  isProfilePublic: z.boolean().default(true),
  emailNotifications: z.boolean().default(true),
  prayerReminders: z.boolean().default(true),
  eventNotifications: z.boolean().default(true),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const { data: userStats } = useQuery({
    queryKey: ["/api/users/stats"],
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ["/api/users/achievements"],
  });

  const { data: userChurches = [] } = useQuery({
    queryKey: ["/api/users/churches"],
  });

  const { data: userEvents = [] } = useQuery({
    queryKey: ["/api/users/events"],
  });

  const { data: userActivities = [] } = useQuery({
    queryKey: ["/api/users/activities"],
  });

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      bio: "",
      phone: "",
      location: "",
      isProfilePublic: true,
      emailNotifications: true,
      prayerReminders: true,
      eventNotifications: true,
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      return await apiRequest("/api/users/profile", "PATCH", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleUpdateProfile = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const getAchievementIcon = (type: string) => {
    switch (type) {
      case "first_prayer":
        return <Heart className="h-6 w-6 text-red-500" />;
      case "prayer_warrior":
        return <Target className="h-6 w-6 text-purple-500" />;
      case "active_member":
        return <Activity className="h-6 w-6 text-blue-500" />;
      case "event_attendee":
        return <Calendar className="h-6 w-6 text-green-500" />;
      case "community_builder":
        return <MessageSquare className="h-6 w-6 text-orange-500" />;
      default:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
    }
  };

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U";
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Profile</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your account and spiritual journey</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <div className="lg:col-span-1">
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={user?.profileImageUrl || ""} />
                  <AvatarFallback className="text-lg">
                    {getInitials(user?.firstName, user?.lastName)}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-semibold mb-1">
                  {user?.firstName || user?.lastName 
                    ? `${user?.firstName || ""} ${user?.lastName || ""}`.trim()
                    : "Anonymous User"
                  }
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{user?.email}</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {isEditing ? "Cancel" : "Edit Profile"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">My Journey</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Prayer Count</span>
                <Badge variant="secondary">{userStats?.prayerCount || 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Events Attended</span>
                <Badge variant="secondary">{userStats?.attendanceCount || 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Community Posts</span>
                <Badge variant="secondary">{userStats?.discussionCount || 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Church Connections</span>
                <Badge variant="secondary">{userStats?.connectionCount || 0}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="churches">Churches</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your personal details and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(handleUpdateProfile)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={profileForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter first name" 
                                  disabled={!isEditing}
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={profileForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter last name" 
                                  disabled={!isEditing}
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={profileForm.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Tell us a bit about your faith journey..." 
                                className="resize-none" 
                                disabled={!isEditing}
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={profileForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="(555) 123-4567" 
                                  disabled={!isEditing}
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={profileForm.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Location</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="City, State" 
                                  disabled={!isEditing}
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      {isEditing && (
                        <Button 
                          type="submit" 
                          className="w-full"
                          disabled={updateProfileMutation.isPending}
                        >
                          {updateProfileMutation.isPending ? "Updating..." : "Update Profile"}
                        </Button>
                      )}
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="achievements" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Spiritual Achievements</CardTitle>
                  <CardDescription>
                    Your milestones and accomplishments in faith
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {achievements.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {achievements.map((achievement: any) => (
                        <div key={achievement.id} className="flex items-center p-4 border rounded-lg">
                          {getAchievementIcon(achievement.type)}
                          <div className="ml-4">
                            <h4 className="font-semibold">{achievement.title}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {achievement.description}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Earned {new Date(achievement.earnedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>No achievements yet. Keep engaging with the community!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="churches" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>My Churches</CardTitle>
                  <CardDescription>
                    Churches you're connected with
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {userChurches.length > 0 ? (
                    <div className="space-y-4">
                      {userChurches.map((church: any) => (
                        <div key={church.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center">
                            <Church className="h-8 w-8 text-blue-600 mr-4" />
                            <div>
                              <h4 className="font-semibold">{church.name}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {church.denomination}
                              </p>
                              <p className="text-xs text-gray-500 flex items-center mt-1">
                                <MapPin className="h-3 w-3 mr-1" />
                                {church.address}
                              </p>
                            </div>
                          </div>
                          <Badge variant="secondary">Member</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Church className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>No church connections yet. Discover churches near you!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Your recent engagement with the community
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {userActivities.length > 0 ? (
                    <div className="space-y-4">
                      {userActivities.map((activity: any) => (
                        <div key={activity.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                          <div className="flex-shrink-0">
                            {activity.type === "prayer" && <Heart className="h-5 w-5 text-red-500" />}
                            {activity.type === "discussion" && <MessageSquare className="h-5 w-5 text-blue-500" />}
                            {activity.type === "event" && <Calendar className="h-5 w-5 text-green-500" />}
                            {activity.type === "church_join" && <Church className="h-5 w-5 text-purple-500" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm">{activity.description}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(activity.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>No recent activity. Start engaging with the community!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Privacy & Notifications</CardTitle>
                  <CardDescription>
                    Control your privacy and notification preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Public Profile</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Allow others to see your profile information
                        </p>
                      </div>
                      <Switch />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Receive email updates about community activity
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Prayer Reminders</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Get reminded to pray for active requests
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Event Notifications</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Receive updates about church events
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}