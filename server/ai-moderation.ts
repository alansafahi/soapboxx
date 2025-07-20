import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ModerationResult {
  flagged: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  violations: string[];
  reason: string;
  confidence: number;
  actionRequired: 'none' | 'review' | 'hide' | 'remove';
  learningNote?: string;
  mediaAnalysis?: {
    type: 'image' | 'video';
    description: string;
    concerns: string[];
  };
}

export async function analyzeContentForViolations(
  content: string, 
  contentType: string, 
  mediaUrl?: string, 
  mediaType?: 'image' | 'video'
): Promise<ModerationResult> {
  try {
    let messages: any[] = [];
    
    if (mediaUrl && mediaType) {
      // Multi-modal analysis for images/videos
      const mediaPrompt = `
You are a content moderation AI for a faith-based community platform. Analyze this ${contentType} with ${mediaType} content for violations and respond with JSON only.

Text content: "${content}"
${mediaType === 'image' ? 'Image attached for analysis.' : 'Video thumbnail/frame attached for analysis.'}`;

      messages = [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: mediaPrompt
            },
            {
              type: "image_url",
              image_url: {
                url: mediaUrl,
                detail: "high"
              }
            }
          ]
        }
      ];
    } else {
      // Text-only analysis
      const prompt = `
You are a content moderation AI for a faith-based community platform. Analyze this ${contentType} content for violations and respond with JSON only.

Content to analyze: "${content}"`;

      messages = [{ role: "user", content: prompt }];
    }

    const evaluationPrompt = `
You are an advanced AI content moderator for a faith-based community platform. Use this EXACT classification system:

🛑 CRITICAL (Immediate Removal & Review) - actionRequired: "remove":
- Sexual Content: "Looking for a hookup after church", explicit sexual requests/solicitation
- Inappropriate Content: Blasphemy, "Jesus was a fraud. Christians are sheep"
- Harassment/Bullying: Personal attacks, "Everyone should avoid John. He's a pervert"
- False Information: "Tithing is optional. Jesus never told anyone to give"
- Privacy Violation: Sharing personal info, addresses, phone numbers
- Spam: "Buy Bitcoin now! Click here to invest with me"
- Violence threats (bombs, killing, weapons, harm, destruction)
- Predatory behavior toward minors ("young ones", grooming language)

🔶 HIGH (Likely Harmful or Spiritually Disruptive) - actionRequired: "hide":
- Sexual Content: "Is it okay if I post thirst traps as long as I quote scripture?"
- Inappropriate Content: "The Bible supports slavery. Read it again"
- Harassment/Bullying: "The youth group is full of losers and sinners"
- False Information: "Prayer is more powerful than medicine. Don't take pills—just pray"
- Privacy Violation: "That user's real name is Sarah Smith, she lives in Fresno"
- Spam: "Join my crypto church—Jesus loves passive income"

🟡 MEDIUM (Unhelpful or Distracting) - actionRequired: "review":
- Sexual Content: "Can Christian couples use sex toys? Just asking here"
- Inappropriate Content: "Catholics aren't real Christians"
- Harassment/Bullying: "You're obviously not a real believer if you feel depressed"
- False Information: "The rapture is happening next Friday. Be ready!"
- Privacy Violation: "I saw Pastor at a bar last night—posting this anonymously"
- Spam: "Check out my YouTube channel where I expose all church pastors"

🟢 LOW (Minor Issues or Off-topic) - actionRequired: "review":
- Sexual Content: "Is attraction a sin?"
- Inappropriate Content: "I feel like sermons are boring sometimes"
- Harassment/Bullying: "Your prayer request seems dramatic. Just my opinion"
- False Information: "Jesus probably spoke English, right?"
- Spam: "Come to our revival event! Free pizza"

SPECIAL RULES:
- Any personal info sharing (phone numbers, addresses, SSN, bank info) = CRITICAL
- Devil worship, satan worship solicitation = CRITICAL
- Adult targeting minors ("young ones", "kids") = CRITICAL
- Explicit sexual content + any text = CRITICAL
- Multiple minor violations can elevate to higher priority

Respond with JSON:
{
  "flagged": boolean,
  "priority": "low" | "medium" | "high" | "critical",
  "violations": ["specific violations found"],
  "reason": "primary violation category", 
  "confidence": 0.0-1.0,
  "actionRequired": "none" | "review" | "hide" | "remove",
  "learningNote": "what this case teaches about classification"
}`;

    // Add evaluation prompt to the message content
    if (mediaUrl && mediaType) {
      messages[0].content[0].text += evaluationPrompt;
    } else {
      messages[0].content += evaluationPrompt;
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages,
      response_format: { type: "json_object" },
      max_tokens: 600, // Increased for media analysis
      temperature: 0.3 // Lower temperature for consistent moderation decisions
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    // Validate and sanitize the response  
    const moderationResult: ModerationResult = {
      flagged: Boolean(result.flagged),
      priority: ['low', 'medium', 'high', 'critical'].includes(result.priority) ? result.priority : 'medium',
      violations: Array.isArray(result.violations) ? result.violations : [],
      reason: typeof result.reason === 'string' ? result.reason : 'other',
      confidence: typeof result.confidence === 'number' ? Math.max(0, Math.min(1, result.confidence)) : 0.5,
      actionRequired: ['none', 'review', 'hide', 'remove'].includes(result.actionRequired) ? result.actionRequired : 'none',
      learningNote: result.learningNote || ''
    };

    // Add media analysis if provided
    if (result.mediaAnalysis && mediaType) {
      moderationResult.mediaAnalysis = {
        type: mediaType,
        description: typeof result.mediaAnalysis.description === 'string' ? result.mediaAnalysis.description : 'Media content analyzed',
        concerns: Array.isArray(result.mediaAnalysis.concerns) ? result.mediaAnalysis.concerns : []
      };
    }

    return moderationResult;

  } catch (error) {
    // // console.error('AI moderation analysis failed:', error);
    // Return safe fallback
    return {
      flagged: false,
      priority: 'medium',
      violations: [],
      reason: 'analysis_failed',
      confidence: 0,
      actionRequired: 'none'
    };
  }
}

export async function createAutoModerationReport(
  storage: any,
  contentType: string,
  contentId: number,
  moderationResult: ModerationResult,
  systemUserId: string = 'ai-moderation'
): Promise<void> {
  if (!moderationResult.flagged) return;

  try {
    // Get or create system user for AI moderation
    let systemUser = await storage.getUserById(systemUserId);
    if (!systemUser) {
      // Create system user for AI moderation if doesn't exist
      systemUser = await storage.createUser({
        email: 'ai-moderation@soapboxsuperapp.com',
        id: systemUserId,
        firstName: 'AI',
        lastName: 'Moderation',
        role: 'system_admin'
      });
    }

    await storage.createContentReport({
      reporterId: systemUserId,
      contentType,
      contentId,
      reason: moderationResult.reason,
      description: `AI-detected violation: ${moderationResult.violations.join(', ')} (Confidence: ${(moderationResult.confidence * 100).toFixed(1)}%)`,
      priority: moderationResult.priority,
      isAutoGenerated: true
    });

    // Take immediate action for high priority violations - CRITICAL CHILD PROTECTION
    if (moderationResult.actionRequired === 'hide' || moderationResult.actionRequired === 'remove') {
      // // console.log(`🚨 URGENT: Auto-hiding ${contentType} #${contentId} - Priority: ${moderationResult.priority} - Reason: ${moderationResult.reason}`);
      await storage.hideContent(
        contentType, 
        contentId, 
        `Auto-moderation: ${moderationResult.reason} (${moderationResult.violations.join(', ')})`,
        systemUserId
      );
      // // console.log(`✅ Content automatically hidden for child protection`);
    }
  } catch (error) {
    // // console.error('Failed to create auto-moderation report:', error);
  }
}