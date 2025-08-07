import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// GPT-5 model configurations
const GPT_5_MINI = 'gpt-5-mini';  // Cost-effective for simple tasks
const GPT_5 = 'gpt-5';            // Premium model for complex tasks

// Model selection criteria
interface TaskComplexity {
  isSimple: boolean;
  maxTokens: number;
  requiresReasoning: boolean;
  isCreative: boolean;
}

// Route-specific timeout configurations (in milliseconds)
const ROUTE_TIMEOUTS = {
  'simple': 15000,    // 15 seconds for simple tasks
  'complex': 45000,   // 45 seconds for complex tasks  
  'creative': 60000,  // 60 seconds for creative tasks
  'default': 30000    // 30 seconds default
};

// AI Service class with intelligent model routing
export class AIService {
  private static instance: AIService;
  private useGPT5Mini: boolean = false; // Toggle for cost-effective mode

  private constructor() {}

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  // Toggle GPT-5-mini mode for cost savings
  setGPT5MiniMode(enabled: boolean): void {
    this.useGPT5Mini = enabled;
    console.log(`GPT-5-mini mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  // Intelligent model selection based on task complexity
  private selectModel(complexity: TaskComplexity): string {
    // Force GPT-5-mini if toggle is enabled and task is suitable
    if (this.useGPT5Mini && (complexity.isSimple || complexity.maxTokens < 1000)) {
      return GPT_5_MINI;
    }

    // Use GPT-5 for complex reasoning, creative tasks, or large outputs
    if (complexity.requiresReasoning || complexity.isCreative || complexity.maxTokens > 2000) {
      return GPT_5;
    }

    // Default to GPT-5-mini for simple tasks
    return complexity.isSimple ? GPT_5_MINI : GPT_5;
  }

  // Get timeout for specific route type
  private getTimeout(routeType: keyof typeof ROUTE_TIMEOUTS): number {
    return ROUTE_TIMEOUTS[routeType] || ROUTE_TIMEOUTS.default;
  }

  // Main completion method with fallback and streaming support
  async createCompletion(
    messages: any[],
    options: {
      complexity?: TaskComplexity;
      routeType?: keyof typeof ROUTE_TIMEOUTS;
      maxTokens?: number;
      temperature?: number;
      stream?: boolean;
      systemPrompt?: string;
    } = {}
  ): Promise<any> {
    const {
      complexity = { isSimple: true, maxTokens: 500, requiresReasoning: false, isCreative: false },
      routeType = 'default',
      maxTokens = 1000,
      temperature = 0.7,
      stream = false,
      systemPrompt
    } = options;

    // Add system prompt if provided
    const fullMessages = systemPrompt 
      ? [{ role: 'system', content: systemPrompt }, ...messages]
      : messages;

    // Select appropriate model
    const primaryModel = this.selectModel(complexity);
    const fallbackModel = primaryModel === GPT_5 ? GPT_5_MINI : GPT_5_MINI;
    
    const timeout = this.getTimeout(routeType);

    try {
      // Primary attempt with selected model
      const response = await Promise.race([
        this.makeAPICall(fullMessages, {
          model: primaryModel,
          max_tokens: maxTokens,
          temperature,
          stream
        }),
        this.createTimeoutPromise(timeout)
      ]);

      console.log(`✅ GPT response successful with ${primaryModel}`);
      return response;

    } catch (error: any) {
      console.warn(`⚠️ ${primaryModel} failed, attempting fallback to ${fallbackModel}:`, error.message);

      try {
        // Fallback attempt with mini model and reduced parameters
        const fallbackResponse = await Promise.race([
          this.makeAPICall(fullMessages, {
            model: fallbackModel,
            max_tokens: Math.min(maxTokens, 1000), // Reduce tokens for fallback
            temperature: Math.min(temperature, 0.5), // Reduce creativity for stability
            stream: false // Disable streaming for fallback
          }),
          this.createTimeoutPromise(15000) // Shorter timeout for fallback
        ]);

        console.log(`✅ Fallback successful with ${fallbackModel}`);
        return fallbackResponse;

      } catch (fallbackError: any) {
        console.error(`❌ Both models failed:`, fallbackError.message);
        throw new Error(`AI service unavailable: ${fallbackError.message}`);
      }
    }
  }

  // Make actual API call to OpenAI
  private async makeAPICall(messages: any[], config: any): Promise<any> {
    try {
      if (config.stream) {
        return await openai.chat.completions.create({
          ...config,
          messages,
          stream: true
        });
      } else {
        return await openai.chat.completions.create({
          ...config,
          messages,
          stream: false
        });
      }
    } catch (error: any) {
      // Handle specific OpenAI errors
      if (error.status === 429) {
        throw new Error('Rate limit exceeded');
      } else if (error.status === 401) {
        throw new Error('Invalid API key');
      } else if (error.status === 404) {
        throw new Error('Model not found');
      }
      throw error;
    }
  }

  // Create timeout promise for race condition
  private createTimeoutPromise(timeout: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Request timeout after ${timeout}ms`)), timeout);
    });
  }

  // Convenience methods for specific use cases

  // Simple text completion (uses GPT-5-mini by default)
  async simpleCompletion(prompt: string, maxTokens: number = 500): Promise<string> {
    const response = await this.createCompletion(
      [{ role: 'user', content: prompt }],
      {
        complexity: { isSimple: true, maxTokens, requiresReasoning: false, isCreative: false },
        routeType: 'simple',
        maxTokens
      }
    );
    return response.choices[0]?.message?.content || '';
  }

  // Complex reasoning task (uses GPT-5)
  async complexReasoning(prompt: string, systemPrompt?: string, maxTokens: number = 2000): Promise<string> {
    const response = await this.createCompletion(
      [{ role: 'user', content: prompt }],
      {
        complexity: { isSimple: false, maxTokens, requiresReasoning: true, isCreative: false },
        routeType: 'complex',
        maxTokens,
        systemPrompt
      }
    );
    return response.choices[0]?.message?.content || '';
  }

  // Creative task (uses GPT-5 with higher temperature)
  async creativeTask(prompt: string, systemPrompt?: string, maxTokens: number = 1500): Promise<string> {
    const response = await this.createCompletion(
      [{ role: 'user', content: prompt }],
      {
        complexity: { isSimple: false, maxTokens, requiresReasoning: false, isCreative: true },
        routeType: 'creative',
        maxTokens,
        temperature: 0.9,
        systemPrompt
      }
    );
    return response.choices[0]?.message?.content || '';
  }

  // Streaming completion for long responses
  async streamingCompletion(prompt: string, onChunk: (chunk: string) => void): Promise<void> {
    const stream = await this.createCompletion(
      [{ role: 'user', content: prompt }],
      {
        complexity: { isSimple: false, maxTokens: 4000, requiresReasoning: true, isCreative: false },
        routeType: 'complex',
        stream: true
      }
    );

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        onChunk(content);
      }
    }
  }
}

// Export singleton instance
export const aiService = AIService.getInstance();

// Legacy compatibility wrapper
export async function generateWithOpenAI(
  prompt: string, 
  systemPrompt?: string,
  options: { isComplex?: boolean, maxTokens?: number } = {}
): Promise<string> {
  const { isComplex = false, maxTokens = 1000 } = options;
  
  if (isComplex) {
    return await aiService.complexReasoning(prompt, systemPrompt, maxTokens);
  } else {
    return await aiService.simpleCompletion(prompt, maxTokens);
  }
}