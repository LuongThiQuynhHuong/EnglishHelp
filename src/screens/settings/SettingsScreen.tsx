import { useState } from 'react';
import { Alert, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/common/Screen';
import { AppText } from '@/components/common/AppText';
import { AppButton } from '@/components/common/AppButton';
import { spacing } from '@/theme/tokens';
import { useSettings } from '@/hooks/useSettings';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingState } from '@/components/common/LoadingState';
import { FormField } from '@/components/common/FormField';
import type { Settings } from '@/models/Settings';
import { useVocabulary } from '@/hooks/useVocabulary';
import { exportVocabulary, importVocabulary } from '@/services/importExport/backupService';
import { BackupValidationError } from '@/services/importExport/backupValidation';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { settings, loading, error, retry } = useSettings();
  if (loading) return <Screen><LoadingState label={t('app.loading')} /></Screen>;
  if (error || !settings) return <Screen><ErrorState message={t('app.error')} retryLabel={t('app.retry')} onRetry={() => void retry()} /></Screen>;
  return <SettingsContent settings={settings} />;
}

function SettingsContent({ settings }: { settings: Settings }) {
  const { t } = useTranslation();
  const { setLanguage, setGroupSize } = useSettings();
  const repository = useVocabulary();
  const [groupSize, setGroupSizeText] = useState(String(settings.reviewGroupSize));
  const [groupError, setGroupError] = useState(false);
  const [busy, setBusy] = useState(false);

  async function saveGroupSize() {
    const value = Number(groupSize);
    if (!Number.isSafeInteger(value) || value < 1) { setGroupError(true); return; }
    try { await setGroupSize(value); setGroupError(false); }
    catch (cause) { if (__DEV__) console.error('Group size save failed', cause); Alert.alert(t('app.error'), t('app.error')); }
  }

  async function exportData() {
    setBusy(true);
    try { await exportVocabulary(repository); }
    catch (cause) { if (__DEV__) console.error('Export failed', cause); Alert.alert(t('app.error'), t('settings.exportError')); }
    finally { setBusy(false); }
  }

  async function importData() {
    setBusy(true);
    try {
      const summary = await importVocabulary(repository);
      if (summary) Alert.alert(t('app.done'), t('settings.importSummary', summary));
    } catch (cause) {
      if (__DEV__) console.error('Import failed', cause);
      const key = cause instanceof BackupValidationError ? `settings.${cause.code}` : 'settings.importError';
      Alert.alert(t('app.error'), t(key));
    } finally { setBusy(false); }
  }

  return <Screen><AppText variant="title">{t('settings.title')}</AppText>
    <AppText variant="subtitle">{t('settings.language')}</AppText>
    <View style={{ gap: spacing.md }}>
      <AppButton title={t('settings.english')} variant={settings.language === 'en' ? 'primary' : 'secondary'} onPress={() => { void setLanguage('en').catch((cause: unknown) => { if (__DEV__) console.error('Language save failed', cause); Alert.alert(t('app.error')); }); }} />
      <AppButton title={t('settings.vietnamese')} variant={settings.language === 'vi' ? 'primary' : 'secondary'} onPress={() => { void setLanguage('vi').catch((cause: unknown) => { if (__DEV__) console.error('Language save failed', cause); Alert.alert(t('app.error')); }); }} />
    </View>
    <AppText variant="subtitle">{t('settings.groupSize')}</AppText>
    <FormField label={t('settings.groupSize')} value={groupSize} onChangeText={(value) => { setGroupSizeText(value); setGroupError(false); }} keyboardType="number-pad" error={groupError ? t('settings.invalidGroupSize') : undefined} />
    <AppButton title={t('app.save')} onPress={() => void saveGroupSize()} />
    <AppText variant="subtitle">{t('settings.export')}</AppText>
    <AppButton title={t('settings.export')} variant="secondary" onPress={() => void exportData()} disabled={busy} />
    <AppButton title={t('settings.import')} variant="secondary" onPress={() => void importData()} disabled={busy} />
  </Screen>;
}
