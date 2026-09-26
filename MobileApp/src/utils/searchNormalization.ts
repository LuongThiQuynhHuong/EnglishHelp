// Store a derived search field so SQLite LIKE can match Vietnamese with or without accents.
export function normalizeSearchText(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLocaleLowerCase('en').replace(/\s+/g, ' ').trim();
}

export function vocabularyContentKey(word: string, vietnameseMeaning: string, englishMeaning: string): string {
  return JSON.stringify([word, vietnameseMeaning, englishMeaning].map(normalizeSearchText));
}

export function makeSearchText(word: string, vietnameseMeaning: string, englishMeaning: string): string {
  return normalizeSearchText(`${word} ${vietnameseMeaning} ${englishMeaning}`);
}
