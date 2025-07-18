import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ModerationResult {
  flagged: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  violations: string[];
  reason: string;
  confidence: number;
  actionRequired: 'none' | 'review' | 'hide' | 'remove';
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
Evaluate for these violation categories with their priority levels:

HIGH PRIORITY (immediate action required):
- Violence threats (specific threats of bombs, killing, weapons, harm, destruction)
- Harassment or bullying (direct targeting, intimidating behavior)
- Sexual content (explicit sexual solicitation, nudity, sexual poses, sexual activity, pornographic material, inappropriate sexual comments, suggestive imagery)
- Predatory behavior toward minors (adults specifically targeting children inappropriately, grooming language)
- Hate speech or discrimination (faith, race, gender based)
- Blasphemous or profane misuse of Scripture

CRITICAL PROTECTION: Content with explicit sexual solicitation (like "take off your clothes"), predatory targeting of minors, violent threats, OR sexual/suggestive images (nudity, sexual poses, explicit content) must be flagged as HIGH priority and actionRequired: "hide"

IMPORTANT: Text + image combinations must be analyzed together. Even innocent text like "Call me!" becomes inappropriate when combined with sexual/explicit images. Always examine both text and visual content for violations.

MEDIUM PRIORITY (review needed):
- Misinformation (false religious information, misquoted scripture)
- Privacy violations (sharing personal info without consent)
- Impersonation of pastors or church staff
- Theological disagreements that are escalating in tone

LOW PRIORITY (automated handling):
- Spam (repetitive content, promotional material)
- Off-topic posts
- Suspicious external links

Respond with JSON in this format:
{
  "flagged": boolean,
  "priority": "low" | "medium" | "high",
  "violations": ["array of specific violations found"],
  "reason": "primary violation category",
  "confidence": 0.0-1.0,
  "actionRequired": "none" | "review" | "hide" | "remove",
  "mediaAnalysis": {
    "type": "image" | "video",
    "description": "brief description of visual content",
    "concerns": ["specific visual concerns if any"]
  }
}

For HIGH priority: set actionRequired to "hide"
For MEDIUM priority: set actionRequired to "review" 
For LOW priority: set actionRequired to "review"
If no violations: set actionRequired to "none"
`;

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
      actionRequired: ['none', 'review', 'hide', 'remove'].includes(result.actionRequired) ? result.actionRequired : 'none'
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
    console.error('AI moderation analysis failed:', error);
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
      console.log(`🚨 URGENT: Auto-hiding ${contentType} #${contentId} - Priority: ${moderationResult.priority} - Reason: ${moderationResult.reason}`);
      await storage.hideContent(
        contentType, 
        contentId, 
        `Auto-moderation: ${moderationResult.reason} (${moderationResult.violations.join(', ')})`,
        systemUserId
      );
      console.log(`✅ Content automatically hidden for child protection`);
    }
  } catch (error) {
    console.error('Failed to create auto-moderation report:', error);
  }
}