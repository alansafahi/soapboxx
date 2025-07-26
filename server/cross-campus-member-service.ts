// D.I.V.I.N.E. Phase 3A: Cross-Campus Member Management Service
import { db } from "./db";
import { eq, and, or, desc, asc, sql, inArray } from "drizzle-orm";
import {
  memberCampusAssignments,
  campusMemberRoles,
  memberTransferHistory,
  campuses,
  users,
  userChurches,
  type MemberCampusAssignment,
  type InsertMemberCampusAssignment,
  type CampusMemberRole,
  type InsertCampusMemberRole,
  type MemberTransferHistory,
  type InsertMemberTransferHistory
} from "../shared/schema";

export class CrossCampusMemberService {
  
  // Get all members across campuses for a church
  async getMembersByCampus(churchId: number, campusId?: number) {
    try {
      // First try to get members with campus assignments
      const membersWithCampus = await db
        .select({
          userId: users.id,
          fullName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
          email: users.email,
          profileImageUrl: users.profileImageUrl,
          role: users.role,
          campusId: memberCampusAssignments.campusId,
          campusName: campuses.name,
          isPrimaryCampus: memberCampusAssignments.isPrimaryCampus,
          membershipStatus: memberCampusAssignments.membershipStatus,
          assignedAt: memberCampusAssignments.assignedAt,
          notes: memberCampusAssignments.notes
        })
        .from(users)
        .innerJoin(memberCampusAssignments, eq(users.id, memberCampusAssignments.userId))
        .innerJoin(campuses, eq(memberCampusAssignments.campusId, campuses.id))
        .where(
          and(
            eq(memberCampusAssignments.churchId, churchId),
            eq(memberCampusAssignments.isActive, true),
            campusId ? eq(memberCampusAssignments.campusId, campusId) : undefined
          )
        )
        .orderBy(asc(campuses.name), sql`CONCAT(${users.firstName}, ' ', ${users.lastName})`);

      // If no campus assignments exist, fall back to all church members
      if (membersWithCampus.length === 0) {
        const allChurchMembers = await db
          .select({
            userId: users.id,
            fullName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
            email: users.email,
            profileImageUrl: users.profileImageUrl,
            role: userChurches.role,
            campusId: sql<number | null>`NULL`,
            campusName: sql<string>`'Unassigned'`,
            isPrimaryCampus: sql<boolean>`false`,
            membershipStatus: sql<string>`'active'`,
            assignedAt: sql<string | null>`NULL`,
            notes: sql<string | null>`NULL`
          })
          .from(users)
          .innerJoin(userChurches, eq(users.id, userChurches.userId))
          .where(eq(userChurches.churchId, churchId))
          .orderBy(sql`CONCAT(${users.firstName}, ' ', ${users.lastName})`);

        return allChurchMembers;
      }

      return membersWithCampus;
    } catch (error) {
      throw error;
    }
  }

  // Assign member to campus
  async assignMemberToCampus(assignment: InsertMemberCampusAssignment) {
    try {
      // Check if member already assigned to this campus
      const existing = await db
        .select()
        .from(memberCampusAssignments)
        .where(
          and(
            eq(memberCampusAssignments.userId, assignment.userId),
            eq(memberCampusAssignments.campusId, assignment.campusId),
            eq(memberCampusAssignments.isActive, true)
          )
        );

      if (existing.length > 0) {
        throw new Error('Member is already assigned to this campus');
      }

      // If this is being set as primary campus, unset other primary assignments
      if (assignment.isPrimaryCampus) {
        await db
          .update(memberCampusAssignments)
          .set({ isPrimaryCampus: false, updatedAt: new Date() })
          .where(
            and(
              eq(memberCampusAssignments.userId, assignment.userId),
              eq(memberCampusAssignments.churchId, assignment.churchId),
              eq(memberCampusAssignments.isActive, true)
            )
          );
      }

      const [newAssignment] = await db
        .insert(memberCampusAssignments)
        .values(assignment)
        .returning();

      return newAssignment;
    } catch (error) {
      throw error;
    }
  }

  // Transfer member between campuses
  async transferMember(
    userId: string, 
    fromCampusId: number, 
    toCampusId: number, 
    churchId: number,
    transferDetails: {
      transferReason?: string;
      requestedBy?: string;
      approvedBy?: string;
      notes?: string;
      transferType?: string;
    }
  ) {
    try {
      // Start transaction-like operations
      
      // 1. Get current campus assignment
      const currentAssignment = await db
        .select()
        .from(memberCampusAssignments)
        .where(
          and(
            eq(memberCampusAssignments.userId, userId),
            eq(memberCampusAssignments.campusId, fromCampusId),
            eq(memberCampusAssignments.isActive, true)
          )
        );

      if (currentAssignment.length === 0) {
        throw new Error('Member not found at source campus');
      }

      // 2. Get current campus-specific roles
      const currentRoles = await db
        .select()
        .from(campusMemberRoles)
        .where(
          and(
            eq(campusMemberRoles.userId, userId),
            eq(campusMemberRoles.campusId, fromCampusId),
            eq(campusMemberRoles.isActive, true)
          )
        );

      // 3. Deactivate current campus assignment
      await db
        .update(memberCampusAssignments)
        .set({ 
          isActive: false,
          membershipStatus: 'transferred',
          updatedAt: new Date()
        })
        .where(
          and(
            eq(memberCampusAssignments.userId, userId),
            eq(memberCampusAssignments.campusId, fromCampusId)
          )
        );

      // 4. Deactivate current campus roles
      if (currentRoles.length > 0) {
        await db
          .update(campusMemberRoles)
          .set({ 
            isActive: false,
            endDate: new Date(),
            updatedAt: new Date()
          })
          .where(
            and(
              eq(campusMemberRoles.userId, userId),
              eq(campusMemberRoles.campusId, fromCampusId)
            )
          );
      }

      // 5. Create new campus assignment
      const newAssignment = await this.assignMemberToCampus({
        userId,
        campusId: toCampusId,
        churchId,
        isPrimaryCampus: currentAssignment[0].isPrimaryCampus,
        membershipStatus: 'active',
        assignedBy: transferDetails.approvedBy,
        transferredFrom: fromCampusId,
        transferReason: transferDetails.transferReason,
        notes: transferDetails.notes
      });

      // 6. Record transfer history
      const transferRecord: InsertMemberTransferHistory = {
        userId,
        fromCampusId,
        toCampusId,
        churchId,
        transferReason: transferDetails.transferReason,
        transferType: transferDetails.transferType || 'manual',
        requestedBy: transferDetails.requestedBy,
        approvedBy: transferDetails.approvedBy,
        previousRoles: currentRoles.length > 0 ? currentRoles : null,
        notes: transferDetails.notes,
        status: 'completed'
      };

      const [historyRecord] = await db
        .insert(memberTransferHistory)
        .values(transferRecord)
        .returning();

      return {
        newAssignment,
        historyRecord,
        transferredRoles: currentRoles
      };
    } catch (error) {
      throw error;
    }
  }

  // Get member's campus assignments
  async getMemberCampusAssignments(userId: string, churchId: number) {
    try {
      const assignments = await db
        .select({
          id: memberCampusAssignments.id,
          campusId: memberCampusAssignments.campusId,
          campusName: campuses.name,
          isPrimaryCampus: memberCampusAssignments.isPrimaryCampus,
          membershipStatus: memberCampusAssignments.membershipStatus,
          assignedAt: memberCampusAssignments.assignedAt,
          notes: memberCampusAssignments.notes,
          isActive: memberCampusAssignments.isActive
        })
        .from(memberCampusAssignments)
        .innerJoin(campuses, eq(memberCampusAssignments.campusId, campuses.id))
        .where(
          and(
            eq(memberCampusAssignments.userId, userId),
            eq(memberCampusAssignments.churchId, churchId)
          )
        )
        .orderBy(desc(memberCampusAssignments.isPrimaryCampus), asc(campuses.name));

      return assignments;
    } catch (error) {
      throw error;
    }
  }

  // Get campus-specific member analytics
  async getCampusMemberAnalytics(churchId: number, campusId?: number) {
    try {
      const whereConditions = [
        eq(memberCampusAssignments.churchId, churchId),
        eq(memberCampusAssignments.isActive, true)
      ];

      if (campusId) {
        whereConditions.push(eq(memberCampusAssignments.campusId, campusId));
      }

      const stats = await db
        .select({
          campusId: memberCampusAssignments.campusId,
          campusName: campuses.name,
          totalMembers: sql<number>`count(*)`,
          activeMembers: sql<number>`count(case when ${memberCampusAssignments.membershipStatus} = 'active' then 1 end)`,
          inactiveMembers: sql<number>`count(case when ${memberCampusAssignments.membershipStatus} = 'inactive' then 1 end)`,
          primaryMembers: sql<number>`count(case when ${memberCampusAssignments.isPrimaryCampus} = true then 1 end)`,
          recentJoins: sql<number>`count(case when ${memberCampusAssignments.assignedAt} >= current_date - interval '30 days' then 1 end)`
        })
        .from(memberCampusAssignments)
        .innerJoin(campuses, eq(memberCampusAssignments.campusId, campuses.id))
        .where(and(...whereConditions))
        .groupBy(memberCampusAssignments.campusId, campuses.name)
        .orderBy(asc(campuses.name));

      return stats;
    } catch (error) {
      throw error;
    }
  }

  // Get member transfer history
  async getMemberTransferHistory(userId?: string, churchId?: number, limit = 50) {
    try {
      const whereConditions = [];

      if (userId) {
        whereConditions.push(eq(memberTransferHistory.userId, userId));
      }
      if (churchId) {
        whereConditions.push(eq(memberTransferHistory.churchId, churchId));
      }

      const history = await db
        .select({
          id: memberTransferHistory.id,
          userId: memberTransferHistory.userId,
          userName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
          fromCampusId: memberTransferHistory.fromCampusId,
          fromCampusName: sql<string>`from_campus.name`,
          toCampusId: memberTransferHistory.toCampusId,
          toCampusName: sql<string>`to_campus.name`,
          transferReason: memberTransferHistory.transferReason,
          transferType: memberTransferHistory.transferType,
          transferDate: memberTransferHistory.transferDate,
          requestedBy: memberTransferHistory.requestedBy,
          approvedBy: memberTransferHistory.approvedBy,
          status: memberTransferHistory.status,
          notes: memberTransferHistory.notes
        })
        .from(memberTransferHistory)
        .innerJoin(users, eq(memberTransferHistory.userId, users.id))
        .leftJoin(
          sql`${campuses} as from_campus`, 
          eq(memberTransferHistory.fromCampusId, sql`from_campus.id`)
        )
        .leftJoin(
          sql`${campuses} as to_campus`, 
          eq(memberTransferHistory.toCampusId, sql`to_campus.id`)
        )
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .orderBy(desc(memberTransferHistory.transferDate))
        .limit(limit);

      return history;
    } catch (error) {
      throw error;
    }
  }

  // Assign campus-specific role to member
  async assignCampusRole(roleAssignment: InsertCampusMemberRole) {
    try {
      const [newRole] = await db
        .insert(campusMemberRoles)
        .values(roleAssignment)
        .returning();

      return newRole;
    } catch (error) {
      throw error;
    }
  }

  // Get member's campus-specific roles
  async getMemberCampusRoles(userId: string, campusId?: number) {
    try {
      const whereConditions = [
        eq(campusMemberRoles.userId, userId),
        eq(campusMemberRoles.isActive, true)
      ];

      if (campusId) {
        whereConditions.push(eq(campusMemberRoles.campusId, campusId));
      }

      const roles = await db
        .select({
          id: campusMemberRoles.id,
          campusId: campusMemberRoles.campusId,
          campusName: campuses.name,
          roleTitle: campusMemberRoles.roleTitle,
          roleDescription: campusMemberRoles.roleDescription,
          permissions: campusMemberRoles.permissions,
          startDate: campusMemberRoles.startDate,
          endDate: campusMemberRoles.endDate,
          assignedBy: campusMemberRoles.assignedBy
        })
        .from(campusMemberRoles)
        .innerJoin(campuses, eq(campusMemberRoles.campusId, campuses.id))
        .where(and(...whereConditions))
        .orderBy(asc(campuses.name), asc(campusMemberRoles.roleTitle));

      return roles;
    } catch (error) {
      throw error;
    }
  }
}

export const crossCampusMemberService = new CrossCampusMemberService();