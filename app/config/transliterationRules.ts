/**
 * Transliteration Rules for Lebanese Arabic
 *
 * Edit this file to change how Arabic letters are transliterated.
 * These rules are sent to Claude when generating translations.
 */

export const transliterationRules: Record<string, string> = {
  // Emphatic/guttural consonants (numbered notation)
  "ع": "3",      // ayn - voiced pharyngeal fricative
  "ء": "2",      // hamza - glottal stop
  "ح": "7",      // ha - voiceless pharyngeal fricative
  "ق": "2",      // qaf - in Lebanese often glottal stop like hamza

  // Consonant digraphs
  "خ": "kh",     // kha - like Scottish "loch"
  "غ": "gh",     // ghayn - like French "r"
  "ش": "sh",     // shin
  "ث": "th",     // tha - like "think" (often becomes "s" or "t" in Lebanese)
  "ذ": "dh",     // dhal - like "the" (often becomes "d" or "z" in Lebanese)

  // Emphatic consonants (can use capital letters if preferred)
  "ص": "s",      // sad - emphatic "s"
  "ض": "d",      // dad - emphatic "d"
  "ط": "t",      // ta - emphatic "t"
  "ظ": "z",      // za - emphatic "z"

  // Standard consonants
  "ب": "b",
  "ت": "t",
  "ج": "j",
  "د": "d",
  "ر": "r",
  "ز": "z",
  "س": "s",
  "ف": "f",
  "ك": "k",
  "ل": "l",
  "م": "m",
  "ن": "n",
  "ه": "h",
  "و": "w",      // also long "u" or "o"
  "ي": "y",      // also long "i" or "e"

  // Vowels (short vowels often omitted in Arabic script)
  "ا": "a",      // alif - long "a"
  "ى": "a",      // alif maqsura
  "ة": "a",      // ta marbuta (or "e" at end of words)
};

/**
 * Additional notes for Claude about transliteration style
 */
export const transliterationNotes = `
- Use lowercase for all transliterations
- Double vowels for long sounds (e.g., "aa", "ii", "uu")
- Use "e" for short "i" sounds common in Lebanese dialect
- Use "o" for short "u" sounds common in Lebanese dialect
- Separate words with spaces as they would be in English
`;

/**
 * Generate the transliteration prompt to include in Claude requests
 */
export function getTransliterationPrompt(): string {
  const rules = Object.entries(transliterationRules)
    .map(([arabic, latin]) => `${arabic}=${latin}`)
    .join(", ");

  return `
TRANSLITERATION RULES:
Use these specific transliterations for Arabic letters: ${rules}

${transliterationNotes}
`.trim();
}
