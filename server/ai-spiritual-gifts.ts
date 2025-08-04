import OpenAI from 'openai';
import { Request, Response } from 'express';
import { db } from './db';
import { soapEntries } from '../shared/schema';
import { eq, desc } from 'drizzle-orm';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeUserSpiritualGifts(req: Request, res: Response) {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Get user's recent SOAP journal entries (last 30 entries or past 3 months)
    const recentEntries = await db
      .select()
      .from(soapEntries)
      .where(eq(soapEntries.userId, userId))
      .orderBy(desc(soapEntries.createdAt))
      .limit(30);

    if (recentEntries.length === 0) {
      return res.json({
        message: "Complete some SOAP journal entries first, and I'll analyze your spiritual patterns to suggest gifts!",
        suggestedGifts: [],
        confidence: 0
      });
    }

    // Prepare journal content for AI analysis
    const journalContent = recentEntries.map(entry => {
      return `
Date: ${entry.createdAt?.toDateString()}
Scripture: ${entry.scripture || 'N/A'}
Observation: ${entry.observation || ''}
Application: ${entry.application || ''}
Prayer: ${entry.prayer || ''}
---`;
    }).join('\n');

    // AI prompt for spiritual gifts analysis
    const prompt = `
As a Christian spiritual gifts counselor, analyze these SOAP (Scripture, Observation, Application, Prayer) journal entries to identify potential spiritual gifts. Look for patterns in:

1. What themes the person consistently focuses on
2. How they apply Scripture to life situations  
3. Their prayer concerns and heart for others
4. Repeated areas of interest, passion, or insight

Journal Entries:
${journalContent}

Based on these patterns, identify the top 3 spiritual gifts this person likely possesses from this list:
- Leadership, Teaching, Administration, Mercy, Service, Evangelism, Encouragement, Giving, Hospitality, Helps, Faith, Discernment, Wisdom, Intercession

Provide your analysis in this JSON format:
{
  "message": "A personalized message explaining what you observed in their journaling patterns (2-3 sentences)",
  "suggestedGifts": ["Gift1", "Gift2", "Gift3"],
  "confidence": 0.8,
  "reasoning": "Brief explanation of the key patterns that led to these suggestions"
}

Focus on authentic patterns, not just keywords. Consider their heart, concerns, and spiritual focus.
`;

    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a wise Christian spiritual gifts counselor who helps people discover their God-given gifts through their spiritual practices and journal reflections." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
      temperature: 0.7
    });

    const analysis = JSON.parse(response.choices[0].message.content || '{}');
    
    res.json(analysis);

  } catch (error) {
    
    res.status(500).json({ 
      error: 'Failed to analyze spiritual gifts',
      message: "I'm having trouble analyzing your journal entries right now. Your assessment results are still valid!"
    });
  }
}