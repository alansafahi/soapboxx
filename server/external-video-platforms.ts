import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ExternalVideoRequest {
  platform: 'creatomate' | 'synthesia' | 'pictory';
  topic: string;
  type: 'devotional' | 'sermon' | 'study' | 'prayer' | 'testimony' | 'worship';
  duration: number;
  voicePersona: string;
  visualStyle: string;
  targetAudience: string;
}

export interface VideoGenerationResult {
  videoId: string;
  downloadUrl?: string;
  previewUrl?: string;
  status: 'processing' | 'completed' | 'failed';
  estimatedCompletionTime?: number;
  platform: string;
}

export class ExternalVideoPlatforms {

  // Creatomate Integration
  async createCreatomateVideo(request: ExternalVideoRequest): Promise<VideoGenerationResult> {
    if (!process.env.CREATOMATE_API_KEY) {
      throw new Error("CREATOMATE_API_KEY is required for Creatomate integration");
    }

    try {
      // Generate script with AI
      const script = await this.generateVideoScript(request);
      
      // Create Creatomate template data
      const templateData = {
        template_id: this.getCreatomateTemplate(request.type, request.visualStyle),
        modifications: {
          "title-text": script.title,
          "main-text": script.content,
          "background-style": this.mapVisualStyle(request.visualStyle),
          "duration": request.duration,
          "voice": this.mapVoicePersona(request.voicePersona)
        }
      };

      const response = await fetch('https://api.creatomate.com/v1/renders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.CREATOMATE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(templateData)
      });

      if (!response.ok) {
        throw new Error(`Creatomate API error: ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        videoId: result.id,
        downloadUrl: result.url,
        previewUrl: result.preview_url,
        status: result.status === 'succeeded' ? 'completed' : 'processing',
        platform: 'creatomate'
      };
    } catch (error) {
      console.error('Creatomate video generation error:', error);
      throw new Error('Failed to create video with Creatomate');
    }
  }

  // Synthesia Integration
  async createSynthesiaVideo(request: ExternalVideoRequest): Promise<VideoGenerationResult> {
    if (!process.env.SYNTHESIA_API_KEY) {
      throw new Error("SYNTHESIA_API_KEY is required for Synthesia integration");
    }

    try {
      // Generate script with AI
      const script = await this.generateVideoScript(request);
      
      // Create Synthesia video
      const videoData = {
        title: script.title,
        description: script.description,
        visibility: "private",
        templateId: this.getSynthesiaTemplate(request.type),
        templateData: {
          script: script.content,
          avatar: this.mapSynthesiaAvatar(request.voicePersona),
          background: this.mapSynthesiaBackground(request.visualStyle),
          voice: this.mapSynthesiaVoice(request.voicePersona)
        }
      };

      const response = await fetch('https://api.synthesia.io/v2/videos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SYNTHESIA_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(videoData)
      });

      if (!response.ok) {
        throw new Error(`Synthesia API error: ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        videoId: result.id,
        status: 'processing',
        estimatedCompletionTime: result.estimatedTime || 300, // 5 minutes default
        platform: 'synthesia'
      };
    } catch (error) {
      console.error('Synthesia video generation error:', error);
      throw new Error('Failed to create video with Synthesia');
    }
  }

  // Pictory Integration
  async createPictoryVideo(request: ExternalVideoRequest): Promise<VideoGenerationResult> {
    if (!process.env.PICTORY_API_KEY) {
      throw new Error("PICTORY_API_KEY is required for Pictory integration");
    }

    try {
      // Generate script with AI
      const script = await this.generateVideoScript(request);
      
      // Create Pictory video from script
      const videoData = {
        videoName: script.title,
        language: "en",
        scenes: this.convertScriptToScenes(script.content, request.duration),
        settings: {
          voiceOver: {
            provider: "aws",
            voice: this.mapPictoryVoice(request.voicePersona),
            speed: 1.0
          },
          music: {
            track: this.getPictoryMusicTrack(request.type),
            volume: 0.3
          },
          style: this.mapPictoryStyle(request.visualStyle)
        }
      };

      const response = await fetch('https://api.pictory.ai/pictoryapis/v1/video/storyboard', {
        method: 'POST',
        headers: {
          'X-Pictory-User-Id': process.env.PICTORY_USER_ID || '',
          'Authorization': `${process.env.PICTORY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(videoData)
      });

      if (!response.ok) {
        throw new Error(`Pictory API error: ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        videoId: result.jobId,
        status: 'processing',
        platform: 'pictory'
      };
    } catch (error) {
      console.error('Pictory video generation error:', error);
      throw new Error('Failed to create video with Pictory');
    }
  }

  // Check video status for external platforms
  async checkVideoStatus(platform: string, videoId: string): Promise<VideoGenerationResult> {
    switch (platform) {
      case 'creatomate':
        return this.checkCreatomateStatus(videoId);
      case 'synthesia':
        return this.checkSynthesiaStatus(videoId);
      case 'pictory':
        return this.checkPictoryStatus(videoId);
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  private async checkCreatomateStatus(videoId: string): Promise<VideoGenerationResult> {
    const response = await fetch(`https://api.creatomate.com/v1/renders/${videoId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.CREATOMATE_API_KEY}`
      }
    });

    const result = await response.json();
    return {
      videoId,
      downloadUrl: result.url,
      status: result.status === 'succeeded' ? 'completed' : 'processing',
      platform: 'creatomate'
    };
  }

  private async checkSynthesiaStatus(videoId: string): Promise<VideoGenerationResult> {
    const response = await fetch(`https://api.synthesia.io/v2/videos/${videoId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.SYNTHESIA_API_KEY}`
      }
    });

    const result = await response.json();
    return {
      videoId,
      downloadUrl: result.download,
      previewUrl: result.preview,
      status: result.status === 'complete' ? 'completed' : 'processing',
      platform: 'synthesia'
    };
  }

  private async checkPictoryStatus(videoId: string): Promise<VideoGenerationResult> {
    const response = await fetch(`https://api.pictory.ai/pictoryapis/v1/jobs/${videoId}`, {
      headers: {
        'X-Pictory-User-Id': process.env.PICTORY_USER_ID || '',
        'Authorization': `${process.env.PICTORY_API_KEY}`
      }
    });

    const result = await response.json();
    return {
      videoId,
      downloadUrl: result.data?.videoURL,
      status: result.data?.status === 'completed' ? 'completed' : 'processing',
      platform: 'pictory'
    };
  }

  // AI Script Generation
  private async generateVideoScript(request: ExternalVideoRequest): Promise<{
    title: string;
    description: string;
    content: string;
  }> {
    const prompt = `Create a ${request.type} video script about "${request.topic}" for ${request.targetAudience} audience.
    
    Duration: ${request.duration} seconds
    Style: ${request.visualStyle}
    Voice: ${request.voicePersona}
    
    Generate:
    1. Compelling title
    2. Brief description
    3. Complete script with timing cues
    
    Format as JSON with: title, description, content`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert spiritual content creator. Create engaging, faith-based video scripts."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  }

  // Platform-specific mapping functions
  private getCreatomateTemplate(type: string, style: string): string {
    const templates = {
      'devotional-modern': 'template_devotional_modern',
      'sermon-traditional': 'template_sermon_classic',
      'study-minimalist': 'template_study_clean',
      'prayer-artistic': 'template_prayer_artistic'
    };
    return templates[`${type}-${style}`] || 'template_default';
  }

  private getSynthesiaTemplate(type: string): string {
    const templates = {
      'devotional': 'devotional_template',
      'sermon': 'sermon_template',
      'study': 'study_template',
      'prayer': 'prayer_template'
    };
    return templates[type] || 'default_template';
  }

  private mapSynthesiaAvatar(voicePersona: string): string {
    const avatars = {
      'pastor-david': 'pastor_male_1',
      'sister-maria': 'teacher_female_1',
      'teacher-john': 'educator_male_1',
      'evangelist-sarah': 'speaker_female_1'
    };
    return avatars[voicePersona] || 'default_avatar';
  }

  private mapSynthesiaVoice(voicePersona: string): string {
    const voices = {
      'pastor-david': 'en-US-neural-male-warm',
      'sister-maria': 'en-US-neural-female-gentle',
      'teacher-john': 'en-US-neural-male-clear',
      'evangelist-sarah': 'en-US-neural-female-energetic'
    };
    return voices[voicePersona] || 'en-US-neural-male-default';
  }

  private mapSynthesiaBackground(style: string): string {
    const backgrounds = {
      'modern': 'modern_church',
      'traditional': 'classic_church',
      'minimalist': 'clean_background',
      'artistic': 'artistic_religious'
    };
    return backgrounds[style] || 'default_background';
  }

  private mapPictoryVoice(voicePersona: string): string {
    const voices = {
      'pastor-david': 'Matthew',
      'sister-maria': 'Joanna',
      'teacher-john': 'Brian',
      'evangelist-sarah': 'Amy'
    };
    return voices[voicePersona] || 'Matthew';
  }

  private mapPictoryStyle(style: string): string {
    const styles = {
      'modern': 'modern_template',
      'traditional': 'classic_template',
      'minimalist': 'clean_template',
      'artistic': 'creative_template'
    };
    return styles[style] || 'modern_template';
  }

  private getPictoryMusicTrack(type: string): string {
    const tracks = {
      'devotional': 'peaceful_ambient',
      'sermon': 'inspiring_orchestral',
      'study': 'gentle_instrumental',
      'prayer': 'contemplative_piano'
    };
    return tracks[type] || 'peaceful_ambient';
  }

  private mapVisualStyle(style: string): string {
    const styles = {
      'modern': 'contemporary',
      'traditional': 'classic',
      'minimalist': 'clean',
      'artistic': 'creative'
    };
    return styles[style] || 'contemporary';
  }

  private mapVoicePersona(persona: string): string {
    const voices = {
      'pastor-david': 'warm_male',
      'sister-maria': 'gentle_female',
      'teacher-john': 'clear_male',
      'evangelist-sarah': 'energetic_female'
    };
    return voices[persona] || 'warm_male';
  }

  private convertScriptToScenes(script: string, duration: number): any[] {
    // Split script into scenes based on duration
    const sentences = script.split('. ');
    const sceneDuration = duration / sentences.length;
    
    return sentences.map((sentence, index) => ({
      id: index + 1,
      text: sentence.trim(),
      duration: sceneDuration,
      voiceOver: true
    }));
  }
}

export const externalVideoPlatforms = new ExternalVideoPlatforms();