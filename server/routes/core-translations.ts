import { Request, Response } from 'express';
import { translationOptimizer } from '../translation-optimizer';

/**
 * API endpoint for fetching core translations (hybrid approach)
 * Returns only essential UI translations from database for performance
 */
export const getCoreTranslations = async (req: Request, res: Response) => {
  try {
    const { language } = req.params;
    
    if (!language || language.length !== 2) {
      return res.status(400).json({ 
        error: 'Invalid language code. Must be 2-character ISO code.' 
      });
    }

    // Get core translations from database
    const coreTranslations = await translationOptimizer.getCoreTranslations(language);
    
    return res.json({
      translations: coreTranslations,
      language,
      count: Object.keys(coreTranslations).length,
      type: 'core',
      cacheTime: 15 * 60 * 1000 // 15 minutes
    });
    
  } catch (error) {
    console.error('Error fetching core translations:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch core translations',
      translations: {} 
    });
  }
};

/**
 * API endpoint for AI translation of missing keys
 */
export const getAITranslation = async (req: Request, res: Response) => {
  try {
    const { key, text, targetLanguage } = req.body;
    
    if (!key || !text || !targetLanguage) {
      return res.status(400).json({ 
        error: 'Missing required fields: key, text, targetLanguage' 
      });
    }

    // For now, return the English text (AI translation would be implemented here)
    // This is a placeholder for the AI translation service
    return res.json({
      key,
      translation: text, // Would be AI-translated text
      targetLanguage,
      source: 'ai',
      cached: false
    });
    
  } catch (error) {
    console.error('Error with AI translation:', error);
    return res.status(500).json({ 
      error: 'AI translation failed',
      translation: req.body.text || req.body.key 
    });
  }
};