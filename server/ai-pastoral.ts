import OpenAI from "openai";
import { aiService } from './ai-service';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

export interface SoapSuggestion {
  observation: string;
  application: string;
  prayer: string;
  scripture?: string;
  scriptureReference?: string;
}

export interface ContextualInfo {
  userMood?: string;
  liturgicalSeason?: string;
  upcomingHolidays?: string[];
  currentEvents?: string[];
  personalContext?: string;
}

export async function generateSoapSuggestions(
  scripture: string,
  scriptureReference: string,
  contextualInfo?: ContextualInfo
): Promise<SoapSuggestion> {
  try {

    // Build contextual awareness
    const currentDate = new Date();
    const liturgicalContext = getLiturgicalContext(currentDate);
    const seasonalContext = getSeasonalContext(currentDate);
    
    let contextPrompt = '';
    
    if (contextualInfo?.userMood) {
      contextPrompt += `User's current mood: ${contextualInfo.userMood}\n`;
    }
    
    if (liturgicalContext.season) {
      contextPrompt += `Liturgical season: ${liturgicalContext.season}\n`;
    }
    
    if (liturgicalContext.upcomingHolidays.length > 0) {
      contextPrompt += `Upcoming Christian holidays: ${liturgicalContext.upcomingHolidays.join(', ')}\n`;
    }
    
    if (seasonalContext) {
      contextPrompt += `Seasonal context: ${seasonalContext}\n`;
    }
    
    if (contextualInfo?.currentEvents && contextualInfo.currentEvents.length > 0) {
      contextPrompt += `Current world context: ${contextualInfo.currentEvents.join(', ')}\n`;
    }
    
    if (contextualInfo?.personalContext) {
      contextPrompt += `Personal context: ${contextualInfo.personalContext}\n`;
    }

    const prompt = `As a pastoral AI assistant, help create meaningful spiritual reflections for this Scripture passage, taking into account the current context:

Scripture: ${scripture}
Reference: ${scriptureReference}

Current Context:
${contextPrompt}

Please provide thoughtful suggestions for each S.O.A.P. component that are sensitive to the user's current situation and the broader context. Consider how this Scripture speaks to their mood, the liturgical season, and current events.

Respond with JSON in this format:
{
  "observation": "Your contextually-aware observation here",
  "application": "Your contextually-relevant application here", 
  "prayer": "Your contextually-sensitive prayer here"
}`;

    const systemPrompt = "You are a wise, caring pastoral assistant who helps people connect deeply with Scripture. Provide thoughtful, biblically sound, and personally meaningful spiritual guidance that is sensitive to current circumstances, liturgical seasons, and world events. Tailor your responses to the user's emotional state and the broader context of their life and world.";
    
    const responseText = await aiService.complexReasoning(prompt, systemPrompt, 1000);
    const result = JSON.parse(responseText || '{}');
    

    return {
      observation: result.observation || '',
      application: result.application || '',
      prayer: result.prayer || ''
    };
  } catch (error) {
    
    throw new Error('Failed to generate AI suggestions. Please try again.');
  }
}

export async function generateCompleteSoapEntry(
  contextualInfo?: ContextualInfo,
  userId?: string,
  excludeRecentScriptures?: string[]
): Promise<SoapSuggestion> {
  try {
    // Build contextual awareness
    const currentDate = new Date();
    const liturgicalContext = getLiturgicalContext(currentDate);
    const seasonalContext = getSeasonalContext(currentDate);
    
    let contextPrompt = '';
    
    if (contextualInfo?.userMood) {
      contextPrompt += `User's current mood: ${contextualInfo.userMood}\n`;
    }
    
    if (liturgicalContext.season) {
      contextPrompt += `Liturgical season: ${liturgicalContext.season}\n`;
    }
    
    if (liturgicalContext.upcomingHolidays.length > 0) {
      contextPrompt += `Upcoming Christian holidays: ${liturgicalContext.upcomingHolidays.join(', ')}\n`;
    }
    
    if (seasonalContext) {
      contextPrompt += `Seasonal context: ${seasonalContext}\n`;
    }
    
    if (contextualInfo?.currentEvents && contextualInfo.currentEvents.length > 0) {
      contextPrompt += `Current world context: ${contextualInfo.currentEvents.join(', ')}\n`;
    }
    
    if (contextualInfo?.personalContext) {
      contextPrompt += `Personal context: ${contextualInfo.personalContext}\n`;
    }

    // Add randomization to ensure variety in scripture selection
    const randomSeed = Math.floor(Math.random() * 1000);
    const currentTimestamp = Date.now();

    // Create a list of alternative verses to encourage variety
    const alternativeVerses = [
      "Psalm 23:1-3", "Isaiah 40:31", "Philippians 4:13", "Romans 8:28", "2 Corinthians 12:9",
      "Psalm 46:10", "Jeremiah 29:11", "1 Peter 5:7", "Psalm 34:18", "Isaiah 41:10",
      "Proverbs 3:5-6", "John 14:27", "Romans 15:13", "Psalm 62:1-2", "2 Corinthians 4:16-18"
    ];
    const suggestedVerse = alternativeVerses[Math.floor(Math.random() * alternativeVerses.length)];

    // Build exclusion text for recent scriptures
    let exclusionText = '';
    if (excludeRecentScriptures && excludeRecentScriptures.length > 0) {
      exclusionText = `IMPORTANT: DO NOT use any of these recently used scriptures: ${excludeRecentScriptures.join(', ')}. `;
    }

    const prompt = `As a pastoral AI assistant, generate a complete S.O.A.P. (Scripture, Observation, Application, Prayer) entry that is perfectly suited to the current context and user's spiritual needs.

Current Context:
${contextPrompt}

Request ID: ${randomSeed}-${currentTimestamp}

${exclusionText}For variety, consider this suggested verse: ${suggestedVerse}, or choose from these categories:

Comfort & Healing Verses (avoid Matthew 11:28-30):
- Psalm 23:1-4 (The Lord is my shepherd)
- Isaiah 40:31 (Those who hope in the Lord will renew their strength)
- Psalm 34:18 (The Lord is close to the brokenhearted)
- 2 Corinthians 1:3-4 (God of all comfort)
- Psalm 147:3 (He heals the brokenhearted)

Financial Concern Verses:
- Philippians 4:19 (God will meet all your needs)
- Matthew 6:26 (Look at the birds of the air)
- Proverbs 3:9-10 (Honor the Lord with your wealth)
- 2 Corinthians 9:8 (God is able to bless you abundantly)

Grief & Doubt Verses:
- Psalm 30:5 (Weeping may stay for the night)
- John 14:1 (Do not let your hearts be troubled)
- Romans 8:38-39 (Nothing can separate us from God's love)
- Habakkuk 3:17-19 (Though the fig tree does not bud)

Choose a verse that:
- Addresses the user's current emotional state
- Is relevant to the liturgical season 
- Provides spiritual guidance and comfort
- Offers fresh perspective and variety
- Is NOT Matthew 11:28-30

Respond with JSON in this format:
{
  "scripture": "The complete Bible verse text here",
  "scriptureReference": "Book Chapter:Verse format (e.g., John 3:16)",
  "observation": "Your contextually-aware observation of what this Scripture says",
  "application": "Your contextually-relevant application for daily life", 
  "prayer": "Your contextually-sensitive prayer based on this Scripture"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are a wise, caring pastoral assistant who helps people connect deeply with Scripture. Select appropriate Bible passages and provide thoughtful, biblically sound, and personally meaningful spiritual guidance that is sensitive to current circumstances, liturgical seasons, and world events. Tailor your responses to the user's emotional state and the broader context of their life and world."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1200,
      temperature: 0.9,
      top_p: 0.95
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      scripture: result.scripture || '',
      scriptureReference: result.scriptureReference || '',
      observation: result.observation || '',
      application: result.application || '',
      prayer: result.prayer || ''
    };
  } catch (error) {
    throw new Error('Failed to generate complete SOAP entry');
  }
}

// Helper function to determine liturgical season and upcoming holidays
function getLiturgicalContext(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // JavaScript months are 0-indexed
  const day = date.getDate();
  
  // Calculate Easter date (simplified algorithm)
  const easter = calculateEaster(year);
  const ashWednesday = new Date(easter.getTime() - 46 * 24 * 60 * 60 * 1000);
  const palmSunday = new Date(easter.getTime() - 7 * 24 * 60 * 60 * 1000);
  const pentecost = new Date(easter.getTime() + 49 * 24 * 60 * 60 * 1000);
  
  const currentDate = new Date(year, month - 1, day);
  const advent = new Date(year, 11, 25); // Christmas
  const adventStart = new Date(advent.getTime() - (advent.getDay() + 21) * 24 * 60 * 60 * 1000);
  
  let season = '';
  const upcomingHolidays: string[] = [];
  
  // Determine current liturgical season
  if (currentDate >= adventStart && currentDate < new Date(year, 11, 25)) {
    season = 'Advent';
  } else if (currentDate >= new Date(year, 11, 25) && currentDate <= new Date(year + 1, 0, 6)) {
    season = 'Christmas';
  } else if (currentDate >= ashWednesday && currentDate < easter) {
    season = 'Lent';
  } else if (currentDate >= easter && currentDate < pentecost) {
    season = 'Easter';
  } else {
    season = 'Ordinary Time';
  }
  
  // Check for upcoming holidays within the next 30 days
  const thirtyDaysOut = new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  const holidays = [
    { date: ashWednesday, name: 'Ash Wednesday' },
    { date: palmSunday, name: 'Palm Sunday' },
    { date: easter, name: 'Easter' },
    { date: pentecost, name: 'Pentecost' },
    { date: new Date(year, 11, 25), name: 'Christmas' },
    { date: new Date(year, 0, 1), name: 'New Year' },
    { date: new Date(year, 9, 31), name: 'All Saints Day' },
  ];
  
  holidays.forEach(holiday => {
    if (holiday.date >= currentDate && holiday.date <= thirtyDaysOut) {
      upcomingHolidays.push(holiday.name);
    }
  });
  
  return { season, upcomingHolidays };
}

// Simplified Easter calculation
function calculateEaster(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  
  return new Date(year, month - 1, day);
}

// Helper function to get seasonal context
function getSeasonalContext(date: Date): string {
  const month = date.getMonth() + 1;
  
  if (month >= 3 && month <= 5) {
    return 'Spring - season of new life and growth';
  } else if (month >= 6 && month <= 8) {
    return 'Summer - season of abundance and rest';
  } else if (month >= 9 && month <= 11) {
    return 'Fall - season of harvest and gratitude';
  } else {
    return 'Winter - season of reflection and preparation';
  }
}

export async function enhanceSoapEntry(
  scripture: string,
  scriptureReference: string,
  observation: string,
  application: string,
  prayer: string
): Promise<{
  enhancedObservation: string;
  enhancedApplication: string;
  enhancedPrayer: string;
}> {
  try {
    const prompt = `As a pastoral AI assistant, please enhance and deepen this S.O.A.P. reflection:

Scripture: ${scripture}
Reference: ${scriptureReference}

Current Reflection:
Observation: ${observation}
Application: ${application}
Prayer: ${prayer}

Please provide enhanced versions that are more detailed, spiritually rich, and personally meaningful while preserving the original intent. Respond in JSON format:

{
  "enhancedObservation": "Enhanced observation here",
  "enhancedApplication": "Enhanced application here",
  "enhancedPrayer": "Enhanced prayer here"
}`;

    const systemPrompt = "You are a wise pastoral assistant who helps deepen spiritual reflections. Enhance the user's thoughts while maintaining their personal voice and intent.";
    
    const responseText = await aiService.complexReasoning(prompt, systemPrompt, 1000);
    const result = JSON.parse(responseText || '{}');
    
    return {
      enhancedObservation: result.enhancedObservation || observation,
      enhancedApplication: result.enhancedApplication || application,
      enhancedPrayer: result.enhancedPrayer || prayer
    };
  } catch (error) {
    throw new Error('Failed to enhance reflection. Please try again.');
  }
}

export async function generateScriptureQuestions(
  scripture: string,
  scriptureReference: string
): Promise<string[]> {
  try {
    const prompt = `For this Scripture passage, generate 3-5 thoughtful reflection questions that help someone go deeper in their study:

Scripture: ${scripture}
Reference: ${scriptureReference}

Please provide questions that encourage:
- Personal reflection and application
- Deeper understanding of the text
- Connection to daily life
- Spiritual growth

Respond with a JSON array of question strings:
{
  "questions": ["Question 1", "Question 2", "Question 3"]
}`;

    const systemPrompt = "You are a pastoral assistant who creates meaningful Bible study questions that encourage deep spiritual reflection.";
    
    const responseText = await aiService.simpleCompletion(prompt, 500);
    const result = JSON.parse(responseText || '{}');
    return result.questions || [];
  } catch (error) {
    return [];
  }
}