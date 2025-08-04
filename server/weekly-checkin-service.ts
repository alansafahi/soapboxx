import { storage } from './storage';
import { notificationScheduler } from './notification-scheduler';

interface WeeklyCheckinData {
  userId: string;
  week: string; // ISO week format: 2024-W01
  spiritualGrowth: number; // 1-5 scale
  prayerLife: number; // 1-5 scale
  bibleReading: number; // 1-5 scale
  communityConnection: number; // 1-5 scale
  serviceOpportunities: number; // 1-5 scale
  emotionalWellbeing: number; // 1-5 scale
  gratitude: string[];
  struggles: string[];
  prayerRequests: string[];
  goals: string[];
  reflectionNotes: string;
  completedAt: Date;
}

interface WeeklyStats {
  totalCheckins: number;
  averageSpiritalGrowth: number;
  streakCount: number;
  longestStreak: number;
  missedWeeks: number;
  improvementAreas: string[];
  strongAreas: string[];
}

export class WeeklyCheckinService {
  
  /**
   * Submit a weekly check-in
   */
  async submitWeeklyCheckin(data: WeeklyCheckinData): Promise<void> {
    try {
      // Store the check-in
      await storage.saveWeeklyCheckin(data);
      
      // Update user stats
      await this.updateUserCheckinStats(data.userId);
      
      // Award points for completing check-in
      await storage.addPointTransaction({
        userId: data.userId,
        points: 100,
        activityType: 'weekly_checkin',
        description: 'Weekly spiritual check-in completed',
        entityId: null
      });
      
      // Track activity for milestone system
      await storage.trackUserActivity({
        userId: data.userId,
        activityType: 'weekly_checkin',
        points: 100
      });
      
      // Send completion confirmation
      await this.sendCheckinConfirmation(data.userId, data);
      
    } catch (error) {
      throw new Error('Failed to submit weekly check-in');
    }
  }

  /**
   * Get user's weekly check-in history
   */
  async getUserCheckinHistory(userId: string, limit: number = 12): Promise<WeeklyCheckinData[]> {
    try {
      return await storage.getUserWeeklyCheckins(userId, limit);
    } catch (error) {
      return [];
    }
  }

  /**
   * Get user's weekly check-in statistics
   */
  async getUserCheckinStats(userId: string): Promise<WeeklyStats> {
    try {
      const history = await this.getUserCheckinHistory(userId, 52); // Last year
      
      if (history.length === 0) {
        return {
          totalCheckins: 0,
          averageSpiritalGrowth: 0,
          streakCount: 0,
          longestStreak: 0,
          missedWeeks: 0,
          improvementAreas: [],
          strongAreas: []
        };
      }

      const totalCheckins = history.length;
      const averageSpiritalGrowth = history.reduce((sum, c) => sum + c.spiritualGrowth, 0) / totalCheckins;
      
      // Calculate streak
      const { currentStreak, longestStreak } = this.calculateStreaks(history);
      
      // Calculate missed weeks (assuming weekly check-ins for last 12 weeks)
      const last12Weeks = this.getLast12Weeks();
      const completedWeeks = new Set(history.slice(0, 12).map(c => c.week));
      const missedWeeks = last12Weeks.filter(week => !completedWeeks.has(week)).length;
      
      // Analyze improvement and strong areas
      const { improvementAreas, strongAreas } = this.analyzeGrowthAreas(history);

      return {
        totalCheckins,
        averageSpiritalGrowth: Math.round(averageSpiritalGrowth * 10) / 10,
        streakCount: currentStreak,
        longestStreak,
        missedWeeks,
        improvementAreas,
        strongAreas
      };
    } catch (error) {
      return {
        totalCheckins: 0,
        averageSpiritalGrowth: 0,
        streakCount: 0,
        longestStreak: 0,
        missedWeeks: 0,
        improvementAreas: [],
        strongAreas: []
      };
    }
  }

  /**
   * Check if user has completed this week's check-in
   */
  async hasCompletedThisWeek(userId: string): Promise<boolean> {
    try {
      const currentWeek = this.getCurrentWeek();
      const checkin = await storage.getWeeklyCheckin(userId, currentWeek);
      return !!checkin;
    } catch (error) {
      return false;
    }
  }

  /**
   * Send weekly check-in reminders to all users
   */
  async sendWeeklyReminders(): Promise<void> {
    try {
      // Get all active users
      const users = await storage.getActiveUsers();
      
      for (const user of users) {
        // Check if user has notification preferences enabled
        const preferences = await storage.getNotificationPreferences(user.id);
        if (!preferences?.weeklyCheckins) continue;
        
        // Skip if already completed this week
        const hasCompleted = await this.hasCompletedThisWeek(user.id);
        if (hasCompleted) continue;
        
        // Send reminder
        await this.sendCheckinReminder(user.id);
      }
    } catch (error) {
      // Silent error handling
    }
  }

  /**
   * Send follow-up reminders for users who missed check-ins
   */
  async sendFollowUpReminders(): Promise<void> {
    try {
      const users = await storage.getActiveUsers();
      
      for (const user of users) {
        const preferences = await storage.getNotificationPreferences(user.id);
        if (!preferences?.engagementReminders) continue;
        
        const stats = await this.getUserCheckinStats(user.id);
        
        // Send gentle follow-up if missed 2+ weeks
        if (stats.missedWeeks >= 2) {
          await this.sendReEngagementReminder(user.id, stats.missedWeeks);
        }
      }
    } catch (error) {
      // Silent error handling
    }
  }

  private async sendCheckinReminder(userId: string): Promise<void> {
    try {
      const user = await storage.getUser(userId);
      if (!user) return;

      const stats = await this.getUserCheckinStats(userId);
      
      // Multi-channel notification
      await notificationScheduler.scheduleWeeklyCheckinNotification(userId, {
        firstName: user.firstName,
        currentStreak: stats.streakCount,
        totalCheckins: stats.totalCheckins
      });

      // Web push notification
      const { webPushService } = await import('./web-push-service');
      await webPushService.sendWeeklyCheckinNotification(userId);
      
    } catch (error) {
      // Silent error handling
    }
  }

  private async sendReEngagementReminder(userId: string, missedWeeks: number): Promise<void> {
    try {
      const user = await storage.getUser(userId);
      if (!user) return;

      // Send gentle re-engagement message
      await notificationScheduler.scheduleReEngagementNotification(userId, {
        firstName: user.firstName,
        missedWeeks,
        lastCheckin: await this.getLastCheckinDate(userId)
      });
      
    } catch (error) {
      // Silent error handling
    }
  }

  private async sendCheckinConfirmation(userId: string, data: WeeklyCheckinData): Promise<void> {
    try {
      const user = await storage.getUser(userId);
      if (!user) return;

      // Send confirmation with insights
      const insights = this.generateInsights(data);
      
      await notificationScheduler.scheduleCheckinConfirmation(userId, {
        firstName: user.firstName,
        week: data.week,
        insights,
        pointsEarned: 100
      });
      
    } catch (error) {
      // Silent error handling
    }
  }

  private generateInsights(data: WeeklyCheckinData): string[] {
    const insights: string[] = [];
    
    if (data.spiritualGrowth >= 4) {
      insights.push("You're experiencing strong spiritual growth this week!");
    }
    
    if (data.prayerLife >= 4) {
      insights.push("Your prayer life is flourishing - keep it up!");
    }
    
    if (data.gratitude.length > 2) {
      insights.push("Your heart is full of gratitude - what a blessing!");
    }
    
    if (data.serviceOpportunities >= 4) {
      insights.push("You're actively serving others - living out your faith!");
    }
    
    if (insights.length === 0) {
      insights.push("Thank you for taking time to reflect on your spiritual journey.");
    }
    
    return insights;
  }

  private calculateStreaks(history: WeeklyCheckinData[]): { currentStreak: number; longestStreak: number } {
    if (history.length === 0) return { currentStreak: 0, longestStreak: 0 };
    
    // Sort by week descending
    const sorted = history.sort((a, b) => b.week.localeCompare(a.week));
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    const currentWeek = this.getCurrentWeek();
    let expectedWeek = currentWeek;
    
    for (const checkin of sorted) {
      if (checkin.week === expectedWeek) {
        tempStreak++;
        if (tempStreak === 1) currentStreak = tempStreak;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = checkin.week === expectedWeek ? 1 : 0;
      }
      
      expectedWeek = this.getPreviousWeek(expectedWeek);
    }
    
    longestStreak = Math.max(longestStreak, tempStreak);
    
    return { currentStreak, longestStreak };
  }

  private analyzeGrowthAreas(history: WeeklyCheckinData[]): { improvementAreas: string[]; strongAreas: string[] } {
    if (history.length < 2) return { improvementAreas: [], strongAreas: [] };
    
    const recent = history.slice(0, 4); // Last 4 weeks
    const areas = [
      { key: 'spiritualGrowth', name: 'Spiritual Growth' },
      { key: 'prayerLife', name: 'Prayer Life' },
      { key: 'bibleReading', name: 'Bible Reading' },
      { key: 'communityConnection', name: 'Community Connection' },
      { key: 'serviceOpportunities', name: 'Service' },
      { key: 'emotionalWellbeing', name: 'Emotional Wellbeing' }
    ];
    
    const improvements: string[] = [];
    const strengths: string[] = [];
    
    areas.forEach(area => {
      const scores = recent.map(c => c[area.key as keyof WeeklyCheckinData] as number);
      const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      
      if (average >= 4) {
        strengths.push(area.name);
      } else if (average <= 2.5) {
        improvements.push(area.name);
      }
    });
    
    return { 
      improvementAreas: improvements.slice(0, 3), 
      strongAreas: strengths.slice(0, 3) 
    };
  }

  private getCurrentWeek(): string {
    const now = new Date();
    const year = now.getFullYear();
    const week = this.getWeekNumber(now);
    return `${year}-W${week.toString().padStart(2, '0')}`;
  }

  private getPreviousWeek(week: string): string {
    const [year, weekNum] = week.split('-W').map(Number);
    if (weekNum === 1) {
      return `${year - 1}-W52`;
    }
    return `${year}-W${(weekNum - 1).toString().padStart(2, '0')}`;
  }

  private getLast12Weeks(): string[] {
    const weeks: string[] = [];
    let currentWeek = this.getCurrentWeek();
    
    for (let i = 0; i < 12; i++) {
      weeks.push(currentWeek);
      currentWeek = this.getPreviousWeek(currentWeek);
    }
    
    return weeks;
  }

  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  private async getLastCheckinDate(userId: string): Promise<Date | null> {
    try {
      const history = await this.getUserCheckinHistory(userId, 1);
      return history.length > 0 ? history[0].completedAt : null;
    } catch (error) {
      return null;
    }
  }

  private async updateUserCheckinStats(userId: string): Promise<void> {
    try {
      const stats = await this.getUserCheckinStats(userId);
      await storage.updateUserStats(userId, {
        weeklyCheckins: stats.totalCheckins,
        checkinStreak: stats.streakCount,
        longestCheckinStreak: stats.longestStreak
      });
    } catch (error) {
      // Silent error handling
    }
  }
}

export const weeklyCheckinService = new WeeklyCheckinService();