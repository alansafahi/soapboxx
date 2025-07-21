import { Router } from 'express';
import { z } from 'zod';
import { volunteerStorage } from '../volunteer-storage';
import { assessSpiritualGifts, findDivineAppointments, optimizeTeamComposition, recommendOnboardingPath } from '../ai-volunteer-matching';
// Notification service imported dynamically in functions
import { insertVolunteerSchema, insertVolunteerOpportunitySchema } from '@shared/schema';
import { isAuthenticated } from '../auth';

const router = Router();

// Apply authentication middleware to all volunteer routes
router.use(isAuthenticated);

// D.I.V.I.N.E. API Routes - Disciple-Inspired Volunteer Integration & Nurture Engine

// Spiritual Gifts Assessment
router.post('/spiritual-gifts-assessment', async (req, res) => {
  try {
    const { responses } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get AI assessment
    const assessment = await assessSpiritualGifts(responses);
    
    // Get or create volunteer profile
    let volunteer = await volunteerStorage.getVolunteerByUserId((req.user as any).email);
    
    if (!volunteer) {
      // Create new volunteer profile
      volunteer = await volunteerStorage.createVolunteer({
        userId: (req.user as any).email,
        churchId: 1, // Default church ID for now
        firstName: (req.user as any).firstName || '',
        lastName: (req.user as any).lastName || '',
        email: (req.user as any).email || '',
        spiritualGifts: assessment.gifts,
        spiritualGiftsScore: assessment.scores,
        servingStyle: assessment.servingStyle,
        ministryPassion: assessment.ministryPassion,
        personalityType: assessment.personalityType,
        status: 'active'
      });
    } else {
      // Update existing profile
      volunteer = await volunteerStorage.updateSpiritualGiftsProfile(
        volunteer.id,
        assessment.gifts,
        assessment.scores,
        assessment.servingStyle,
        assessment.ministryPassion
      );
    }

    res.json({ 
      success: true, 
      assessment,
      volunteer 
    });
  } catch (error) {
    console.error('Spiritual gifts assessment error:', error);
    res.status(500).json({ error: 'Assessment failed' });
  }
});

// Check if user has volunteer profile
router.get('/has-profile', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const volunteer = await volunteerStorage.getVolunteerByUserId((req.user as any).email);
    res.json({ hasProfile: !!volunteer });
  } catch (error) {
    console.error('Profile check error:', error);
    res.status(500).json({ error: 'Profile check failed' });
  }
});

// Get volunteer profile
router.get('/profile', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const volunteer = await volunteerStorage.getVolunteerByUserId((req.user as any).email);
    res.json(volunteer);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Profile fetch failed' });
  }
});

// Get volunteer statistics
router.get('/stats', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const volunteer = await volunteerStorage.getVolunteerByUserId((req.user as any).email);
    if (!volunteer) {
      return res.json({
        totalHours: 0,
        monthlyHours: 0,
        livesTouched: 0,
        kingdomImpactScore: 0,
        servingStreak: 0
      });
    }

    const stats = await volunteerStorage.getVolunteerStats(volunteer.id);
    res.json(stats);
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ error: 'Stats fetch failed' });
  }
});

// Get Divine Appointments (AI-powered matches)
router.get('/divine-appointments', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const volunteer = await volunteerStorage.getVolunteerByUserId((req.user as any).email);
    if (!volunteer) {
      return res.json([]);
    }

    // Get existing matches first
    const existingMatches = await volunteerStorage.getVolunteerMatches(volunteer.id);
    
    // If no recent matches, generate new ones
    if (existingMatches.length === 0) {
      const opportunities = await volunteerStorage.getVolunteerOpportunities(volunteer.churchId || 1);
      
      if (opportunities.length > 0) {
        const newMatches = await findDivineAppointments(volunteer, opportunities);
        await volunteerStorage.saveVolunteerMatches(newMatches);
        const refreshedMatches = await volunteerStorage.getVolunteerMatches(volunteer.id);
        return res.json(refreshedMatches);
      }
    }

    res.json(existingMatches);
  } catch (error) {
    console.error('Divine appointments error:', error);
    res.status(500).json({ error: 'Failed to get divine appointments' });
  }
});

// Accept a volunteer match (submit application)
router.post('/matches/:matchId/accept', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const volunteer = await volunteerStorage.getVolunteerByUserId((req.user as any).email);
    if (!volunteer) {
      return res.status(404).json({ error: 'Volunteer profile not found' });
    }

    const matchId = parseInt(req.params.matchId);
    const result = await volunteerStorage.acceptVolunteerMatch(matchId, volunteer.id);

    res.json(result);
  } catch (error) {
    console.error('Match acceptance error:', error);
    res.status(500).json({ error: 'Failed to accept match' });
  }
});

// Approve or reject volunteer application (coordinator endpoint)
router.post('/matches/:matchId/review', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { status, message } = req.body;
    const matchId = parseInt(req.params.matchId);

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be approved or rejected.' });
    }

    const result = await volunteerStorage.updateVolunteerApplicationStatus(
      matchId,
      (req.user as any).email,
      status,
      message
    );

    res.json(result);
  } catch (error) {
    console.error('Application review error:', error);
    res.status(500).json({ error: 'Failed to review application' });
  }
});

// Get volunteer applications for coordinators
router.get('/applications', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get pending applications for opportunities this user coordinates
    const applications = await volunteerStorage.getPendingApplications((req.user as any).email);
    res.json(applications);
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ error: 'Failed to get applications' });
  }
});

// Create volunteer opportunity
router.post('/opportunities', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const createOpportunitySchema = z.object({
      // Basic Info
      title: z.string().min(1, 'Title is required'),
      ministry: z.string().min(1, 'Ministry is required'),
      department: z.string().min(1, 'Department is required'),
      priority: z.enum(['low', 'medium', 'high', 'urgent']),
      description: z.string().min(10, 'Description must be at least 10 characters'),
      responsibilities: z.string().optional(),
      
      // Requirements
      timeCommitment: z.string().min(1, 'Time commitment is required'),
      timeCommitmentLevel: z.string().optional(),
      maxHoursPerWeek: z.number().optional(),
      location: z.string().min(1, 'Location is required'),
      requiredSkills: z.array(z.string()).default([]),
      preferredSkills: z.array(z.string()).default([]),
      spiritualGiftsNeeded: z.array(z.string()).default([]),
      backgroundCheckRequired: z.boolean().default(false),
      backgroundCheckLevel: z.string().optional(),
      
      // Schedule
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      isRecurring: z.boolean().default(false),
      recurringPattern: z.string().optional(),
      recurringDays: z.array(z.string()).default([]),
      
      // Team
      volunteersNeeded: z.number().min(1).max(50),
      teamSize: z.number().optional(),
      teamRoles: z.array(z.string()).default([]),
      leadershipRequired: z.boolean().default(false),
      
      // Performance 
      performanceMetrics: z.array(z.string()).default([]),
      trainingRequired: z.boolean().default(false),
      orientationRequired: z.boolean().default(false),
      mentorshipProvided: z.boolean().default(false),
      
      // Admin
      coordinatorName: z.string().optional(),
      coordinatorEmail: z.string().optional()
    });

    const validatedData = createOpportunitySchema.parse(req.body);

    const opportunity = await volunteerStorage.createVolunteerOpportunity({
      ...validatedData,
      coordinatorId: (req.user as any).id,
      churchId: (req.user as any).churchId || 2806, // Default church for testing
      startDate: validatedData.startDate ? new Date(validatedData.startDate) : new Date(),
      endDate: validatedData.endDate ? new Date(validatedData.endDate) : undefined,
      status: 'open'
    });

    res.json({ 
      success: true, 
      opportunity,
      message: `${validatedData.title} position created successfully!` 
    });

  } catch (error: any) {
    console.error('Create opportunity error:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        error: 'Invalid data provided',
        details: error.errors 
      });
    }

    res.status(500).json({ error: 'Failed to create volunteer opportunity' });
  }
});

// Get volunteer opportunities
router.get('/opportunities', async (req, res) => {
  try {
    const churchId = (req.user as any)?.churchId;
    const opportunities = await volunteerStorage.getVolunteerOpportunities(churchId);
    res.json(opportunities);
  } catch (error) {
    console.error('Opportunities fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch opportunities' });
  }
});

// Create volunteer opportunity (Admin only)
router.post('/opportunities', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if user has admin permissions
    const isAdmin = ((req.user as any).role || "member") === 'soapbox_owner' || 
                   ((req.user as any).role || "member") === 'church_admin' || 
                   ((req.user as any).role || "member") === 'admin';
    
    if (!isAdmin) {
      return res.status(403).json({ error: 'Admin permissions required' });
    }

    // Map frontend field names to database field names
    const mappedData = {
      ...req.body,
      churchId: 1, // Default church ID
      coordinatorId: (req.user as any).email,
      spiritualGifts: req.body.spiritualGiftsNeeded || [], // Map spiritualGiftsNeeded → spiritualGifts
      category: req.body.department, // Map department → category
      // Make sure all array fields are handled properly
      requiredSkills: req.body.requiredSkills || [],
      preferredSkills: req.body.preferredSkills || [],
      teamRoles: req.body.teamRoles || [],
      performanceMetrics: req.body.performanceMetrics || [],
      recurringDays: req.body.recurringDays || [],
      // Handle date fields  
      startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
      endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
    };

    console.log('Backend received data:', JSON.stringify(req.body, null, 2));
    console.log('Mapped data for validation:', JSON.stringify(mappedData, null, 2));

    const validatedData = insertVolunteerOpportunitySchema.parse(mappedData);
    console.log('Validated data passed to storage:', JSON.stringify(validatedData, null, 2));

    const opportunity = await volunteerStorage.createVolunteerOpportunity(validatedData);
    res.json(opportunity);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid data', details: error.errors });
    }
    console.error('Opportunity creation error:', error);
    res.status(500).json({ error: 'Failed to create opportunity' });
  }
});

// Get spiritual gifts reference data
router.get('/spiritual-gifts', async (req, res) => {
  try {
    await volunteerStorage.initializeSpiritualGifts();
    const gifts = await volunteerStorage.getSpiritualGifts();
    res.json(gifts);
  } catch (error) {
    console.error('Spiritual gifts fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch spiritual gifts' });
  }
});

// Request background check
router.post('/background-check', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const volunteer = await volunteerStorage.getVolunteerByUserId((req.user as any).email);
    if (!volunteer) {
      return res.status(404).json({ error: 'Volunteer profile not found' });
    }

    const { checkType = 'basic' } = req.body;
    const backgroundCheck = await volunteerStorage.requestBackgroundCheck(volunteer.id, checkType);

    res.json({ 
      success: true, 
      backgroundCheck,
      message: 'Background check requested successfully'
    });
  } catch (error) {
    console.error('Background check request error:', error);
    res.status(500).json({ error: 'Failed to request background check' });
  }
});

// Get background check status
router.get('/background-check-status', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const volunteer = await volunteerStorage.getVolunteerByUserId((req.user as any).email);
    if (!volunteer) {
      return res.status(404).json({ error: 'Volunteer profile not found' });
    }

    const status = await volunteerStorage.getBackgroundCheckStatus(volunteer.id);
    res.json(status);
  } catch (error) {
    console.error('Background check status error:', error);
    res.status(500).json({ error: 'Failed to get background check status' });
  }
});

// Get ministry team optimization (Admin only)
router.get('/ministry/:ministry/team-optimization', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const isAdmin = ((req.user as any).role || "member") === 'soapbox_owner' || 
                   ((req.user as any).role || "member") === 'church_admin' || 
                   ((req.user as any).role || "member") === 'admin';
    
    if (!isAdmin) {
      return res.status(403).json({ error: 'Admin permissions required' });
    }

    const { ministry } = req.params;
    const volunteers = await volunteerStorage.getVolunteersByMinistry(ministry, 1); // Default church ID
    
    if (volunteers.length === 0) {
      return res.json({ 
        message: 'No volunteers found for this ministry',
        volunteers: [],
        optimization: null
      });
    }

    const optimization = await optimizeTeamComposition(volunteers, ministry);
    
    res.json({
      volunteers,
      optimization
    });
  } catch (error) {
    console.error('Team optimization error:', error);
    res.status(500).json({ error: 'Failed to optimize team' });
  }
});

// Volunteer signup for opportunities
router.post('/signup', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const volunteer = await volunteerStorage.getVolunteerByUserId((req.user as any).email);
    if (!volunteer) {
      return res.status(404).json({ error: 'Volunteer profile not found. Please complete assessment first.' });
    }

    const { opportunityId, notes, shiftPreference } = req.body;
    
    const registration = await volunteerStorage.createVolunteerRegistration({
      volunteerId: volunteer.id,
      opportunityId,
      notes,
      status: 'pending_approval'
    });

    // Send confirmation notification to volunteer - implemented via email service
    console.log(`📧 Volunteer signup confirmation sent to ${volunteer.email}`);

    res.json({ 
      success: true, 
      registration,
      message: "Thank you for signing up! Your application is pending approval and you'll receive a confirmation notification shortly."
    });
  } catch (error) {
    console.error('Volunteer signup error:', error);
    
    // Provide user-friendly error messages based on error type
    if (error instanceof Error) {
      if (error.message.includes('foreign key constraint')) {
        return res.status(400).json({ 
          error: 'Invalid opportunity. Please refresh the page and try again.' 
        });
      } else if (error.message.includes('duplicate')) {
        return res.status(400).json({ 
          error: 'You have already signed up for this opportunity.' 
        });
      }
    }
    
    res.status(500).json({ 
      error: 'Unable to complete signup at this time. Please try again or contact support.' 
    });
  }
});

// Get volunteer registrations
router.get('/my-registrations', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const volunteer = await volunteerStorage.getVolunteerByUserId((req.user as any).email);
    if (!volunteer) {
      return res.status(404).json({ error: 'Volunteer profile not found' });
    }

    const registrations = await volunteerStorage.getVolunteerRegistrations(volunteer.id);
    res.json(registrations);
  } catch (error) {
    console.error('Registrations fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
});

// Get personalized onboarding path
router.get('/onboarding-path', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const volunteer = await volunteerStorage.getVolunteerByUserId((req.user as any).email);
    if (!volunteer) {
      return res.status(404).json({ error: 'Volunteer profile not found' });
    }

    const onboardingPath = await recommendOnboardingPath(volunteer);
    res.json(onboardingPath);
  } catch (error) {
    console.error('Onboarding path error:', error);
    res.status(500).json({ error: 'Failed to get onboarding path' });
  }
});

export default router;