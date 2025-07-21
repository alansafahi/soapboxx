import { db } from "./db";
import { 
  volunteers, 
  volunteerRoles, 
  volunteerOpportunities,
  volunteerMatches,
  volunteerRegistrations,
  backgroundChecks,
  spiritualGifts,
  type Volunteer,
  type VolunteerRole,
  type VolunteerOpportunity,
  type VolunteerMatch,
  type InsertVolunteer,
  type InsertVolunteerRole,
  type InsertVolunteerOpportunity,
  type InsertVolunteerMatch,
  users
} from "@shared/schema";
import { eq, and, desc, asc, sql } from "drizzle-orm";

// D.I.V.I.N.E. Enhanced Volunteer Storage Methods

export class VolunteerStorage {
  
  // Volunteer Profile Management
  async createVolunteer(data: InsertVolunteer): Promise<Volunteer> {
    const [volunteer] = await db.insert(volunteers).values(data).returning();
    return volunteer;
  }

  async getVolunteerByUserId(userId: string): Promise<Volunteer | undefined> {
    try {
      const [volunteer] = await db
        .select()
        .from(volunteers)
        .where(eq(volunteers.userId, userId));
      return volunteer || undefined;
    } catch (error) {
      console.error('Error fetching volunteer by userId:', error);
      return undefined;
    }
  }

  async updateVolunteerProfile(volunteerId: number, updates: Partial<Volunteer>): Promise<Volunteer> {
    const [volunteer] = await db
      .update(volunteers)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(volunteers.id, volunteerId))
      .returning();
    return volunteer;
  }

  async updateSpiritualGiftsProfile(
    volunteerId: number, 
    spiritualGifts: string[], 
    scores: Record<string, number>,
    servingStyle: string,
    ministryPassion: string[]
  ): Promise<Volunteer> {
    const [volunteer] = await db
      .update(volunteers)
      .set({
        spiritualGifts,
        spiritualGiftsScore: scores,
        servingStyle,
        ministryPassion,
        updatedAt: new Date()
      })
      .where(eq(volunteers.id, volunteerId))
      .returning();
    return volunteer;
  }

  // Volunteer Opportunities Management
  async createVolunteerOpportunity(data: InsertVolunteerOpportunity): Promise<VolunteerOpportunity> {
    const [opportunity] = await db
      .insert(volunteerOpportunities)
      .values(data)
      .returning();
    return opportunity;
  }

  async getVolunteerOpportunities(churchId?: number): Promise<VolunteerOpportunity[]> {
    try {
      let query = db.select().from(volunteerOpportunities);
      
      if (churchId) {
        query = query.where(eq(volunteerOpportunities.churchId, churchId));
      }
      
      return await query.orderBy(desc(volunteerOpportunities.createdAt));
    } catch (error) {
      console.error('Error fetching volunteer opportunities:', error);
      return [];
    }
  }

  async getVolunteerOpportunityById(opportunityId: number): Promise<VolunteerOpportunity | undefined> {
    const [opportunity] = await db
      .select()
      .from(volunteerOpportunities)
      .where(eq(volunteerOpportunities.id, opportunityId));
    return opportunity;
  }

  // AI-Powered Matching System
  async saveVolunteerMatches(matches: InsertVolunteerMatch[]): Promise<VolunteerMatch[]> {
    if (matches.length === 0) return [];
    
    const savedMatches = await db
      .insert(volunteerMatches)
      .values(matches)
      .returning();
    return savedMatches;
  }

  async getVolunteerMatches(volunteerId: number): Promise<any[]> {
    const matches = await db
      .select({
        id: volunteerMatches.id,
        matchScore: volunteerMatches.matchScore,
        spiritualFitScore: volunteerMatches.spiritualFitScore,
        skillFitScore: volunteerMatches.skillFitScore,
        availabilityScore: volunteerMatches.availabilityScore,
        passionScore: volunteerMatches.passionScore,
        divineAppointmentScore: volunteerMatches.divineAppointmentScore,
        aiRecommendation: volunteerMatches.aiRecommendation,
        aiExplanation: volunteerMatches.aiExplanation,
        reasons: volunteerMatches.matchReasons,
        // Opportunity details
        opportunityId: volunteerOpportunities.id,
        opportunityTitle: volunteerOpportunities.title,
        opportunityDescription: volunteerOpportunities.description,
        ministry: sql<string>`'General Ministry'`,
        location: volunteerOpportunities.location,
        timeCommitment: sql<string>`'Flexible schedule'`,
        startDate: volunteerOpportunities.startDate,
        endDate: volunteerOpportunities.endDate,
        volunteersNeeded: volunteerOpportunities.volunteersNeeded,
        volunteersRegistered: volunteerOpportunities.volunteersRegistered,
        backgroundCheckRequired: sql<boolean>`false`,
        priority: volunteerOpportunities.priority,
        requiredSkills: volunteerOpportunities.requiredSkills,
        created: volunteerOpportunities.createdAt,
        // Coordinator details
        coordinatorId: users.id,
        coordinatorName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
        coordinatorEmail: users.email,
        roleId: volunteerOpportunities.roleId
      })
      .from(volunteerMatches)
      .innerJoin(volunteerOpportunities, eq(volunteerMatches.opportunityId, volunteerOpportunities.id))
      .leftJoin(users, eq(volunteerOpportunities.coordinatorId, users.id))
      .where(eq(volunteerMatches.volunteerId, volunteerId))
      .orderBy(desc(volunteerMatches.divineAppointmentScore));

    return matches.map(match => ({
      id: match.id,
      opportunityId: match.opportunityId,
      matchScore: match.matchScore,
      spiritualFitScore: match.spiritualFitScore,
      skillFitScore: match.skillFitScore,
      availabilityScore: match.availabilityScore,
      passionScore: match.passionScore,
      divineAppointmentScore: match.divineAppointmentScore,
      aiRecommendation: match.aiRecommendation,
      aiExplanation: match.aiExplanation,
      reasons: match.reasons,
      opportunity: {
        id: match.opportunityId,
        title: match.opportunityTitle,
        description: match.opportunityDescription,
        ministry: match.ministry,
        location: match.location,
        timeCommitment: match.timeCommitment,
        startDate: match.startDate,
        endDate: match.endDate,
        volunteersNeeded: match.volunteersNeeded,
        volunteersRegistered: match.volunteersRegistered,
        backgroundCheckRequired: match.backgroundCheckRequired,
        priority: match.priority,
        requiredSkills: match.requiredSkills,
        created: match.created,
        coordinatorName: match.coordinatorName,
        coordinatorEmail: match.coordinatorEmail,
        roleId: match.roleId
      }
    }));
  }

  async acceptVolunteerMatch(matchId: number, volunteerId: number): Promise<void> {
    // Update match response
    await db
      .update(volunteerMatches)
      .set({
        volunteerResponse: 'accepted',
        respondedAt: new Date()
      })
      .where(and(
        eq(volunteerMatches.id, matchId),
        eq(volunteerMatches.volunteerId, volunteerId)
      ));

    // Get the opportunity details
    const [match] = await db
      .select()
      .from(volunteerMatches)
      .where(eq(volunteerMatches.id, matchId));

    if (match) {
      // Register for the opportunity
      await db.insert(volunteerRegistrations).values({
        opportunityId: match.opportunityId,
        volunteerId: volunteerId,
        status: 'registered',
        notes: 'Registered via Divine Appointment AI matching'
      });

      // Update opportunity registration count
      await db
        .update(volunteerOpportunities)
        .set({
          volunteersRegistered: db.$count(volunteerRegistrations, eq(volunteerRegistrations.opportunityId, match.opportunityId))
        })
        .where(eq(volunteerOpportunities.id, match.opportunityId));
    }
  }

  // Volunteer Statistics and Analytics
  async getVolunteerStats(volunteerId: number): Promise<any> {
    const [volunteer] = await db
      .select()
      .from(volunteers)
      .where(eq(volunteers.id, volunteerId));

    if (!volunteer) return null;

    // Calculate additional stats from registrations and hours
    const registrationCount = await db.$count(
      volunteerRegistrations, 
      eq(volunteerRegistrations.volunteerId, volunteerId)
    );

    const completedCount = await db.$count(
      volunteerRegistrations, 
      and(
        eq(volunteerRegistrations.volunteerId, volunteerId),
        eq(volunteerRegistrations.status, 'completed')
      )
    );

    return {
      totalHours: volunteer.totalHoursServed || 0,
      monthlyHours: 0, // Would need date-based calculation
      livesTouched: volunteer.livesTouched || 0,
      kingdomImpactScore: volunteer.kingdomImpactScore || 0,
      servingStreak: volunteer.servingStreakDays || 0,
      totalOpportunities: registrationCount,
      completedOpportunities: completedCount,
      successRate: registrationCount > 0 ? (completedCount / registrationCount) * 100 : 0,
      lastServed: volunteer.lastServedDate
    };
  }

  // Spiritual Gifts Management
  async getSpiritualGifts(): Promise<any[]> {
    return await db
      .select()
      .from(spiritualGifts)
      .where(eq(spiritualGifts.isActive, true))
      .orderBy(asc(spiritualGifts.category), asc(spiritualGifts.name));
  }

  async initializeSpiritualGifts(): Promise<void> {
    const existingGifts = await db.select().from(spiritualGifts);
    
    if (existingGifts.length === 0) {
      const defaultGifts = [
        {
          name: 'Administration',
          category: 'ministry',
          description: 'The ability to organize, plan, and coordinate ministry activities with excellence',
          scriptureReference: '1 Corinthians 12:28',
          assessmentQuestions: ['I enjoy organizing people and resources for ministry projects', 'I excel at creating systems and procedures']
        },
        {
          name: 'Leadership',
          category: 'ministry',
          description: 'The gift to guide, direct, and inspire others toward spiritual growth and ministry goals',
          scriptureReference: 'Romans 12:8',
          assessmentQuestions: ['People naturally look to me for direction and guidance', 'I enjoy taking responsibility for group decisions']
        },
        {
          name: 'Teaching',
          category: 'spiritual',
          description: 'The ability to communicate biblical truths clearly and help others understand Scripture',
          scriptureReference: '1 Corinthians 12:28',
          assessmentQuestions: ['I love explaining biblical truths to help others understand', 'I enjoy studying Scripture in depth']
        },
        {
          name: 'Mercy',
          category: 'spiritual',
          description: 'The gift to show compassion and care for those who are suffering or in need',
          scriptureReference: 'Romans 12:8',
          assessmentQuestions: ['I am drawn to comfort and care for those who are suffering', 'I feel deeply for people in pain']
        },
        {
          name: 'Evangelism',
          category: 'spiritual',
          description: 'The gift to share the gospel effectively and lead others to faith in Christ',
          scriptureReference: 'Ephesians 4:11',
          assessmentQuestions: ['I enjoy sharing the gospel with non-believers', 'I have opportunities to lead people to Christ']
        },
        {
          name: 'Service',
          category: 'ministry',
          description: 'The gift to serve others with joy and meet practical needs in the church',
          scriptureReference: 'Romans 12:7',
          assessmentQuestions: ['I find joy in practical acts of service behind the scenes', 'I love helping with hands-on ministry tasks']
        },
        {
          name: 'Giving',
          category: 'ministry',
          description: 'The gift to contribute material resources generously and joyfully for ministry',
          scriptureReference: 'Romans 12:8',
          assessmentQuestions: ['I feel called to be generous with my resources for ministry', 'I give cheerfully and sacrificially']
        },
        {
          name: 'Hospitality',
          category: 'ministry',
          description: 'The gift to welcome others warmly and create environments where people feel loved',
          scriptureReference: '1 Peter 4:9',
          assessmentQuestions: ['I love welcoming and making people feel at home', 'I enjoy hosting and caring for guests']
        },
        {
          name: 'Encouragement',
          category: 'spiritual',
          description: 'The gift to uplift, motivate, and strengthen others in their faith journey',
          scriptureReference: 'Romans 12:8',
          assessmentQuestions: ['I naturally encourage and build up others in their faith', 'People feel better after talking with me']
        },
        {
          name: 'Discernment',
          category: 'spiritual',
          description: 'The ability to distinguish between truth and error, and spiritual authenticity',
          scriptureReference: '1 Corinthians 12:10',
          assessmentQuestions: ['I can often sense spiritual truth or deception', 'I have insight into spiritual matters']
        },
        {
          name: 'Wisdom',
          category: 'spiritual',
          description: 'The gift to apply biblical knowledge practically and give godly counsel',
          scriptureReference: '1 Corinthians 12:8',
          assessmentQuestions: ['People seek me out for wise counsel and advice', 'I often know the right thing to do in difficult situations']
        },
        {
          name: 'Faith',
          category: 'spiritual',
          description: 'The gift of extraordinary trust in God and His ability to work miracles',
          scriptureReference: '1 Corinthians 12:9',
          assessmentQuestions: ['I have strong faith that God will provide and work miracles', 'I believe God for the impossible']
        }
      ];

      await db.insert(spiritualGifts).values(defaultGifts);
    }
  }

  // Background Check Management
  async requestBackgroundCheck(volunteerId: number, checkType: string): Promise<any> {
    const backgroundCheck = await db.insert(backgroundChecks).values({
      volunteerId: volunteerId.toString(),
      provider: 'MinistrySafe', // Default provider
      checkType,
      status: 'pending',
      requestedAt: new Date(),
      cost: (checkType === 'basic' ? 25.00 : 45.00).toString()
    }).returning();

    return backgroundCheck[0];
  }

  async getBackgroundCheckStatus(volunteerId: number): Promise<any> {
    const [check] = await db
      .select()
      .from(backgroundChecks)
      .where(eq(backgroundChecks.volunteerId, volunteerId))
      .orderBy(desc(backgroundChecks.requestedAt));
    
    return check;
  }

  // Volunteer Registration Management
  async createVolunteerRegistration(data: any): Promise<any> {
    const [registration] = await db.insert(volunteerRegistrations).values({
      volunteerId: data.volunteerId,
      opportunityId: data.opportunityId,
      notes: data.notes,
      status: data.status || 'pending_approval',
      registeredAt: new Date()
    }).returning();

    return registration;
  }

  async getVolunteerRegistrations(volunteerId: number): Promise<any[]> {
    const registrations = await db
      .select({
        id: volunteerRegistrations.id,
        opportunityId: volunteerRegistrations.opportunityId,
        status: volunteerRegistrations.status,
        registeredAt: volunteerRegistrations.registeredAt,
        notes: volunteerRegistrations.notes,
        opportunityTitle: volunteerOpportunities.title,
        opportunityDescription: volunteerOpportunities.description,
        location: volunteerOpportunities.location,
        startDate: volunteerOpportunities.startDate,
        endDate: volunteerOpportunities.endDate
      })
      .from(volunteerRegistrations)
      .innerJoin(volunteerOpportunities, eq(volunteerRegistrations.opportunityId, volunteerOpportunities.id))
      .where(eq(volunteerRegistrations.volunteerId, volunteerId))
      .orderBy(desc(volunteerRegistrations.registeredAt));

    return registrations;
  }

  // Get pending registrations for admin approval
  async getPendingRegistrations(churchId?: number): Promise<any[]> {
    const pendingRegistrations = await db
      .select({
        id: volunteerRegistrations.id,
        volunteerId: volunteerRegistrations.volunteerId,
        opportunityId: volunteerRegistrations.opportunityId,
        status: volunteerRegistrations.status,
        registeredAt: volunteerRegistrations.registeredAt,
        notes: volunteerRegistrations.notes,
        opportunityTitle: volunteerOpportunities.title,
        opportunityDescription: volunteerOpportunities.description,
        location: volunteerOpportunities.location,
        startDate: volunteerOpportunities.startDate,
        endDate: volunteerOpportunities.endDate,
        volunteerName: volunteers.firstName,
        volunteerLastName: volunteers.lastName,
        volunteerEmail: volunteers.email
      })
      .from(volunteerRegistrations)
      .innerJoin(volunteerOpportunities, eq(volunteerRegistrations.opportunityId, volunteerOpportunities.id))
      .innerJoin(volunteers, eq(volunteerRegistrations.volunteerId, volunteers.id))
      .where(eq(volunteerRegistrations.status, 'pending_approval'))
      .orderBy(desc(volunteerRegistrations.registeredAt));

    return pendingRegistrations;
  }

  // Update registration status
  async updateRegistrationStatus(registrationId: number, status: string): Promise<any> {
    const [updatedRegistration] = await db
      .update(volunteerRegistrations)
      .set({ status })
      .where(eq(volunteerRegistrations.id, registrationId))
      .returning();

    return updatedRegistration;
  }

  // Helper methods for notifications
  async getVolunteerById(volunteerId: number): Promise<any> {
    const [volunteer] = await db
      .select()
      .from(volunteers)
      .where(eq(volunteers.id, volunteerId));
    return volunteer;
  }

  async getVolunteerOpportunity(opportunityId: number): Promise<any> {
    const [opportunity] = await db
      .select()
      .from(volunteerOpportunities)
      .where(eq(volunteerOpportunities.id, opportunityId));
    return opportunity;
  }

  // Ministry Team Management
  async getVolunteersByMinistry(ministry: string, churchId?: number): Promise<Volunteer[]> {
    let query = db
      .select()
      .from(volunteers)
      .where(eq(volunteers.status, 'active'));

    if (churchId) {
      query = query.where(and(
        eq(volunteers.status, 'active'),
        eq(volunteers.churchId, churchId)
      ));
    }

    const allVolunteers = await query;
    
    // Filter by ministry passion or current assignments
    return allVolunteers.filter(volunteer => 
      volunteer.ministryPassion?.includes(ministry) ||
      volunteer.preferredMinistries?.includes(ministry)
    );
  }
}

export const volunteerStorage = new VolunteerStorage();