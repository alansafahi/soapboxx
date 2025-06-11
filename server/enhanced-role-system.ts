import { db } from "./db";
import { roles, permissions, userChurches } from "@shared/schema";
import { eq, and } from "drizzle-orm";

// Enhanced role definitions with Regional Admin and improved permissions
export const ENHANCED_ROLE_DEFINITIONS = [
  {
    name: "owner",
    displayName: "Owner",
    description: "Complete system control across all churches",
    level: 1,
    scope: "system",
    icon: "crown",
    color: "#8B5CF6",
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
      "backups.manage",
      "audit.logs.access"
    ],
    canManageRoles: ["regional_admin", "super_admin", "church_admin", "lead_pastor", "pastor", "minister", "social_manager", "staff", "member"]
  },
  {
    name: "regional_admin",
    displayName: "Regional Admin",
    description: "Manages multiple assigned churches for denominations or regions",
    level: 2,
    scope: "multi-church",
    icon: "map",
    color: "#F59E0B",
    permissions: [
      "churches.manage.assigned",
      "users.manage.multi_church",
      "roles.assign.church_admin",
      "roles.assign.lead_pastor",
      "roles.assign.pastor",
      "content.approve.regional",
      "content.moderate.regional",
      "events.manage.regional",
      "prayers.manage.regional",
      "analytics.view.regional",
      "settings.manage.regional",
      "audit.logs.access.regional"
    ],
    canManageRoles: ["church_admin", "lead_pastor", "pastor", "minister", "social_manager", "staff", "member"]
  },
  {
    name: "super_admin",
    displayName: "Super Admin",
    description: "Full control within assigned churches",
    level: 3,
    scope: "church",
    icon: "shield-check",
    color: "#EF4444",
    permissions: [
      "church.manage.assigned",
      "users.manage.church",
      "roles.assign.church_admin",
      "roles.assign.lead_pastor",
      "roles.assign.pastor",
      "roles.assign.minister",
      "content.approve.all",
      "content.moderate.all",
      "content.delete.church",
      "events.manage.all",
      "prayers.manage.all",
      "discussions.manage.all",
      "media.manage.church",
      "analytics.view.church",
      "settings.manage.church",
      "audit.logs.access"
    ],
    canManageRoles: ["church_admin", "lead_pastor", "pastor", "minister", "social_manager", "staff", "member"]
  },
  {
    name: "church_admin",
    displayName: "Church Admin",
    description: "Manages one church portal and users",
    level: 4,
    scope: "church",
    icon: "building",
    color: "#10B981",
    permissions: [
      "church.manage.single",
      "users.manage.church",
      "roles.assign.lead_pastor",
      "roles.assign.pastor",
      "roles.assign.minister",
      "roles.assign.social_manager",
      "roles.assign.staff",
      "roles.assign.member",
      "content.approve.church",
      "content.moderate.church",
      "events.manage.church",
      "prayers.moderate.church",
      "discussions.manage.church",
      "analytics.view.church",
      "settings.manage.church",
      "member_directory.full_access"
    ],
    canManageRoles: ["lead_pastor", "pastor", "minister", "social_manager", "staff", "member"]
  },
  {
    name: "lead_pastor",
    displayName: "Lead Pastor",
    description: "Posts and approves spiritual content",
    level: 5,
    scope: "church",
    icon: "book-open",
    color: "#3B82F6",
    permissions: [
      "content.create.all",
      "content.publish.all",
      "content.approve.spiritual",
      "content.moderate.spiritual",
      "sermons.create",
      "devotionals.create",
      "bible_studies.create",
      "events.create.spiritual",
      "events.manage.spiritual",
      "prayers.respond.pastoral",
      "prayers.moderate.church",
      "discussions.moderate.spiritual",
      "analytics.view.ministry",
      "member_directory.ministry_access",
      "volunteers.manage.spiritual"
    ],
    canManageRoles: ["pastor", "minister", "staff", "member"]
  },
  {
    name: "pastor",
    displayName: "Pastor",
    description: "Creates sermons, devotionals, responds to prayers",
    level: 6,
    scope: "ministry",
    icon: "heart",
    color: "#8B5CF6",
    permissions: [
      "content.create.spiritual",
      "content.publish.spiritual",
      "sermons.create",
      "devotionals.create",
      "bible_studies.create",
      "events.create.ministry",
      "events.manage.ministry",
      "prayers.respond.pastoral",
      "prayers.moderate.ministry",
      "discussions.participate.all",
      "member_directory.ministry_access",
      "volunteers.manage.ministry"
    ],
    canManageRoles: ["minister", "staff", "member"]
  },
  {
    name: "minister",
    displayName: "Minister",
    description: "Handles specific ministries and member responses - Enhanced with moderation",
    level: 7,
    scope: "ministry",
    icon: "users",
    color: "#06B6D4",
    permissions: [
      "content.create.ministry",
      "content.publish.ministry",
      "events.create.ministry",
      "events.manage.ministry",
      "prayers.respond.ministry",
      "prayers.moderate.ministry_scope",
      "prayers.flag.inappropriate",
      "discussions.moderate.ministry_scope",
      "comments.moderate.ministry_scope",
      "discussions.participate.all",
      "member_directory.ministry_access",
      "volunteers.manage.ministry",
      "small_groups.lead"
    ],
    canManageRoles: ["staff", "member"]
  },
  {
    name: "social_manager",
    displayName: "Social Manager",
    description: "Manages public posts and social content",
    level: 8,
    scope: "social",
    icon: "megaphone",
    color: "#F97316",
    permissions: [
      "content.create.social",
      "content.publish.social",
      "social_media.manage",
      "public_posts.create",
      "public_posts.schedule",
      "events.promote.social",
      "discussions.participate.all",
      "community.engage.all"
    ],
    canManageRoles: ["staff", "member"]
  },
  {
    name: "staff",
    displayName: "Staff",
    description: "Enhanced flexible role with optional permissions",
    level: 9,
    scope: "support",
    icon: "briefcase",
    color: "#64748B",
    permissions: [
      "content.create.draft",
      "content.submit_for_review",
      "events.create.optional", // Can be toggled
      "events.assist.admin",
      "comments.moderate.optional", // Can be toggled
      "prayers.create",
      "prayers.support.members",
      "discussions.participate.all",
      "community.engage.all",
      "admin.assist.tasks"
    ],
    canManageRoles: ["member"],
    flexiblePermissions: ["events.create", "comments.moderate", "volunteer.coordinate"]
  },
  {
    name: "member",
    displayName: "Member",
    description: "Basic community participation with defined directory access",
    level: 10,
    scope: "community",
    icon: "user",
    color: "#71717A",
    permissions: [
      "content.submit_for_review",
      "prayers.create",
      "prayers.support.community",
      "discussions.participate.all",
      "comments.create",
      "community.like_react",
      "events.attend",
      "events.checkin",
      "member_directory.limited_access", // Defined: staff, pastors, assigned small group leaders, public bios
      "profile.manage.own"
    ],
    canManageRoles: [],
    directoryAccess: {
      canView: ["staff", "pastors", "assigned_small_group_leaders", "public_bios_opt_in"],
      cannotView: ["private_profiles", "other_members_full_info"]
    }
  }
];

// Enhanced permission definitions with new categories
export const ENHANCED_PERMISSION_DEFINITIONS = [
  // System Permissions
  { name: "system.manage.all", displayName: "System Management", category: "system" },
  { name: "audit.logs.access", displayName: "Audit Logs Access", category: "system" },
  { name: "audit.logs.access.regional", displayName: "Regional Audit Access", category: "system" },
  
  // Multi-Church Permissions
  { name: "churches.manage.assigned", displayName: "Manage Assigned Churches", category: "multi-church" },
  { name: "users.manage.multi_church", displayName: "Multi-Church User Management", category: "multi-church" },
  
  // Enhanced Content Permissions
  { name: "content.moderate.ministry_scope", displayName: "Ministry Scope Moderation", category: "content" },
  { name: "content.approve.regional", displayName: "Regional Content Approval", category: "content" },
  { name: "prayers.moderate.ministry_scope", displayName: "Ministry Prayer Moderation", category: "prayers" },
  { name: "prayers.flag.inappropriate", displayName: "Flag Inappropriate Prayers", category: "prayers" },
  
  // Enhanced Discussion Permissions
  { name: "discussions.moderate.ministry_scope", displayName: "Ministry Discussion Moderation", category: "discussions" },
  { name: "comments.moderate.ministry_scope", displayName: "Ministry Comment Moderation", category: "discussions" },
  { name: "comments.moderate.optional", displayName: "Optional Comment Moderation", category: "discussions" },
  
  // Enhanced Staff Permissions
  { name: "events.create.optional", displayName: "Optional Event Creation", category: "events" },
  { name: "admin.assist.tasks", displayName: "Administrative Assistance", category: "admin" },
  
  // Member Directory Permissions
  { name: "member_directory.limited_access", displayName: "Limited Directory Access", category: "directory" },
  { name: "member_directory.ministry_access", displayName: "Ministry Directory Access", category: "directory" },
  { name: "member_directory.full_access", displayName: "Full Directory Access", category: "directory" },
  
  // All existing permissions...
  { name: "users.manage.all", displayName: "User Management", category: "users" },
  { name: "churches.manage.all", displayName: "Church Management", category: "churches" },
  { name: "roles.assign.all", displayName: "Role Assignment", category: "roles" },
  { name: "content.approve.all", displayName: "Content Approval", category: "content" },
  { name: "content.moderate.all", displayName: "Content Moderation", category: "content" },
  { name: "content.create.all", displayName: "Content Creation", category: "content" },
  { name: "content.publish.all", displayName: "Content Publishing", category: "content" },
  { name: "content.delete.all", displayName: "Content Deletion", category: "content" },
  { name: "sermons.create", displayName: "Sermon Creation", category: "spiritual" },
  { name: "devotionals.create", displayName: "Devotional Creation", category: "spiritual" },
  { name: "events.manage.all", displayName: "Event Management", category: "events" },
  { name: "events.create.all", displayName: "Event Creation", category: "events" },
  { name: "prayers.manage.all", displayName: "Prayer Management", category: "prayers" },
  { name: "prayers.respond.pastoral", displayName: "Pastoral Prayer Response", category: "prayers" },
  { name: "discussions.manage.all", displayName: "Discussion Management", category: "discussions" },
  { name: "social_media.manage", displayName: "Social Media Management", category: "social" },
  { name: "analytics.view.all", displayName: "Analytics Access", category: "analytics" },
  { name: "settings.manage.system", displayName: "System Settings", category: "settings" },
  { name: "community.engage.all", displayName: "Community Engagement", category: "community" }
];

// Role templates for different church sizes
export const ROLE_TEMPLATES = {
  "small_church": {
    name: "Small Church (Under 50)",
    description: "Simplified roles for smaller congregations",
    recommendedRoles: ["church_admin", "lead_pastor", "staff", "member"],
    autoAssignPermissions: {
      "staff": ["events.create.optional", "comments.moderate.optional"]
    }
  },
  "mid_size_church": {
    name: "Mid-size Church",
    description: "Balanced structure for growing churches",
    recommendedRoles: ["church_admin", "lead_pastor", "pastor", "minister", "staff", "member"],
    autoAssignPermissions: {
      "minister": ["prayers.moderate.ministry_scope", "discussions.moderate.ministry_scope"],
      "staff": ["events.create.optional"]
    }
  },
  "large_church": {
    name: "Large Church with Ministries",
    description: "Full role structure for complex organizations",
    recommendedRoles: ["church_admin", "lead_pastor", "pastor", "minister", "social_manager", "staff", "member"],
    autoAssignPermissions: {
      "minister": ["prayers.moderate.ministry_scope", "discussions.moderate.ministry_scope", "comments.moderate.ministry_scope"],
      "staff": ["events.create.optional", "comments.moderate.optional", "volunteer.coordinate"]
    }
  },
  "multi_church_network": {
    name: "Multi-Church Network",
    description: "Regional or denominational oversight structure",
    recommendedRoles: ["regional_admin", "church_admin", "lead_pastor", "pastor", "minister", "social_manager", "staff", "member"],
    autoAssignPermissions: {
      "regional_admin": ["audit.logs.access.regional"],
      "minister": ["prayers.moderate.ministry_scope", "discussions.moderate.ministry_scope"],
      "staff": ["events.create.optional", "comments.moderate.optional"]
    }
  }
};

export class EnhancedRoleManager {
  async initializeEnhancedRoles() {
    console.log("Initializing enhanced roles and permissions...");
    
    // Create enhanced permissions
    for (const permission of ENHANCED_PERMISSION_DEFINITIONS) {
      await db.insert(permissions)
        .values({
          name: permission.name,
          displayName: permission.displayName,
          description: `${permission.category} permission`,
          category: permission.category
        })
        .onConflictDoNothing();
    }
    
    // Create enhanced roles
    for (const role of ENHANCED_ROLE_DEFINITIONS) {
      await db.insert(roles)
        .values({
          name: role.name,
          displayName: role.displayName,
          description: role.description,
          level: role.level,
          color: role.color,
          permissions: role.permissions,
          canManageRoles: role.canManageRoles
        })
        .onConflictDoNothing();
    }
    
    console.log("Enhanced roles and permissions initialized!");
  }

  async applyRoleTemplate(churchId: number, templateName: string) {
    const template = ROLE_TEMPLATES[templateName];
    if (!template) {
      throw new Error(`Template ${templateName} not found`);
    }

    // Auto-assign template-specific permissions
    for (const [roleName, permissions] of Object.entries(template.autoAssignPermissions)) {
      // Implementation would update role permissions for this church
      console.log(`Applying ${templateName} permissions to ${roleName} for church ${churchId}`);
    }
  }

  async hasEnhancedPermission(userId: string, churchId: number, permission: string): Promise<boolean> {
    // Enhanced permission checking with scope awareness
    const userRole = await this.getUserRole(userId, churchId);
    if (!userRole) return false;

    const role = ENHANCED_ROLE_DEFINITIONS.find(r => r.name === userRole.roleName);
    if (!role) return false;

    return role.permissions.includes(permission);
  }

  async getUserRole(userId: string, churchId: number) {
    const [assignment] = await db
      .select()
      .from(userChurches)
      .where(and(
        eq(userChurches.userId, userId),
        eq(userChurches.churchId, churchId)
      ));
    
    return assignment;
  }

  getDirectoryAccessRules(roleName: string) {
    const role = ENHANCED_ROLE_DEFINITIONS.find(r => r.name === roleName);
    return role?.directoryAccess || null;
  }

  getFlexiblePermissions(roleName: string) {
    const role = ENHANCED_ROLE_DEFINITIONS.find(r => r.name === roleName);
    return role?.flexiblePermissions || [];
  }
}

export const enhancedRoleManager = new EnhancedRoleManager();