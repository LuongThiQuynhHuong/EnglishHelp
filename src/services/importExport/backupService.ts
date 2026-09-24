import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import type { BackupV1, ImportSummary } from '@/models/Backup';
import type { VocabularyRepository } from '@/services/database/vocabularyRepository';
import { BACKUP_VERSION } from '@/constants/defaults';
import { parseBackup, planImport } from './backupValidation';

export async function exportVocabulary(repository: VocabularyRepository): Promise<void> {
  const vocabularies = await repository.list();
  const exportedAt = new Date().toISOString();
  const backup: BackupV1 = { version: BACKUP_VERSION, exportedAt, vocabularies };
  const filename = `english-helper-${exportedAt.replace(/[:.]/g, '-')}.json`;
  const file = new File(Paths.cache, filename);
  file.create();
  file.write(JSON.stringify(backup, null, 2));
  if (!await Sharing.isAvailableAsync()) throw new Error('Sharing unavailable');
  await Sharing.shareAsync(file.uri, { mimeType: 'application/json' });
}

export async function importVocabulary(repository: VocabularyRepository): Promise<ImportSummary | null> {
  // Some file providers label .json files as plain text or generic binary data.
  const selection = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
  if (selection.canceled) return null;
  const json = await new File(selection.assets[0].uri).text();
  const { backup, invalid } = parseBackup(json);
  const { records, summary } = planImport(await repository.list(), backup.vocabularies, invalid);
  if (records.length > 0) await repository.insertMany(records);
  return summary;
}
