import type { Vocabulary } from './Vocabulary';

export type BackupVocabulary = Omit<Vocabulary, 'userId'>;
export type BackupFile = { version: 1 | 2; exportedAt: string; vocabularies: BackupVocabulary[] };
export type ImportSummary = { imported: number; duplicates: number; invalid: number };
