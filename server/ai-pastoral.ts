import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

export interface SoapSuggestion {
  observation: string;
  application: string;
  prayer: string;
}

export async function generateSoapSuggestions(
  scripture: string,
  scriptureReference: string,
  userContext?: string
): Promise<SoapSuggestion> {
  try {
    const prompt = `As a pastoral AI assistant, help create meaningful spiritual reflections for this Scripture passage:

Scripture: ${scripture}
Reference: ${scriptureReference}
${userContext ? `User Context: ${userContext}` : ''}

Please provide thoughtful suggestions for each S.O.A.P. component in JSON format:

1. Observation: What does this passage say? Key themes, context, and meaning.
2. Application: How can this apply to daily life? Practical, personal applications.
3. Prayer: A heartfelt prayer response to this Scripture.

Respond with JSON in this format:
{
  "observation": "Your observation here",
  "application": "Your application here", 
  "prayer": "Your prayer here"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are a wise, caring pastoral assistant who helps people connect deeply with Scripture. Provide thoughtful, biblically sound, and personally meaningful spiritual guidance."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 800,
      temperature: 0.7
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      observation: result.observation || '',
      application: result.application || '',
      prayer: result.prayer || ''
    };
  } catch (error) {
    console.error('Error generating SOAP suggestions:', error);
    throw new Error('Failed to generate AI suggestions. Please try again.');
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

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are a wise pastoral assistant who helps deepen spiritual reflections. Enhance the user's thoughts while maintaining their personal voice and intent."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
      temperature: 0.6
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      enhancedObservation: result.enhancedObservation || observation,
      enhancedApplication: result.enhancedApplication || application,
      enhancedPrayer: result.enhancedPrayer || prayer
    };
  } catch (error) {
    console.error('Error enhancing SOAP entry:', error);
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

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are a pastoral assistant who creates meaningful Bible study questions that encourage deep spiritual reflection."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
      temperature: 0.7
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result.questions || [];
  } catch (error) {
    console.error('Error generating Scripture questions:', error);
    return [];
  }
}