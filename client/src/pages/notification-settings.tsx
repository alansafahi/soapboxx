import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { PushNotificationSettings } from '@/components/PushNotificationSettings';
import { Bell, Mail, MessageSquare, Clock, Settings, Smartphone, Volume2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NotificationPreferences {
  dailyReading: boolean;
  prayerReminders: boolean;
  communityUpdates: boolean;
  eventReminders: boolean;
  weeklyCheckins: boolean;
  engagementReminders: boolean;
  smsNotifications: boolean;
  emailNotifications: boolean;
  webPushEnabled: boolean;
  friendActivity: boolean;
  dailyReadingTime: string;
  prayerTimes: string[];
  quietHours: {
    start: string;
    end: string;
  };
}

export function NotificationSettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: preferences, isLoading } = useQuery({
    queryKey: ['/api/notification-preferences'],
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (updates: Partial<NotificationPreferences>) => {
      const response = await fetch('/api/notification-preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update preferences');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notification-preferences'] });
      toast({
        title: "Preferences Updated",
        description: "Your notification settings have been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update notification preferences.",
        variant: "destructive",
      });
    },
  });

  const handleToggle = (key: keyof NotificationPreferences, value: boolean) => {
    updatePreferencesMutation.mutate({ [key]: value });
  };

  const handleTimeChange = (key: keyof NotificationPreferences, value: string) => {
    updatePreferencesMutation.mutate({ [key]: value });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const prefs = preferences || {};

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Notification Settings</h1>
          <p className="text-gray-600">
            Customize how and when you receive notifications to stay connected with your spiritual journey
          </p>
        </div>

        {/* Push Notifications */}
        <PushNotificationSettings />

        {/* Email Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Mail className="w-5 h-5" />
              <CardTitle>Email Notifications</CardTitle>
            </div>
            <CardDescription>
              Receive notifications via email for important updates and reminders
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-sm font-medium">Email Notifications</div>
                <div className="text-sm text-gray-600">
                  Receive email summaries and important updates
                </div>
              </div>
              <Switch
                checked={prefs.emailNotifications}
                onCheckedChange={(value) => handleToggle('emailNotifications', value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* SMS Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5" />
              <CardTitle>SMS Notifications</CardTitle>
            </div>
            <CardDescription>
              Get text message alerts for urgent reminders and celebrations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-sm font-medium">SMS Notifications</div>
                <div className="text-sm text-gray-600">
                  Receive text messages for weekly check-ins and milestones
                </div>
              </div>
              <Switch
                checked={prefs.smsNotifications}
                onCheckedChange={(value) => handleToggle('smsNotifications', value)}
              />
            </div>
            
            {prefs.smsNotifications && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm text-blue-800">
                  📱 SMS enabled for high-priority notifications like weekly spiritual check-ins and milestone celebrations
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notification Types */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <CardTitle>Notification Types</CardTitle>
            </div>
            <CardDescription>
              Choose which types of notifications you want to receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                key: 'dailyReading' as keyof NotificationPreferences,
                title: 'Daily Bible Reading',
                description: 'Morning reminders to start your day with Scripture',
                icon: '📖'
              },
              {
                key: 'prayerReminders' as keyof NotificationPreferences,
                title: 'Prayer Reminders',
                description: 'Gentle reminders for prayer time and active prayer requests',
                icon: '🙏'
              },
              {
                key: 'weeklyCheckins' as keyof NotificationPreferences,
                title: 'Weekly Check-ins',
                description: 'Sunday evening spiritual reflection and growth tracking',
                icon: '📝'
              },
              {
                key: 'communityUpdates' as keyof NotificationPreferences,
                title: 'Community Updates',
                description: 'New discussions, prayer requests, and community activity',
                icon: '💬'
              },
              {
                key: 'eventReminders' as keyof NotificationPreferences,
                title: 'Event Reminders',
                description: 'Church events, services, and special occasions',
                icon: '📅'
              },
              {
                key: 'engagementReminders' as keyof NotificationPreferences,
                title: 'Engagement Reminders',
                description: 'Gentle nudges when you\'ve been away for a few days',
                icon: '💝'
              },
              {
                key: 'friendActivity' as keyof NotificationPreferences,
                title: 'Friend Activity',
                description: 'Updates when friends achieve milestones or share prayers',
                icon: '👥'
              }
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{item.icon}</span>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">{item.title}</div>
                    <div className="text-sm text-gray-600">{item.description}</div>
                  </div>
                </div>
                <Switch
                  checked={prefs[item.key]}
                  onCheckedChange={(value) => handleToggle(item.key, value)}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Timing Preferences */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <CardTitle>Timing Preferences</CardTitle>
            </div>
            <CardDescription>
              Set your preferred times for different types of notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dailyReadingTime">Daily Reading Reminder</Label>
                <Input
                  id="dailyReadingTime"
                  type="time"
                  value={prefs.dailyReadingTime || '08:00'}
                  onChange={(e) => handleTimeChange('dailyReadingTime', e.target.value)}
                />
              </div>
            </div>

            <Separator />

            {/* Quiet Hours */}
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium">Quiet Hours</h4>
                <p className="text-sm text-gray-600">No notifications during this time period</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quietStart">Start Time</Label>
                  <Input
                    id="quietStart"
                    type="time"
                    value={prefs.quietHours?.start || '22:00'}
                    onChange={(e) => {
                      const quietHours = { ...prefs.quietHours, start: e.target.value };
                      updatePreferencesMutation.mutate({ quietHours });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quietEnd">End Time</Label>
                  <Input
                    id="quietEnd"
                    type="time"
                    value={prefs.quietHours?.end || '07:00'}
                    onChange={(e) => {
                      const quietHours = { ...prefs.quietHours, end: e.target.value };
                      updatePreferencesMutation.mutate({ quietHours });
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Your Notification Summary</CardTitle>
            <CardDescription>
              Here's what you'll receive based on your current settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {prefs.webPushEnabled && (
                <div className="flex items-center space-x-2 text-sm">
                  <Smartphone className="w-4 h-4 text-blue-500" />
                  <span>Real-time push notifications enabled</span>
                </div>
              )}
              {prefs.emailNotifications && (
                <div className="flex items-center space-x-2 text-sm">
                  <Mail className="w-4 h-4 text-green-500" />
                  <span>Email summaries and updates enabled</span>
                </div>
              )}
              {prefs.smsNotifications && (
                <div className="flex items-center space-x-2 text-sm">
                  <MessageSquare className="w-4 h-4 text-purple-500" />
                  <span>SMS alerts for important events enabled</span>
                </div>
              )}
              {prefs.weeklyCheckins && (
                <div className="flex items-center space-x-2 text-sm">
                  <Bell className="w-4 h-4 text-orange-500" />
                  <span>Weekly spiritual check-ins on Sunday evenings</span>
                </div>
              )}
              {prefs.dailyReading && (
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  <span>Daily Bible reading reminders at {prefs.dailyReadingTime || '8:00 AM'}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default NotificationSettingsPage;