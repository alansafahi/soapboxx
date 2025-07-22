import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ServeWell™ AI-Powered Volunteer Matching System

interface SpiritualGiftsProfile {
  gifts: string[];
  scores: Record<string, number>;
  servingStyle: string;
  ministryPassion: string[];
  personalityType: string;
}

interface VolunteerOpportunityRequirements {
  ministry: string;
  spiritualGifts: string[];
  requiredSkills: string[];
  timeCommitment: string;
  isLeadershipRole: boolean;
  backgroundCheckRequired: boolean;
}

interface DivineAppointmentMatch {
  volunteerId: number;
  opportunityId: number;
  matchScore: number;
  spiritualFitScore: number;
  skillFitScore: number;
  availabilityScore: number;
  passionScore: number;
  divineAppointmentScore: number;
  recommendation: 'highly_recommended' | 'recommended' | 'consider' | 'not_recommended';
  explanation: string;
  reasons: string[];
}

// Comprehensive Spiritual Gifts Assessment
export async function assessSpiritualGifts(responses: Record<string, number>): Promise<SpiritualGiftsProfile> {
  try {
    const prompt = `
    As a spiritual gifts assessment expert, analyze these survey responses and provide a comprehensive spiritual gifts profile.
    
    Survey responses (1-5 scale, 5 being strongest agreement):
    ${JSON.stringify(responses, null, 2)}
    
    Please provide analysis in this JSON format:
    {
      "gifts": ["primary", "secondary", "emerging_gifts"],
      "scores": {"gift_name": score_0_to_100},
      "servingStyle": "hands_on|behind_scenes|leadership|support",
      "ministryPassion": ["areas_of_calling"],
      "personalityType": "servant|leader|teacher|helper|encourager",
      "strengths": ["key_strengths"],
      "developmentAreas": ["growth_opportunities"],
      "idealServing": ["ministry_environments"],
      "scripture": "relevant_verse_reference"
    }
    
    Base assessment on biblical spiritual gifts: Administration, Apostleship, Discernment, 
    Evangelism, Exhortation, Faith, Giving, Helps, Hospitality, Knowledge, Leadership, 
    Mercy, Prophecy, Service, Teaching, Tongues, Interpretation, Wisdom, Healing, Miracles.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are a biblical spiritual gifts assessment expert. Provide accurate, encouraging, and scripturally-grounded spiritual gifts analysis."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    });

    const assessment = JSON.parse(response.choices[0].message.content);
    
    return {
      gifts: assessment.gifts,
      scores: assessment.scores,
      servingStyle: assessment.servingStyle,
      ministryPassion: assessment.ministryPassion,
      personalityType: assessment.personalityType
    };

  } catch (error) {
    
    throw new Error("Failed to assess spiritual gifts");
  }
}

// AI-Powered Divine Appointment Matching Algorithm
export async function findDivineAppointments(
  volunteer: any, 
  opportunities: any[]
): Promise<DivineAppointmentMatch[]> {
  try {
    const prompt = `
    As an AI-powered ministry matching expert, analyze this volunteer's profile and available opportunities 
    to find "Divine Appointments" - perfect ministry matches that align gifts, passion, and calling.

    VOLUNTEER PROFILE:
    ${JSON.stringify({
      spiritualGifts: volunteer.spiritualGifts,
      skills: volunteer.skills,
      ministryPassion: volunteer.ministryPassion,
      servingStyle: volunteer.servingStyle,
      availability: volunteer.availability,
      timeCommitmentLevel: volunteer.timeCommitmentLevel,
      personalityType: volunteer.personalityType
    }, null, 2)}

    OPPORTUNITIES:
    ${JSON.stringify(opportunities.map(opp => ({
      id: opp.id,
      title: opp.title,
      ministry: opp.ministry,
      spiritualGifts: opp.spiritualGifts,
      requiredSkills: opp.requiredSkills,
      timeCommitment: opp.timeCommitment,
      isLeadershipRole: opp.isLeadershipRole,
      backgroundCheckRequired: opp.backgroundCheckRequired
    })), null, 2)}

    For each opportunity, calculate match scores (0-1) and provide analysis in this JSON format:
    {
      "matches": [
        {
          "opportunityId": number,
          "matchScore": number,
          "spiritualFitScore": number,
          "skillFitScore": number,
          "availabilityScore": number,
          "passionScore": number,
          "divineAppointmentScore": number,
          "recommendation": "highly_recommended|recommended|consider|not_recommended",
          "explanation": "detailed_explanation",
          "reasons": ["specific_match_reasons"],
          "growthOpportunity": "how_this_serves_spiritual_development"
        }
      ]
    }

    Focus on spiritual alignment, kingdom impact potential, and personal growth opportunities.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert in Christian ministry placement and spiritual gifts matching. Find divine appointments where volunteers can maximize kingdom impact."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8
    });

    const analysis = JSON.parse(response.choices[0].message.content);
    
    return analysis.matches.map((match: any) => ({
      volunteerId: volunteer.id,
      opportunityId: match.opportunityId,
      matchScore: match.matchScore,
      spiritualFitScore: match.spiritualFitScore,
      skillFitScore: match.skillFitScore,
      availabilityScore: match.availabilityScore,
      passionScore: match.passionScore,
      divineAppointmentScore: match.divineAppointmentScore,
      recommendation: match.recommendation,
      explanation: match.explanation,
      reasons: match.reasons
    }));

  } catch (error) {
    
    throw new Error("Failed to find volunteer matches");
  }
}

// Ministry Team Composition Optimization
export async function optimizeTeamComposition(volunteers: any[], ministry: string): Promise<any> {
  try {
    const prompt = `
    As a ministry team optimization expert, analyze this team of volunteers for ${ministry} ministry 
    and provide recommendations for optimal team composition and role assignments.

    TEAM MEMBERS:
    ${JSON.stringify(volunteers.map(v => ({
      id: v.id,
      name: `${v.firstName} ${v.lastName}`,
      spiritualGifts: v.spiritualGifts,
      servingStyle: v.servingStyle,
      personalityType: v.personalityType,
      skills: v.skills,
      experience: v.totalHoursServed
    })), null, 2)}

    Provide team optimization analysis in this JSON format:
    {
      "teamStrengths": ["identified_strengths"],
      "teamGaps": ["areas_needing_attention"],
      "roleAssignments": [
        {
          "volunteerId": number,
          "recommendedRole": "role_title",
          "rationale": "why_this_assignment",
          "giftUtilization": ["gifts_being_used"]
        }
      ],
      "teamDynamics": "overall_team_compatibility_assessment",
      "recruitmentNeeds": ["specific_spiritual_gifts_or_skills_needed"],
      "developmentOpportunities": ["team_growth_suggestions"]
    }

    Focus on spiritual gifts complement, leadership development, and ministry effectiveness.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert in Christian ministry team building and spiritual gifts-based role assignment."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    });

    return JSON.parse(response.choices[0].message.content);

  } catch (error) {
    
    throw new Error("Failed to optimize team composition");
  }
}

// Volunteer Onboarding Path Recommendation
export async function recommendOnboardingPath(volunteer: any): Promise<any> {
  try {
    const prompt = `
    As a volunteer development expert, create a personalized onboarding and growth path 
    for this new volunteer based on their spiritual gifts and ministry interests.

    VOLUNTEER PROFILE:
    ${JSON.stringify({
      spiritualGifts: volunteer.spiritualGifts,
      ministryPassion: volunteer.ministryPassion,
      servingStyle: volunteer.servingStyle,
      timeCommitmentLevel: volunteer.timeCommitmentLevel,
      skills: volunteer.skills
    }, null, 2)}

    Provide personalized onboarding recommendations in this JSON format:
    {
      "welcomeMessage": "personalized_welcome",
      "orientationFocus": ["key_areas_to_emphasize"],
      "trainingRecommendations": [
        {
          "training": "training_name",
          "priority": "high|medium|low",
          "rationale": "why_this_training"
        }
      ],
      "mentoringMatch": "ideal_mentor_characteristics",
      "earlyOpportunities": [
        {
          "opportunity": "starting_role",
          "duration": "recommended_timeframe",
          "goals": ["specific_learning_objectives"]
        }
      ],
      "developmentPath": [
        {
          "phase": "phase_name",
          "timeline": "timeframe",
          "focus": "development_focus",
          "milestones": ["key_achievements"]
        }
      ]
    }

    Focus on spiritual growth, skill development, and progressive ministry involvement.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert in volunteer development and Christian discipleship through service."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8
    });

    return JSON.parse(response.choices[0].message.content);

  } catch (error) {
    
    throw new Error("Failed to recommend onboarding path");
  }
}