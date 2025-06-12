// Comprehensive content safety system for SoapBox Super App
// Protects against inappropriate content in all AI-generated features

export interface ContentSafetyResult {
  isAllowed: boolean;
  reason?: string;
  filteredContent?: string;
}

// Comprehensive list of inappropriate content
const BLOCKED_TERMS = [
  // Profanity and offensive language
  'fuck', 'shit', 'damn', 'hell', 'bitch', 'ass', 'bastard', 'crap',
  'piss', 'cock', 'dick', 'pussy', 'whore', 'slut', 'faggot', 'nigger',
  'retard', 'gay', 'lesbian', 'homo', 'queer',
  
  // Sexual content
  'sex', 'sexual', 'porn', 'pornography', 'nude', 'naked', 'breast',
  'penis', 'vagina', 'orgasm', 'masturbate', 'erotic', 'horny',
  'seductive', 'sensual', 'intimate', 'aroused', 'climax',
  
  // Violence and harm
  'kill', 'murder', 'death', 'suicide', 'cut', 'stab', 'shoot',
  'gun', 'weapon', 'knife', 'bomb', 'explosion', 'violence',
  'hurt', 'pain', 'torture', 'abuse', 'rape', 'assault',
  
  // Drugs and substances
  'drug', 'cocaine', 'heroin', 'marijuana', 'weed', 'meth',
  'alcohol', 'beer', 'wine', 'drunk', 'high', 'stoned',
  'addiction', 'overdose', 'pills', 'prescription',
  
  // Hate and discrimination
  'hate', 'racist', 'terrorism', 'nazi', 'extremist', 'radical',
  'supremacy', 'discrimination', 'prejudice', 'bigot',
  
  // Self-harm and mental health concerns
  'suicide', 'self-harm', 'cutting', 'depression', 'anxiety',
  'mental illness', 'therapy', 'medication', 'pills'
];

// Faith-appropriate content categories for backgrounds
const APPROVED_BACKGROUND_THEMES = [
  'sunset', 'sunrise', 'mountains', 'ocean', 'forest', 'flowers',
  'garden', 'clouds', 'sky', 'nature', 'peaceful', 'serene',
  'landscape', 'pastoral', 'meadow', 'trees', 'river', 'lake',
  'beach', 'abstract', 'geometric', 'watercolor', 'minimalist',
  'cross', 'church', 'stained glass', 'cathedral', 'chapel',
  'bible', 'scripture', 'holy', 'sacred', 'divine', 'spiritual',
  'light', 'golden', 'warm', 'soft', 'gentle', 'calming'
];

// Bible verse pattern validation
const VERSE_REFERENCE_PATTERN = /^[1-3]?\s?[A-Za-z]+\s+\d{1,3}:\d{1,3}(-\d{1,3})?$/;

export class ContentSafetyService {
  
  /**
   * Validates text content for appropriateness
   */
  validateTextContent(text: string): ContentSafetyResult {
    const lowerText = text.toLowerCase();
    
    // Check for blocked terms
    for (const term of BLOCKED_TERMS) {
      if (lowerText.includes(term)) {
        return {
          isAllowed: false,
          reason: `Content contains inappropriate language: "${term}"`
        };
      }
    }
    
    return { isAllowed: true };
  }
  
  /**
   * Validates Bible verse references
   */
  validateVerseReference(reference: string): ContentSafetyResult {
    if (!VERSE_REFERENCE_PATTERN.test(reference.trim())) {
      return {
        isAllowed: false,
        reason: 'Invalid Bible verse reference format'
      };
    }
    
    return { isAllowed: true };
  }
  
  /**
   * Validates background theme requests for verse art
   */
  validateBackgroundTheme(theme: string): ContentSafetyResult {
    const lowerTheme = theme.toLowerCase();
    
    // First check if it contains inappropriate content
    const textValidation = this.validateTextContent(theme);
    if (!textValidation.isAllowed) {
      return textValidation;
    }
    
    // Check if theme is in approved list
    const isApproved = APPROVED_BACKGROUND_THEMES.some(approved => 
      lowerTheme.includes(approved) || approved.includes(lowerTheme)
    );
    
    if (!isApproved) {
      return {
        isAllowed: false,
        reason: 'Background theme not approved for faith-based content'
      };
    }
    
    return { isAllowed: true };
  }
  
  /**
   * Comprehensive validation for verse art generation
   */
  validateVerseArtRequest(verseText: string, verseReference: string, backgroundTheme: string): ContentSafetyResult {
    // Validate verse reference
    const refValidation = this.validateVerseReference(verseReference);
    if (!refValidation.isAllowed) return refValidation;
    
    // Validate verse text
    const textValidation = this.validateTextContent(verseText);
    if (!textValidation.isAllowed) return textValidation;
    
    // Validate background theme
    const themeValidation = this.validateBackgroundTheme(backgroundTheme);
    if (!themeValidation.isAllowed) return themeValidation;
    
    return { isAllowed: true };
  }
  
  /**
   * Sanitizes user input for AI prompts
   */
  sanitizeForAIPrompt(input: string): string {
    // Remove any potentially harmful content
    let sanitized = input.trim();
    
    // Remove special characters that could be used for prompt injection
    sanitized = sanitized.replace(/[<>{}[\]\\]/g, '');
    
    // Limit length to prevent abuse
    if (sanitized.length > 500) {
      sanitized = sanitized.substring(0, 500);
    }
    
    return sanitized;
  }
  
  /**
   * Validates prayer requests
   */
  validatePrayerRequest(prayerText: string): ContentSafetyResult {
    const textValidation = this.validateTextContent(prayerText);
    if (!textValidation.isAllowed) return textValidation;
    
    // Additional prayer-specific validations
    const lowerText = prayerText.toLowerCase();
    
    // Ensure it's actually a prayer or spiritual request
    const prayerIndicators = [
      'pray', 'prayer', 'god', 'lord', 'jesus', 'christ', 'father',
      'holy', 'spirit', 'blessing', 'help', 'guidance', 'strength',
      'healing', 'peace', 'love', 'forgiveness', 'mercy', 'grace'
    ];
    
    const containsPrayerContent = prayerIndicators.some(indicator => 
      lowerText.includes(indicator)
    );
    
    if (!containsPrayerContent && lowerText.length > 50) {
      return {
        isAllowed: false,
        reason: 'Content does not appear to be a prayer or spiritual request'
      };
    }
    
    return { isAllowed: true };
  }
  
  /**
   * Validates reflection prompts and responses
   */
  validateReflectionContent(content: string): ContentSafetyResult {
    const textValidation = this.validateTextContent(content);
    if (!textValidation.isAllowed) return textValidation;
    
    // Ensure reflections are faith-focused
    const lowerContent = content.toLowerCase();
    const spiritualTerms = [
      'god', 'lord', 'jesus', 'christ', 'faith', 'believe', 'prayer',
      'bible', 'scripture', 'verse', 'spiritual', 'christian', 'church',
      'blessing', 'ministry', 'worship', 'praise', 'testimony'
    ];
    
    // For longer reflections, ensure spiritual context
    if (content.length > 100) {
      const containsSpiritualContent = spiritualTerms.some(term => 
        lowerContent.includes(term)
      );
      
      if (!containsSpiritualContent) {
        return {
          isAllowed: false,
          reason: 'Reflection content should have spiritual or faith-based context'
        };
      }
    }
    
    return { isAllowed: true };
  }
  
  /**
   * Validates community post content
   */
  validateCommunityPost(content: string): ContentSafetyResult {
    const textValidation = this.validateTextContent(content);
    if (!textValidation.isAllowed) return textValidation;
    
    // Additional community guidelines
    const lowerContent = content.toLowerCase();
    
    // Check for spam patterns
    if (content.includes('http://') || content.includes('https://')) {
      return {
        isAllowed: false,
        reason: 'External links are not allowed in community posts'
      };
    }
    
    // Check for excessive capitalization (shouting)
    const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
    if (capsRatio > 0.5 && content.length > 20) {
      return {
        isAllowed: false,
        reason: 'Excessive capitalization is not allowed'
      };
    }
    
    return { isAllowed: true };
  }
  
  /**
   * Creates safe AI prompt with guardrails
   */
  createSafeAIPrompt(userInput: string, promptType: 'verse-art' | 'reflection' | 'prayer' | 'general'): string {
    const sanitizedInput = this.sanitizeForAIPrompt(userInput);
    
    const safetyPrefix = `You are a Christian AI assistant helping with faith-based content. 
    Always maintain appropriate, family-friendly, and spiritually uplifting responses. 
    Never generate content involving violence, sexuality, profanity, drugs, or other inappropriate material.
    Focus on biblical principles, spiritual growth, and positive Christian values.
    
    User request: `;
    
    const safetySuffix = `
    
    Remember to keep all content appropriate for a Christian faith community and suitable for all ages.`;
    
    return safetyPrefix + sanitizedInput + safetySuffix;
  }
}

// Singleton instance
export const contentSafety = new ContentSafetyService();