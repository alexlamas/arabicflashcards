// app/services/claudeService.ts
import Anthropic from '@anthropic-ai/sdk';

// Initialize the Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

export class ClaudeService {

  static async chatCompletion(prompt: string): Promise<string> {
    try {
      const message = await anthropic.messages.create({
        model: "claude-3-opus-20240229",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      });
  
      const response = message.content[0].type === 'text' ? message.content[0].text : '';
      return response;
    } catch (error) {
      console.error('Error in Claude chat completion:', error);
      throw new Error('Failed to get completion from Claude');
    }
  }
  
  static async generateSentence(word: string): Promise<{
    english: string;
    arabic: string;
    transliteration: string;
  }> {
    try {
      const prompt = `You are an AI assistant specialized in Lebanese Arabic language education. Your task is to generate an example sentence using a given Arabic word, suitable for a language learning application.
                      Here is the Arabic word you will use in your example sentence: "${word}"
                      Your goal is to create a simple, clear example sentence in Lebanese Arabic that incorporates this word. The sentence should be natural, conversational, and helpful for learners of Lebanese Arabic.

                      Provide ONLY a JSON object with the following structure:
                      {
                        "arabic": "The sentence in Arabic script",
                        "transliteration": "The Lebanese Arabic pronunciation using English letters",
                        "english": "The English translation"
                      }

                      Ensure that your response adheres to these guidelines:
                      1. Keep the sentence relatively short and simple (around 5-10 words).
                      2. Use common, everyday vocabulary that a language learner might encounter.
                      3. Ensure the sentence sounds natural and conversational.
                      4. If the word has multiple meanings, choose the most common usage.
                      5. If applicable, incorporate some aspect of Lebanese culture or daily life.
                      6. Be culturally sensitive and appropriate. Avoid controversial topics, offensive language, or content that might be considered inappropriate for a general audience.
                      7. Use numbers in the transliteration to represent Arabic sounds not present in English (e.g., "3" for ع).

                      Remember, your final output should be ONLY the JSON object, with no additional text or explanations.`;

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