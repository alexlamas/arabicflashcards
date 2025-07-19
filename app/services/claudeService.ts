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
    notes?: string
  ): Promise<{
    english: string;
    arabic: string;
    transliteration: string;
  }> {
    try {
      const contextInfo = [];
      if (english) contextInfo.push(`English meaning: "${english}"`);
      if (type) contextInfo.push(`Word type: ${type}`);
      if (notes) contextInfo.push(`Additional notes: ${notes}`);
      
      const contextSection = contextInfo.length > 0 
        ? `\nContext information about the word:\n${contextInfo.join('\n')}\n` 
        : '';

      const prompt = `You are an AI assistant specialized in Lebanese Arabic language education. Your task is to generate an example sentence using a given Arabic word.

Arabic word: "${word}"${contextSection}

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
