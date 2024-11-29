// app/services/claudeService.ts
import Anthropic from '@anthropic-ai/sdk';

// Initialize the Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

export class ClaudeService {
  static async generateSentence(word: string): Promise<{
    english: string;
    arabic: string;
    transliteration: string;
  }> {
    try {
      const prompt = `Generate a simple, everyday example sentence in Lebanese Arabic using the "${word}". 
      Format your response as a JSON object with three fields:
      - english: The English translation
      - arabic: The sentence in Arabic script
      - transliteration: The Lebanese Arabic pronunciation using English letters
      
      Make sure the sentence is casual, conversational Lebanese Arabic, not formal Arabic.`;

      const message = await anthropic.messages.create({
        model: "claude-3-opus-20240229",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      });

      const response = message.content[0].type === 'text' ? message.content[0].text : '';

      // Parse the JSON response
      return JSON.parse(response);
    } catch (error) {
      console.error('Error generating sentence:', error);
      throw new Error('Failed to generate sentence');
    }
  }
}