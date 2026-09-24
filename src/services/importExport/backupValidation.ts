import type { BackupV1, ImportSummary } from '@/models/Backup';
import type { Vocabulary } from '@/models/Vocabulary';
import { BACKUP_VERSION } from '@/constants/defaults';
import { vocabularyContentKey } from '@/utils/searchNormalization';
import { isHttpUrl } from '@/utils/vocabularyValidation';

export class BackupValidationError extends Error {
  constructor(public readonly code: 'malformedBackup' | 'unsupportedBackup') { super(code); }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function validDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(value)) return false;
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 19) === value.slice(0, 19);
}

function validCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

export function validVocabulary(value: unknown): value is Vocabulary {
  if (!isRecord(value)) return false;
  if (typeof value.id !== 'string' || !value.id.trim()) return false;
  if (typeof value.word !== 'string' || !value.word.trim()) return false;
  if (typeof value.vietnameseMeaning !== 'string' || !value.vietnameseMeaning.trim()) return false;
  if (typeof value.englishMeaning !== 'string' || !value.englishMeaning.trim()) return false;
  if (value.imageUrl !== null && (typeof value.imageUrl !== 'string' || !isHttpUrl(value.imageUrl))) return false;
  if (!validDate(value.createdAt) || !validDate(value.updatedAt)) return false;
  if (Date.parse(value.updatedAt) < Date.parse(value.createdAt)) return false;
  if (value.lastReviewedAt !== null && !validDate(value.lastReviewedAt)) return false;
  if (!validCount(value.reviewCount) || !validCount(value.correctCount) || !validCount(value.incorrectCount)) return false;
  if (value.correctCount + value.incorrectCount > value.reviewCount) return false;
  return true;
}

export function parseBackup(json: string): { backup: BackupV1; invalid: number } {
  let parsed: unknown;
  try { parsed = JSON.parse(json); } catch { throw new BackupValidationError('malformedBackup'); }
  if (!isRecord(parsed)) throw new BackupValidationError('malformedBackup');
  if (!('version' in parsed)) throw new BackupValidationError('malformedBackup');
  if (parsed.version !== BACKUP_VERSION) throw new BackupValidationError('unsupportedBackup');
  if (!validDate(parsed.exportedAt) || !Array.isArray(parsed.vocabularies)) throw new BackupValidationError('malformedBackup');
  const valid = parsed.vocabularies.filter(validVocabulary);
  return { backup: { version: 1, exportedAt: parsed.exportedAt, vocabularies: valid }, invalid: parsed.vocabularies.length - valid.length };
}

export function planImport(existing: Vocabulary[], candidates: Vocabulary[], invalid = 0): { records: Vocabulary[]; summary: ImportSummary } {
  // Check both identity and content: the same word may legitimately have different meanings.
  const byId = new Map(existing.map((item) => [item.id, vocabularyContentKey(item.word, item.vietnameseMeaning, item.englishMeaning)]));
  const content = new Set(byId.values());
  const records: Vocabulary[] = [];
  let duplicates = 0;
  for (const item of candidates) {
    const key = vocabularyContentKey(item.word, item.vietnameseMeaning, item.englishMeaning);
    if (byId.has(item.id) && byId.get(item.id) !== key) { invalid++; continue; }
    if (byId.has(item.id) || content.has(key)) { duplicates++; continue; }
    byId.set(item.id, key);
    content.add(key);
    records.push(item);
  }
  return { records, summary: { imported: records.length, duplicates, invalid } };
}
