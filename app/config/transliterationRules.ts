/**
 * Transliteration Rules for Lebanese Arabic
 *
 * DEPRECATED: Rules are now stored in the database.
 * Use TransliterationService.getTransliterationPrompt() instead.
 *
 * This file is kept for reference only.
 */

// Legacy export for backwards compatibility - not used
export const transliterationRules: Record<string, string> = {};
export const transliterationNotes = "";

export function getTransliterationPrompt(): string {
  console.warn("getTransliterationPrompt() is deprecated. Use TransliterationService.getTransliterationPrompt() instead.");
  return "";
}
