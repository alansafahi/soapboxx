import { weeklyCheckinService } from './weekly-checkin-service';
import { notificationScheduler } from './notification-scheduler';

// Cron-like scheduler for periodic notification tasks
export class NotificationCron {
  private intervals: Map<string, NodeJS.Timeout> = new Map();

  start() {
    // Schedule weekly check-in reminders for Sunday 7:00 PM
    this.scheduleWeeklyTask('weekly-checkin-reminders', this.sendWeeklyCheckinReminders.bind(this), {
      dayOfWeek: 0, // Sunday
      hour: 19, // 7 PM
      minute: 0
    });

    // Schedule re-engagement reminders every Wednesday at 10:00 AM
    this.scheduleWeeklyTask('re-engagement-reminders', this.sendReEngagementReminders.bind(this), {
      dayOfWeek: 3, // Wednesday
      hour: 10,
      minute: 0
    });

    // Schedule daily Bible reading reminders based on user preferences
    this.scheduleDailyTask('daily-reading-reminders', this.sendDailyReadingReminders.bind(this), {
      hour: 8, // 8 AM default, individual users can override
      minute: 0
    });


  }

  stop() {
    this.intervals.forEach((interval, key) => {
      clearInterval(interval);

    });
    this.intervals.clear();
  }

  private scheduleWeeklyTask(taskName: string, task: () => Promise<void>, schedule: {
    dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
    hour: number;
    minute: number;
  }) {
    const intervalMs = this.calculateNextExecution(schedule.dayOfWeek, schedule.hour, schedule.minute);
    
    const executeTask = async () => {
      try {

        await task();
        // Task completed successfully
      } catch (error) {
        // Task execution error handled
      }
    };

    // Execute immediately if it's the right time, then schedule weekly
    const now = new Date();
    if (this.isScheduleTime(now, schedule.dayOfWeek, schedule.hour, schedule.minute)) {
      executeTask();
    }

    // Schedule to run weekly
    const interval = setInterval(executeTask, 7 * 24 * 60 * 60 * 1000); // Weekly
    this.intervals.set(taskName, interval);
    

  }

  private scheduleDailyTask(taskName: string, task: () => Promise<void>, schedule: {
    hour: number;
    minute: number;
  }) {
    const executeTask = async () => {
      try {
        await task();
        // Task completed successfully
      } catch (error) {
        // Daily task execution error handled
      }
    };

    // Calculate next execution time
    const now = new Date();
    const nextExecution = new Date();
    nextExecution.setHours(schedule.hour, schedule.minute, 0, 0);
    
    if (nextExecution <= now) {
      nextExecution.setDate(nextExecution.getDate() + 1);
    }

    const timeUntilNext = nextExecution.getTime() - now.getTime();

    // Execute at the scheduled time, then every 24 hours
    setTimeout(() => {
      executeTask();
      const interval = setInterval(executeTask, 24 * 60 * 60 * 1000); // Daily
      this.intervals.set(taskName, interval);
    }, timeUntilNext);


  }

  private calculateNextExecution(dayOfWeek: number, hour: number, minute: number): number {
    const now = new Date();
    const nextExecution = new Date();
    
    // Set to target day of week
    const daysUntilTarget = (dayOfWeek - now.getDay() + 7) % 7;
    nextExecution.setDate(now.getDate() + daysUntilTarget);
    nextExecution.setHours(hour, minute, 0, 0);
    
    // If the time has passed today and it's the target day, schedule for next week
    if (daysUntilTarget === 0 && nextExecution <= now) {
      nextExecution.setDate(nextExecution.getDate() + 7);
    }
    
    return nextExecution.getTime() - now.getTime();
  }

  private isScheduleTime(date: Date, dayOfWeek: number, hour: number, minute: number): boolean {
    return date.getDay() === dayOfWeek && 
           date.getHours() === hour && 
           date.getMinutes() >= minute && 
           date.getMinutes() < minute + 1;
  }

  private getDayName(dayOfWeek: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  }

  private async sendWeeklyCheckinReminders(): Promise<void> {
    try {
      await weeklyCheckinService.sendWeeklyReminders();
    } catch (error) {

    }
  }

  private async sendReEngagementReminders(): Promise<void> {
    try {
      await weeklyCheckinService.sendFollowUpReminders();
    } catch (error) {

    }
  }

  private async sendDailyReadingReminders(): Promise<void> {
    try {
      // This would integrate with daily Bible reading reminder system
      // Daily reading reminders sent
    } catch (error) {
      // Daily reading reminder error handled
    }
  }
}

export const notificationCron = new NotificationCron();