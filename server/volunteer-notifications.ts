import { storage } from './storage';
import { volunteerStorage } from './volunteer-storage';

// D.I.V.I.N.E. Notification System for Volunteer Management

export interface VolunteerNotification {
  recipientId: string;
  type: 'volunteer_signup' | 'approval_needed' | 'volunteer_approved' | 'volunteer_rejected' | 'reminder';
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: any;
}

export class VolunteerNotificationService {
  
  // Send notification to church admins when someone signs up
  async notifyAdminsOfVolunteerSignup(registrationId: number, volunteerId: number, opportunityId: number) {
    try {
      // Get registration details
      const registration = await volunteerStorage.getVolunteerRegistrations(volunteerId);
      const opportunity = await volunteerStorage.getVolunteerOpportunity(opportunityId);
      const volunteer = await volunteerStorage.getVolunteerById(volunteerId);
      
      if (!opportunity || !volunteer) return;

      // Get church admins and ministry leaders
      const churchId = opportunity.churchId || 1;
      const admins = await this.getChurchAdmins(churchId);
      
      // Send notifications to each admin
      for (const admin of admins) {
        const notification: VolunteerNotification = {
          recipientId: admin.id,
          type: 'approval_needed',
          title: 'New Volunteer Signup Needs Approval',
          message: `${volunteer.firstName} ${volunteer.lastName} has signed up for "${opportunity.title}". Please review and approve their application.`,
          actionUrl: `/divine/admin/approvals?registration=${registrationId}`,
          metadata: {
            registrationId,
            volunteerId,
            opportunityId,
            volunteerName: `${volunteer.firstName} ${volunteer.lastName}`,
            opportunityTitle: opportunity.title
          }
        };
        
        await this.sendNotification(notification);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to notify admins of volunteer signup:', error);
      return false;
    }
  }

  // Send confirmation to volunteer after signup
  async sendVolunteerSignupConfirmation(volunteerId: number, opportunityId: number) {
    try {
      const volunteer = await volunteerStorage.getVolunteerById(volunteerId);
      const opportunity = await volunteerStorage.getVolunteerOpportunity(opportunityId);
      
      if (!volunteer || !opportunity) return false;

      const notification: VolunteerNotification = {
        recipientId: volunteer.userId,
        type: 'volunteer_signup',
        title: 'Thank You for Volunteering! 🙏',
        message: `Your signup for "${opportunity.title}" has been received and is pending approval. We'll notify you once it's confirmed!`,
        actionUrl: `/divine/my-registrations`,
        metadata: {
          opportunityTitle: opportunity.title,
          status: 'pending_approval',
          nextSteps: 'Wait for church admin approval'
        }
      };
      
      await this.sendNotification(notification);
      return true;
    } catch (error) {
      console.error('Failed to send volunteer confirmation:', error);
      return false;
    }
  }

  // Send approval/rejection notifications
  async sendApprovalNotification(registrationId: number, status: 'approved' | 'rejected', message?: string) {
    try {
      // Implementation for approval notifications
      const registration = await db.query.volunteerRegistrations.findFirst({
        where: eq(volunteerRegistrations.id, registrationId),
        with: {
          volunteer: true,
          opportunity: true
        }
      });

      if (!registration) return false;

      const notification: VolunteerNotification = {
        recipientId: registration.volunteer.userId,
        type: status === 'approved' ? 'volunteer_approved' : 'volunteer_rejected',
        title: status === 'approved' ? 'Volunteer Application Approved! ✅' : 'Volunteer Application Update',
        message: status === 'approved' 
          ? `Great news! Your application for "${registration.opportunity.title}" has been approved. Welcome to the team!`
          : `Your application for "${registration.opportunity.title}" needs attention. ${message || 'Please contact the ministry leader for more information.'}`,
        actionUrl: status === 'approved' ? `/divine/my-registrations` : `/divine/opportunities`,
        metadata: {
          registrationId,
          opportunityTitle: registration.opportunity.title,
          status,
          adminMessage: message
        }
      };
      
      await this.sendNotification(notification);
      return true;
    } catch (error) {
      console.error('Failed to send approval notification:', error);
      return false;
    }
  }

  // Get church administrators and ministry leaders
  private async getChurchAdmins(churchId: number) {
    try {
      // Get users with admin roles for this church
      const churchMembers = await storage.getChurchMembers(churchId);
      return churchMembers.filter(member => 
        ['church_admin', 'admin', 'pastor', 'lead_pastor', 'elder'].includes(member.role)
      );
    } catch (error) {
      console.error('Failed to get church admins:', error);
      return [];
    }
  }

  // Core notification sending method
  private async sendNotification(notification: VolunteerNotification) {
    try {
      // Create notification record in database
      await storage.createNotification({
        recipientId: notification.recipientId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        actionUrl: notification.actionUrl,
        metadata: notification.metadata,
        isRead: false,
        createdAt: new Date()
      });
      
      // Here you could also integrate with email service, push notifications, etc.
      console.log(`Notification sent to ${notification.recipientId}: ${notification.title}`);
      
      return true;
    } catch (error) {
      console.error('Failed to send notification:', error);
      return false;
    }
  }
}

export const volunteerNotificationService = new VolunteerNotificationService();