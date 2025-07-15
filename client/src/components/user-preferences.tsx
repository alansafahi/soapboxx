import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { useTheme } from "../contexts/ThemeContext";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import { Slider } from "./ui/slider";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Separator } from "./ui/separator";
import { useToast } from "../hooks/use-toast";
import { useLanguage } from "../contexts/LanguageContext";
import { 
  Settings, 
  Bell, 
  Download, 
  RefreshCw, 
  Brain, 
  Globe, 
  Users,
  Clock,
  Volume2,
  Eye,
  Moon,
  Sun
} from "lucide-react";

interface UserPreferences {
  language: string;
  timezone: string;
  theme: string;
  fontSize: string;
  readingSpeed: string;
  audioEnabled: boolean;
  audioSpeed: number;
  familyMode: boolean;
  offlineMode: boolean;
  syncEnabled: boolean;
  notificationsEnabled: boolean;
}

interface NotificationPreferences {
  dailyReading: boolean;
  prayerReminders: boolean;
  communityUpdates: boolean;
  eventReminders: boolean;
  friendActivity: boolean;
  dailyReadingTime: string;
  prayerTimes: string[];
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  weekendPreferences: {
    differentSchedule: boolean;
    weekendReadingTime: string;
  };
}

export default function UserPreferences() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const { setTheme, setFontSize } = useTheme();

  const [preferences, setPreferences] = useState<UserPreferences>({
    language: "en",
    timezone: "UTC",
    theme: "light",
    fontSize: "medium",
    readingSpeed: "normal",
    audioEnabled: true,
    audioSpeed: 1.0,
    familyMode: false,
    offlineMode: false,
    syncEnabled: true,
    notificationsEnabled: true,
  });

  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>({
    dailyReading: true,
    prayerReminders: true,
    communityUpdates: true,
    eventReminders: true,
    friendActivity: false,
    dailyReadingTime: "08:00",
    prayerTimes: ["06:00", "12:00", "18:00"],
    quietHours: {
      enabled: false,
      start: "22:00",
      end: "07:00",
    },
    weekendPreferences: {
      differentSchedule: false,
      weekendReadingTime: "09:00",
    },
  });

  // Fetch user preferences
  const { data: userPrefs, isLoading } = useQuery({
    queryKey: ["/api/user/preferences"],
    enabled: !!user?.id,
  });

  const { data: notificationSettings } = useQuery({
    queryKey: ["/api/user/notification-preferences"],
    enabled: !!user?.id,
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: (data: Partial<UserPreferences>) =>
      apiRequest("PATCH", "/api/user/preferences", data),
    onSuccess: () => {
      toast({
        title: "Preferences Updated",
        description: "Your settings have been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/preferences"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update notification preferences mutation
  const updateNotificationsMutation = useMutation({
    mutationFn: (data: Partial<NotificationPreferences>) =>
      apiRequest("PATCH", "/api/user/notification-preferences", data),
    onSuccess: () => {
      toast({
        title: "Notifications Updated",
        description: "Your notification settings have been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/notification-preferences"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update notification settings.",
        variant: "destructive",
      });
    },
  });

  // Sync offline content mutation
  const syncOfflineContentMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/user/sync-offline-content", {}),
    onSuccess: () => {
      toast({
        title: "Content Synced",
        description: "Your offline content has been updated.",
      });
    },
  });

  useEffect(() => {
    if (userPrefs) {
      setPreferences(userPrefs);
      // Apply saved theme and font size to context
      if (userPrefs.theme) {
        setTheme(userPrefs.theme);
      }
      if (userPrefs.fontSize) {
        setFontSize(userPrefs.fontSize);
      }
    }
  }, [userPrefs, setTheme, setFontSize]);

  useEffect(() => {
    if (notificationSettings) {
      setNotificationPrefs(notificationSettings);
    }
  }, [notificationSettings]);

  const handlePreferenceChange = (key: keyof UserPreferences, value: any) => {
    const newPrefs = { ...preferences, [key]: value };
    setPreferences(newPrefs);
    
    // Apply changes immediately to UI
    if (key === 'theme') {
      setTheme(value);
    } else if (key === 'fontSize') {
      setFontSize(value);
    }
    
    updatePreferencesMutation.mutate({ [key]: value });
  };

  const handleNotificationChange = (key: keyof NotificationPreferences, value: any) => {
    const newNotificationPrefs = { ...notificationPrefs, [key]: value };
    setNotificationPrefs(newNotificationPrefs);
    updateNotificationsMutation.mutate({ [key]: value });
  };

  const addPrayerTime = () => {
    const newTime = "12:00";
    const updatedTimes = [...notificationPrefs.prayerTimes, newTime];
    handleNotificationChange("prayerTimes", updatedTimes);
  };

  const removePrayerTime = (index: number) => {
    const updatedTimes = notificationPrefs.prayerTimes.filter((_, i) => i !== index);
    handleNotificationChange("prayerTimes", updatedTimes);
  };

  const updatePrayerTime = (index: number, time: string) => {
    const updatedTimes = [...notificationPrefs.prayerTimes];
    updatedTimes[index] = time;
    handleNotificationChange("prayerTimes", updatedTimes);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('settings.title')}</h1>
          <p className="text-gray-600 dark:text-gray-400">{t('settings.description')}</p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="general" className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">{t('general')}</span>
              <span className="sm:hidden">Gen</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">{t('notifications')}</span>
              <span className="sm:hidden">{t('notifications')}</span>
            </TabsTrigger>
            <TabsTrigger value="offline" className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
              <Download className="h-4 w-4" />
              <span>{t('offline')}</span>
            </TabsTrigger>
            <TabsTrigger value="sync" className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
              <RefreshCw className="h-4 w-4" />
              <span>{t('sync')}</span>
            </TabsTrigger>
            <TabsTrigger value="personalization" className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
              <Brain className="h-4 w-4" />
              <span>{t('ai')}</span>
            </TabsTrigger>
            <TabsTrigger value="language" className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">{t('language')}</span>
              <span className="sm:hidden">{t('language')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.generalPreferences')}</CardTitle>
                <CardDescription>
                  {t('settings.generalDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="theme">{t('theme.label')}</Label>
                    <Select
                      value={preferences.theme}
                      onValueChange={(value) => handlePreferenceChange("theme", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">
                          <div className="flex items-center space-x-2">
                            <Sun className="h-4 w-4" />
                            <span>{t('theme.light')}</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="dark">
                          <div className="flex items-center space-x-2">
                            <Moon className="h-4 w-4" />
                            <span>{t('theme.dark')}</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="auto">{t('theme.auto')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fontSize">{t('fontSize.label')}</Label>
                    <Select
                      value={preferences.fontSize}
                      onValueChange={(value) => handlePreferenceChange("fontSize", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">{t('fontSize.small')}</SelectItem>
                        <SelectItem value="medium">{t('fontSize.medium')}</SelectItem>
                        <SelectItem value="large">{t('fontSize.large')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="readingSpeed">{t('readingSpeed.label')}</Label>
                    <Select
                      value={preferences.readingSpeed}
                      onValueChange={(value) => handlePreferenceChange("readingSpeed", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="slow">{t('readingSpeed.slow')}</SelectItem>
                        <SelectItem value="normal">{t('readingSpeed.medium')}</SelectItem>
                        <SelectItem value="fast">{t('readingSpeed.fast')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">{t('timezone.label')}</Label>
                    <Select
                      value={preferences.timezone}
                      onValueChange={(value) => handlePreferenceChange("timezone", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">{t('timezone.utc')}</SelectItem>
                        <SelectItem value="America/New_York">{t('timezone.eastern')}</SelectItem>
                        <SelectItem value="America/Chicago">{t('timezone.central')}</SelectItem>
                        <SelectItem value="America/Denver">{t('timezone.mountain')}</SelectItem>
                        <SelectItem value="America/Los_Angeles">{t('timezone.pacific')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{t('audioEnabled.label')}</Label>
                      <p className="text-sm text-gray-500">{t('audioEnabled.description')}</p>
                    </div>
                    <Switch
                      checked={preferences.audioEnabled}
                      onCheckedChange={(checked) => handlePreferenceChange("audioEnabled", checked)}
                    />
                  </div>

                  {preferences.audioEnabled && (
                    <div className="space-y-2">
                      <Label>{t('audioSpeed.label')}: {preferences.audioSpeed}x</Label>
                      <Slider
                        value={[preferences.audioSpeed]}
                        onValueChange={([value]) => handlePreferenceChange("audioSpeed", value)}
                        min={0.5}
                        max={2.0}
                        step={0.1}
                        className="w-full"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{t('familyMode.label')}</Label>
                      <p className="text-sm text-gray-500">{t('familyMode.description')}</p>
                    </div>
                    <Switch
                      checked={preferences.familyMode}
                      onCheckedChange={(checked) => handlePreferenceChange("familyMode", checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Customize when and how you receive spiritual reminders
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Daily Reading Reminders</Label>
                      <p className="text-sm text-gray-500">Get reminded for your daily Bible reading</p>
                    </div>
                    <Switch
                      checked={notificationPrefs.dailyReading}
                      onCheckedChange={(checked) => handleNotificationChange("dailyReading", checked)}
                    />
                  </div>

                  {notificationPrefs.dailyReading && (
                    <div className="ml-4 space-y-2">
                      <Label>Daily Reading Time</Label>
                      <Input
                        type="time"
                        value={notificationPrefs.dailyReadingTime}
                        onChange={(e) => handleNotificationChange("dailyReadingTime", e.target.value)}
                        className="w-full sm:w-32"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Prayer Reminders</Label>
                      <p className="text-sm text-gray-500">Scheduled prayer time notifications</p>
                    </div>
                    <Switch
                      checked={notificationPrefs.prayerReminders}
                      onCheckedChange={(checked) => handleNotificationChange("prayerReminders", checked)}
                    />
                  </div>

                  {notificationPrefs.prayerReminders && (
                    <div className="ml-4 space-y-3">
                      <Label>Prayer Times</Label>
                      {notificationPrefs.prayerTimes.map((time, index) => (
                        <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                          <Input
                            type="time"
                            value={time}
                            onChange={(e) => updatePrayerTime(index, e.target.value)}
                            className="w-full sm:w-32"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removePrayerTime(index)}
                            className="w-full sm:w-auto"
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={addPrayerTime}
                        className="w-full sm:w-auto"
                      >
                        Add Prayer Time
                      </Button>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Community Updates</Label>
                      <p className="text-sm text-gray-500">New posts and discussions in your groups</p>
                    </div>
                    <Switch
                      checked={notificationPrefs.communityUpdates}
                      onCheckedChange={(checked) => handleNotificationChange("communityUpdates", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Event Reminders</Label>
                      <p className="text-sm text-gray-500">Church events and activities</p>
                    </div>
                    <Switch
                      checked={notificationPrefs.eventReminders}
                      onCheckedChange={(checked) => handleNotificationChange("eventReminders", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Friend Activity</Label>
                      <p className="text-sm text-gray-500">When friends complete readings or join events</p>
                    </div>
                    <Switch
                      checked={notificationPrefs.friendActivity}
                      onCheckedChange={(checked) => handleNotificationChange("friendActivity", checked)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Quiet Hours</Label>
                      <p className="text-sm text-gray-500">No notifications during these hours</p>
                    </div>
                    <Switch
                      checked={notificationPrefs.quietHours.enabled}
                      onCheckedChange={(checked) =>
                        handleNotificationChange("quietHours", {
                          ...notificationPrefs.quietHours,
                          enabled: checked,
                        })
                      }
                    />
                  </div>

                  {notificationPrefs.quietHours.enabled && (
                    <div className="ml-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Start Time</Label>
                        <Input
                          type="time"
                          value={notificationPrefs.quietHours.start}
                          onChange={(e) =>
                            handleNotificationChange("quietHours", {
                              ...notificationPrefs.quietHours,
                              start: e.target.value,
                            })
                          }
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>End Time</Label>
                        <Input
                          type="time"
                          value={notificationPrefs.quietHours.end}
                          onChange={(e) =>
                            handleNotificationChange("quietHours", {
                              ...notificationPrefs.quietHours,
                              end: e.target.value,
                            })
                          }
                          className="w-full"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="offline">
            <Card>
              <CardHeader>
                <CardTitle>Offline Reading</CardTitle>
                <CardDescription>
                  Download content for reading without internet connection
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('offline.enableLabel')}</Label>
                    <p className="text-sm text-gray-500">{t('offline.downloadDescription')}</p>
                  </div>
                  <Switch
                    checked={preferences.offlineMode}
                    onCheckedChange={(checked) => handlePreferenceChange("offlineMode", checked)}
                  />
                </div>

                {preferences.offlineMode && (
                  <div className="space-y-4">
                    <Button
                      onClick={() => syncOfflineContentMutation.mutate()}
                      disabled={syncOfflineContentMutation.isPending}
                      className="w-full"
                    >
                      {syncOfflineContentMutation.isPending ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Syncing...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Download className="h-4 w-4" />
                          <span>Sync Offline Content</span>
                        </div>
                      )}
                    </Button>
                    
                    <div className="text-sm text-gray-500">
                      <p>Offline content includes:</p>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Daily Bible readings for the next 30 days</li>
                        <li>Your favorite devotionals</li>
                        <li>Saved verses and notes</li>
                        <li>Audio files (if enabled)</li>
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sync">
            <Card>
              <CardHeader>
                <CardTitle>{t('sync.title')}</CardTitle>
                <CardDescription>
                  {t('sync.subtitle')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('sync.enableLabel')}</Label>
                    <p className="text-sm text-gray-500">{t('sync.enableDescription')}</p>
                  </div>
                  <Switch
                    checked={preferences.syncEnabled}
                    onCheckedChange={(checked) => handlePreferenceChange("syncEnabled", checked)}
                  />
                </div>

                {preferences.syncEnabled && (
                  <div className="space-y-4">
                    <div className="text-sm text-gray-500">
                      <p>{t('sync.description')}</p>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>{t('sync.readingProgress')}</li>
                        <li>{t('sync.personalNotes')}</li>
                        <li>{t('sync.prayerRequests')}</li>
                        <li>{t('sync.settingsPreferences')}</li>
                        <li>{t('sync.offlineContent')}</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-2 text-blue-800">
                        <RefreshCw className="h-4 w-4" />
                        <span className="font-medium">{t('sync.lastSynced')}</span>
                      </div>
                      <p className="text-sm text-blue-600 mt-1">{t('sync.upToDate')}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="personalization">
            <Card>
              <CardHeader>
                <CardTitle>{t('ai.title')}</CardTitle>
<parameter name="old_str">                <CardDescription>
                  {t('ai.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2 text-purple-800 mb-2">
                    <Brain className="h-5 w-5" />
                    <span className="font-medium">{t('ai.poweredRecommendations')}</span>
                  </div>
                  <p className="text-sm text-purple-600">
                    {t('ai.analysisDescription')}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="text-sm text-gray-500">
                    <p>{t('ai.personalizationIncludes')}</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>{t('ai.personalizedVerses')}</li>
                      <li>{t('ai.suggestedPlans')}</li>
                      <li>{t('ai.adaptiveProgression')}</li>
                      <li>{t('ai.topicRecommendations')}</li>
                      <li>{t('ai.optimalTiming')}</li>
                    </ul>
                  </div>
                  
                  <Button className="w-full" variant="outline">
                    <Brain className="h-4 w-4 mr-2" />
                    {t('ai.generateRecommendations')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="language">
            <Card>
              <CardHeader>
                <CardTitle>{t('language.title')}</CardTitle>
                <CardDescription>
                  {t('language.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="language">{t('language.label')}</Label>
                  <Select
                    value={preferences.language}
                    onValueChange={(value) => handlePreferenceChange("language", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="pt">Português</SelectItem>
                      <SelectItem value="zh">中文</SelectItem>
                      <SelectItem value="ko">한국어</SelectItem>
                      <SelectItem value="ja">日本語</SelectItem>
                      <SelectItem value="ar">العربية</SelectItem>
                      <SelectItem value="fa">فارسی</SelectItem>
                      <SelectItem value="hi">हिन्दी</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2 text-green-800 mb-2">
                    <Globe className="h-5 w-5" />
                    <span className="font-medium">{t('multilingual.title')}</span>
                  </div>
                  <p className="text-sm text-green-600">
                    {t('multilingual.description')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}