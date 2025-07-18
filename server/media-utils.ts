// Utility functions for media processing and analysis
import fs from 'fs';
import path from 'path';

export interface MediaInfo {
  url: string;
  type: 'image' | 'video';
  base64?: string;
}

/**
 * Extract base64 data URL from uploaded media
 */
export function extractMediaForAnalysis(mediaPath: string): MediaInfo | null {
  try {
    if (!fs.existsSync(mediaPath)) {
      return null;
    }

    const extension = path.extname(mediaPath).toLowerCase();
    const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(extension);
    const isVideo = ['.mp4', '.mov', '.avi', '.webm'].includes(extension);

    if (!isImage && !isVideo) {
      return null;
    }

    // For images, convert to base64 for AI analysis
    if (isImage) {
      const imageBuffer = fs.readFileSync(mediaPath);
      const mimeType = extension === '.png' ? 'image/png' : 'image/jpeg';
      const base64 = `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
      
      return {
        url: base64,
        type: 'image',
        base64
      };
    }

    // For videos, we'll need to extract a frame (simplified for now)
    if (isVideo) {
      // In a full implementation, you'd extract a video frame here
      // For now, we'll return the path and handle it differently
      return {
        url: mediaPath,
        type: 'video'
      };
    }

    return null;
  } catch (error) {
    console.error('Error processing media for analysis:', error);
    return null;
  }
}

/**
 * Check if content contains media references
 */
export function extractMediaReferences(content: string): string[] {
  const mediaUrls: string[] = [];
  
  // Extract image URLs from markdown or HTML
  const imageRegex = /!\[.*?\]\((.*?)\)|<img.*?src=["'](.*?)["']/g;
  let match;
  while ((match = imageRegex.exec(content)) !== null) {
    mediaUrls.push(match[1] || match[2]);
  }

  // Extract video URLs
  const videoRegex = /<video.*?src=["'](.*?)["']|data:video\/[^;]+;base64,([A-Za-z0-9+/=]+)/g;
  while ((match = videoRegex.exec(content)) !== null) {
    mediaUrls.push(match[1] || `data:video/mp4;base64,${match[2]}`);
  }

  return mediaUrls;
}

/**
 * Determine media type from URL or path
 */
export function getMediaType(url: string): 'image' | 'video' | null {
  const lowercaseUrl = url.toLowerCase();
  
  if (lowercaseUrl.includes('data:image/') || 
      /\.(jpg|jpeg|png|gif|webp)(\?|$)/.test(lowercaseUrl)) {
    return 'image';
  }
  
  if (lowercaseUrl.includes('data:video/') || 
      /\.(mp4|mov|avi|webm)(\?|$)/.test(lowercaseUrl)) {
    return 'video';
  }
  
  return null;
}

/**
 * Analyze media attachments in content for moderation
 */
export async function analyzeContentMedia(content: string, attachments: any[] = []): Promise<MediaInfo[]> {
  const mediaItems: MediaInfo[] = [];
  
  // Check for embedded media in content
  const embeddedUrls = extractMediaReferences(content);
  for (const url of embeddedUrls) {
    const mediaType = getMediaType(url);
    if (mediaType) {
      mediaItems.push({ url, type: mediaType });
    }
  }
  
  // Check file attachments
  for (const attachment of attachments) {
    if (attachment.type && attachment.url) {
      const mediaType = getMediaType(attachment.url);
      if (mediaType) {
        mediaItems.push({ url: attachment.url, type: mediaType });
      }
    }
  }
  
  return mediaItems;
}