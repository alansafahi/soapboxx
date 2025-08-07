import { db } from './db';
import { sql } from 'drizzle-orm';

interface MilestoneContext {
  entityId?: number;
  points?: number;
}

class MilestoneService {
  async checkMilestones(userId: string, activityType: string, context: MilestoneContext): Promise<void> {
    try {
      // Get user's current points and activity counts
      const userStats = await db.execute(sql`
        SELECT 
          up.total_points,
          up.weekly_points,
          up.monthly_points,
          up.current_streak,
          (SELECT COUNT(*) FROM point_transactions WHERE user_id = ${userId} AND reason = 'discussion_post') as discussion_count,
          (SELECT COUNT(*) FROM point_transactions WHERE user_id = ${userId} AND reason = 'prayer_request') as prayer_count,
          (SELECT COUNT(*) FROM point_transactions WHERE user_id = ${userId} AND reason = 'soap_entry') as soap_count,
          (SELECT COUNT(*) FROM point_transactions WHERE user_id = ${userId} AND reason = 'event_attended') as event_count
        FROM user_points up
        WHERE up.user_id = ${userId}
      `);

      if (userStats.rows.length === 0) {
        return; // No user stats found
      }

      const stats = userStats.rows[0];
      
      // Check various milestone categories
      await this.checkPointMilestones(userId, stats.total_points);
      await this.checkActivityMilestones(userId, activityType, {
        discussions: stats.discussion_count,
        prayers: stats.prayer_count,
        soapEntries: stats.soap_count,
        events: stats.event_count
      });
      await this.checkStreakMilestones(userId, stats.current_streak);
      
    } catch (error) {
      // Silent error handling - milestones shouldn't break main functionality
      console.error('Milestone check error:', error);
    }
  }

  private async checkPointMilestones(userId: string, totalPoints: number): Promise<void> {
    const pointMilestones = [100, 250, 500, 1000, 2500, 5000, 10000];
    
    for (const milestone of pointMilestones) {
      if (totalPoints >= milestone) {
        await this.awardMilestoneAchievement(userId, `points_${milestone}`, {
          name: `${milestone} Points Milestone`,
          description: `Earned ${milestone} total points through faithful engagement`,
          category: 'points',
          pointsRequired: milestone
        });
      }
    }
  }

  private async checkActivityMilestones(
    userId: string, 
    activityType: string, 
    counts: { discussions: number; prayers: number; soapEntries: number; events: number }
  ): Promise<void> {
    
    // Discussion milestones
    if (activityType === 'discussion_post' && [5, 10, 25, 50, 100].includes(counts.discussions)) {
      await this.awardMilestoneAchievement(userId, `discussions_${counts.discussions}`, {
        name: `Discussion Leader ${counts.discussions}`,
        description: `Started ${counts.discussions} meaningful discussions`,
        category: 'engagement'
      });
    }

    // Prayer milestones
    if (activityType === 'prayer_request' && [5, 10, 25, 50, 100].includes(counts.prayers)) {
      await this.awardMilestoneAchievement(userId, `prayers_${counts.prayers}`, {
        name: `Prayer Warrior ${counts.prayers}`,
        description: `Shared ${counts.prayers} prayer requests with the community`,
        category: 'spiritual'
      });
    }

    // SOAP milestones
    if (activityType === 'soap_entry' && [7, 30, 90, 365].includes(counts.soapEntries)) {
      await this.awardMilestoneAchievement(userId, `soap_${counts.soapEntries}`, {
        name: `Bible Study Champion ${counts.soapEntries}`,
        description: `Completed ${counts.soapEntries} S.O.A.P. study entries`,
        category: 'spiritual'
      });
    }
  }

  private async checkStreakMilestones(userId: string, currentStreak: number): Promise<void> {
    const streakMilestones = [7, 14, 30, 60, 100, 365];
    
    for (const milestone of streakMilestones) {
      if (currentStreak >= milestone) {
        await this.awardMilestoneAchievement(userId, `streak_${milestone}`, {
          name: `${milestone} Day Streak`,
          description: `Maintained faithful engagement for ${milestone} consecutive days`,
          category: 'consistency'
        });
      }
    }
  }

  private async awardMilestoneAchievement(
    userId: string, 
    achievementKey: string, 
    achievement: {
      name: string;
      description: string;
      category: string;
      pointsRequired?: number;
    }
  ): Promise<void> {
    try {
      // Check if user already has this achievement
      const existing = await db.execute(sql`
        SELECT id FROM user_achievements 
        WHERE user_id = ${userId} AND achievement_key = ${achievementKey}
      `);

      if (existing.rows.length === 0) {
        // Award the achievement with points bonus
        const pointsBonus = achievement.pointsRequired ? Math.floor(achievement.pointsRequired / 10) : 25;
        
        await db.execute(sql`
          INSERT INTO user_achievements (user_id, achievement_key, name, description, category, points_awarded, earned_at)
          VALUES (${userId}, ${achievementKey}, ${achievement.name}, ${achievement.description}, ${achievement.category}, ${pointsBonus}, NOW())
        `);

        // Award achievement bonus points through the centralized system
        if (pointsBonus > 0) {
          await this.addPointsToUser(parseInt(userId), pointsBonus, `achievement_${achievementKey}`);
        }
      }
    } catch (error) {
      // Reduced error logging for cleaner console
      console.error('Milestone achievement error (non-critical):', error.message);
    }
  }

  private async addPointsToUser(userId: number, points: number, reason: string): Promise<void> {
    try {
      // Update user points
      await db.execute(sql`
        INSERT INTO user_points (user_id, total_points, weekly_points, monthly_points, last_updated)
        VALUES (${userId}, ${points}, ${points}, ${points}, NOW())
        ON CONFLICT (user_id) 
        DO UPDATE SET 
          total_points = user_points.total_points + ${points},
          weekly_points = user_points.weekly_points + ${points},
          monthly_points = user_points.monthly_points + ${points},
          last_updated = NOW()
      `);

      // Log the transaction
      await db.execute(sql`
        INSERT INTO point_transactions (user_id, points, reason, created_at)
        VALUES (${userId}, ${points}, ${reason}, NOW())
      `);
    } catch (error) {
      // Silent handling for milestone points
    }
  }
}

export const milestoneService = new MilestoneService();