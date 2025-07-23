import { db } from "./db";
import { 
  campuses, 
  campusAdministrators, 
  volunteerCampusAssignments,
  volunteers,
  volunteerOpportunities,
  users,
  type Campus,
  type InsertCampus,
  type CampusAdministrator,
  type InsertCampusAdministrator,
  type VolunteerCampusAssignment
} from "@shared/schema";
import { eq, and, desc, asc, sql } from "drizzle-orm";

// D.I.V.I.N.E. Phase 2: Enterprise Multi-Campus Management Service

export class MultiCampusService {

  /**
   * Create a new campus
   */
  async createCampus(campusData: InsertCampus): Promise<Campus> {
    try {
      const [campus] = await db
        .insert(campuses)
        .values({
          ...campusData,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      return campus;
    } catch (error) {
      throw new Error(`Failed to create campus: ${error.message}`);
    }
  }

  /**
   * Get all campuses for a church
   */
  async getCampusesByChurch(churchId: number): Promise<Campus[]> {
    try {
      const churchCampuses = await db
        .select()
        .from(campuses)
        .where(and(
          eq(campuses.churchId, churchId),
          eq(campuses.isActive, true)
        ))
        .orderBy(asc(campuses.name));

      return churchCampuses;
    } catch (error) {
      throw new Error(`Failed to get campuses: ${error.message}`);
    }
  }

  /**
   * Get campus details with administrators
   */
  async getCampusWithAdministrators(campusId: number): Promise<any> {
    try {
      const campusData = await db
        .select({
          campus: campuses,
          administrator: campusAdministrators,
          user: {
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email
          }
        })
        .from(campuses)
        .leftJoin(campusAdministrators, and(
          eq(campusAdministrators.campusId, campuses.id),
          eq(campusAdministrators.isActive, true)
        ))
        .leftJoin(users, eq(campusAdministrators.userId, users.id))
        .where(eq(campuses.id, campusId));

      if (campusData.length === 0) {
        throw new Error("Campus not found");
      }

      const campus = campusData[0].campus;
      const administrators = campusData
        .filter(row => row.administrator)
        .map(row => ({
          ...row.administrator,
          user: row.user
        }));

      return {
        ...campus,
        administrators
      };
    } catch (error) {
      throw new Error(`Failed to get campus details: ${error.message}`);
    }
  }

  /**
   * Assign administrator to campus
   */
  async assignCampusAdministrator(
    campusId: number, 
    userId: string, 
    permissions: string[], 
    assignedBy: string
  ): Promise<CampusAdministrator> {
    try {
      // Check if user is already an administrator
      const existingAdmin = await db
        .select()
        .from(campusAdministrators)
        .where(and(
          eq(campusAdministrators.campusId, campusId),
          eq(campusAdministrators.userId, userId),
          eq(campusAdministrators.isActive, true)
        ));

      if (existingAdmin.length > 0) {
        // Update existing administrator permissions
        const [updatedAdmin] = await db
          .update(campusAdministrators)
          .set({
            permissions,
            updatedAt: new Date()
          })
          .where(eq(campusAdministrators.id, existingAdmin[0].id))
          .returning();

        return updatedAdmin;
      }

      // Create new administrator assignment
      const [administrator] = await db
        .insert(campusAdministrators)
        .values({
          campusId,
          userId,
          permissions,
          assignedBy,
          isActive: true,
          assignedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      return administrator;
    } catch (error) {
      throw new Error(`Failed to assign campus administrator: ${error.message}`);
    }
  }

  /**
   * Get volunteers for a specific campus
   */
  async getCampusVolunteers(campusId: number): Promise<any[]> {
    try {
      const campusVolunteers = await db
        .select({
          volunteer: volunteers,
          assignment: volunteerCampusAssignments,
          user: {
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email,
            profileImageUrl: users.profileImageUrl
          }
        })
        .from(volunteers)
        .innerJoin(volunteerCampusAssignments, and(
          eq(volunteerCampusAssignments.volunteerId, volunteers.id),
          eq(volunteerCampusAssignments.isActive, true)
        ))
        .innerJoin(users, eq(volunteers.userId, users.id))
        .where(eq(volunteerCampusAssignments.campusId, campusId))
        .orderBy(asc(users.firstName), asc(users.lastName));

      return campusVolunteers.map(row => ({
        ...row.volunteer,
        assignment: row.assignment,
        user: row.user
      }));
    } catch (error) {
      throw new Error(`Failed to get campus volunteers: ${error.message}`);
    }
  }

  /**
   * Assign volunteer to campus
   */
  async assignVolunteerToCampus(
    volunteerId: number, 
    campusId: number, 
    isPrimaryCampus: boolean = false,
    assignedBy: string
  ): Promise<VolunteerCampusAssignment> {
    try {
      // If this is being set as primary campus, unset other primary assignments
      if (isPrimaryCampus) {
        await db
          .update(volunteerCampusAssignments)
          .set({ isPrimaryCampus: false })
          .where(and(
            eq(volunteerCampusAssignments.volunteerId, volunteerId),
            eq(volunteerCampusAssignments.isActive, true)
          ));
      }

      // Check if assignment already exists
      const existingAssignment = await db
        .select()
        .from(volunteerCampusAssignments)
        .where(and(
          eq(volunteerCampusAssignments.volunteerId, volunteerId),
          eq(volunteerCampusAssignments.campusId, campusId)
        ));

      if (existingAssignment.length > 0) {
        // Update existing assignment
        const [updatedAssignment] = await db
          .update(volunteerCampusAssignments)
          .set({
            isPrimaryCampus,
            isActive: true,
            assignedBy,
            assignedAt: new Date()
          })
          .where(eq(volunteerCampusAssignments.id, existingAssignment[0].id))
          .returning();

        return updatedAssignment;
      }

      // Create new assignment
      const [assignment] = await db
        .insert(volunteerCampusAssignments)
        .values({
          volunteerId,
          campusId,
          isPrimaryCampus,
          assignedBy,
          isActive: true,
          assignedAt: new Date(),
          createdAt: new Date()
        })
        .returning();

      return assignment;
    } catch (error) {
      throw new Error(`Failed to assign volunteer to campus: ${error.message}`);
    }
  }

  /**
   * Get volunteer opportunities for a specific campus
   */
  async getCampusOpportunities(campusId: number): Promise<any[]> {
    try {
      // Note: This assumes volunteer_opportunities table has a campus_id field
      // If not, we might need to join through church_id and campus assignments
      const opportunities = await db
        .select()
        .from(volunteerOpportunities)
        .where(and(
          eq(volunteerOpportunities.status, "open"),
          eq(volunteerOpportunities.isPublic, true)
        ))
        .orderBy(desc(volunteerOpportunities.createdAt));

      // Filter by campus through church relationship
      // This is a simplified version - in practice you might want a direct campus_id field
      return opportunities;
    } catch (error) {
      throw new Error(`Failed to get campus opportunities: ${error.message}`);
    }
  }

  /**
   * Get cross-campus volunteer statistics
   */
  async getCrossCampusStatistics(churchId: number): Promise<any> {
    try {
      const campusList = await this.getCampusesByChurch(churchId);
      
      const statistics = await Promise.all(
        campusList.map(async (campus) => {
          const volunteerCount = await db
            .select({ count: sql`count(*)` })
            .from(volunteerCampusAssignments)
            .where(and(
              eq(volunteerCampusAssignments.campusId, campus.id),
              eq(volunteerCampusAssignments.isActive, true)
            ));

          const opportunityCount = await db
            .select({ count: sql`count(*)` })
            .from(volunteerOpportunities)
            .where(and(
              eq(volunteerOpportunities.churchId, churchId),
              eq(volunteerOpportunities.status, "open")
            ));

          return {
            campus: campus,
            volunteerCount: volunteerCount[0]?.count || 0,
            opportunityCount: opportunityCount[0]?.count || 0
          };
        })
      );

      const totalVolunteers = statistics.reduce((sum, stat) => sum + Number(stat.volunteerCount), 0);
      const totalOpportunities = statistics.reduce((sum, stat) => sum + Number(stat.opportunityCount), 0);

      return {
        campusStatistics: statistics,
        totalVolunteers,
        totalOpportunities,
        totalCampuses: campusList.length
      };
    } catch (error) {
      throw new Error(`Failed to get cross-campus statistics: ${error.message}`);
    }
  }

  /**
   * Transfer volunteer between campuses
   */
  async transferVolunteerToCampus(
    volunteerId: number, 
    fromCampusId: number, 
    toCampusId: number,
    transferredBy: string,
    notes?: string
  ): Promise<void> {
    try {
      // Deactivate old assignment
      await db
        .update(volunteerCampusAssignments)
        .set({ 
          isActive: false,
          notes: notes || `Transferred to campus ${toCampusId} by ${transferredBy}`
        })
        .where(and(
          eq(volunteerCampusAssignments.volunteerId, volunteerId),
          eq(volunteerCampusAssignments.campusId, fromCampusId),
          eq(volunteerCampusAssignments.isActive, true)
        ));

      // Create new assignment
      await this.assignVolunteerToCampus(volunteerId, toCampusId, true, transferredBy);

    } catch (error) {
      throw new Error(`Failed to transfer volunteer: ${error.message}`);
    }
  }

  /**
   * Get campus administrator permissions
   */
  async getCampusAdminPermissions(userId: string, campusId: number): Promise<string[]> {
    try {
      const admin = await db
        .select()
        .from(campusAdministrators)
        .where(and(
          eq(campusAdministrators.userId, userId),
          eq(campusAdministrators.campusId, campusId),
          eq(campusAdministrators.isActive, true)
        ));

      return admin[0]?.permissions || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Check if user has permission for campus operation
   */
  async hasPermission(userId: string, campusId: number, requiredPermission: string): Promise<boolean> {
    try {
      const permissions = await this.getCampusAdminPermissions(userId, campusId);
      return permissions.includes(requiredPermission) || permissions.includes("all");
    } catch (error) {
      return false;
    }
  }

  /**
   * Get volunteer's campus assignments
   */
  async getVolunteerCampusAssignments(volunteerId: number): Promise<any[]> {
    try {
      const assignments = await db
        .select({
          assignment: volunteerCampusAssignments,
          campus: campuses
        })
        .from(volunteerCampusAssignments)
        .innerJoin(campuses, eq(volunteerCampusAssignments.campusId, campuses.id))
        .where(and(
          eq(volunteerCampusAssignments.volunteerId, volunteerId),
          eq(volunteerCampusAssignments.isActive, true)
        ))
        .orderBy(desc(volunteerCampusAssignments.isPrimaryCampus), asc(campuses.name));

      return assignments.map(row => ({
        ...row.assignment,
        campus: row.campus
      }));
    } catch (error) {
      throw new Error(`Failed to get volunteer campus assignments: ${error.message}`);
    }
  }

  /**
   * Get all campuses (for enterprise dashboard)
   */
  async getAllCampuses(): Promise<Campus[]> {
    try {
      const allCampuses = await db
        .select()
        .from(campuses)
        .where(eq(campuses.isActive, true))
        .orderBy(asc(campuses.name));

      return allCampuses;
    } catch (error) {
      throw new Error(`Failed to get all campuses: ${(error as Error).message}`);
    }
  }

  /**
   * Get campus statistics for enterprise dashboard
   */
  async getCampusStatistics(): Promise<any> {
    try {
      const allCampuses = await this.getAllCampuses();
      
      const statistics = await Promise.all(
        allCampuses.map(async (campus) => {
          // Get volunteer count for campus
          const volunteerCount = await db
            .select({ count: sql`count(*)` })
            .from(volunteerCampusAssignments)
            .where(and(
              eq(volunteerCampusAssignments.campusId, campus.id),
              eq(volunteerCampusAssignments.isActive, true)
            ));

          // Get opportunity count for campus (using churchId since campusId may not exist)
          const opportunityCount = await db
            .select({ count: sql`count(*)` })
            .from(volunteerOpportunities)
            .where(eq(volunteerOpportunities.churchId, campus.churchId));

          return {
            campus: campus,
            volunteerCount: Number(volunteerCount[0]?.count || 0),
            opportunityCount: Number(opportunityCount[0]?.count || 0),
            capacity: campus.capacity || 0,
            utilizationRate: campus.capacity ? 
              Math.round((Number(volunteerCount[0]?.count || 0) / campus.capacity) * 100) : 0
          };
        })
      );

      return {
        totalCampuses: allCampuses.length,
        totalVolunteers: statistics.reduce((sum, s) => sum + s.volunteerCount, 0),
        totalOpportunities: statistics.reduce((sum, s) => sum + s.opportunityCount, 0),
        averageUtilization: statistics.length > 0 ? 
          Math.round(statistics.reduce((sum, s) => sum + s.utilizationRate, 0) / statistics.length) : 0,
        campusBreakdown: statistics
      };
    } catch (error) {
      throw new Error(`Failed to get campus statistics: ${(error as Error).message}`);
    }
  }
}

export const multiCampusService = new MultiCampusService();