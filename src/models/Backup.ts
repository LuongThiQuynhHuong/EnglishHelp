import type { Vocabulary } from './Vocabulary';

export type BackupV1 = { version: 1; exportedAt: string; vocabularies: Vocabulary[] };
export type ImportSummary = { imported: number; duplicates: number; invalid: number };
