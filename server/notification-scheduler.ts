import { storage } from "./storage";
import { aiPersonalizationService } from "./ai-personalization";

interface NotificationJob {
  id: string;
  userId: string;
  type: 'daily_reading' | 'prayer_reminder' | 'community_update' | 'event_reminder';
  scheduledTime: Date;
  content: {
    title: string;
    message: string;
    actionUrl?: string;
    data?: any;
  };
  isRecurring: boolean;
  recurringPattern?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    daysOfWeek?: number[]; // 0-6, Sunday = 0
    monthlyDay?: number;
  };
}

export class NotificationScheduler {
  private scheduledJobs: Map<string, NodeJS.Timeout> = new Map();

  async initializeUserNotifications(userId: string): Promise<void> {
    try {
      const preferences = await storage.getNotificationPreferences(userId);
      const userPrefs = await storage.getUserPreferences(userId);
      
      if (!preferences || !preferences.dailyReading) return;

      // Schedule daily reading notifications
      if (preferences.dailyReading) {
        await this.scheduleDailyReading(userId, preferences.dailyReadingTime);
      }

      // Schedule prayer reminders
      if (preferences.prayerReminders && preferences.prayerTimes) {
        for (const time of preferences.prayerTimes) {
          await this.schedulePrayerReminder(userId, time);
        }
      }

      // Schedule weekend notifications if different
      if (preferences.weekendPreferences?.differentSchedule) {
        await this.scheduleWeekendNotifications(userId, preferences.weekendPreferences);
      }

    } catch (error) {
      console.error('Error initializing notifications for user:', userId, error);
    }
  }

  async scheduleDailyReading(userId: string, time: string): Promise<void> {
    const jobId = `daily-reading-${userId}`;
    
    // Clear existing job if any
    this.cancelJob(jobId);

    const job: NotificationJob = {
      id: jobId,
      userId,
      type: 'daily_reading',
      scheduledTime: this.parseTimeToDate(time),
      content: {
        title: "Daily Bible Reading",
        message: "Start your day with God's Word. Your daily reading is ready!",
        actionUrl: "/daily-bible",
      },
      isRecurring: true,
      recurringPattern: {
        frequency: 'daily'
      }
    };

    await this.scheduleJob(job);
  }

  async schedulePrayerReminder(userId: string, time: string): Promise<void> {
    const jobId = `prayer-${userId}-${time}`;
    
    this.cancelJob(jobId);

    const job: NotificationJob = {
      id: jobId,
      userId,
      type: 'prayer_reminder',
      scheduledTime: this.parseTimeToDate(time),
      content: {
        title: "Prayer Time",
        message: "Take a moment to connect with God in prayer.",
        actionUrl: "/prayers",
      },
      isRecurring: true,
      recurringPattern: {
        frequency: 'daily'
      }
    };

    await this.scheduleJob(job);
  }

  async schedulePersonalizedNotification(userId: string): Promise<void> {
    try {
      // Get AI-powered personalized content
      const recommendations = await aiPersonalizationService.generatePersonalizedRecommendations(userId);
      
      if (recommendations.length === 0) return;

      const topRecommendation = recommendations[0];
      const jobId = `personalized-${userId}-${Date.now()}`;

      const job: NotificationJob = {
        id: jobId,
        userId,
        type: 'daily_reading',
        scheduledTime: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
        content: {
          title: `Personalized for You: ${topRecommendation.title}`,
          message: topRecommendation.reason,
          actionUrl: "/daily-bible",
          data: topRecommendation
        },
        isRecurring: false
      };

      await this.scheduleJob(job);
    } catch (error) {
      console.error('Error scheduling personalized notification:', error);
    }
  }

  async scheduleEventReminder(userId: string, eventId: number, reminderTime: Date): Promise<void> {
    try {
      const event = await storage.getEventById(eventId);
      if (!event) return;

      const jobId = `event-${eventId}-${userId}`;
      
      const job: NotificationJob = {
        id: jobId,
        userId,
        type: 'event_reminder',
        scheduledTime: reminderTime,
        content: {
          title: `Upcoming Event: ${event.title}`,
          message: `Don't forget about "${event.title}" starting soon!`,
          actionUrl: `/events/${eventId}`,
          data: { eventId, event }
        },
        isRecurring: false
      };

      await this.scheduleJob(job);
    } catch (error) {
      console.error('Error scheduling event reminder:', error);
    }
  }

  async scheduleCommunityUpdate(userId: string, updateType: string, content: any): Promise<void> {
    const preferences = await storage.getNotificationPreferences(userId);
    
    if (!preferences?.communityUpdates) return;

    const jobId = `community-${userId}-${Date.now()}`;
    
    const job: NotificationJob = {
      id: jobId,
      userId,
      type: 'community_update',
      scheduledTime: new Date(Date.now() + 1000), // Send immediately
      content: {
        title: "Community Update",
        message: this.formatCommunityMessage(updateType, content),
        actionUrl: "/community",
        data: content
      },
      isRecurring: false
    };

    await this.scheduleJob(job);
  }

  private async scheduleJob(job: NotificationJob): Promise<void> {
    const delay = job.scheduledTime.getTime() - Date.now();
    
    if (delay <= 0 && job.isRecurring) {
      // If time has passed today and it's recurring, schedule for tomorrow
      job.scheduledTime.setDate(job.scheduledTime.getDate() + 1);
    } else if (delay <= 0) {
      // Non-recurring job in the past, skip
      return;
    }

    const timeout = setTimeout(async () => {
      await this.executeJob(job);
      
      // Reschedule if recurring
      if (job.isRecurring) {
        this.rescheduleRecurringJob(job);
      }
    }, delay);

    this.scheduledJobs.set(job.id, timeout);
    
    // Store job in database for persistence
    await storage.saveScheduledNotification(job);
  }

  private async executeJob(job: NotificationJob): Promise<void> {
    try {
      // Check quiet hours
      const preferences = await storage.getNotificationPreferences(job.userId);
      if (preferences?.quietHours?.enabled) {
        if (this.isInQuietHours(new Date(), preferences.quietHours)) {
          // Reschedule after quiet hours
          await this.rescheduleAfterQuietHours(job, preferences.quietHours);
          return;
        }
      }

      // Send notification (implement with your preferred notification service)
      await this.sendNotification(job);
      
      // Log notification delivery
      await storage.logNotificationDelivery({
        userId: job.userId,
        type: job.type,
        title: job.content.title,
        message: job.content.message,
        deliveredAt: new Date(),
        status: 'delivered'
      });

    } catch (error) {
      console.error('Error executing notification job:', job.id, error);
      
      // Log failed delivery
      await storage.logNotificationDelivery({
        userId: job.userId,
        type: job.type,
        title: job.content.title,
        message: job.content.message,
        deliveredAt: new Date(),
        status: 'failed',
        errorMessage: error.message
      });
    }
  }

  private async sendNotification(job: NotificationJob): Promise<void> {
    // Implement with your preferred notification service (Push notifications, Email, SMS)

    
    // For web push notifications, you would integrate with a service like:
    // - Firebase Cloud Messaging (FCM)
    // - OneSignal
    // - Native Web Push API
    
    // For now, we'll store it as an in-app notification
    await storage.createInAppNotification({
      userId: job.userId,
      type: job.type,
      title: job.content.title,
      message: job.content.message,
      actionUrl: job.content.actionUrl,
      data: job.content.data,
      isRead: false,
    });
  }

  private rescheduleRecurringJob(job: NotificationJob): void {
    const nextScheduledTime = this.calculateNextScheduledTime(job);
    job.scheduledTime = nextScheduledTime;
    this.scheduleJob(job);
  }

  private calculateNextScheduledTime(job: NotificationJob): Date {
    const now = new Date();
    const nextTime = new Date(job.scheduledTime);

    switch (job.recurringPattern?.frequency) {
      case 'daily':
        nextTime.setDate(nextTime.getDate() + 1);
        break;
      case 'weekly':
        nextTime.setDate(nextTime.getDate() + 7);
        break;
      case 'monthly':
        nextTime.setMonth(nextTime.getMonth() + 1);
        break;
    }

    return nextTime;
  }

  private parseTimeToDate(timeString: string): Date {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    
    // If time has passed today, schedule for tomorrow
    if (date.getTime() <= Date.now()) {
      date.setDate(date.getDate() + 1);
    }
    
    return date;
  }

  private isInQuietHours(time: Date, quietHours: any): boolean {
    const currentHour = time.getHours();
    const currentMinute = time.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;

    const [startHour, startMinute] = quietHours.start.split(':').map(Number);
    const [endHour, endMinute] = quietHours.end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Quiet hours span midnight
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  private async rescheduleAfterQuietHours(job: NotificationJob, quietHours: any): Promise<void> {
    const [endHour, endMinute] = quietHours.end.split(':').map(Number);
    const nextTime = new Date();
    nextTime.setHours(endHour, endMinute, 0, 0);
    
    if (nextTime.getTime() <= Date.now()) {
      nextTime.setDate(nextTime.getDate() + 1);
    }
    
    job.scheduledTime = nextTime;
    await this.scheduleJob(job);
  }

  private formatCommunityMessage(updateType: string, content: any): string {
    switch (updateType) {
      case 'new_post':
        return `${content.author} shared a new post in ${content.group}`;
      case 'friend_activity':
        return `${content.friend} completed their daily reading`;
      case 'prayer_request':
        return `New prayer request from ${content.author}`;
      default:
        return 'You have a new community update';
    }
  }

  private async scheduleWeekendNotifications(userId: string, weekendPrefs: any): Promise<void> {
    // Implementation for different weekend schedules
    if (weekendPrefs.differentSchedule && weekendPrefs.weekendReadingTime) {
      const weekendJobId = `weekend-reading-${userId}`;
      
      const job: NotificationJob = {
        id: weekendJobId,
        userId,
        type: 'daily_reading',
        scheduledTime: this.parseTimeToDate(weekendPrefs.weekendReadingTime),
        content: {
          title: "Weekend Bible Reading",
          message: "Enjoy some peaceful time with God's Word this weekend.",
          actionUrl: "/daily-bible",
        },
        isRecurring: true,
        recurringPattern: {
          frequency: 'weekly',
          daysOfWeek: [0, 6] // Saturday and Sunday
        }
      };

      await this.scheduleJob(job);
    }
  }

  cancelJob(jobId: string): void {
    const timeout = this.scheduledJobs.get(jobId);
    if (timeout) {
      clearTimeout(timeout);
      this.scheduledJobs.delete(jobId);
    }
  }

  async cancelAllUserJobs(userId: string): Promise<void> {
    for (const [jobId, timeout] of this.scheduledJobs.entries()) {
      if (jobId.includes(userId)) {
        clearTimeout(timeout);
        this.scheduledJobs.delete(jobId);
      }
    }
    
    await storage.cancelUserNotifications(userId);
  }

  async updateUserNotifications(userId: string): Promise<void> {
    // Cancel existing notifications
    await this.cancelAllUserJobs(userId);
    
    // Reinitialize with new preferences
    await this.initializeUserNotifications(userId);
  }
}

export const notificationScheduler = new NotificationScheduler();