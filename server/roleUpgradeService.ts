import { db } from './db';
import { users, userChurches } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { twoFactorService } from './twoFactorService';

export interface RoleUpgradeNotification {
  userId: string;
  oldRole: string;
  newRole: string;
  churchId: number;
  churchName: string;
  requires2FA: boolean;
  upgradeReason?: string;
}

export class RoleUpgradeService {
  // Roles that require 2FA
  private privilegedRoles = [
    'super_admin',
    'lead_pastor', 
    'pastor',
    'minister',
    'admin',
    'staff'
  ];

  // Check if role requires 2FA
  private requiresTwoFactor(role: string): boolean {
    return this.privilegedRoles.includes(role.toLowerCase());
  }

  // Handle role upgrade and check 2FA requirements
  async handleRoleUpgrade(notification: RoleUpgradeNotification): Promise<{
    success: boolean;
    requires2FASetup: boolean;
    message: string;
  }> {
    try {
      const { userId, newRole, oldRole } = notification;

      // Check if new role requires 2FA
      const newRoleRequires2FA = this.requiresTwoFactor(newRole);
      const oldRoleRequired2FA = this.requiresTwoFactor(oldRole);

      // If upgrading to a privileged role and user doesn't have 2FA enabled
      if (newRoleRequires2FA && !oldRoleRequired2FA) {
        const has2FA = await twoFactorService.is2FAEnabled(userId);
        
        if (!has2FA) {
          // User needs to set up 2FA before role upgrade is complete
          await this.flagUserForMandatory2FA(userId, newRole, notification.churchId);
          
          return {
            success: true,
            requires2FASetup: true,
            message: `Role upgraded to ${newRole}. Two-factor authentication setup is required to access privileged features.`
          };
        }
      }

      return {
        success: true,
        requires2FASetup: false,
        message: `Role successfully upgraded to ${newRole}.`
      };

    } catch (error) {
      console.error('Error handling role upgrade:', error);
      return {
        success: false,
        requires2FASetup: false,
        message: 'Failed to process role upgrade'
      };
    }
  }

  // Flag user for mandatory 2FA setup
  private async flagUserForMandatory2FA(userId: string, newRole: string, churchId: number): Promise<void> {
    // Update user record to indicate pending 2FA setup
    await db.update(users)
      .set({
        // Add a flag to track pending 2FA setup for role upgrade
        twoFactorMethod: 'pending_setup'
      })
      .where(eq(users.id, userId));

    // Log the requirement for audit purposes
    console.log(`User ${userId} flagged for mandatory 2FA setup due to role upgrade to ${newRole} in church ${churchId}`);
  }

  // Check if user has pending 2FA setup
  async hasPending2FASetup(userId: string): Promise<boolean> {
    const user = await db.select({ twoFactorMethod: users.twoFactorMethod })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return user[0]?.twoFactorMethod === 'pending_setup';
  }

  // Complete 2FA setup and finalize role upgrade
  async complete2FASetup(userId: string): Promise<void> {
    await db.update(users)
      .set({
        twoFactorMethod: null // Will be set by 2FA service when actually enabled
      })
      .where(eq(users.id, userId));
  }

  // Get user's current role and church information
  async getUserRoleInfo(userId: string): Promise<{
    role: string;
    churchId: number;
    churchName: string;
  } | null> {
    const result = await db.select({
      role: userChurches.roleId,
      churchId: userChurches.churchId,
      churchName: userChurches.churchName
    })
    .from(userChurches)
    .where(eq(userChurches.userId, userId))
    .limit(1);

    if (!result[0]) return null;

    return {
      role: result[0].role?.toString() || 'member',
      churchId: result[0].churchId,
      churchName: result[0].churchName || 'Unknown Church'
    };
  }

  // Check if user needs 2FA onboarding
  async needsOnboarding(userId: string): Promise<{
    needsOnboarding: boolean;
    userRole?: string;
    churchName?: string;
  }> {
    const hasPending = await this.hasPending2FASetup(userId);
    
    if (!hasPending) {
      return { needsOnboarding: false };
    }

    const roleInfo = await this.getUserRoleInfo(userId);
    
    if (!roleInfo) {
      return { needsOnboarding: false };
    }

    return {
      needsOnboarding: true,
      userRole: roleInfo.role,
      churchName: roleInfo.churchName
    };
  }

  // Validate role assignment based on 2FA status
  async validateRoleAssignment(userId: string, newRole: string): Promise<{
    valid: boolean;
    message: string;
    requires2FAFirst: boolean;
  }> {
    const newRoleRequires2FA = this.requiresTwoFactor(newRole);
    
    if (!newRoleRequires2FA) {
      return {
        valid: true,
        message: 'Role assignment valid',
        requires2FAFirst: false
      };
    }

    const has2FA = await twoFactorService.is2FAEnabled(userId);
    
    if (!has2FA) {
      return {
        valid: false,
        message: 'Two-factor authentication must be enabled before assigning privileged roles',
        requires2FAFirst: true
      };
    }

    return {
      valid: true,
      message: 'Role assignment valid - user has 2FA enabled',
      requires2FAFirst: false
    };
  }

  // Get role display name
  getRoleDisplayName(role: string): string {
    const roleNames: Record<string, string> = {
      'super_admin': 'Super Administrator',
      'lead_pastor': 'Lead Pastor',
      'pastor': 'Pastor',
      'minister': 'Minister', 
      'admin': 'Administrator',
      'staff': 'Staff Member',
      'member': 'Member'
    };

    return roleNames[role.toLowerCase()] || role;
  }

  // Send notification about role upgrade (email/in-app)
  async sendRoleUpgradeNotification(notification: RoleUpgradeNotification): Promise<void> {
    // This would integrate with your notification system
    console.log(`Role upgrade notification sent to user ${notification.userId}:`, {
      oldRole: this.getRoleDisplayName(notification.oldRole),
      newRole: this.getRoleDisplayName(notification.newRole),
      church: notification.churchName,
      requires2FA: notification.requires2FA
    });
  }
}

export const roleUpgradeService = new RoleUpgradeService();