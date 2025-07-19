// AI Training System for Content Moderation
// Learns from moderator decisions to improve classification accuracy

import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ModerationTrainingData {
  content: string;
  contentType: string;
  aiClassification: {
    priority: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    confidence: number;
  };
  humanDecision: {
    finalPriority: 'low' | 'medium' | 'high' | 'critical';
    finalCategory: string;
    action: 'approved' | 'hidden' | 'removed' | 'edit_requested';
    moderatorNotes?: string;
  };
  outcome: 'correct' | 'under_classified' | 'over_classified';
  timestamp: Date;
}

export interface TrainingFeedback {
  totalCases: number;
  accuracyRate: number;
  commonMisclassifications: Array<{
    pattern: string;
    aiPredicted: string;
    humanCorrected: string;
    frequency: number;
  }>;
  improvementSuggestions: string[];
}

// Enhanced classification prompt with your detailed guidelines
const ENHANCED_CLASSIFICATION_PROMPT = `
You are an advanced AI content moderator for a faith-based community platform. Classify content using this EXACT priority system:

🛑 CRITICAL (Immediate Removal & Review):
- Sexual Content: "Looking for a hookup after church", explicit sexual requests/solicitation
- Inappropriate Content: Blasphemy, "Jesus was a fraud. Christians are sheep"
- Harassment/Bullying: Personal attacks, "Everyone should avoid John. He's a pervert"
- False Information: "Tithing is optional. Jesus never told anyone to give"
- Privacy Violation: Sharing SSN, bank info, sensitive personal data
- Spam: "Buy Bitcoin now! Click here to invest with me"
- Violence threats: bombs, killing, weapons, harm, destruction
- Predatory behavior toward minors: "young ones", grooming language
- Devil worship, satan worship solicitation
- Adult targeting minors: "young ones", "kids"
- Explicit sexual content + any text combination
🚨 ACTION: Auto-flag + immediate shadowban/quarantine

🔶 HIGH (Likely Harmful or Spiritually Disruptive):
- Sexual Content: "Is it okay if I post thirst traps as long as I quote scripture?"
- Inappropriate Content: "The Bible supports slavery. Read it again."
- Harassment/Bullying: "The youth group is full of losers and sinners."
- False Information: "Prayer is more powerful than medicine. Don't take pills—just pray."
- Privacy Violation: Sharing OTHER people's personal info, especially for sale
- Spam: "Join my crypto church—Jesus loves passive income"
🚨 ACTION: Warn user + send to human moderator

🟡 MEDIUM (Unhelpful or Distracting):
- Sexual Content: "Can Christian couples use sex toys? Just asking here."
- Inappropriate Content: "Catholics aren't real Christians."
- Harassment/Bullying: "You're obviously not a real believer if you feel depressed."
- False Information: "The rapture is happening next Friday. Be ready!"
- Privacy Violation: "I saw Pastor at a bar last night—posting this anonymously."
- Spam: "Check out my YouTube channel where I expose all church pastors."
⚠️ ACTION: AI response with correction, throttle reach

NOTE: Sharing your own personal info (phone, address) is generally OK. Only flag sharing OTHER people's info without consent.

🟢 LOW (Minor Issues or Off-topic):
- Sexual Content: "Is attraction a sin?"
- Inappropriate Content: "I feel like sermons are boring sometimes."
- Harassment/Bullying: "Your prayer request seems dramatic. Just my opinion."
- False Information: "Jesus probably spoke English, right?"
- Spam: "Come to our revival event! Free pizza"
✅ ACTION: AI coach guidance, allow with soft moderation

LEARNING FROM PAST DECISIONS:
{{TRAINING_CONTEXT}}

IMPORTANT: Respond with ONLY valid JSON, no code blocks or markdown formatting:
{
  "flagged": boolean,
  "priority": "critical|high|medium|low",
  "category": "sexual_content|inappropriate_content|harassment_bullying|false_information|privacy_violation|spam|other",
  "violations": ["specific violation types"],
  "reason": "detailed explanation",
  "confidence": 0.0-1.0,
  "actionRequired": "remove|hide|review|coach|none",
  "learningNote": "what this case teaches about classification"
}`;

export class AITrainingSystem {
  private trainingData: ModerationTrainingData[] = [];

  /**
   * Record AI prediction vs human decision for learning
   */
  async recordTrainingCase(trainingCase: ModerationTrainingData): Promise<void> {
    this.trainingData.push(trainingCase);
    
    // Store in database for persistent learning
    // This would integrate with your storage system
    console.log('🧠 Training case recorded:', {
      content: trainingCase.content.substring(0, 50),
      aiPrediction: trainingCase.aiClassification.priority,
      humanDecision: trainingCase.humanDecision.finalPriority,
      outcome: trainingCase.outcome
    });
  }

  /**
   * Generate training context from past decisions
   */
  private generateTrainingContext(): string {
    if (this.trainingData.length === 0) return '';

    const recentCases = this.trainingData.slice(-20); // Last 20 cases
    const corrections = recentCases.filter(trainingCase => trainingCase.outcome !== 'correct');
    
    if (corrections.length === 0) return 'Recent classifications have been accurate.';

    const contextSections = corrections.map(correction => {
      return `
LEARNING CASE:
Content: "${correction.content.substring(0, 100)}"
AI Classified: ${correction.aiClassification.priority} (${correction.aiClassification.category})
Human Corrected: ${correction.humanDecision.finalPriority} (${correction.humanDecision.finalCategory})
Lesson: ${correction.outcome === 'under_classified' ? 'Be more strict with this type of content' : 'Be less strict with this type of content'}
Notes: ${correction.humanDecision.moderatorNotes || 'None'}`;
    }).join('\n---\n');

    return `RECENT CORRECTIONS TO LEARN FROM:\n${contextSections}`;
  }

  /**
   * Enhanced content analysis with learning integration
   */
  async analyzeContentWithLearning(
    content: string,
    contentType: string
  ): Promise<any> {
    try {
      const trainingContext = this.generateTrainingContext();
      const enhancedPrompt = ENHANCED_CLASSIFICATION_PROMPT.replace(
        '{{TRAINING_CONTEXT}}',
        trainingContext
      );

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: enhancedPrompt },
          { 
            role: 'user', 
            content: `Analyze this ${contentType}: "${content}"` 
          }
        ],
        temperature: 0.1, // Low temperature for consistent classification
        max_tokens: 500
      });

      // Clean up the response to handle code blocks
      let responseContent = response.choices[0].message.content || '{}';
      
      // Remove code blocks if present
      if (responseContent.includes('```json')) {
        responseContent = responseContent.replace(/```json\s*/, '').replace(/\s*```/, '');
      } else if (responseContent.includes('```')) {
        responseContent = responseContent.replace(/```\s*/, '').replace(/\s*```/, '');
      }
      
      const result = JSON.parse(responseContent);
      
      // Validate and sanitize response
      return {
        flagged: Boolean(result.flagged),
        priority: ['low', 'medium', 'high', 'critical'].includes(result.priority) 
          ? result.priority 
          : 'medium',
        category: result.category || 'other',
        violations: Array.isArray(result.violations) ? result.violations : [],
        reason: typeof result.reason === 'string' ? result.reason : 'Content analysis',
        confidence: typeof result.confidence === 'number' 
          ? Math.max(0, Math.min(1, result.confidence)) 
          : 0.7,
        actionRequired: ['remove', 'hide', 'review', 'coach', 'none'].includes(result.actionRequired)
          ? result.actionRequired
          : 'review',
        learningNote: result.learningNote || ''
      };

    } catch (error) {
      console.error('AI analysis with learning failed:', error);
      return {
        flagged: false,
        priority: 'medium',
        category: 'other',
        violations: [],
        reason: 'analysis_failed',
        confidence: 0,
        actionRequired: 'review',
        learningNote: 'Error in analysis'
      };
    }
  }

  /**
   * Analyze training effectiveness and generate feedback
   */
  generateTrainingFeedback(): TrainingFeedback {
    if (this.trainingData.length === 0) {
      return {
        totalCases: 0,
        accuracyRate: 0,
        commonMisclassifications: [],
        improvementSuggestions: ['Collect more training data']
      };
    }

    const totalCases = this.trainingData.length;
    const correctCases = this.trainingData.filter(trainingCase => trainingCase.outcome === 'correct').length;
    const accuracyRate = correctCases / totalCases;

    // Find common misclassification patterns
    const misclassifications = this.trainingData.filter(trainingCase => trainingCase.outcome !== 'correct');
    const patterns = new Map<string, number>();

    misclassifications.forEach(trainingCase => {
      const pattern = `${trainingCase.aiClassification.priority} -> ${trainingCase.humanDecision.finalPriority}`;
      patterns.set(pattern, (patterns.get(pattern) || 0) + 1);
    });

    const commonMisclassifications = Array.from(patterns.entries())
      .map(([pattern, frequency]) => {
        const [aiPredicted, humanCorrected] = pattern.split(' -> ');
        return { pattern, aiPredicted, humanCorrected, frequency };
      })
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5);

    // Generate improvement suggestions
    const improvementSuggestions = [];
    if (accuracyRate < 0.8) {
      improvementSuggestions.push('Accuracy below 80% - increase training data');
    }
    if (commonMisclassifications.length > 0) {
      improvementSuggestions.push(`Most common error: ${commonMisclassifications[0].pattern}`);
    }
    
    return {
      totalCases,
      accuracyRate,
      commonMisclassifications,
      improvementSuggestions
    };
  }

  /**
   * Test the AI with your specific examples
   */
  async testWithExamples(): Promise<void> {
    console.log('🧪 Testing AI with Classification Examples...\n');

    const testCases = [
      // CRITICAL Examples
      { content: 'Looking for a hookup after church 💦 DM me', expected: 'critical', category: 'sexual_content' },
      { content: 'Jesus was a fraud. Christians are sheep.', expected: 'critical', category: 'inappropriate_content' },
      { content: 'Everyone should avoid John. He\'s a pervert and a liar.', expected: 'critical', category: 'harassment_bullying' },
      { content: 'Tithing is optional. Jesus never told anyone to give.', expected: 'critical', category: 'false_information' },
      { content: 'Here\'s Pastor Mark\'s phone number and home address 🏠📞', expected: 'critical', category: 'privacy_violation' },
      
      // HIGH Examples  
      { content: 'Is it okay if I post thirst traps as long as I quote scripture?', expected: 'high', category: 'sexual_content' },
      { content: 'The Bible supports slavery. Read it again.', expected: 'high', category: 'inappropriate_content' },
      { content: 'Prayer is more powerful than medicine. Don\'t take pills—just pray.', expected: 'high', category: 'false_information' },
      
      // MEDIUM Examples
      { content: 'Can Christian couples use sex toys? Just asking here.', expected: 'medium', category: 'sexual_content' },
      { content: 'Catholics aren\'t real Christians.', expected: 'medium', category: 'inappropriate_content' },
      { content: 'The rapture is happening next Friday. Be ready!', expected: 'medium', category: 'false_information' },
      
      // LOW Examples
      { content: 'Is attraction a sin?', expected: 'low', category: 'sexual_content' },
      { content: 'I feel like sermons are boring sometimes.', expected: 'low', category: 'inappropriate_content' },
      { content: 'Come to our revival event! Free pizza 🍕🎉', expected: 'low', category: 'spam' }
    ];

    let correct = 0;
    for (const testCase of testCases) {
      const result = await this.analyzeContentWithLearning(testCase.content, 'discussion');
      const isCorrect = result.priority === testCase.expected;
      if (isCorrect) correct++;
      
      console.log(`${isCorrect ? '✅' : '❌'} "${testCase.content.substring(0, 40)}..."`);
      console.log(`   Expected: ${testCase.expected} | Got: ${result.priority} | Confidence: ${(result.confidence * 100).toFixed(1)}%`);
      if (!isCorrect) {
        console.log(`   Reason: ${result.reason}`);
      }
    }
    
    console.log(`\n🎯 Accuracy: ${correct}/${testCases.length} (${((correct/testCases.length)*100).toFixed(1)}%)`);
  }
}

export const aiTrainingSystem = new AITrainingSystem();