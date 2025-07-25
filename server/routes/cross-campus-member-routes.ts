// D.I.V.I.N.E. Phase 3A: Cross-Campus Member Management Routes
import express from 'express';
import { z } from 'zod';
import { isAuthenticated } from '../auth';
import { crossCampusMemberService } from '../cross-campus-member-service';
import { createInsertSchema } from 'drizzle-zod';
import { memberCampusAssignments, campusMemberRoles, memberTransferHistory } from '../../shared/schema';

const router = express.Router();

// Validation schemas
const memberAssignmentSchema = createInsertSchema(memberCampusAssignments);
const campusRoleSchema = createInsertSchema(campusMemberRoles);
const transferRequestSchema = z.object({
  userId: z.string(),
  fromCampusId: z.number(),
  toCampusId: z.number(),
  transferReason: z.string().optional(),
  notes: z.string().optional(),
  transferType: z.string().default('manual')
});

// Apply authentication middleware to all routes
router.use(isAuthenticated);

// Get members by campus
router.get('/members/:churchId/campus/:campusId?', async (req, res) => {
  try {
    const user = req.user as any;
    const churchId = parseInt(req.params.churchId);
    const campusId = req.params.campusId ? parseInt(req.params.campusId) : undefined;

    // Permission check
    const hasPermission = ['church_admin', 'admin', 'pastor', 'lead_pastor', 'soapbox_owner'].includes(user.role);
    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const members = await crossCampusMemberService.getMembersByCampus(churchId, campusId);
    
    console.log('API Route: Fetched', members.length, 'members for church', churchId);
    console.log('API Route: Members data sample:', members.slice(0, 2));

    res.json({
      success: true,
      members,
      count: members.length
    });

  } catch (error) {
    console.error('Error fetching campus members:', error);
    res.status(500).json({ 
      error: 'Failed to fetch members',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Assign member to campus
router.post('/members/assign', async (req, res) => {
  try {
    const user = req.user as any;

    // Permission check
    const hasPermission = ['church_admin', 'admin', 'pastor', 'lead_pastor', 'soapbox_owner'].includes(user.role);
    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const validatedData = memberAssignmentSchema.parse({
      ...req.body,
      assignedBy: user.id
    });

    const assignment = await crossCampusMemberService.assignMemberToCampus(validatedData);

    res.json({
      success: true,
      assignment,
      message: 'Member assigned to campus successfully'
    });

  } catch (error) {
    console.error('Error assigning member to campus:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors
      });
    }

    res.status(500).json({
      error: 'Failed to assign member',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Transfer member between campuses
router.post('/members/transfer', async (req, res) => {
  try {
    const user = req.user as any;

    // Permission check
    const hasPermission = ['church_admin', 'admin', 'pastor', 'lead_pastor', 'soapbox_owner'].includes(user.role);
    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const validatedData = transferRequestSchema.parse(req.body);
    const churchId = user.churchId || 1;

    const transferResult = await crossCampusMemberService.transferMember(
      validatedData.userId,
      validatedData.fromCampusId,
      validatedData.toCampusId,
      churchId,
      {
        transferReason: validatedData.transferReason,
        requestedBy: user.id,
        approvedBy: user.id,
        notes: validatedData.notes,
        transferType: validatedData.transferType
      }
    );

    res.json({
      success: true,
      transfer: transferResult,
      message: 'Member transferred successfully'
    });

  } catch (error) {
    console.error('Error transferring member:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors
      });
    }

    res.status(500).json({
      error: 'Failed to transfer member',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get member's campus assignments
router.get('/members/:userId/assignments/:churchId', async (req, res) => {
  try {
    const user = req.user as any;
    const { userId, churchId } = req.params;

    // Permission check
    const hasPermission = ['church_admin', 'admin', 'pastor', 'lead_pastor', 'soapbox_owner'].includes(user.role);
    if (!hasPermission && user.id !== userId) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const assignments = await crossCampusMemberService.getMemberCampusAssignments(
      userId, 
      parseInt(churchId)
    );

    res.json({
      success: true,
      assignments
    });

  } catch (error) {
    console.error('Error fetching member assignments:', error);
    res.status(500).json({
      error: 'Failed to fetch assignments',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get campus member analytics
router.get('/analytics/:churchId/campus/:campusId?', async (req, res) => {
  try {
    const user = req.user as any;
    const churchId = parseInt(req.params.churchId);
    const campusId = req.params.campusId ? parseInt(req.params.campusId) : undefined;

    // Permission check
    const hasPermission = ['church_admin', 'admin', 'pastor', 'lead_pastor', 'soapbox_owner'].includes(user.role);
    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const analytics = await crossCampusMemberService.getCampusMemberAnalytics(churchId, campusId);

    res.json({
      success: true,
      analytics
    });

  } catch (error) {
    console.error('Error fetching campus analytics:', error);
    res.status(500).json({
      error: 'Failed to fetch analytics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get member transfer history
router.get('/transfers/:churchId', async (req, res) => {
  try {
    const user = req.user as any;
    const churchId = parseInt(req.params.churchId);
    const userId = req.query.userId as string;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

    // Permission check
    const hasPermission = ['church_admin', 'admin', 'pastor', 'lead_pastor', 'soapbox_owner'].includes(user.role);
    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const history = await crossCampusMemberService.getMemberTransferHistory(
      userId,
      churchId,
      limit
    );

    res.json({
      success: true,
      history,
      count: history.length
    });

  } catch (error) {
    console.error('Error fetching transfer history:', error);
    res.status(500).json({
      error: 'Failed to fetch transfer history',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Assign campus-specific role to member
router.post('/members/roles', async (req, res) => {
  try {
    const user = req.user as any;

    // Permission check
    const hasPermission = ['church_admin', 'admin', 'pastor', 'lead_pastor', 'soapbox_owner'].includes(user.role);
    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const validatedData = campusRoleSchema.parse({
      ...req.body,
      assignedBy: user.id
    });

    const role = await crossCampusMemberService.assignCampusRole(validatedData);

    res.json({
      success: true,
      role,
      message: 'Campus role assigned successfully'
    });

  } catch (error) {
    console.error('Error assigning campus role:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors
      });
    }

    res.status(500).json({
      error: 'Failed to assign role',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get member's campus roles
router.get('/members/:userId/roles/:campusId?', async (req, res) => {
  try {
    const user = req.user as any;
    const { userId } = req.params;
    const campusId = req.params.campusId ? parseInt(req.params.campusId) : undefined;

    // Permission check
    const hasPermission = ['church_admin', 'admin', 'pastor', 'lead_pastor', 'soapbox_owner'].includes(user.role);
    if (!hasPermission && user.id !== userId) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const roles = await crossCampusMemberService.getMemberCampusRoles(userId, campusId);

    res.json({
      success: true,
      roles
    });

  } catch (error) {
    console.error('Error fetching member campus roles:', error);
    res.status(500).json({
      error: 'Failed to fetch roles',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;