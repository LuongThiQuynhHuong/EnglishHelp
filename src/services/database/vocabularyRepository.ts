import * as Crypto from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';
import type { Vocabulary, VocabularyInput } from '@/models/Vocabulary';
import { makeSearchText, normalizeSearchText, vocabularyContentKey } from '@/utils/searchNormalization';
import { cleanVocabularyInput, validateVocabularyInput } from '@/utils/vocabularyValidation';
import { toVocabulary, type VocabularyRow } from './rowMappers';

export class VocabularyRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async list(): Promise<Vocabulary[]> {
    const rows = await this.db.getAllAsync<VocabularyRow>('SELECT * FROM vocabularies ORDER BY created_at DESC, id DESC');
    return rows.map(toVocabulary);
  }

  async get(id: string): Promise<Vocabulary | null> {
    const row = await this.db.getFirstAsync<VocabularyRow>('SELECT * FROM vocabularies WHERE id = ?', id);
    return row ? toVocabulary(row) : null;
  }

  async search(query: string): Promise<Vocabulary[]> {
    // Escape LIKE wildcards from user input; the normalized field supports accent-insensitive search.
    const term = normalizeSearchText(query).replace(/[\\%_]/g, '\\$&');
    if (!term) return [];
    const rows = await this.db.getAllAsync<VocabularyRow>("SELECT * FROM vocabularies WHERE search_text LIKE ? ESCAPE '\\' ORDER BY created_at DESC, id DESC", `%${term}%`);
    return rows.map(toVocabulary);
  }

  async create(rawInput: VocabularyInput): Promise<Vocabulary> {
    const input = cleanVocabularyInput(rawInput);
    const validation = validateVocabularyInput(input);
    if (validation) throw new Error(validation);
    const key = vocabularyContentKey(input.word, input.vietnameseMeaning, input.englishMeaning);
    const existing = await this.list();
    if (existing.some((item) => vocabularyContentKey(item.word, item.vietnameseMeaning, item.englishMeaning) === key)) throw new Error('duplicate');
    const now = new Date().toISOString();
    const vocabulary: Vocabulary = { ...input, id: Crypto.randomUUID(), createdAt: now, updatedAt: now, reviewCount: 0, correctCount: 0, incorrectCount: 0, lastReviewedAt: null };
    await this.insert(vocabulary);
    return vocabulary;
  }

  async update(id: string, rawInput: VocabularyInput): Promise<Vocabulary> {
    const input = cleanVocabularyInput(rawInput);
    const validation = validateVocabularyInput(input);
    if (validation) throw new Error(validation);
    const current = await this.get(id);
    if (!current) throw new Error('notFound');
    const key = vocabularyContentKey(input.word, input.vietnameseMeaning, input.englishMeaning);
    const existing = await this.list();
    if (existing.some((item) => item.id !== id && vocabularyContentKey(item.word, item.vietnameseMeaning, item.englishMeaning) === key)) throw new Error('duplicate');
    const updated = { ...current, ...input, updatedAt: new Date().toISOString() };
    await this.db.runAsync('UPDATE vocabularies SET word = ?, vietnamese_meaning = ?, english_meaning = ?, image_url = ?, updated_at = ?, search_text = ? WHERE id = ?', updated.word, updated.vietnameseMeaning, updated.englishMeaning, updated.imageUrl, updated.updatedAt, makeSearchText(updated.word, updated.vietnameseMeaning, updated.englishMeaning), id);
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.db.runAsync('DELETE FROM vocabularies WHERE id = ?', id);
  }

  async insert(vocabulary: Vocabulary): Promise<void> {
    await this.db.runAsync('INSERT INTO vocabularies (id, word, vietnamese_meaning, english_meaning, image_url, created_at, updated_at, review_count, correct_count, incorrect_count, last_reviewed_at, search_text) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', vocabulary.id, vocabulary.word, vocabulary.vietnameseMeaning, vocabulary.englishMeaning, vocabulary.imageUrl, vocabulary.createdAt, vocabulary.updatedAt, vocabulary.reviewCount, vocabulary.correctCount, vocabulary.incorrectCount, vocabulary.lastReviewedAt, makeSearchText(vocabulary.word, vocabulary.vietnameseMeaning, vocabulary.englishMeaning));
  }

  async insertMany(records: Vocabulary[]): Promise<void> {
    await this.db.withExclusiveTransactionAsync(async (tx) => {
      for (const item of records) {
        await tx.runAsync('INSERT INTO vocabularies (id, word, vietnamese_meaning, english_meaning, image_url, created_at, updated_at, review_count, correct_count, incorrect_count, last_reviewed_at, search_text) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', item.id, item.word, item.vietnameseMeaning, item.englishMeaning, item.imageUrl, item.createdAt, item.updatedAt, item.reviewCount, item.correctCount, item.incorrectCount, item.lastReviewedAt, makeSearchText(item.word, item.vietnameseMeaning, item.englishMeaning));
      }
    });
  }

  async count(): Promise<number> {
    const row = await this.db.getFirstAsync<{ count: number }>('SELECT COUNT(*) AS count FROM vocabularies');
    return row?.count ?? 0;
  }
}
