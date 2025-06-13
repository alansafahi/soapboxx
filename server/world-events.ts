import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

export interface WorldEvent {
  title: string;
  description: string;
  category: 'disaster' | 'conflict' | 'celebration' | 'crisis' | 'tragedy' | 'breakthrough';
  impact: 'local' | 'national' | 'global';
  date: Date;
  spiritualRelevance: string;
}

export async function getCurrentWorldEvents(): Promise<WorldEvent[]> {
  try {
    const prompt = `As a pastoral AI assistant, identify 5-7 current significant world events from the past 30 days that would be relevant for Christian spiritual reflection and prayer. Consider events that might impact people's emotional and spiritual state.

Include categories like:
- Natural disasters (earthquakes, hurricanes, floods)
- Global conflicts or tensions
- Humanitarian crises
- Significant losses (public figures, tragedies)
- Celebrations or positive breakthroughs
- Economic challenges
- Health crises

For each event, provide:
1. Title: Brief event name
2. Description: 1-2 sentence summary
3. Category: disaster, conflict, celebration, crisis, tragedy, or breakthrough
4. Impact: local, national, or global
5. Spiritual relevance: How this might affect people's spiritual needs

Respond in JSON format:
{
  "events": [
    {
      "title": "Event name",
      "description": "Brief description",
      "category": "disaster",
      "impact": "global",
      "spiritualRelevance": "How this affects spiritual needs"
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are a pastoral assistant who helps identify current events that would be spiritually significant for Christians to consider in their prayers and reflections. Focus on events that would impact people's emotional and spiritual state."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1500,
      temperature: 0.3
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return (result.events || []).map((event: any) => ({
      title: event.title,
      description: event.description,
      category: event.category,
      impact: event.impact,
      date: new Date(),
      spiritualRelevance: event.spiritualRelevance
    }));
  } catch (error) {
    console.error('Error fetching world events:', error);
    // Return some general categories that are often relevant
    return [
      {
        title: "Global Uncertainty",
        description: "Ongoing world tensions and economic challenges affecting communities worldwide",
        category: 'crisis' as const,
        impact: 'global' as const,
        date: new Date(),
        spiritualRelevance: "People may be feeling anxious about the future and need hope and peace"
      },
      {
        title: "Natural Disasters",
        description: "Recent natural disasters affecting various communities around the world",
        category: 'disaster' as const,
        impact: 'global' as const,
        date: new Date(),
        spiritualRelevance: "Communities need comfort, healing, and support during recovery"
      }
    ];
  }
}

export async function getSpiritualResponseToEvents(events: WorldEvent[]): Promise<string[]> {
  try {
    const eventsText = events.map(e => `${e.title}: ${e.description} (${e.spiritualRelevance})`).join('\n');
    
    const prompt = `Given these current world events:

${eventsText}

Provide 3-5 brief spiritual themes that Christians might want to focus on in their prayers and Bible study during this time. Each theme should be 3-5 words that capture how believers might respond spiritually to these circumstances.

Examples: "Hope in uncertainty", "Comfort for suffering", "Peace amid chaos", "Strength for service"

Respond with JSON:
{
  "themes": ["theme 1", "theme 2", "theme 3"]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are a pastoral assistant who helps identify spiritual themes and responses to current world events."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 300,
      temperature: 0.4
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result.themes || [];
  } catch (error) {
    console.error('Error generating spiritual themes:', error);
    return ['Hope in uncertainty', 'Peace amid chaos', 'Comfort for suffering'];
  }
}

// Cache world events for 6 hours to avoid excessive API calls
let cachedEvents: { events: WorldEvent[], timestamp: number } | null = null;
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

export async function getCachedWorldEvents(): Promise<WorldEvent[]> {
  const now = Date.now();
  
  if (cachedEvents && (now - cachedEvents.timestamp) < CACHE_DURATION) {
    return cachedEvents.events;
  }
  
  const events = await getCurrentWorldEvents();
  cachedEvents = { events, timestamp: now };
  
  return events;
}