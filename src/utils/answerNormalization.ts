// V1 keeps punctuation meaningful while treating spacing and case as typing variation.
export function normalizeAnswer(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('en');
}

export function answersMatch(answer: string, word: string): boolean {
  return normalizeAnswer(answer) === normalizeAnswer(word);
}
