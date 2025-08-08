import express from 'express';
import { db } from '../db.js';
import { users, userReadingPlanSubscriptions, readingPlans } from '../../shared/schema.js';
import { eq, and } from 'drizzle-orm';

// Simple auth middleware
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.session?.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  req.user = { id: req.session.userId };
  next();
};

const router = express.Router();

// Upgrade user subscription
router.post('/upgrade', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { tier, planId } = req.body;

    console.log('DEBUG - Subscription upgrade request:', { userId, tier, planId });

    // Validate tier
    const validTiers = ['disciple', 'servant', 'torchbearer'];
    if (!validTiers.includes(tier)) {
      return res.status(400).json({ error: 'Invalid subscription tier' });
    }

    // For now, we'll store subscription info in session since user table doesn't have these fields yet
    req.session.subscriptionTier = tier;
    req.session.subscriptionStatus = 'trial';

    // If upgrading for a specific plan, create subscription
    if (planId) {
      // Check if plan exists and user has access
      const plan = await db.select()
        .from(readingPlans)
        .where(eq(readingPlans.id, planId))
        .limit(1);

      if (plan.length === 0) {
        return res.status(404).json({ error: 'Reading plan not found' });
      }

      // Check if user already subscribed to this plan
      const existingSubscription = await db.select()
        .from(userReadingPlanSubscriptions)
        .where(and(
          eq(userReadingPlanSubscriptions.userId, userId),
          eq(userReadingPlanSubscriptions.planId, planId)
        ))
        .limit(1);

      if (existingSubscription.length === 0) {
        // Create new subscription
        await db.insert(userReadingPlanSubscriptions).values({
          userId,
          planId,
          currentDay: 1,
          isActive: true,
          startedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        });
      } else {
        // Reactivate existing subscription
        await db.update(userReadingPlanSubscriptions)
          .set({
            isActive: true,
            startedAt: new Date(),
            updatedAt: new Date()
          })
          .where(and(
            eq(userReadingPlanSubscriptions.userId, userId),
            eq(userReadingPlanSubscriptions.planId, planId)
          ));
      }
    }

    console.log('DEBUG - Subscription upgrade completed:', { userId, tier, planId });

    res.json({ 
      success: true, 
      tier,
      message: `Successfully upgraded to ${tier} plan${planId ? ' and subscribed to reading plan' : ''}`,
      trialDays: 7
    });

  } catch (error) {
    console.error('Error upgrading subscription:', error);
    res.status(500).json({ error: 'Failed to upgrade subscription' });
  }
});

// Get subscription status
router.get('/status', requireAuth, async (req, res) => {
  try {
    // For now, get from session
    const subscriptionTier = req.session.subscriptionTier || 'disciple';
    const subscriptionStatus = req.session.subscriptionStatus || 'active';

    res.json({
      subscriptionTier,
      subscriptionStatus,
      createdAt: new Date()
    });

  } catch (error) {
    console.error('Error getting subscription status:', error);
    res.status(500).json({ error: 'Failed to get subscription status' });
  }
});

// Check if user can access tier-specific features
router.get('/access/:tier', requireAuth, async (req, res) => {
  try {
    const requestedTier = req.params.tier;
    const userTier = req.session.subscriptionTier || 'disciple';
    const tierHierarchy = { 'disciple': 1, 'servant': 2, 'torchbearer': 3 };
    
    const hasAccess = tierHierarchy[userTier as keyof typeof tierHierarchy] >= 
                     tierHierarchy[requestedTier as keyof typeof tierHierarchy];

    res.json({ 
      hasAccess,
      currentTier: userTier,
      requestedTier,
      subscriptionStatus: req.session.subscriptionStatus || 'active'
    });

  } catch (error) {
    console.error('Error checking tier access:', error);
    res.status(500).json({ error: 'Failed to check tier access' });
  }
});

export default router;