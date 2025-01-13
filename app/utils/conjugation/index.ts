import type { Language } from './types';
import { japaneseRules } from './japanese';
import { romajiRules } from './romaji';
import { englishRules } from './english';
import { nepaliRules } from './nepali';

const rules = {
  japanese: japaneseRules,
  japanese_romaji: romajiRules,
  english: englishRules,
  nepali: nepaliRules
};

export function conjugate(word: unknown, language: Language, tense: string, context?: { prevWords?: string[] }): string {
  if (!word || typeof word !== 'string') {
    return typeof word === 'string' ? word : '';
  }

  const languageRules = rules[language];
  const trimmedWord = word.trim();

  // Check if it's a non-verb
  if (languageRules.nonVerbs.includes(trimmedWord)) {
    return trimmedWord;
  }

  // Find matching verb class and conjugate
  const verbClass = languageRules.verbClasses.find(vc => vc.test(trimmedWord));
  if (verbClass) {
    const result = verbClass.conjugate(trimmedWord, tense, context);
    return result;
  }

  return trimmedWord;
}

export { rules as RULES }; 