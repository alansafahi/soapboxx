import { storage } from "./storage";
import { NotificationScheduler } from "./notification-scheduler";

interface MilestoneDefinition {
  id: string;
  name: string;
  description: string;
  category: 'reading' | 'prayer' | 'journaling' | 'community' | 'service' | 'streaks';
  type: 'count' | 'streak' | 'points' | 'time_based';
  threshold: number;
  badge: string;
  celebrationMessage: {
    title: string;
    message: string;
    actionUrl?: string;
  };
}

const MILESTONE_DEFINITIONS: MilestoneDefinition[] = [
  // Bible Reading Milestones
  {
    id: 'first_reading',
    name: 'First Steps',
    description: 'Completed your first daily Bible reading',
    category: 'reading',
    type: 'count',
    threshold: 1,
    badge: '📖',
    celebrationMessage: {
      title: '🎉 First Steps in Faith!',
      message: 'Congratulations! You\'ve completed your first daily Bible reading. This is the beginning of an amazing spiritual journey!',
      actionUrl: '/daily-bible'
    }
  },
  {
    id: 'week_reading_streak',
    name: 'Faithful Week',
    description: '7 consecutive days of Bible reading',
    category: 'reading',
    type: 'streak',
    threshold: 7,
    badge: '🔥',
    celebrationMessage: {
      title: '🔥 7-Day Reading Streak!',
      message: 'Amazing! You\'ve read the Bible for 7 days straight. Your consistency is building a strong spiritual foundation!',
      actionUrl: '/daily-bible'
    }
  },
  {
    id: 'month_reading_streak',
    name: 'Devoted Reader',
    description: '30 consecutive days of Bible reading',
    category: 'reading',
    type: 'streak',
    threshold: 30,
    badge: '📚',
    celebrationMessage: {
      title: '📚 30-Day Reading Champion!',
      message: 'Incredible dedication! A full month of daily Bible reading. You\'re truly walking in faith!',
      actionUrl: '/achievements'
    }
  },
  
  // Prayer Milestones
  {
    id: 'first_prayer',
    name: 'First Prayer',
    description: 'Submitted your first prayer request',
    category: 'prayer',
    type: 'count',
    threshold: 1,
    badge: '🙏',
    celebrationMessage: {
      title: '🙏 First Prayer Offered!',
      message: 'Beautiful! You\'ve shared your first prayer with our community. God hears every prayer!',
      actionUrl: '/prayer-wall'
    }
  },
  {
    id: 'prayer_warrior_10',
    name: 'Prayer Supporter',
    description: 'Prayed for 10 different prayer requests',
    category: 'prayer',
    type: 'count',
    threshold: 10,
    badge: '💜',
    celebrationMessage: {
      title: '💜 Prayer Supporter!',
      message: 'You\'ve prayed for 10 prayer requests! Your heart for others is truly inspiring.',
      actionUrl: '/prayer-wall'
    }
  },
  {
    id: 'prayer_warrior_50',
    name: 'Prayer Warrior',
    description: 'Prayed for 50 different prayer requests',
    category: 'prayer',
    type: 'count',
    threshold: 50,
    badge: '⚔️',
    celebrationMessage: {
      title: '⚔️ Prayer Warrior Unlocked!',
      message: 'You\'ve become a true Prayer Warrior with 50 prayers offered! Your intercession is powerful.',
      actionUrl: '/achievements'
    }
  },

  // Journaling Milestones
  {
    id: 'first_journal',
    name: 'Journal Beginner',
    description: 'Completed your first S.O.A.P. journal entry',
    category: 'journaling',
    type: 'count',
    threshold: 1,
    badge: '✍️',
    celebrationMessage: {
      title: '✍️ First Journal Entry!',
      message: 'Great start! Your first S.O.A.P. journal entry shows your heart to grow closer to God.',
      actionUrl: '/soap-journal'
    }
  },
  {
    id: 'journal_streak_7',
    name: 'Reflective Week',
    description: '7 consecutive days of journaling',
    category: 'journaling',
    type: 'streak',
    threshold: 7,
    badge: '📝',
    celebrationMessage: {
      title: '📝 7-Day Journaling Streak!',
      message: 'Wonderful! A week of consistent reflection. Your spiritual insights are growing daily!',
      actionUrl: '/soap-journal'
    }
  },

  // Community Milestones
  {
    id: 'first_comment',
    name: 'Community Voice',
    description: 'Made your first community comment',
    category: 'community',
    type: 'count',
    threshold: 1,
    badge: '💬',
    celebrationMessage: {
      title: '💬 Community Voice!',
      message: 'Welcome to the conversation! Your first comment adds value to our faith community.',
      actionUrl: '/community'
    }
  },
  {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Participated in 25 community discussions',
    category: 'community',
    type: 'count',
    threshold: 25,
    badge: '🦋',
    celebrationMessage: {
      title: '🦋 Social Butterfly!',
      message: 'You\'ve participated in 25 discussions! Your engagement strengthens our community.',
      actionUrl: '/community'
    }
  },

  // Service Milestones
  {
    id: 'first_volunteer',
    name: 'Willing Heart',
    description: 'Volunteered for your first ministry opportunity',
    category: 'service',
    type: 'count',
    threshold: 1,
    badge: '🤝',
    celebrationMessage: {
      title: '🤝 Willing Heart!',
      message: 'Thank you for stepping up to serve! Your first volunteer opportunity shows Christ\'s love.',
      actionUrl: '/volunteer'
    }
  },
  {
    id: 'service_hours_10',
    name: 'Faithful Servant',
    description: 'Completed 10 hours of volunteer service',
    category: 'service',
    type: 'count',
    threshold: 10,
    badge: '⭐',
    celebrationMessage: {
      title: '⭐ Faithful Servant!',
      message: 'Amazing! 10 hours of service completed. You\'re living out your faith through action!',
      actionUrl: '/volunteer'
    }
  }
];

export class MilestoneService {
  private notificationScheduler: NotificationScheduler;

  constructor() {
    this.notificationScheduler = new NotificationScheduler();
  }

  /**
   * Check and award milestones for a specific user action
   */
  async checkMilestones(userId: string, activityType: string, data?: any): Promise<void> {
    try {
      const relevantMilestones = MILESTONE_DEFINITIONS.filter(m => 
        this.isRelevantMilestone(m, activityType)
      );

      for (const milestone of relevantMilestones) {
        const hasAchieved = await this.checkMilestoneAchievement(userId, milestone, data);
        if (hasAchieved) {
          await this.awardMilestone(userId, milestone);
        }
      }
    } catch (error) {
      // Silent error handling for production
    }
  }

  private isRelevantMilestone(milestone: MilestoneDefinition, activityType: string): boolean {
    const activityMilestoneMap: Record<string, string[]> = {
      'bible_reading': ['reading'],
      'prayer_request': ['prayer'],
      'prayer_support': ['prayer'],
      'soap_journal': ['journaling'],
      'community_comment': ['community'],
      'community_post': ['community'],
      'volunteer_signup': ['service'],
      'volunteer_hours': ['service']
    };

    return activityMilestoneMap[activityType]?.includes(milestone.category) || false;
  }

  private async checkMilestoneAchievement(
    userId: string, 
    milestone: MilestoneDefinition, 
    data?: any
  ): Promise<boolean> {
    // Check if user already has this milestone
    const existingAchievement = await storage.getUserAchievement(userId, milestone.id);
    if (existingAchievement) return false;

    let currentValue = 0;

    switch (milestone.type) {
      case 'count':
        currentValue = await this.getActivityCount(userId, milestone.category);
        break;
      case 'streak':
        currentValue = await this.getCurrentStreak(userId, milestone.category);
        break;
      case 'points':
        currentValue = await this.getUserPoints(userId, milestone.category);
        break;
      case 'time_based':
        currentValue = await this.getTimeBasedValue(userId, milestone.category);
        break;
    }

    return currentValue >= milestone.threshold;
  }

  private async getActivityCount(userId: string, category: string): Promise<number> {
    const userScore = await storage.getUserScore(userId);
    if (!userScore) return 0;

    switch (category) {
      case 'reading':
        return userScore.bibleReadingCount || 0;
      case 'prayer':
        return userScore.prayersOffered || 0;
      case 'journaling':
        return userScore.journalEntries || 0;
      case 'community':
        return userScore.communityEngagement || 0;
      case 'service':
        return userScore.serviceHours || 0;
      default:
        return 0;
    }
  }

  private async getCurrentStreak(userId: string, category: string): Promise<number> {
    const streakType = this.getStreakType(category);
    const streak = await storage.getUserStreak(userId, streakType);
    return streak?.currentCount || 0;
  }

  private async getUserPoints(userId: string, category: string): Promise<number> {
    const userScore = await storage.getUserScore(userId);
    if (!userScore) return 0;

    switch (category) {
      case 'reading':
        return userScore.bibleStudyPoints || 0;
      case 'prayer':
        return userScore.prayerChampionPoints || 0;
      case 'community':
        return userScore.socialButterflyPoints || 0;
      default:
        return userScore.totalPoints || 0;
    }
  }

  private async getTimeBasedValue(userId: string, category: string): Promise<number> {
    // For service hours or other time-based metrics
    const userScore = await storage.getUserScore(userId);
    return userScore?.serviceHours || 0;
  }

  private getStreakType(category: string): string {
    const streakMap: Record<string, string> = {
      'reading': 'daily_reading',
      'prayer': 'daily_prayer',
      'journaling': 'daily_journal',
      'community': 'community_engagement'
    };
    return streakMap[category] || category;
  }

  private async awardMilestone(userId: string, milestone: MilestoneDefinition): Promise<void> {
    try {
      // Create achievement record
      await storage.createUserAchievement({
        userId,
        achievementId: milestone.id,
        achievementName: milestone.name,
        achievementDescription: milestone.description,
        badgeIcon: milestone.badge,
        category: milestone.category,
        pointsAwarded: this.calculateBonusPoints(milestone),
        unlockedAt: new Date()
      });

      // Award bonus points
      const bonusPoints = this.calculateBonusPoints(milestone);
      if (bonusPoints > 0) {
        await storage.addPointTransaction({
          userId,
          points: bonusPoints,
          activityType: 'milestone_bonus',
          description: `Milestone bonus: ${milestone.name}`,
          entityId: null
        });
      }

      // Send celebration notification
      await this.sendCelebrationNotification(userId, milestone);

      // Update user achievements count
      await this.updateUserAchievementStats(userId);

    } catch (error) {
      // Silent error handling
    }
  }

  private calculateBonusPoints(milestone: MilestoneDefinition): number {
    const pointsMap: Record<string, number> = {
      'first_reading': 50,
      'week_reading_streak': 100,
      'month_reading_streak': 500,
      'first_prayer': 25,
      'prayer_warrior_10': 100,
      'prayer_warrior_50': 300,
      'first_journal': 30,
      'journal_streak_7': 150,
      'first_comment': 20,
      'social_butterfly': 200,
      'first_volunteer': 75,
      'service_hours_10': 250
    };
    return pointsMap[milestone.id] || 50;
  }

  private async sendCelebrationNotification(userId: string, milestone: MilestoneDefinition): Promise<void> {
    // Schedule immediate celebration notification
    await this.notificationScheduler.scheduleCelebrationNotification(userId, {
      milestoneId: milestone.id,
      title: milestone.celebrationMessage.title,
      message: milestone.celebrationMessage.message,
      actionUrl: milestone.celebrationMessage.actionUrl,
      badge: milestone.badge,
      bonusPoints: this.calculateBonusPoints(milestone)
    });
  }

  private async updateUserAchievementStats(userId: string): Promise<void> {
    const achievementCount = await storage.getUserAchievementCount(userId);
    await storage.updateUserStats(userId, {
      achievementsUnlocked: achievementCount
    });
  }

  /**
   * Get user's milestone progress for display
   */
  async getUserMilestoneProgress(userId: string): Promise<any[]> {
    const progress = [];
    
    for (const milestone of MILESTONE_DEFINITIONS) {
      const hasAchieved = await storage.getUserAchievement(userId, milestone.id);
      let currentValue = 0;

      if (!hasAchieved) {
        switch (milestone.type) {
          case 'count':
            currentValue = await this.getActivityCount(userId, milestone.category);
            break;
          case 'streak':
            currentValue = await this.getCurrentStreak(userId, milestone.category);
            break;
          case 'points':
            currentValue = await this.getUserPoints(userId, milestone.category);
            break;
          case 'time_based':
            currentValue = await this.getTimeBasedValue(userId, milestone.category);
            break;
        }
      }

      progress.push({
        ...milestone,
        currentValue,
        isAchieved: !!hasAchieved,
        progressPercentage: hasAchieved ? 100 : Math.min(100, (currentValue / milestone.threshold) * 100),
        achievedAt: hasAchieved?.unlockedAt || null
      });
    }

    return progress.sort((a, b) => {
      if (a.isAchieved && !b.isAchieved) return 1;
      if (!a.isAchieved && b.isAchieved) return -1;
      return b.progressPercentage - a.progressPercentage;
    });
  }
}

export const milestoneService = new MilestoneService();