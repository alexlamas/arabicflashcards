import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

const MODEL = "claude-3-opus-20240229";

export class ClaudeService {
  private static async createMessage(prompt: string, temperature = 0.7) {
    if (!process.env.CLAUDE_API_KEY) {
      throw new Error("CLAUDE_API_KEY is not configured");
    }
    
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
      temperature,
    });
    
    if (!message.content || message.content.length === 0) {
      throw new Error("No content in Claude response");
    }
    
    return message.content[0].type === "text" ? message.content[0].text : "";
  }

  static async chatCompletion(prompt: string): Promise<string> {
    try {
      return await this.createMessage(prompt);
    } catch (error) {
      console.error("Error in Claude chat completion:", error);
      throw new Error("Failed to get completion from Claude");
    }
  }

  static async generateSentence(
    word: string,
    english?: string,
    type?: string,
    notes?: string,
    existingData?: {
      arabic?: string;
      transliteration?: string;
      english?: string;
    }
  ): Promise<{
    english: string;
    arabic: string;
    transliteration: string;
  }> {
    try {
      const contextInfo = [];
      if (type) contextInfo.push(`Word type: ${type}`);
      if (notes) contextInfo.push(`Additional notes: ${notes}`);
      
      const contextSection = contextInfo.length > 0 
        ? `\nContext information about the word:\n${contextInfo.join('\n')}\n` 
        : '';

      // Check what existing data we have
      const hasExistingEnglish = existingData?.english && existingData.english.trim().length > 0;
      const hasExistingTransliteration = existingData?.transliteration && existingData.transliteration.trim().length > 0;
      const hasExistingArabic = existingData?.arabic && existingData.arabic.trim().length > 0;
      
      let prompt;
      
      // Build prompt based on what's already provided
      const existingFields = [];
      if (hasExistingEnglish) existingFields.push(`English: "${existingData.english}"`);
      if (hasExistingTransliteration) existingFields.push(`Transliteration: "${existingData.transliteration}"`);
      if (hasExistingArabic) existingFields.push(`Arabic: "${existingData.arabic}"`);
      
      const existingSection = existingFields.length > 0 
        ? `\nProvided sentence parts:\n${existingFields.join('\n')}\n` 
        : '';

      if (existingFields.length > 0) {
        // Some fields are already filled - complete/correct them
        prompt = `You are an AI assistant specialized in Lebanese Arabic language education. Your task is to complete or gently correct an example sentence.

Word to include: "${word}"${contextSection}${existingSection}

Your task:
1. If all three fields are provided, make only minimal corrections if there are obvious errors
2. If some fields are missing, generate them based on the provided ones
3. Ensure the word "${word}" appears naturally in the sentence
4. Keep as close as possible to the provided content - only change what's necessary

Guidelines:
- Preserve the original meaning and structure when possible
- Only correct clear grammatical errors or unnatural phrasing
- Ensure consistency between all three versions (Arabic, transliteration, English)
- Use numbers in transliteration for Arabic sounds (e.g., "3" for ع)
- Be culturally appropriate

Return ONLY a JSON object with this exact structure:
{
  "arabic": "${hasExistingArabic ? existingData.arabic : 'The sentence in Arabic script'}",
  "transliteration": "${hasExistingTransliteration ? existingData.transliteration : 'The Lebanese Arabic pronunciation'}",
  "english": "${hasExistingEnglish ? existingData.english : 'The English translation'}"
}

Fill in any missing fields and make minimal corrections to existing ones if needed.
No additional text or explanations. Just the JSON.`;
      } else {
        // No existing fields - generate new sentence
        const meaningContext = english ? `\nEnglish meaning: "${english}"` : '';
        
        prompt = `You are an AI assistant specialized in Lebanese Arabic language education. Your task is to generate an example sentence using a given Arabic word.

Arabic word: "${word}"${meaningContext}${contextSection}

Create a simple, clear example sentence in Lebanese Arabic that uses this word naturally.

Guidelines:
- Keep the sentence short and simple (5-10 words)
- Use ONLY common, everyday vocabulary (water, food, house, go, come, want, have, good, bad, big, small, etc.)
- Ensure the sentence is grammatically correct and natural in Lebanese Arabic
- Use the context provided to choose the correct meaning if the word has multiple meanings
- Be culturally appropriate
- Use numbers in transliteration for Arabic sounds (e.g., "3" for ع)
- Vary sentence structures for creativity

Return ONLY a JSON object with this exact structure:
{
  "arabic": "The sentence in Arabic script",
  "transliteration": "The Lebanese Arabic pronunciation",
  "english": "The English translation"
}

No additional text or explanations. Just the JSON.`;
      }

      const response = await this.createMessage(prompt, 1.0);
      
      try {
        const parsed = JSON.parse(response);
        return parsed;
      } catch (parseError) {
        console.error("Failed to parse Claude response:", response);
        console.error("Parse error:", parseError);
        throw new Error("Invalid response format from Claude");
      }
    } catch (error) {
      console.error("Error generating sentence - full error:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      throw error;
    }
  }
}
