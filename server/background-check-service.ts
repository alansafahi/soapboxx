import OpenAI from "openai";
import { db } from "./db";
import { 
  backgroundChecks, 
  backgroundCheckProviders, 
  backgroundCheckRequirements,
  volunteers,
  type BackgroundCheck,
  type InsertBackgroundCheck,
  type BackgroundCheckProvider
} from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// D.I.V.I.N.E. Phase 2: Enterprise Background Check Integration

interface MinistrySafeResponse {
  requestId: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  results?: {
    overallStatus: "approved" | "rejected" | "requires_review";
    findings: Array<{
      category: string;
      severity: "low" | "medium" | "high";
      description: string;
      disqualifying: boolean;
    }>;
    completedDate: string;
    expirationDate: string;
  };
}

export class BackgroundCheckService {
  
  /**
   * Request a background check for a volunteer
   */
  async requestBackgroundCheck(
    volunteerId: number, 
    checkType: string = "comprehensive",
    providerId?: number
  ): Promise<BackgroundCheck> {
    try {
      // Get volunteer information
      const [volunteer] = await db
        .select()
        .from(volunteers)
        .where(eq(volunteers.id, volunteerId));

      if (!volunteer) {
        throw new Error("Volunteer not found");
      }

      // Get provider (default to first active provider if not specified)
      let provider: BackgroundCheckProvider;
      if (providerId) {
        const [selectedProvider] = await db
          .select()
          .from(backgroundCheckProviders)
          .where(and(
            eq(backgroundCheckProviders.id, providerId),
            eq(backgroundCheckProviders.isActive, true)
          ));
        provider = selectedProvider;
      } else {
        const [defaultProvider] = await db
          .select()
          .from(backgroundCheckProviders)
          .where(eq(backgroundCheckProviders.isActive, true))
          .limit(1);
        provider = defaultProvider;
      }

      if (!provider) {
        throw new Error("No active background check provider found");
      }

      // For demo purposes, simulate API call to provider
      const externalId = `BGC_${Date.now()}_${volunteerId}`;
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 2); // 2 years from now

      // Create background check record
      const [backgroundCheck] = await db
        .insert(backgroundChecks)
        .values({
          volunteerId,
          provider: provider.name,
          externalId,
          checkType,
          status: "pending",
          requestedAt: new Date(),
          expiresAt,
          cost: provider.costPerCheck || "29.99",
          notes: `Background check requested via ${provider.name} API`
        })
        .returning();

      // In a real implementation, this would call the actual provider API
      await this.simulateProviderAPICall(backgroundCheck.id, provider);

      return backgroundCheck;

    } catch (error) {
      throw new Error(`Failed to request background check: ${error.message}`);
    }
  }

  /**
   * Check background check status and update if completed
   */
  async checkBackgroundCheckStatus(backgroundCheckId: number): Promise<BackgroundCheck> {
    try {
      const [backgroundCheck] = await db
        .select()
        .from(backgroundChecks)
        .where(eq(backgroundChecks.id, backgroundCheckId));

      if (!backgroundCheck) {
        throw new Error("Background check not found");
      }

      // In a real implementation, this would call the provider API to check status
      if (backgroundCheck.status === "pending") {
        // Simulate processing time - in real implementation this would be an actual API call
        const timeSinceRequest = Date.now() - new Date(backgroundCheck.requestedAt).getTime();
        const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;

        if (timeSinceRequest > threeDaysInMs) {
          // Simulate completion after 3 days
          const [updatedCheck] = await db
            .update(backgroundChecks)
            .set({
              status: "approved",
              completedAt: new Date(),
              results: {
                overallStatus: "approved",
                findings: [],
                completedDate: new Date().toISOString(),
                processingNotes: "Clean background check - no disqualifying findings"
              }
            })
            .where(eq(backgroundChecks.id, backgroundCheckId))
            .returning();

          return updatedCheck;
        }
      }

      return backgroundCheck;

    } catch (error) {
      throw new Error(`Failed to check background check status: ${error.message}`);
    }
  }

  /**
   * Get background check requirements for a volunteer opportunity
   */
  async getBackgroundCheckRequirements(opportunityId: number): Promise<any[]> {
    try {
      const requirements = await db
        .select()
        .from(backgroundCheckRequirements)
        .where(eq(backgroundCheckRequirements.opportunityId, opportunityId));

      return requirements;

    } catch (error) {
      throw new Error(`Failed to get background check requirements: ${error.message}`);
    }
  }

  /**
   * Check if volunteer meets background check requirements
   */
  async validateVolunteerBackgroundCheck(
    volunteerId: number, 
    opportunityId: number
  ): Promise<{
    isValid: boolean;
    missingChecks: string[];
    expiredChecks: string[];
    warnings: string[];
  }> {
    try {
      // Get requirements for this opportunity
      const requirements = await this.getBackgroundCheckRequirements(opportunityId);

      if (requirements.length === 0) {
        return {
          isValid: true,
          missingChecks: [],
          expiredChecks: [],
          warnings: []
        };
      }

      // Get volunteer's background checks
      const volunteerChecks = await db
        .select()
        .from(backgroundChecks)
        .where(and(
          eq(backgroundChecks.volunteerId, volunteerId),
          eq(backgroundChecks.status, "approved")
        ))
        .orderBy(desc(backgroundChecks.completedAt));

      const missingChecks: string[] = [];
      const expiredChecks: string[] = [];
      const warnings: string[] = [];

      for (const requirement of requirements) {
        if (!requirement.isRequired) continue;

        const matchingCheck = volunteerChecks.find(check => 
          check.checkType === requirement.checkType
        );

        if (!matchingCheck) {
          missingChecks.push(requirement.checkType);
        } else {
          // Check if expired
          const expirationDate = new Date(matchingCheck.expiresAt);
          const now = new Date();
          
          if (expirationDate <= now) {
            expiredChecks.push(requirement.checkType);
          } else {
            // Check if expiring soon (within grace period)
            const gracePeriodMs = (requirement.gracePeriodDays || 30) * 24 * 60 * 60 * 1000;
            const warningDate = new Date(expirationDate.getTime() - gracePeriodMs);
            
            if (now >= warningDate) {
              warnings.push(`${requirement.checkType} expires on ${expirationDate.toLocaleDateString()}`);
            }
          }
        }
      }

      const isValid = missingChecks.length === 0 && expiredChecks.length === 0;

      return {
        isValid,
        missingChecks,
        expiredChecks,
        warnings
      };

    } catch (error) {
      throw new Error(`Failed to validate background check: ${error.message}`);
    }
  }

  /**
   * Get volunteers with expiring background checks
   */
  async getExpiringBackgroundChecks(daysAhead: number = 30): Promise<any[]> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() + daysAhead);

      const expiringChecks = await db
        .select({
          backgroundCheck: backgroundChecks,
          volunteer: volunteers
        })
        .from(backgroundChecks)
        .innerJoin(volunteers, eq(backgroundChecks.volunteerId, volunteers.id))
        .where(and(
          eq(backgroundChecks.status, "approved"),
          eq(backgroundChecks.renewalReminder, true)
        ));

      return expiringChecks.filter(item => {
        const expirationDate = new Date(item.backgroundCheck.expiresAt);
        return expirationDate <= cutoffDate && expirationDate > new Date();
      });

    } catch (error) {
      throw new Error(`Failed to get expiring background checks: ${error.message}`);
    }
  }

  /**
   * Simulate provider API call for demo purposes
   */
  private async simulateProviderAPICall(backgroundCheckId: number, provider: BackgroundCheckProvider): Promise<void> {
    try {
      // Simulate API processing delay
      setTimeout(async () => {
        // In a real implementation, this would be triggered by a webhook
        // For now, we'll just mark it as in progress
        await db
          .update(backgroundChecks)
          .set({
            status: "in_progress",
            notes: `Processing with ${provider.name} - typically takes ${provider.averageProcessingDays} days`
          })
          .where(eq(backgroundChecks.id, backgroundCheckId));
      }, 1000);

    } catch (error) {
    }
  }

  /**
   * Handle webhook from background check provider
   */
  async handleProviderWebhook(payload: any): Promise<void> {
    try {
      // Parse provider webhook payload
      const { externalId, status, results } = payload;

      // Find background check by external ID
      const [backgroundCheck] = await db
        .select()
        .from(backgroundChecks)
        .where(eq(backgroundChecks.externalId, externalId));

      if (!backgroundCheck) {
        throw new Error("Background check not found");
      }

      // Update background check with results
      await db
        .update(backgroundChecks)
        .set({
          status: status,
          completedAt: status === "approved" || status === "rejected" ? new Date() : undefined,
          results: results,
          notes: results?.summary || "Background check completed"
        })
        .where(eq(backgroundChecks.id, backgroundCheck.id));

      // Send notification to volunteer and administrators
      await this.sendBackgroundCheckNotification(backgroundCheck.id, status);

    } catch (error) {
      throw new Error(`Failed to handle provider webhook: ${error.message}`);
    }
  }

  /**
   * Send notifications for background check status updates
   */
  private async sendBackgroundCheckNotification(backgroundCheckId: number, status: string): Promise<void> {
    try {
      // In a real implementation, this would send email/SMS notifications
      // For now, we'll just log the notification
      
      // This would integrate with the notification service
      // await notificationService.sendBackgroundCheckUpdate(backgroundCheckId, status);

    } catch (error) {
    }
  }
}

export const backgroundCheckService = new BackgroundCheckService();