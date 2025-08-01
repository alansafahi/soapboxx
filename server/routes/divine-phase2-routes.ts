import { Router } from 'express';
import { z } from 'zod';
import { isAuthenticated } from '../auth';
import { backgroundCheckService } from '../background-check-service';
import { multiCampusService } from '../multi-campus-service';
import { analyticsService } from '../analytics-service';
import { 
  insertCampusSchema,
  insertCampusAdministratorSchema,
  insertBackgroundCheckProviderSchema,
  insertDashboardConfigurationSchema
} from '@shared/schema';

const router = Router();

// Apply authentication middleware to all D.I.V.I.N.E. Phase 2 routes
// Note: Authentication middleware is applied when routes are registered in main server

// D.I.V.I.N.E. Phase 2: Enterprise Ready API Routes

// ===== BACKGROUND CHECK MANAGEMENT =====

// Request background check for volunteer
router.post('/background-checks/request', async (req, res) => {
  try {
    const { volunteerId, checkType, providerId } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify user has permission to request background checks
    const user = req.user as any;
    const hasPermission = ['church_admin', 'admin', 'pastor', 'lead_pastor', 'soapbox_owner'].includes(user.role);
    
    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions to request background checks' });
    }

    const backgroundCheck = await backgroundCheckService.requestBackgroundCheck(
      volunteerId, 
      checkType || 'comprehensive',
      providerId
    );

    res.json({
      success: true,
      backgroundCheck,
      message: 'Background check requested successfully'
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to request background check',
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Check background check status
router.get('/background-checks/status/:id', async (req, res) => {
  try {
    const backgroundCheckId = parseInt(req.params.id);
    
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const backgroundCheck = await backgroundCheckService.checkBackgroundCheckStatus(backgroundCheckId);

    res.json({
      success: true,
      backgroundCheck
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to check background check status',
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Get background check requirements for opportunity
router.get('/background-checks/requirements/:opportunityId', async (req, res) => {
  try {
    const opportunityId = parseInt(req.params.opportunityId);
    
    const requirements = await backgroundCheckService.getBackgroundCheckRequirements(opportunityId);

    res.json({
      success: true,
      requirements
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to get background check requirements',
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Validate volunteer background check for opportunity
router.post('/background-checks/validate', async (req, res) => {
  try {
    const { volunteerId, opportunityId } = req.body;
    
    const validation = await backgroundCheckService.validateVolunteerBackgroundCheck(
      volunteerId, 
      opportunityId
    );

    res.json({
      success: true,
      validation
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to validate background check',
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Get expiring background checks
router.get('/background-checks/expiring', async (req, res) => {
  try {
    const daysAhead = parseInt(req.query.days as string) || 30;
    
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = req.user as any;
    const hasPermission = ['church_admin', 'admin', 'pastor', 'lead_pastor', 'soapbox_owner'].includes(user.role);
    
    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const expiringChecks = await backgroundCheckService.getExpiringBackgroundChecks(daysAhead);

    res.json({
      success: true,
      expiringChecks,
      count: expiringChecks.length
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to get expiring background checks',
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// ===== MULTI-CAMPUS MANAGEMENT =====

// Create new campus
router.post('/campuses', async (req, res) => {
  try {
    // Enhanced authentication check with detailed logging
    
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = req.user as any;
    
    // Validate user object has required properties
    if (!user.id) {
      return res.status(401).json({ error: 'Invalid user session' });
    }
    
    const hasPermission = ['church_admin', 'admin', 'pastor', 'lead_pastor', 'soapbox_owner'].includes(user.role);
    
    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions to create campus' });
    }

    const validatedData = insertCampusSchema.parse(req.body);
    
    const campus = await multiCampusService.createCampus({
      ...validatedData,
      churchId: user.churchId || 1
    });

    res.json({
      success: true,
      campus,
      message: 'Campus created successfully'
    });

  } catch (error) {
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation error',
        details: error.errors 
      });
    }

    res.status(500).json({ 
      error: 'Failed to create campus',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
    });
  }
});

// Get campuses for church
router.get('/campuses', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = req.user as any;
    const churchId = user.churchId || 1;

    const campuses = await multiCampusService.getCampusesByChurch(churchId);

    res.json({
      success: true,
      campuses,
      count: campuses.length
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to get campuses',
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Get campus with administrators
router.get('/campuses/:id', async (req, res) => {
  try {
    const campusId = parseInt(req.params.id);
    
    const campusData = await multiCampusService.getCampusWithAdministrators(campusId);

    res.json({
      success: true,
      campus: campusData
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to get campus details',
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Assign campus administrator
router.post('/campuses/:id/administrators', async (req, res) => {
  try {
    const campusId = parseInt(req.params.id);
    const { userId, permissions } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = req.user as any;
    const hasPermission = ['church_admin', 'admin', 'lead_pastor', 'soapbox_owner'].includes(user.role);
    
    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions to assign administrators' });
    }

    const administrator = await multiCampusService.assignCampusAdministrator(
      campusId,
      userId,
      permissions,
      user.id
    );

    res.json({
      success: true,
      administrator,
      message: 'Campus administrator assigned successfully'
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to assign campus administrator',
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Update campus
router.put('/campuses/:id', async (req, res) => {
  try {
    const campusId = parseInt(req.params.id);
    
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = req.user as any;
    const hasPermission = ['church_admin', 'admin', 'pastor', 'lead_pastor', 'soapbox_owner'].includes(user.role);
    
    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions to update campus' });
    }

    const validatedData = insertCampusSchema.partial().parse(req.body);
    
    const campus = await multiCampusService.updateCampus(campusId, validatedData);

    res.json({
      success: true,
      campus,
      message: 'Campus updated successfully'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation error',
        details: error.errors 
      });
    }

    res.status(500).json({ 
      error: 'Failed to update campus',
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Delete campus
router.delete('/campuses/:id', async (req, res) => {
  try {
    const campusId = parseInt(req.params.id);
    
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = req.user as any;
    const hasPermission = ['church_admin', 'admin', 'pastor', 'lead_pastor', 'soapbox_owner'].includes(user.role);
    
    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions to delete campus' });
    }

    await multiCampusService.deleteCampus(campusId);

    res.json({
      success: true,
      message: 'Campus deleted successfully'
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to delete campus',
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Get campus volunteers
router.get('/campuses/:id/volunteers', async (req, res) => {
  try {
    const campusId = parseInt(req.params.id);
    
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if user has permission for this campus
    const user = req.user as any;
    const hasGeneralPermission = ['church_admin', 'admin', 'pastor', 'lead_pastor', 'soapbox_owner'].includes(user.role);
    const hasCampusPermission = await multiCampusService.hasPermission(user.id, campusId, 'volunteer_management');

    if (!hasGeneralPermission && !hasCampusPermission) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const volunteers = await multiCampusService.getCampusVolunteers(campusId);

    res.json({
      success: true,
      volunteers,
      count: volunteers.length
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to get campus volunteers',
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Assign volunteer to campus
router.post('/campuses/:id/volunteers', async (req, res) => {
  try {
    const campusId = parseInt(req.params.id);
    const { volunteerId, isPrimaryCampus } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = req.user as any;
    const assignment = await multiCampusService.assignVolunteerToCampus(
      volunteerId,
      campusId,
      isPrimaryCampus,
      user.id
    );

    res.json({
      success: true,
      assignment,
      message: 'Volunteer assigned to campus successfully'
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to assign volunteer to campus',
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Get cross-campus statistics
router.get('/campuses/statistics', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = req.user as any;
    const churchId = user.churchId || 1;

    const statistics = await multiCampusService.getCrossCampusStatistics(churchId);

    res.json({
      success: true,
      statistics
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to get cross-campus statistics',
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// ===== ANALYTICS AND REPORTING =====

// Calculate volunteer engagement metrics
router.post('/analytics/engagement/:volunteerId', async (req, res) => {
  try {
    const volunteerId = parseInt(req.params.volunteerId);
    
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const metrics = await analyticsService.calculateVolunteerEngagement(volunteerId);

    res.json({
      success: true,
      metrics,
      message: 'Engagement metrics calculated successfully'
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to calculate engagement metrics',
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Generate ministry analytics
router.post('/analytics/ministry', async (req, res) => {
  try {
    const { ministryName, campusId, period, startDate, endDate } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const analytics = await analyticsService.generateMinistryAnalytics(
      ministryName,
      campusId,
      period,
      new Date(startDate),
      new Date(endDate)
    );

    res.json({
      success: true,
      analytics
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to generate ministry analytics',
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Get volunteer engagement trends
router.get('/analytics/engagement/:volunteerId/trends', async (req, res) => {
  try {
    const volunteerId = parseInt(req.params.volunteerId);
    const days = parseInt(req.query.days as string) || 30;
    
    const trends = await analyticsService.getVolunteerEngagementTrends(volunteerId, days);

    res.json({
      success: true,
      trends,
      count: trends.length
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to get engagement trends',
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Get ministry performance comparison
router.get('/analytics/ministry/performance', async (req, res) => {
  try {
    const campusId = req.query.campusId ? parseInt(req.query.campusId as string) : undefined;
    const period = (req.query.period as string) || 'monthly';
    
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const performance = await analyticsService.getMinistryPerformanceComparison(
      campusId,
      period as "monthly" | "quarterly" | "yearly"
    );

    res.json({
      success: true,
      performance
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to get ministry performance',
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Generate retention prediction
router.get('/analytics/retention/:volunteerId', async (req, res) => {
  try {
    const volunteerId = parseInt(req.params.volunteerId);
    
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const prediction = await analyticsService.generateRetentionPrediction(volunteerId);

    res.json({
      success: true,
      prediction
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to generate retention prediction',
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Get cross-campus analytics
router.get('/analytics/cross-campus', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = req.user as any;
    const churchId = user.churchId || 1;

    const analytics = await analyticsService.getCrossCampusAnalytics(churchId);

    res.json({
      success: true,
      analytics
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to get cross-campus analytics',
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// ===== MINISTRY LEADER DASHBOARD =====

// Get dashboard configuration
router.get('/dashboard/configuration', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = req.user as any;
    const dashboardType = req.query.type || 'ministry_leader';

    // Return default configuration for now
    // In a full implementation, this would be stored in the database
    const defaultConfig = {
      dashboardType,
      widgets: [
        'volunteer_overview',
        'engagement_metrics',
        'upcoming_events',
        'recent_activities',
        'performance_trends'
      ],
      layoutSettings: {
        columns: 3,
        rowHeight: 200
      },
      refreshInterval: 300
    };

    res.json({
      success: true,
      configuration: defaultConfig
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to get dashboard configuration',
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Background check webhook endpoint (for providers like MinistrySafe)
router.post('/background-checks/webhook', async (req, res) => {
  try {
    await backgroundCheckService.handleProviderWebhook(req.body);
    
    res.json({
      success: true,
      message: 'Webhook processed successfully'
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to process webhook',
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// ===== CAMPUS MANAGEMENT =====

// Get all campuses
router.get('/campuses', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const campuses = await multiCampusService.getAllCampuses();
    
    res.json({
      success: true,
      campuses
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch campuses',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Note: Duplicate POST /campuses route removed to prevent conflicts
// Campus creation is handled by the first POST /campuses route above

// Get campus statistics
router.get('/campuses/statistics', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const statistics = await multiCampusService.getCampusStatistics();
    
    res.json({
      success: true,
      statistics
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch campus statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ===== ANALYTICS ENDPOINTS =====

// Get ministry performance analytics
router.get('/analytics/ministry/performance', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const performance = await analyticsService.getVolunteerEngagementTrends();
    
    res.json({
      success: true,
      performance
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch ministry performance',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get volunteer engagement analytics
router.get('/analytics/volunteer/engagement', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const engagement = await analyticsService.getVolunteerRetentionAnalytics();
    
    res.json({
      success: true,
      engagement
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch volunteer engagement',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;