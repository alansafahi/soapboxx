import { Router } from 'express';
import { volunteerStorage } from '../volunteer-storage';
import { volunteerNotificationService } from '../volunteer-notifications';

const router = Router();

// D.I.V.I.N.E. Admin Routes for Volunteer Approval Workflow

// Get pending volunteer registrations for approval
router.get('/pending-approvals', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if user has admin permissions
    const user = req.user as any;
    const isAdmin = ['church_admin', 'admin', 'pastor', 'lead_pastor', 'elder', 'soapbox_owner'].includes(user.role);
    
    if (!isAdmin) {
      return res.status(403).json({ error: 'Admin permissions required' });
    }

    // Get pending registrations
    const pendingRegistrations = await volunteerStorage.getPendingRegistrations(user.churchId || 1);
    
    res.json(pendingRegistrations);
  } catch (error) {
    // Failed to get pending approvals - silent error handling
    res.status(500).json({ error: 'Failed to get pending approvals' });
  }
});

// Approve or reject volunteer registration
router.post('/approve-registration', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = req.user as any;
    const isAdmin = ['church_admin', 'admin', 'pastor', 'lead_pastor', 'elder', 'soapbox_owner'].includes(user.role);
    
    if (!isAdmin) {
      return res.status(403).json({ error: 'Admin permissions required' });
    }

    const { registrationId, status, message } = req.body; // status: 'approved' | 'rejected'
    
    // Update registration status
    const updatedRegistration = await volunteerStorage.updateRegistrationStatus(registrationId, status);
    
    // Send notification to volunteer
    await volunteerNotificationService.sendApprovalNotification(registrationId, status, message);
    
    res.json({ 
      success: true, 
      registration: updatedRegistration,
      message: `Registration ${status} successfully`
    });
  } catch (error) {
    // Failed to approve registration - silent error handling
    res.status(500).json({ error: 'Failed to process approval' });
  }
});

export default router;