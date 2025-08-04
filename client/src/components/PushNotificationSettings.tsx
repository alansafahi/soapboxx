import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, Smartphone, Check, X, AlertCircle } from 'lucide-react';
import { pushNotificationManager } from '@/lib/push-notifications';
import { useToast } from '@/hooks/use-toast';

export function PushNotificationSettings() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const { toast } = useToast();

  useEffect(() => {
    checkNotificationStatus();
  }, []);

  const checkNotificationStatus = async () => {
    try {
      setIsLoading(true);
      
      if ('Notification' in window) {
        setPermission(Notification.permission);
      }
      
      await pushNotificationManager.initialize();
      const subscribed = await pushNotificationManager.isSubscribed();
      setIsSubscribed(subscribed);
    } catch (error) {
      console.error('Error checking notification status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnableNotifications = async () => {
    try {
      setIsLoading(true);
      
      const success = await pushNotificationManager.subscribe();
      
      if (success) {
        setIsSubscribed(true);
        setPermission('granted');
        toast({
          title: "Push Notifications Enabled",
          description: "You'll now receive notifications for important updates and reminders.",
        });
      } else {
        toast({
          title: "Unable to Enable Notifications",
          description: "Please check your browser settings and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to enable push notifications. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableNotifications = async () => {
    try {
      setIsLoading(true);
      
      const success = await pushNotificationManager.unsubscribe();
      
      if (success) {
        setIsSubscribed(false);
        toast({
          title: "Push Notifications Disabled",
          description: "You will no longer receive push notifications.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to disable push notifications.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disable push notifications. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestNotification = async () => {
    try {
      const response = await fetch('/api/push/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Test Notification Sent",
          description: "Check your notifications to see if it arrived!",
        });
      } else {
        toast({
          title: "Unable to Send Test",
          description: result.message || "Please make sure notifications are enabled.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send test notification.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = () => {
    if (permission === 'denied') {
      return <Badge variant="destructive"><X className="w-3 h-3 mr-1" />Blocked</Badge>;
    }
    if (permission === 'granted' && isSubscribed) {
      return <Badge variant="default" className="bg-green-500"><Check className="w-3 h-3 mr-1" />Active</Badge>;
    }
    if (permission === 'granted' && !isSubscribed) {
      return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" />Available</Badge>;
    }
    return <Badge variant="outline"><Bell className="w-3 h-3 mr-1" />Not Set</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5" />
            <CardTitle>Push Notifications</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5" />
            <CardTitle>Push Notifications</CardTitle>
          </div>
          {getStatusBadge()}
        </div>
        <CardDescription>
          Get instant notifications for spiritual milestones, weekly check-ins, and community updates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Browser Support Check */}
        {!('Notification' in window) && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2 text-yellow-800">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">Push notifications are not supported in this browser.</span>
            </div>
          </div>
        )}

        {/* Permission Denied */}
        {permission === 'denied' && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2 text-red-800 mb-2">
              <X className="w-4 h-4" />
              <span className="text-sm font-medium">Notifications Blocked</span>
            </div>
            <p className="text-sm text-red-700">
              Notifications have been blocked for this site. To enable them, click the lock icon in your browser's address bar and allow notifications.
            </p>
          </div>
        )}

        {/* Main Controls */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-sm font-medium">
              {isSubscribed ? 'Push Notifications Enabled' : 'Enable Push Notifications'}
            </div>
            <div className="text-sm text-gray-600">
              {isSubscribed 
                ? 'You\'ll receive notifications for important updates'
                : 'Stay connected with your spiritual journey'
              }
            </div>
          </div>
          <Switch
            checked={isSubscribed}
            onCheckedChange={isSubscribed ? handleDisableNotifications : handleEnableNotifications}
            disabled={isLoading || permission === 'denied' || !('Notification' in window)}
          />
        </div>

        {/* Test Notification */}
        {isSubscribed && (
          <div className="pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={sendTestNotification}
              className="w-full"
            >
              <Bell className="w-4 h-4 mr-2" />
              Send Test Notification
            </Button>
          </div>
        )}

        {/* Notification Types */}
        {isSubscribed && (
          <div className="pt-4 border-t space-y-3">
            <h4 className="text-sm font-medium">You'll receive notifications for:</h4>
            <div className="grid grid-cols-1 gap-2 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Check className="w-3 h-3 text-green-500" />
                <span>Weekly spiritual check-ins</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-3 h-3 text-green-500" />
                <span>Milestone achievements and celebrations</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-3 h-3 text-green-500" />
                <span>Daily Bible reading reminders</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-3 h-3 text-green-500" />
                <span>Prayer reminders and community updates</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-3 h-3 text-green-500" />
                <span>Church events and important announcements</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default PushNotificationSettings;