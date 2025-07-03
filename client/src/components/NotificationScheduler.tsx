import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import { useToast } from "../hooks/use-toast";
import { Bell, Clock, Calendar, Settings } from "lucide-react";

interface NotificationSchedule {
  id: number;
  userId: string;
  notificationType: string;
  scheduledTime: string;
  isActive: boolean;
  title: string;
  message: string;
  frequency: string;
  daysOfWeek?: string[];
  timeZone: string;
}

export function NotificationScheduler() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTime, setSelectedTime] = useState("07:00");
  const [selectedDays, setSelectedDays] = useState<string[]>(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']);
  const [isEnabled, setIsEnabled] = useState(true);
  const [notificationTitle, setNotificationTitle] = useState("Daily Bible Reading");
  const [notificationMessage, setNotificationMessage] = useState("Start your day with God's Word. Your daily verse is ready!");

  // Fetch existing notification schedules
  const { data: schedules = [] } = useQuery<NotificationSchedule[]>({
    queryKey: ["/api/notifications/scheduled"],
  });

  // Create notification schedule mutation
  const createScheduleMutation = useMutation({
    mutationFn: async (data: {
      notificationType: string;
      scheduledTime: string;
      title: string;
      message: string;
      frequency: string;
      daysOfWeek: string[];
      isActive: boolean;
    }) => {
      return await apiRequest("/api/notifications/scheduled", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/scheduled"] });
      toast({
        title: "Notification Scheduled",
        description: "Your daily Bible reading reminder has been set up successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to schedule notification. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update notification schedule mutation
  const updateScheduleMutation = useMutation({
    mutationFn: async (data: { id: number; updates: Partial<NotificationSchedule> }) => {
      return await apiRequest(`/api/notifications/scheduled/${data.id}`, "PUT", data.updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/scheduled"] });
      toast({
        title: "Notification Updated",
        description: "Your notification schedule has been updated successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update notification. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete notification schedule mutation
  const deleteScheduleMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/notifications/scheduled/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/scheduled"] });
      toast({
        title: "Notification Deleted",
        description: "Your notification schedule has been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete notification. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSaveSchedule = () => {
    createScheduleMutation.mutate({
      notificationType: "daily_bible",
      scheduledTime: selectedTime,
      title: notificationTitle,
      message: notificationMessage,
      frequency: "weekly",
      daysOfWeek: selectedDays,
      isActive: isEnabled,
    });
  };

  const toggleScheduleActive = (schedule: NotificationSchedule) => {
    updateScheduleMutation.mutate({
      id: schedule.id,
      updates: { isActive: !schedule.isActive }
    });
  };

  const deleteSchedule = (id: number) => {
    deleteScheduleMutation.mutate(id);
  };

  const dayLabels = {
    sunday: "Sun",
    monday: "Mon",
    tuesday: "Tue",
    wednesday: "Wed",
    thursday: "Thu",
    friday: "Fri",
    saturday: "Sat"
  };

  const toggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const existingBibleSchedule = schedules.find(s => s.notificationType === 'daily_bible');

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Daily Bible Reminders
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Time Selection */}
        <div className="space-y-2">
          <Label htmlFor="time">Reminder Time</Label>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <Input
              id="time"
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>

        {/* Days of Week Selection */}
        <div className="space-y-2">
          <Label>Days of Week</Label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(dayLabels).map(([day, label]) => (
              <Button
                key={day}
                variant={selectedDays.includes(day) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleDay(day)}
                className="text-xs"
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Notification Content */}
        <div className="space-y-2">
          <Label htmlFor="title">Notification Title</Label>
          <Input
            id="title"
            value={notificationTitle}
            onChange={(e) => setNotificationTitle(e.target.value)}
            placeholder="Daily Bible Reading"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Notification Message</Label>
          <Input
            id="message"
            value={notificationMessage}
            onChange={(e) => setNotificationMessage(e.target.value)}
            placeholder="Start your day with God's Word..."
          />
        </div>

        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between">
          <Label htmlFor="enabled">Enable Notifications</Label>
          <Switch
            id="enabled"
            checked={isEnabled}
            onCheckedChange={setIsEnabled}
          />
        </div>

        {/* Save Button */}
        <Button 
          onClick={handleSaveSchedule}
          disabled={createScheduleMutation.isPending}
          className="w-full"
        >
          {createScheduleMutation.isPending ? "Saving..." : "Save Schedule"}
        </Button>

        {/* Existing Schedules */}
        {existingBibleSchedule && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Current Schedule</h4>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">{existingBibleSchedule.scheduledTime}</p>
                <p className="text-xs text-gray-500">
                  {existingBibleSchedule.daysOfWeek?.map(day => dayLabels[day as keyof typeof dayLabels]).join(", ")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={existingBibleSchedule.isActive}
                  onCheckedChange={() => toggleScheduleActive(existingBibleSchedule)}
                />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteSchedule(existingBibleSchedule.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}