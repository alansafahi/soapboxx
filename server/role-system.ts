import { db } from "./db";
import { roles, permissions, userChurches } from "@shared/schema";
import { eq, and } from "drizzle-orm";

// Define the 9 roles with their specific permissions and capabilities
export const ROLE_DEFINITIONS = [
  {
    name: "owner",
    displayName: "Owner",
    description: "Full system control across all churches. Can manage Super Admins.",
    level: 1,
    scope: "system",
    icon: "crown",
    color: "#FF6B35",
    permissions: [
      "system.manage.all",
      "users.manage.all",
      "churches.manage.all",
      "roles.assign.all",
      "content.approve.all",
      "content.moderate.all",
      "content.delete.all",
      "events.manage.all",
      "prayers.manage.all",
      "discussions.manage.all",
      "media.manage.all",
      "analytics.view.all",
      "settings.manage.system",
      "billing.manage",
      "integrations.manage",
      "backups.manage"
    ],
    canManageRoles: ["super_admin", "church_admin", "lead_pastor", "pastor", "minister", "social_manager", "staff", "member"]
  },
  {
    name: "super_admin",
    displayName: "Super Admin",
    description: "Full control within assigned churches. Can manage Church Admins & content.",
    level: 2,
    scope: "church",
    icon: "shield-check",
    color: "#8B5CF6",
    permissions: [
      "church.manage.assigned",
      "users.manage.church",
      "roles.assign.church_admin",
      "roles.assign.lead_pastor",
      "roles.assign.pastor",
      "roles.assign.minister",
      "content.approve.all",
      "content.moderate.all",
      "content.delete.all",
      "events.manage.all",
      "prayers.manage.all",
      "discussions.manage.all",
      "media.manage.all",
      "analytics.view.church",
      "settings.manage.church",
      "bible.manage.church",
      "devotionals.manage.all",
      "sermons.manage.all"
    ],
    canManageRoles: ["church_admin", "lead_pastor", "pastor", "minister", "social_manager", "staff", "member"]
  },
  {
    name: "church_admin",
    displayName: "Church Admin",
    description: "Manages one church's portal and users. Approves posts.",
    level: 3,
    scope: "church",
    icon: "settings",
    color: "#3B82F6",
    permissions: [
      "church.manage.own",
      "users.manage.own_church",
      "roles.assign.staff",
      "roles.assign.member",
      "roles.assign.minister",
      "content.approve.church",
      "content.moderate.church",
      "content.delete.church",
      "events.manage.church",
      "prayers.moderate.church",
      "discussions.moderate.church",
      "media.manage.church",
      "analytics.view.church",
      "settings.manage.own_church",
      "checkins.manage.church",
      "leaderboard.manage.church",
      "notifications.manage.church"
    ],
    canManageRoles: ["minister", "social_manager", "staff", "member"]
  },
  {
    name: "lead_pastor",
    displayName: "Lead Pastor",
    description: "Can post, approve spiritual content, and manage events.",
    level: 4,
    scope: "church",
    icon: "book-open",
    color: "#10B981",
    permissions: [
      "content.create.all",
      "content.approve.spiritual",
      "content.moderate.spiritual",
      "sermons.create",
      "sermons.approve",
      "sermons.manage.own",
      "devotionals.create",
      "devotionals.approve",
      "devotionals.manage.own",
      "events.create",
      "events.manage.own",
      "prayers.respond",
      "prayers.moderate",
      "discussions.create",
      "discussions.moderate",
      "bible.create.content",
      "members.view.detailed",
      "analytics.view.limited",
      "media.upload",
      "inspirations.create"
    ],
    canManageRoles: ["minister", "staff"]
  },
  {
    name: "pastor",
    displayName: "Pastor",
    description: "Can post sermons, devotionals, respond to prayers, and moderate.",
    level: 5,
    scope: "church",
    icon: "heart",
    color: "#F59E0B",
    permissions: [
      "content.create.spiritual",
      "sermons.create",
      "sermons.manage.own",
      "devotionals.create",
      "devotionals.manage.own",
      "prayers.respond",
      "prayers.moderate.limited",
      "content.moderate.limited",
      "events.create",
      "events.manage.own",
      "discussions.create",
      "discussions.participate",
      "members.view.basic",
      "bible.read.advanced",
      "media.upload",
      "inspirations.create"
    ],
    canManageRoles: []
  },
  {
    name: "minister",
    displayName: "Minister",
    description: "Can reply to members, post content, and handle specific ministries.",
    level: 6,
    scope: "ministry",
    icon: "users",
    color: "#EC4899",
    permissions: [
      "content.create.ministry",
      "members.respond",
      "members.view.ministry",
      "prayers.respond.ministry",
      "prayers.view.ministry",
      "events.create.ministry",
      "events.manage.ministry",
      "discussions.moderate.ministry",
      "discussions.create.ministry",
      "ministry.manage.own",
      "bible.read.standard",
      "devotionals.create.ministry",
      "media.upload.ministry",
      "checkins.view.ministry"
    ],
    canManageRoles: []
  },
  {
    name: "social_manager",
    displayName: "Social Manager",
    description: "Manages public posts, social content, and event promotion.",
    level: 7,
    scope: "church",
    icon: "megaphone",
    color: "#06B6D4",
    permissions: [
      "content.create.social",
      "content.publish.public",
      "content.schedule",
      "events.promote",
      "events.create.public",
      "media.manage.social",
      "media.upload.social",
      "analytics.view.social",
      "posts.schedule",
      "discussions.create.public",
      "inspirations.create.public",
      "notifications.send.public",
      "members.view.public"
    ],
    canManageRoles: []
  },
  {
    name: "staff",
    displayName: "Staff",
    description: "Read/write limited access to schedule events, submit posts for approval.",
    level: 8,
    scope: "church",
    icon: "user-check",
    color: "#84CC16",
    permissions: [
      "content.create.draft",
      "content.submit.approval",
      "events.create.draft",
      "events.submit.approval",
      "members.view.basic",
      "prayers.view",
      "prayers.submit",
      "discussions.participate",
      "bible.read.standard",
      "devotionals.view",
      "sermons.view",
      "checkins.create.own",
      "media.view",
      "inspirations.view"
    ],
    canManageRoles: []
  },
  {
    name: "member",
    displayName: "Member",
    description: "Can read, comment, pray, like, submit content for review (no approval).",
    level: 9,
    scope: "church",
    icon: "user",
    color: "#6B7280",
    permissions: [
      "content.view",
      "content.comment",
      "content.like",
      "content.submit.review",
      "prayers.submit",
      "prayers.pray",
      "prayers.view.public",
      "events.view",
      "events.rsvp",
      "discussions.participate.basic",
      "discussions.view",
      "bible.read.basic",
      "devotionals.view",
      "sermons.view",
      "checkins.create.own",
      "checkins.view.own",
      "leaderboard.view",
      "media.view.public",
      "inspirations.view",
      "profile.manage.own"
    ],
    canManageRoles: []
  }
];

// Define all permissions used in the system
export const PERMISSION_DEFINITIONS = [
  // System permissions
  { name: "system.manage.all", displayName: "Manage System", description: "Full system administration", category: "system", resource: "system", action: "manage", scope: "system" },
  { name: "billing.manage", displayName: "Manage Billing", description: "Manage billing and subscriptions", category: "system", resource: "billing", action: "manage", scope: "system" },
  { name: "integrations.manage", displayName: "Manage Integrations", description: "Manage third-party integrations", category: "system", resource: "integrations", action: "manage", scope: "system" },
  { name: "backups.manage", displayName: "Manage Backups", description: "Manage system backups", category: "system", resource: "backups", action: "manage", scope: "system" },
  
  // User management permissions
  { name: "users.manage.all", displayName: "Manage All Users", description: "Manage users across all churches", category: "users", resource: "users", action: "manage", scope: "system" },
  { name: "users.manage.church", displayName: "Manage Church Users", description: "Manage users within assigned churches", category: "users", resource: "users", action: "manage", scope: "church" },
  { name: "users.manage.own_church", displayName: "Manage Own Church Users", description: "Manage users within own church only", category: "users", resource: "users", action: "manage", scope: "church" },
  
  // Church management permissions
  { name: "churches.manage.all", displayName: "Manage All Churches", description: "Manage all churches in system", category: "church", resource: "churches", action: "manage", scope: "system" },
  { name: "church.manage.assigned", displayName: "Manage Assigned Churches", description: "Manage assigned churches", category: "church", resource: "churches", action: "manage", scope: "church" },
  { name: "church.manage.own", displayName: "Manage Own Church", description: "Manage own church only", category: "church", resource: "churches", action: "manage", scope: "church" },
  
  // Role assignment permissions
  { name: "roles.assign.all", displayName: "Assign Any Role", description: "Can assign any role", category: "roles", resource: "roles", action: "assign", scope: "system" },
  { name: "roles.assign.super_admin", displayName: "Assign Super Admin", description: "Can assign Super Admin roles", category: "roles", resource: "roles", action: "assign", scope: "system" },
  { name: "roles.assign.church_admin", displayName: "Assign Church Admin", description: "Can assign Church Admin roles", category: "roles", resource: "roles", action: "assign", scope: "church" },
  { name: "roles.assign.lead_pastor", displayName: "Assign Lead Pastor", description: "Can assign Lead Pastor roles", category: "roles", resource: "roles", action: "assign", scope: "church" },
  { name: "roles.assign.pastor", displayName: "Assign Pastor", description: "Can assign Pastor roles", category: "roles", resource: "roles", action: "assign", scope: "church" },
  { name: "roles.assign.minister", displayName: "Assign Minister", description: "Can assign Minister roles", category: "roles", resource: "roles", action: "assign", scope: "church" },
  { name: "roles.assign.staff", displayName: "Assign Staff", description: "Can assign Staff roles", category: "roles", resource: "roles", action: "assign", scope: "church" },
  { name: "roles.assign.member", displayName: "Assign Member", description: "Can assign Member roles", category: "roles", resource: "roles", action: "assign", scope: "church" },
  
  // Content permissions
  { name: "content.create.all", displayName: "Create All Content", description: "Create any type of content", category: "content", resource: "content", action: "create", scope: "church" },
  { name: "content.create.spiritual", displayName: "Create Spiritual Content", description: "Create spiritual content", category: "content", resource: "content", action: "create", scope: "church" },
  { name: "content.create.ministry", displayName: "Create Ministry Content", description: "Create ministry-specific content", category: "content", resource: "content", action: "create", scope: "ministry" },
  { name: "content.create.social", displayName: "Create Social Content", description: "Create social media content", category: "content", resource: "content", action: "create", scope: "church" },
  { name: "content.create.draft", displayName: "Create Draft Content", description: "Create content drafts for approval", category: "content", resource: "content", action: "create", scope: "own" },
  { name: "content.approve.all", displayName: "Approve All Content", description: "Approve any content", category: "content", resource: "content", action: "approve", scope: "church" },
  { name: "content.approve.church", displayName: "Approve Church Content", description: "Approve church content", category: "content", resource: "content", action: "approve", scope: "church" },
  { name: "content.approve.spiritual", displayName: "Approve Spiritual Content", description: "Approve spiritual content", category: "content", resource: "content", action: "approve", scope: "church" },
  { name: "content.moderate.all", displayName: "Moderate All Content", description: "Moderate any content", category: "content", resource: "content", action: "moderate", scope: "church" },
  { name: "content.moderate.church", displayName: "Moderate Church Content", description: "Moderate church content", category: "content", resource: "content", action: "moderate", scope: "church" },
  { name: "content.moderate.spiritual", displayName: "Moderate Spiritual Content", description: "Moderate spiritual content", category: "content", resource: "content", action: "moderate", scope: "church" },
  { name: "content.moderate.limited", displayName: "Limited Content Moderation", description: "Limited content moderation", category: "content", resource: "content", action: "moderate", scope: "own" },
  { name: "content.view", displayName: "View Content", description: "View published content", category: "content", resource: "content", action: "read", scope: "church" },
  { name: "content.comment", displayName: "Comment on Content", description: "Comment on content", category: "content", resource: "content", action: "comment", scope: "church" },
  { name: "content.like", displayName: "Like Content", description: "Like content", category: "content", resource: "content", action: "like", scope: "church" },
  { name: "content.submit.review", displayName: "Submit for Review", description: "Submit content for review", category: "content", resource: "content", action: "submit", scope: "own" },
  { name: "content.publish.public", displayName: "Publish Public Content", description: "Publish content publicly", category: "content", resource: "content", action: "publish", scope: "church" },
  
  // Sermon permissions
  { name: "sermons.create", displayName: "Create Sermons", description: "Create sermon content", category: "content", resource: "sermons", action: "create", scope: "church" },
  { name: "sermons.approve", displayName: "Approve Sermons", description: "Approve sermon content", category: "content", resource: "sermons", action: "approve", scope: "church" },
  
  // Devotional permissions
  { name: "devotionals.create", displayName: "Create Devotionals", description: "Create devotional content", category: "content", resource: "devotionals", action: "create", scope: "church" },
  { name: "devotionals.approve", displayName: "Approve Devotionals", description: "Approve devotional content", category: "content", resource: "devotionals", action: "approve", scope: "church" },
  
  // Prayer permissions
  { name: "prayers.submit", displayName: "Submit Prayers", description: "Submit prayer requests", category: "prayers", resource: "prayers", action: "create", scope: "church" },
  { name: "prayers.pray", displayName: "Pray for Others", description: "Pray for prayer requests", category: "prayers", resource: "prayers", action: "pray", scope: "church" },
  { name: "prayers.respond", displayName: "Respond to Prayers", description: "Respond to prayer requests", category: "prayers", resource: "prayers", action: "respond", scope: "church" },
  { name: "prayers.respond.ministry", displayName: "Respond to Ministry Prayers", description: "Respond to ministry prayer requests", category: "prayers", resource: "prayers", action: "respond", scope: "ministry" },
  { name: "prayers.moderate", displayName: "Moderate Prayers", description: "Moderate prayer requests", category: "prayers", resource: "prayers", action: "moderate", scope: "church" },
  { name: "prayers.view", displayName: "View Prayers", description: "View prayer requests", category: "prayers", resource: "prayers", action: "read", scope: "church" },
  
  // Event permissions
  { name: "events.manage.all", displayName: "Manage All Events", description: "Manage all church events", category: "events", resource: "events", action: "manage", scope: "church" },
  { name: "events.manage.church", displayName: "Manage Church Events", description: "Manage church events", category: "events", resource: "events", action: "manage", scope: "church" },
  { name: "events.manage.own", displayName: "Manage Own Events", description: "Manage own events", category: "events", resource: "events", action: "manage", scope: "own" },
  { name: "events.create", displayName: "Create Events", description: "Create events", category: "events", resource: "events", action: "create", scope: "church" },
  { name: "events.create.ministry", displayName: "Create Ministry Events", description: "Create ministry events", category: "events", resource: "events", action: "create", scope: "ministry" },
  { name: "events.create.draft", displayName: "Create Draft Events", description: "Create event drafts", category: "events", resource: "events", action: "create", scope: "own" },
  { name: "events.view", displayName: "View Events", description: "View events", category: "events", resource: "events", action: "read", scope: "church" },
  { name: "events.rsvp", displayName: "RSVP to Events", description: "RSVP to events", category: "events", resource: "events", action: "rsvp", scope: "church" },
  { name: "events.promote", displayName: "Promote Events", description: "Promote events publicly", category: "events", resource: "events", action: "promote", scope: "church" },
  
  // Member permissions
  { name: "members.view.basic", displayName: "View Basic Member Info", description: "View basic member information", category: "members", resource: "members", action: "read", scope: "church" },
  { name: "members.respond", displayName: "Respond to Members", description: "Respond to member inquiries", category: "members", resource: "members", action: "respond", scope: "church" },
  
  // Discussion permissions
  { name: "discussions.participate", displayName: "Participate in Discussions", description: "Participate in discussions", category: "discussions", resource: "discussions", action: "participate", scope: "church" },
  { name: "discussions.participate.basic", displayName: "Basic Discussion Participation", description: "Basic discussion participation", category: "discussions", resource: "discussions", action: "participate", scope: "church" },
  { name: "discussions.moderate.ministry", displayName: "Moderate Ministry Discussions", description: "Moderate ministry discussions", category: "discussions", resource: "discussions", action: "moderate", scope: "ministry" },
  
  // Ministry permissions
  { name: "ministry.manage.own", displayName: "Manage Own Ministry", description: "Manage own ministry", category: "ministry", resource: "ministry", action: "manage", scope: "ministry" },
  
  // Media permissions
  { name: "media.manage.social", displayName: "Manage Social Media", description: "Manage social media content", category: "media", resource: "media", action: "manage", scope: "church" },
  
  // Analytics permissions
  { name: "analytics.view.all", displayName: "View All Analytics", description: "View all analytics", category: "analytics", resource: "analytics", action: "read", scope: "system" },
  { name: "analytics.view.church", displayName: "View Church Analytics", description: "View church analytics", category: "analytics", resource: "analytics", action: "read", scope: "church" },
  { name: "analytics.view.social", displayName: "View Social Analytics", description: "View social media analytics", category: "analytics", resource: "analytics", action: "read", scope: "church" },
  
  // Settings permissions
  { name: "settings.manage.system", displayName: "Manage System Settings", description: "Manage system settings", category: "settings", resource: "settings", action: "manage", scope: "system" },
  { name: "settings.manage.church", displayName: "Manage Church Settings", description: "Manage church settings", category: "settings", resource: "settings", action: "manage", scope: "church" },
  { name: "settings.manage.own_church", displayName: "Manage Own Church Settings", description: "Manage own church settings", category: "settings", resource: "settings", action: "manage", scope: "church" },
  
  // Post permissions
  { name: "posts.schedule", displayName: "Schedule Posts", description: "Schedule posts for future publication", category: "content", resource: "posts", action: "schedule", scope: "church" }
];

export class RoleManager {
  // Initialize roles and permissions in the database
  async initializeRolesAndPermissions() {
    console.log("Initializing roles and permissions...");
    
    try {
      // Insert permissions first
      console.log("Creating permissions...");
      for (const permDef of PERMISSION_DEFINITIONS) {
        await db.insert(permissions).values(permDef).onConflictDoNothing();
      }
      
      // Insert roles
      console.log("Creating roles...");
      for (const roleDef of ROLE_DEFINITIONS) {
        await db.insert(roles).values({
          name: roleDef.name,
          displayName: roleDef.displayName,
          description: roleDef.description,
          level: roleDef.level,
          scope: roleDef.scope,
          permissions: roleDef.permissions,
          icon: roleDef.icon,
          color: roleDef.color,
          canManageRoles: roleDef.canManageRoles,
          isActive: true
        }).onConflictDoNothing();
      }
      
      console.log("Roles and permissions initialized successfully!");
    } catch (error) {
      console.error("Error initializing roles and permissions:", error);
      throw error;
    }
  }
  
  // Check if a user has a specific permission
  async hasPermission(userId: string, churchId: number, permission: string): Promise<boolean> {
    try {
      const userChurch = await db
        .select({
          roleId: userChurches.roleId,
          additionalPermissions: userChurches.additionalPermissions,
          restrictedPermissions: userChurches.restrictedPermissions
        })
        .from(userChurches)
        .innerJoin(roles, eq(userChurches.roleId, roles.id))
        .where(and(
          eq(userChurches.userId, userId),
          eq(userChurches.churchId, churchId),
          eq(userChurches.isActive, true)
        ))
        .limit(1);
      
      if (!userChurch.length) return false;
      
      const { roleId, additionalPermissions, restrictedPermissions } = userChurch[0];
      
      // Get role permissions
      const role = await db.select().from(roles).where(eq(roles.id, roleId)).limit(1);
      if (!role.length) return false;
      
      const rolePermissions = role[0].permissions || [];
      
      // Check if permission is restricted
      if (restrictedPermissions && restrictedPermissions.includes(permission)) {
        return false;
      }
      
      // Check if permission exists in role or additional permissions
      const hasRolePermission = rolePermissions.includes(permission);
      const hasAdditionalPermission = additionalPermissions && additionalPermissions.includes(permission);
      
      return hasRolePermission || hasAdditionalPermission;
    } catch (error) {
      console.error("Error checking permission:", error);
      return false;
    }
  }
  
  // Get user's role in a church
  async getUserRole(userId: string, churchId: number) {
    try {
      const result = await db
        .select({
          roleId: userChurches.roleId,
          roleName: roles.name,
          roleDisplayName: roles.displayName,
          roleLevel: roles.level,
          permissions: roles.permissions,
          additionalPermissions: userChurches.additionalPermissions,
          restrictedPermissions: userChurches.restrictedPermissions,
          title: userChurches.title,
          department: userChurches.department
        })
        .from(userChurches)
        .innerJoin(roles, eq(userChurches.roleId, roles.id))
        .where(and(
          eq(userChurches.userId, userId),
          eq(userChurches.churchId, churchId),
          eq(userChurches.isActive, true)
        ))
        .limit(1);
      
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error("Error getting user role:", error);
      return null;
    }
  }
  
  // Assign role to user
  async assignRole(userId: string, churchId: number, roleName: string, assignedBy: string, options?: {
    title?: string;
    department?: string;
    additionalPermissions?: string[];
    expiresAt?: Date;
  }) {
    try {
      // Get role by name
      const role = await db.select().from(roles).where(eq(roles.name, roleName)).limit(1);
      if (!role.length) {
        throw new Error(`Role ${roleName} not found`);
      }
      
      // Check if user already has a role in this church
      const existingRole = await db
        .select()
        .from(userChurches)
        .where(and(
          eq(userChurches.userId, userId),
          eq(userChurches.churchId, churchId)
        ))
        .limit(1);
      
      if (existingRole.length > 0) {
        // Update existing role
        await db
          .update(userChurches)
          .set({
            roleId: role[0].id,
            title: options?.title,
            department: options?.department,
            additionalPermissions: options?.additionalPermissions,
            assignedBy,
            assignedAt: new Date(),
            expiresAt: options?.expiresAt,
            isActive: true
          })
          .where(eq(userChurches.id, existingRole[0].id));
      } else {
        // Create new role assignment
        await db.insert(userChurches).values({
          userId,
          churchId,
          roleId: role[0].id,
          title: options?.title,
          department: options?.department,
          additionalPermissions: options?.additionalPermissions,
          assignedBy,
          expiresAt: options?.expiresAt
        });
      }
      
      console.log(`Assigned role ${roleName} to user ${userId} in church ${churchId}`);
      return true;
    } catch (error) {
      console.error("Error assigning role:", error);
      throw error;
    }
  }
  
  // Get all roles
  async getAllRoles() {
    try {
      return await db.select().from(roles).where(eq(roles.isActive, true)).orderBy(roles.level);
    } catch (error) {
      console.error("Error getting roles:", error);
      return [];
    }
  }
  
  // Get all permissions
  async getAllPermissions() {
    try {
      return await db.select().from(permissions).where(eq(permissions.isActive, true));
    } catch (error) {
      console.error("Error getting permissions:", error);
      return [];
    }
  }
  
  // Check if user can manage another role
  async canManageRole(userId: string, churchId: number, targetRoleName: string): Promise<boolean> {
    try {
      const userRole = await this.getUserRole(userId, churchId);
      if (!userRole) return false;
      
      const role = await db.select().from(roles).where(eq(roles.name, userRole.roleName)).limit(1);
      if (!role.length) return false;
      
      const canManageRoles = role[0].canManageRoles || [];
      return canManageRoles.includes(targetRoleName);
    } catch (error) {
      console.error("Error checking role management permission:", error);
      return false;
    }
  }
}

export const roleManager = new RoleManager();