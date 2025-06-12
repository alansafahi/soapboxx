import OpenAI from "openai";
import { storage } from "./storage";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable must be set");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface VideoGenerationRequest {
  type: 'devotional' | 'sermon' | 'study' | 'prayer' | 'testimony' | 'worship';
  topic: string;
  bibleVerse?: string;
  duration: number; // in seconds
  voicePersona: 'pastor-david' | 'sister-maria' | 'teacher-john' | 'evangelist-sarah';
  visualStyle: 'modern' | 'traditional' | 'minimalist' | 'artistic';
  targetAudience: 'youth' | 'adults' | 'seniors' | 'families' | 'general';
  churchId: number;
  userId: string;
}

export interface VideoContent {
  title: string;
  description: string;
  script: string;
  visualCues: VisualCue[];
  audioNarration: string;
  bibleReferences: string[];
  tags: string[];
  estimatedDuration: number;
}

export interface VisualCue {
  timestamp: number; // in seconds
  type: 'text' | 'image' | 'background' | 'transition';
  content: string;
  description: string;
  duration: number;
}

export class AIVideoGenerator {
  
  async generateVideoContent(request: VideoGenerationRequest): Promise<VideoContent> {
    try {
      console.log(`Generating AI video content for ${request.type}: ${request.topic}`);
      
      // Generate the video script and content
      const contentResponse = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: this.getSystemPrompt(request)
          },
          {
            role: "user",
            content: `Create a ${request.duration}-second ${request.type} video about "${request.topic}"${request.bibleVerse ? ` based on ${request.bibleVerse}` : ''}`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const content = JSON.parse(contentResponse.choices[0].message.content || '{}');
      
      // Generate visual cues and timing
      const visualCues = await this.generateVisualCues(content, request);
      
      return {
        title: content.title,
        description: content.description,
        script: content.script,
        visualCues,
        audioNarration: content.narration,
        bibleReferences: content.bibleReferences || [],
        tags: content.tags || [],
        estimatedDuration: request.duration,
      };
      
    } catch (error) {
      console.error('Error generating video content:', error);
      throw new Error('Failed to generate video content');
    }
  }

  private getSystemPrompt(request: VideoGenerationRequest): string {
    const audienceGuidance = {
      youth: "Use contemporary language, relatable examples, and engaging storytelling. Focus on practical application for young people.",
      adults: "Use mature, thoughtful language with real-world applications and deeper theological insights.",
      seniors: "Use respectful, traditional language with wisdom-focused content and life experience applications.",
      families: "Use inclusive language suitable for all ages, with examples that resonate across generations.",
      general: "Use accessible language that speaks to a broad church audience with universal themes."
    };

    const typeGuidance = {
      devotional: "Create a personal, reflective piece that encourages quiet contemplation and spiritual growth.",
      sermon: "Develop a structured message with clear points, biblical exposition, and practical application.",
      study: "Focus on educational content with biblical analysis, historical context, and discussion questions.",
      prayer: "Center on prayer guidance, spiritual intercession, and communion with God.",
      testimony: "Share inspiring stories of faith, transformation, and God's work in people's lives.",
      worship: "Create content that leads people into worship, praise, and spiritual connection."
    };

    return `You are an AI assistant helping create Christian video content for churches. 

CONTENT TYPE: ${request.type}
TARGET AUDIENCE: ${request.targetAudience}
VISUAL STYLE: ${request.visualStyle}
VOICE PERSONA: ${request.voicePersona}

GUIDANCE FOR THIS CONTENT TYPE:
${typeGuidance[request.type]}

AUDIENCE CONSIDERATIONS:
${audienceGuidance[request.targetAudience]}

Your response must be valid JSON with this structure:
{
  "title": "Engaging title for the video",
  "description": "Brief description of the video content",
  "script": "Full narration script broken into timed segments",
  "narration": "Complete narration text for audio generation",
  "bibleReferences": ["Verse 1", "Verse 2"],
  "tags": ["tag1", "tag2", "tag3"],
  "segments": [
    {
      "startTime": 0,
      "duration": 10,
      "text": "Opening segment text",
      "visualDescription": "Description of what should be shown visually"
    }
  ]
}

Keep the content biblically sound, spiritually enriching, and appropriate for church use. The total duration should be approximately ${request.duration} seconds.`;
  }

  private async generateVisualCues(content: any, request: VideoGenerationRequest): Promise<VisualCue[]> {
    const visualCues: VisualCue[] = [];
    
    if (content.segments && Array.isArray(content.segments)) {
      for (const segment of content.segments) {
        // Generate background visual
        visualCues.push({
          timestamp: segment.startTime,
          type: 'background',
          content: await this.generateBackgroundPrompt(segment.visualDescription, request.visualStyle),
          description: segment.visualDescription,
          duration: segment.duration,
        });

        // Generate text overlay if needed
        if (segment.text) {
          visualCues.push({
            timestamp: segment.startTime + 1,
            type: 'text',
            content: segment.text,
            description: 'Text overlay for narration',
            duration: segment.duration - 2,
          });
        }
      }
    }

    return visualCues;
  }

  private async generateBackgroundPrompt(visualDescription: string, style: string): Promise<string> {
    const stylePrompts = {
      modern: "Clean, contemporary design with soft lighting and modern typography",
      traditional: "Classic church aesthetics with warm tones and traditional elements",
      minimalist: "Simple, clean design with plenty of white space and subtle elements",
      artistic: "Creative, expressive visuals with artistic flair and unique compositions"
    };

    return `${stylePrompts[style]}, ${visualDescription}, professional quality, suitable for church presentation`;
  }

  async generateVideoFromContent(videoContent: VideoContent, request: VideoGenerationRequest): Promise<string> {
    try {
      const fs = await import('fs');
      const path = await import('path');
      
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'uploads', 'videos');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      // Generate a simple video file placeholder for now
      const videoId = Date.now();
      const fileName = `ai-generated-${videoId}.mp4`;
      const filePath = path.join(uploadsDir, fileName);
      
      // Create a minimal MP4 file structure for demonstration
      // In a real implementation, this would use proper video generation libraries
      const videoHeader = Buffer.from([
        0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70, // MP4 header
        0x69, 0x73, 0x6F, 0x6D, 0x00, 0x00, 0x02, 0x00,
        0x69, 0x73, 0x6F, 0x6D, 0x69, 0x73, 0x6F, 0x32,
        0x61, 0x76, 0x63, 0x31, 0x6D, 0x70, 0x34, 0x31
      ]);
      
      fs.writeFileSync(filePath, videoHeader);
      
      // Return the local URL that can be served by the express server
      const videoUrl = `/uploads/videos/${fileName}`;
      
      console.log(`Generated AI video file: ${filePath}`);
      console.log(`Video URL: ${videoUrl}`);
      return videoUrl;
      
    } catch (error) {
      console.error('Error generating video file:', error);
      throw new Error('Failed to generate video file');
    }
  }

  async createThumbnail(videoContent: VideoContent, visualStyle: string): Promise<string> {
    try {
      // Generate thumbnail using DALL-E
      const thumbnailResponse = await openai.images.generate({
        model: "dall-e-3",
        prompt: `Create a thumbnail for a Christian video titled "${videoContent.title}". ${this.generateBackgroundPrompt(videoContent.description, visualStyle)}. Include the title text overlay. Church-appropriate, professional quality.`,
        n: 1,
        size: "1024x1024",
        quality: "standard",
      });

      return thumbnailResponse.data[0].url || '';
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      throw new Error('Failed to generate thumbnail');
    }
  }

  async generateVideoSeries(
    topic: string, 
    episodeCount: number, 
    request: VideoGenerationRequest
  ): Promise<VideoContent[]> {
    try {
      const seriesResponse = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are creating a video series for a church. Generate a structured series with connected episodes."
          },
          {
            role: "user",
            content: `Create a ${episodeCount}-part video series about "${topic}". Each episode should be ${request.duration} seconds long and build upon the previous ones.`
          }
        ],
        response_format: { type: "json_object" },
      });

      const seriesData = JSON.parse(seriesResponse.choices[0].message.content || '{}');
      const episodes: VideoContent[] = [];

      if (seriesData.episodes && Array.isArray(seriesData.episodes)) {
        for (let i = 0; i < seriesData.episodes.length; i++) {
          const episodeRequest = {
            ...request,
            topic: seriesData.episodes[i].topic,
          };
          
          const episodeContent = await this.generateVideoContent(episodeRequest);
          episodes.push({
            ...episodeContent,
            title: `${seriesData.title} - Episode ${i + 1}: ${episodeContent.title}`,
          });
        }
      }

      return episodes;
    } catch (error) {
      console.error('Error generating video series:', error);
      throw new Error('Failed to generate video series');
    }
  }
}

export const aiVideoGenerator = new AIVideoGenerator();