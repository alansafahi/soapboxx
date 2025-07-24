import { Router } from 'express';
import { z } from 'zod';
import { isAuthenticated } from '../auth';
import { multiCampusService } from '../multi-campus-service';
import { insertCampusSchema } from '@shared/schema';

const router = Router();

// Church Campus Management Routes
// These routes are church-scoped and integrated into the main church admin system

// Get campuses for a specific church
router.get('/churches/:churchId/campuses', isAuthenticated, async (req, res) => {
  try {
    const churchId = parseInt(req.params.churchId);
    
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify user has permission to view this church's campuses
    const user = req.user as any;
    
    // Check if user is global admin or has church-specific admin role
    let hasPermission = false;
    
    if (['soapbox_owner', 'system_admin'].includes(user.role)) {
      hasPermission = true;
    } else {
      // Check if user has admin role in this specific church
      const userChurches = await multiCampusService.storage.getUserChurches(user.id);
      const churchRole = userChurches.find(uc => uc.id === churchId);
      hasPermission = churchRole && ['church_admin', 'admin', 'pastor', 'lead_pastor'].includes(churchRole.role);
    }
    
    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions to view church campuses' });
    }

    const campuses = await multiCampusService.getCampusesByChurch(churchId);

    res.json({
      success: true,
      campuses,
      count: campuses.length
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to get church campuses',
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Create new campus for a church
router.post('/churches/:churchId/campuses', isAuthenticated, async (req, res) => {
  try {
    const churchId = parseInt(req.params.churchId);
    
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = req.user as any;
    
    // Check if user is global admin or has church-specific admin role
    let hasPermission = false;
    
    if (['soapbox_owner', 'system_admin'].includes(user.role)) {
      hasPermission = true;
    } else {
      // Check if user has admin role in this specific church
      const userChurches = await multiCampusService.storage.getUserChurches(user.id);
      const churchRole = userChurches.find(uc => uc.id === churchId);
      hasPermission = churchRole && ['church_admin', 'admin', 'pastor', 'lead_pastor'].includes(churchRole.role);
    }
    
    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions to create campus' });
    }

    const validatedData = insertCampusSchema.parse({
      ...req.body,
      churchId: churchId
    });
    
    const campus = await multiCampusService.createCampus(validatedData);

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
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Update campus
router.put('/churches/campuses/:campusId', isAuthenticated, async (req, res) => {
  try {
    const campusId = parseInt(req.params.campusId);
    
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
router.delete('/churches/campuses/:campusId', isAuthenticated, async (req, res) => {
  try {
    const campusId = parseInt(req.params.campusId);
    
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

export default router;