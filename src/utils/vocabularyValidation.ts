import type { VocabularyInput } from '@/models/Vocabulary';

export type VocabularyValidationError = 'required' | 'invalidImageUrl';

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
    vietnameseMeaning: input.vietnameseMeaning.trim(),
    englishMeaning: input.englishMeaning.trim(),
    imageUrl: input.imageUrl?.trim() || null,
  };
}

export function validateVocabularyInput(input: VocabularyInput): VocabularyValidationError | null {
  if (!input.word.trim() || !input.vietnameseMeaning.trim() || !input.englishMeaning.trim()) return 'required';
  if (input.imageUrl && !isHttpUrl(input.imageUrl.trim())) return 'invalidImageUrl';
  return null;
}
