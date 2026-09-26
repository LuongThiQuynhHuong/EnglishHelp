import type { VocabularyInput } from '@/models/Vocabulary';
import { isWordClass } from '@/models/WordClass';

export type VocabularyValidationError = 'required' | 'invalidImageUrl' | 'invalidWordClass';

export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (url.protocol === 'http:' || url.protocol === 'https:') && Boolean(url.hostname);
  } catch {
    return false;
  }
}

export function cleanVocabularyInput(input: VocabularyInput): VocabularyInput {
  return {
    word: input.word.trim().replace(/\s+/g, ' '),
    wordClass: input.wordClass,
    ipa: input.ipa?.trim() || null,
    vietnameseMeaning: input.vietnameseMeaning.trim(),
    englishMeaning: input.englishMeaning.trim(),
    imageUrl: input.imageUrl?.trim() || null,
  };
}

export function validateVocabularyInput(input: VocabularyInput): VocabularyValidationError | null {
  if (!input.word.trim() || !input.vietnameseMeaning.trim() || !input.englishMeaning.trim()) return 'required';
  if (input.wordClass !== null && !isWordClass(input.wordClass)) return 'invalidWordClass';
  if (input.imageUrl && !isHttpUrl(input.imageUrl.trim())) return 'invalidImageUrl';
  return null;
}
