import { storage } from './storage';

export interface BulkMessage {
  id?: number;
  title: string;
  content: string;
  type: 'announcement' | 'prayer_request' | 'event' | 'urgent' | 'general';
  channels: ('email' | 'push' | 'sms' | 'in_app')[];
  targetAudience: {
    roles?: string[];
    groups?: string[];
    departments?: string[];
    allMembers?: boolean;
    customList?: string[]; // user IDs
  };
  senderId: string;
  churchId: number;
  scheduledFor?: Date;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  expiresAt?: Date;
  requiresResponse?: boolean;
  createdAt?: Date;
  sentAt?: Date;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
}

export interface MessageRecipient {
  id?: number;
  messageId: number;
  userId: string;
  email?: string;
  phone?: string;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  responseAt?: Date;
  response?: string;
}

export class BulkCommunicationService {
  
  // Create and schedule bulk message
  async createBulkMessage(messageData: BulkMessage): Promise<BulkMessage> {
    try {
      // Validate sender permissions
      const sender = await storage.getUserWithChurch(messageData.senderId);
      if (!this.canSendBulkMessages(sender.role)) {
        throw new Error('Insufficient permissions to send bulk messages');
      }

      // Create message record
      const message = await storage.createBulkMessage({
        ...messageData,
        status: messageData.scheduledFor ? 'scheduled' : 'draft',
        createdAt: new Date()
      });

      // Generate recipient list
      const recipients = await this.generateRecipientList(message);
      await this.saveRecipients(message.id!, recipients);

      // Send immediately if not scheduled
      if (!messageData.scheduledFor) {
        await this.sendBulkMessage(message.id!);
      }

      return message;
    } catch (error) {
      console.error('Error creating bulk message:', error);
      throw error;
    }
  }

  // Generate recipient list based on target audience
  private async generateRecipientList(message: BulkMessage): Promise<MessageRecipient[]> {
    const recipients: MessageRecipient[] = [];
    const { targetAudience, churchId } = message;

    try {
      let users: any[] = [];

      if (targetAudience.allMembers) {
        users = await storage.getChurchMembers(churchId);
      } else {
        // Get users by roles
        if (targetAudience.roles?.length) {
          const roleUsers = await storage.getUsersByRoles(targetAudience.roles, churchId);
          users.push(...roleUsers);
        }

        // Get users by groups/departments
        if (targetAudience.departments?.length) {
          for (const dept of targetAudience.departments) {
            const deptUsers = await storage.getUsersByDepartment(dept, churchId);
            users.push(...deptUsers);
          }
        }

        // Add custom user list
        if (targetAudience.customList?.length) {
          const customUsers = await storage.getUsersByIds(targetAudience.customList);
          users.push(...customUsers);
        }
      }

      // Remove duplicates and create recipient records
      const uniqueUsers = users.filter((user, index, self) => 
        index === self.findIndex(u => u.id === user.id)
      );

      for (const user of uniqueUsers) {
        recipients.push({
          messageId: message.id!,
          userId: user.id,
          email: user.email,
          phone: user.phone,
          status: 'pending'
        });
      }

      return recipients;
    } catch (error) {
      console.error('Error generating recipient list:', error);
      throw error;
    }
  }

  // Save recipients to database
  private async saveRecipients(messageId: number, recipients: MessageRecipient[]): Promise<void> {
    try {
      for (const recipient of recipients) {
        await storage.createMessageRecipient(recipient);
      }
    } catch (error) {
      console.error('Error saving recipients:', error);
      throw error;
    }
  }

  // Send bulk message to all recipients
  async sendBulkMessage(messageId: number): Promise<void> {
    try {
      const message = await storage.getBulkMessage(messageId);
      if (!message) {
        throw new Error('Message not found');
      }

      // Update status to sending
      await storage.updateBulkMessage(messageId, { status: 'sending' });

      const recipients = await storage.getMessageRecipients(messageId);
      const sender = await storage.getUserWithChurch(message.senderId);

      let successCount = 0;
      let failureCount = 0;

      // Send to each recipient through selected channels
      for (const recipient of recipients) {
        try {
          // Send via email
          if (message.channels.includes('email') && recipient.email) {
            await this.sendEmailMessage(message, recipient, sender);
          }

          // Send via push notification
          if (message.channels.includes('push')) {
            await this.sendPushNotification(message, recipient);
          }

          // Send via SMS
          if (message.channels.includes('sms') && recipient.phone) {
            await this.sendSMSMessage(message, recipient, sender);
          }

          // Send in-app notification
          if (message.channels.includes('in_app')) {
            await this.sendInAppNotification(message, recipient);
          }

          // Update recipient status
          await storage.updateMessageRecipient(recipient.id!, {
            status: 'sent',
            sentAt: new Date()
          });

          successCount++;
        } catch (error) {
          console.error(`Failed to send to recipient ${recipient.userId}:`, error);
          await storage.updateMessageRecipient(recipient.id!, {
            status: 'failed'
          });
          failureCount++;
        }
      }

      // Update message status
      await storage.updateBulkMessage(messageId, {
        status: failureCount === 0 ? 'sent' : 'failed',
        sentAt: new Date()
      });


    } catch (error) {
      console.error('Error sending bulk message:', error);
      await storage.updateBulkMessage(messageId, { status: 'failed' });
      throw error;
    }
  }

  // Send email message
  private async sendEmailMessage(message: BulkMessage, recipient: MessageRecipient, sender: any): Promise<void> {
    const emailData = {
      to: recipient.email!,
      subject: `${message.title} - ${sender.church?.name || 'Church Announcement'}`,
      html: this.generateEmailTemplate(message, sender),
      replyTo: sender.email
    };

    await sendEmailNotification(emailData);
  }

  // Send push notification
  private async sendPushNotification(message: BulkMessage, recipient: MessageRecipient): Promise<void> {
    // Integrate with FCM or OneSignal
    // For now, create in-app notification
    await this.sendInAppNotification(message, recipient);
  }

  // Send SMS message
  private async sendSMSMessage(message: BulkMessage, recipient: MessageRecipient, sender: any): Promise<void> {
    // Integrate with Twilio or similar SMS service

  }

  // Send in-app notification
  private async sendInAppNotification(message: BulkMessage, recipient: MessageRecipient): Promise<void> {
    await storage.createInAppNotification({
      userId: recipient.userId,
      type: message.type,
      title: message.title,
      message: message.content,
      priority: message.priority,
      expiresAt: message.expiresAt,
      isRead: false,
      actionUrl: this.generateActionUrl(message),
      data: { messageId: message.id }
    });
  }

  // Generate email template
  private generateEmailTemplate(message: BulkMessage, sender: any): string {
    const priorityBadge = message.priority === 'urgent' ? 
      '<span style="background: #ef4444; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">URGENT</span>' : '';

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">${sender.church?.name || 'Church'} Announcement</h1>
          ${priorityBadge}
        </div>
        
        <div style="padding: 20px; background: #f9fafb;">
          <h2 style="color: #374151; margin-top: 0;">${message.title}</h2>
          <div style="color: #6b7280; line-height: 1.6;">
            ${message.content.replace(/\n/g, '<br>')}
          </div>
          
          ${message.requiresResponse ? `
            <div style="margin-top: 20px; padding: 15px; background: #fef3c7; border-left: 4px solid #f59e0b;">
              <strong>Response Required</strong><br>
              Please respond to this message through the church app.
            </div>
          ` : ''}
        </div>
        
        <div style="padding: 20px; background: #e5e7eb; text-align: center; font-size: 14px; color: #6b7280;">
          <p>From: ${sender.name || 'Church Leadership'}</p>
          <p>Sent via SoapBox Super App</p>
        </div>
      </div>
    `;
  }

  // Generate action URL for notifications
  private generateActionUrl(message: BulkMessage): string {
    switch (message.type) {
      case 'event':
        return '/events';
      case 'prayer_request':
        return '/prayer';
      case 'announcement':
        return '/announcements';
      default:
        return '/dashboard';
    }
  }

  // Check if user can send bulk messages
  private canSendBulkMessages(role: string): boolean {
    return ['owner', 'super_admin', 'system_admin', 'church_admin', 'lead_pastor', 'pastor'].includes(role);
  }

  // Get message analytics
  async getMessageAnalytics(messageId: number): Promise<any> {
    try {
      const message = await storage.getBulkMessage(messageId);
      const recipients = await storage.getMessageRecipients(messageId);

      const analytics = {
        totalRecipients: recipients.length,
        sent: recipients.filter(r => r.status === 'sent').length,
        delivered: recipients.filter(r => r.status === 'delivered').length,
        read: recipients.filter(r => r.status === 'read').length,
        failed: recipients.filter(r => r.status === 'failed').length,
        responses: recipients.filter(r => r.response).length,
        deliveryRate: 0,
        readRate: 0,
        responseRate: 0
      };

      if (analytics.totalRecipients > 0) {
        analytics.deliveryRate = (analytics.delivered / analytics.totalRecipients) * 100;
        analytics.readRate = (analytics.read / analytics.totalRecipients) * 100;
        analytics.responseRate = (analytics.responses / analytics.totalRecipients) * 100;
      }

      return { message, analytics, recipients };
    } catch (error) {
      console.error('Error getting message analytics:', error);
      throw error;
    }
  }

  // Schedule recurring messages
  async scheduleRecurringMessage(messageData: BulkMessage, schedule: {
    frequency: 'daily' | 'weekly' | 'monthly';
    dayOfWeek?: number; // 0-6 for weekly
    dayOfMonth?: number; // 1-31 for monthly
    time: string; // HH:MM format
    endDate?: Date;
  }): Promise<void> {
    // Implementation for recurring message scheduling

  }
}

export const bulkCommunicationService = new BulkCommunicationService();