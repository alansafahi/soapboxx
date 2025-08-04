import webpush from 'web-push';
import { storage } from './storage';

// VAPID keys for web push notifications
const VAPID_KEYS = {
  publicKey: process.env.VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa40HI2BbS-oMH7Kv_4QAEQdNKr-lc8hF7xYI7vN0MvmKdO-bEQN1yPL1hd4J8',
  privateKey: process.env.VAPID_PRIVATE_KEY || 'Y4_jJKJzTxUHxKlsyNdkzJ3Pz8YKlFH2KJj4DvXhwYc'
};

// Configure web-push
webpush.setVapidDetails(
  'mailto:support@soapboxsuperapp.com',
  VAPID_KEYS.publicKey,
  VAPID_KEYS.privateKey
);

interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  url?: string;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  data?: any;
}

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export class WebPushService {
  
  /**
   * Send push notification to a specific user
   */
  async sendNotificationToUser(userId: string, payload: PushNotificationPayload): Promise<boolean> {
    try {
      const subscriptions = await storage.getUserPushSubscriptions(userId);
      
      if (!subscriptions || subscriptions.length === 0) {
        return false; // User has no push subscriptions
      }

      const pushPayload = JSON.stringify({
        title: payload.title,
        body: payload.body,
        icon: payload.icon || '/icon-192x192.png',
        badge: payload.badge || '/badge-72x72.png',
        image: payload.image,
        tag: payload.tag || 'soapbox-notification',
        url: payload.url || '/',
        actions: payload.actions || [],
        data: {
          ...payload.data,
          timestamp: Date.now(),
          url: payload.url || '/'
        }
      });

      const promises = subscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: subscription.p256dhKey,
                auth: subscription.authKey
              }
            },
            pushPayload,
            {
              TTL: 24 * 60 * 60, // 24 hours
              urgency: 'normal'
            }
          );
          return true;
        } catch (error) {
          // Handle invalid/expired subscriptions
          if (error.statusCode === 410 || error.statusCode === 404) {
            // Remove invalid subscription
            await storage.removePushSubscription(subscription.id);
          }
          return false;
        }
      });

      const results = await Promise.allSettled(promises);
      const successCount = results.filter(result => 
        result.status === 'fulfilled' && result.value === true
      ).length;

      return successCount > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Send notification to multiple users
   */
  async sendNotificationToUsers(userIds: string[], payload: PushNotificationPayload): Promise<number> {
    const promises = userIds.map(userId => this.sendNotificationToUser(userId, payload));
    const results = await Promise.allSettled(promises);
    
    return results.filter(result => 
      result.status === 'fulfilled' && result.value === true
    ).length;
  }

  /**
   * Send notification to all church members
   */
  async sendNotificationToChurch(churchId: number, payload: PushNotificationPayload): Promise<number> {
    try {
      const members = await storage.getChurchMembers(churchId);
      const userIds = members.map(member => member.userId);
      return await this.sendNotificationToUsers(userIds, payload);
    } catch (error) {
      return 0;
    }
  }

  /**
   * Create weekly check-in push notification
   */
  async sendWeeklyCheckinNotification(userId: string): Promise<boolean> {
    const user = await storage.getUser(userId);
    if (!user) return false;

    return await this.sendNotificationToUser(userId, {
      title: '📝 Weekly Spiritual Check-in',
      body: `Hi ${user.firstName}! How has your spiritual journey been this week?`,
      icon: '/icons/checkin.png',
      tag: 'weekly-checkin',
      url: '/weekly-checkin',
      actions: [
        {
          action: 'open-checkin',
          title: 'Start Check-in',
          icon: '/icons/checkin-action.png'
        },
        {
          action: 'remind-later',
          title: 'Remind Later'
        }
      ],
      data: {
        type: 'weekly_checkin',
        userId
      }
    });
  }

  /**
   * Create milestone celebration push notification
   */
  async sendMilestoneCelebrationNotification(userId: string, milestone: any): Promise<boolean> {
    const user = await storage.getUser(userId);
    if (!user) return false;

    return await this.sendNotificationToUser(userId, {
      title: `🎉 ${milestone.title}`,
      body: milestone.message,
      icon: '/icons/achievement.png',
      image: '/images/celebration-banner.png',
      tag: 'milestone-celebration',
      url: milestone.actionUrl || '/achievements',
      actions: [
        {
          action: 'view-achievement',
          title: 'View Achievement',
          icon: '/icons/trophy.png'
        },
        {
          action: 'share-achievement',
          title: 'Share',
          icon: '/icons/share.png'
        }
      ],
      data: {
        type: 'milestone_celebration',
        milestoneId: milestone.milestoneId,
        userId,
        bonusPoints: milestone.bonusPoints
      }
    });
  }

  /**
   * Create daily Bible reading reminder
   */
  async sendDailyReadingReminder(userId: string): Promise<boolean> {
    const user = await storage.getUser(userId);
    if (!user) return false;

    const streak = await storage.getUserStreak(userId, 'daily_reading');
    const streakText = streak?.currentCount > 0 ? ` Keep your ${streak.currentCount}-day streak going!` : '';

    return await this.sendNotificationToUser(userId, {
      title: '📖 Daily Bible Reading',
      body: `Good morning ${user.firstName}! Ready to start your day with God's Word?${streakText}`,
      icon: '/icons/bible.png',
      tag: 'daily-reading',
      url: '/daily-bible',
      actions: [
        {
          action: 'start-reading',
          title: 'Start Reading',
          icon: '/icons/book-open.png'
        },
        {
          action: 'view-streak',
          title: 'View Streak'
        }
      ],
      data: {
        type: 'daily_reading',
        userId,
        currentStreak: streak?.currentCount || 0
      }
    });
  }

  /**
   * Create prayer reminder notification
   */
  async sendPrayerReminder(userId: string): Promise<boolean> {
    const user = await storage.getUser(userId);
    if (!user) return false;

    const activePrayers = await storage.getUserActivePrayerRequests(userId);
    const prayerCount = activePrayers?.length || 0;

    return await this.sendNotificationToUser(userId, {
      title: '🙏 Prayer Time',
      body: prayerCount > 0 
        ? `You have ${prayerCount} active prayer requests. Take a moment to pray.`
        : 'Take a moment for prayer and reflection.',
      icon: '/icons/prayer.png',
      tag: 'prayer-reminder',
      url: '/prayer-wall',
      actions: [
        {
          action: 'open-prayers',
          title: 'Open Prayers',
          icon: '/icons/prayer-hands.png'
        },
        {
          action: 'quick-prayer',
          title: 'Quick Prayer'
        }
      ],
      data: {
        type: 'prayer_reminder',
        userId,
        activePrayerCount: prayerCount
      }
    });
  }

  /**
   * Create community activity notification
   */
  async sendCommunityNotification(userId: string, activityType: string, content: any): Promise<boolean> {
    const user = await storage.getUser(userId);
    if (!user) return false;

    const notifications = {
      new_prayer_request: {
        title: '🙏 New Prayer Request',
        body: `${content.authorName} shared a prayer request: "${content.title}"`,
        url: `/prayer-wall/${content.id}`
      },
      new_discussion: {
        title: '💬 New Discussion',
        body: `${content.authorName} started a discussion: "${content.title}"`,
        url: `/community/${content.id}`
      },
      prayer_answered: {
        title: '✨ Prayer Answered!',
        body: `${content.authorName} marked their prayer as answered: "${content.title}"`,
        url: `/prayer-wall/${content.id}`
      },
      new_event: {
        title: '📅 New Church Event',
        body: `${content.title} - ${content.date}`,
        url: `/events/${content.id}`
      }
    };

    const notification = notifications[activityType];
    if (!notification) return false;

    return await this.sendNotificationToUser(userId, {
      title: notification.title,
      body: notification.body,
      icon: '/icons/community.png',
      tag: `community-${activityType}`,
      url: notification.url,
      actions: [
        {
          action: 'view-content',
          title: 'View',
          icon: '/icons/eye.png'
        },
        {
          action: 'engage',
          title: 'Engage'
        }
      ],
      data: {
        type: activityType,
        contentId: content.id,
        userId
      }
    });
  }

  /**
   * Get VAPID public key for client subscription
   */
  getVapidPublicKey(): string {
    return VAPID_KEYS.publicKey;
  }
}

export const webPushService = new WebPushService();