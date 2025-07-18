// Media-specific moderation endpoints
import { Request, Response } from 'express';
import { analyzeContentForViolations } from '../ai-moderation.js';
import { extractMediaForAnalysis, getMediaType } from '../media-utils.js';

// Simple middleware check (will integrate with main auth system)
const isAuthenticated = (req: Request, res: Response, next: any) => {
  if (req.session?.userId) {
    next();
  } else {
    res.status(401).json({ error: 'Authentication required' });
  }
};

// Analyze uploaded media before posting
router.post('/api/media/analyze', isAuthenticated, async (req, res) => {
  try {
    const { mediaUrl, mediaType, contentText = '' } = req.body;
    
    if (!mediaUrl) {
      return res.status(400).json({ error: 'Media URL required' });
    }

    const detectedType = getMediaType(mediaUrl) || mediaType;
    
    if (!detectedType) {
      return res.status(400).json({ error: 'Invalid media type' });
    }

    const moderationResult = await analyzeContentForViolations(
      contentText, 
      'media_upload', 
      mediaUrl, 
      detectedType
    );

    res.json({
      safe: !moderationResult.flagged,
      analysis: moderationResult,
      recommendations: generateMediaRecommendations(moderationResult)
    });

  } catch (error) {
    console.error('Media analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

// Bulk analyze multiple media items
router.post('/api/media/bulk-analyze', isAuthenticated, async (req, res) => {
  try {
    const { mediaItems, contentText = '' } = req.body;
    
    if (!Array.isArray(mediaItems) || mediaItems.length === 0) {
      return res.status(400).json({ error: 'Media items array required' });
    }

    const results = [];
    
    for (const item of mediaItems) {
      const mediaType = getMediaType(item.url);
      if (mediaType) {
        try {
          const result = await analyzeContentForViolations(
            contentText, 
            'media_upload', 
            item.url, 
            mediaType
          );
          results.push({
            url: item.url,
            type: mediaType,
            analysis: result,
            safe: !result.flagged
          });
        } catch (error) {
          results.push({
            url: item.url,
            type: mediaType,
            error: 'Analysis failed',
            safe: false
          });
        }
      }
    }

    const allSafe = results.every(r => r.safe);
    const highPriorityFlags = results.filter(r => r.analysis?.priority === 'high');

    res.json({
      overall: {
        safe: allSafe,
        totalItems: results.length,
        flaggedItems: results.filter(r => !r.safe).length,
        highPriorityFlags: highPriorityFlags.length
      },
      results,
      recommendations: allSafe ? [] : generateBulkRecommendations(results)
    });

  } catch (error) {
    console.error('Bulk media analysis error:', error);
    res.status(500).json({ error: 'Bulk analysis failed' });
  }
});

function generateMediaRecommendations(result: any): string[] {
  const recommendations = [];
  
  if (result.flagged) {
    if (result.priority === 'high') {
      recommendations.push('This content violates community guidelines and cannot be posted');
      recommendations.push('Consider sharing faith-appropriate content that builds up the community');
    } else if (result.priority === 'medium') {
      recommendations.push('Please review this content before posting');
      recommendations.push('Consider adding context or removing concerning elements');
    } else {
      recommendations.push('Minor concerns detected - please review before posting');
    }
    
    if (result.mediaAnalysis?.concerns?.length > 0) {
      recommendations.push(`Visual concerns: ${result.mediaAnalysis.concerns.join(', ')}`);
    }
  } else {
    recommendations.push('Content appears appropriate for the faith community');
  }
  
  return recommendations;
}

function generateBulkRecommendations(results: any[]): string[] {
  const recommendations = [];
  const flaggedCount = results.filter(r => !r.safe).length;
  
  if (flaggedCount > 0) {
    recommendations.push(`${flaggedCount} item(s) require attention before posting`);
    
    const highPriority = results.filter(r => r.analysis?.priority === 'high');
    if (highPriority.length > 0) {
      recommendations.push(`${highPriority.length} item(s) have serious violations that must be addressed`);
    }
    
    recommendations.push('Review each flagged item and consider alternatives that align with community values');
  }
  
  return recommendations;
}

// Export individual route handlers
export default function(req: Request, res: Response, next: any) {
  const url = req.url;
  const method = req.method;
  
  if (method === 'POST' && url === '/analyze') {
    return analyzeMedia(req, res);
  } else if (method === 'POST' && url === '/bulk-analyze') {
    return bulkAnalyzeMedia(req, res);
  } else {
    next();
  }
}

// Individual route handlers
async function analyzeMedia(req: Request, res: Response) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    const { mediaUrl, mediaType, contentText = '' } = req.body;
    
    if (!mediaUrl) {
      return res.status(400).json({ error: 'Media URL required' });
    }

    const detectedType = getMediaType(mediaUrl) || mediaType;
    
    if (!detectedType) {
      return res.status(400).json({ error: 'Invalid media type' });
    }

    const moderationResult = await analyzeContentForViolations(
      contentText, 
      'media_upload', 
      mediaUrl, 
      detectedType
    );

    res.json({
      safe: !moderationResult.flagged,
      analysis: moderationResult,
      recommendations: generateMediaRecommendations(moderationResult)
    });

  } catch (error) {
    console.error('Media analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
}

async function bulkAnalyzeMedia(req: Request, res: Response) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    const { mediaItems, contentText = '' } = req.body;
    
    if (!Array.isArray(mediaItems) || mediaItems.length === 0) {
      return res.status(400).json({ error: 'Media items array required' });
    }

    const results = [];
    
    for (const item of mediaItems) {
      const mediaType = getMediaType(item.url);
      if (mediaType) {
        try {
          const result = await analyzeContentForViolations(
            contentText, 
            'media_upload', 
            item.url, 
            mediaType
          );
          results.push({
            url: item.url,
            type: mediaType,
            analysis: result,
            safe: !result.flagged
          });
        } catch (error) {
          results.push({
            url: item.url,
            type: mediaType,
            error: 'Analysis failed',
            safe: false
          });
        }
      }
    }

    const allSafe = results.every(r => r.safe);
    const highPriorityFlags = results.filter(r => r.analysis?.priority === 'high');

    res.json({
      overall: {
        safe: allSafe,
        totalItems: results.length,
        flaggedItems: results.filter(r => !r.safe).length,
        highPriorityFlags: highPriorityFlags.length
      },
      results,
      recommendations: allSafe ? [] : generateBulkRecommendations(results)
    });

  } catch (error) {
    console.error('Bulk media analysis error:', error);
    res.status(500).json({ error: 'Bulk analysis failed' });
  }
}