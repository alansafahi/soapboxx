import { Router } from 'express';
import { z } from 'zod';
import { volunteerStorage } from '../volunteer-storage';
import { assessSpiritualGifts, findDivineAppointments, optimizeTeamComposition, recommendOnboardingPath } from '../ai-volunteer-matching';
import { volunteerNotificationService } from '../volunteer-notifications';
import { insertVolunteerSchema, insertVolunteerOpportunitySchema } from '@shared/schema';

const router = Router();

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

// Accept a volunteer match
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
    await volunteerStorage.acceptVolunteerMatch(matchId, volunteer.id);

    res.json({ success: true, message: 'Divine appointment accepted!' });
  } catch (error) {
    console.error('Match acceptance error:', error);
    res.status(500).json({ error: 'Failed to accept match' });
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

    const validatedData = insertVolunteerOpportunitySchema.parse({
      ...req.body,
      churchId: 1, // Default church ID
      coordinatorId: (req.user as any).email
    });

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

    // Send confirmation notification to volunteer
    await volunteerNotificationService.sendVolunteerSignupConfirmation(volunteer.id, opportunityId);
    
    // Notify church admins of new signup
    await volunteerNotificationService.notifyAdminsOfVolunteerSignup(registration.id, volunteer.id, opportunityId);

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