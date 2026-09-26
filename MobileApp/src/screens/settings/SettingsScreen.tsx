import { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Switch, View } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/common/Screen';
import { AppText } from '@/components/common/AppText';
import { AppButton } from '@/components/common/AppButton';
import { colors, dimensions, radius, spacing } from '@/theme/tokens';
import { useSettings } from '@/hooks/useSettings';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingState } from '@/components/common/LoadingState';
import { FormField } from '@/components/common/FormField';
import type { Settings } from '@/models/Settings';
import { useVocabulary } from '@/hooks/useVocabulary';
import { exportVocabulary, importVocabulary } from '@/services/importExport/backupService';
import { BackupValidationError } from '@/services/importExport/backupValidation';
import { AppHeader } from '@/components/common/AppHeader';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { settings, loading, error, retry } = useSettings();
  if (loading) return <Screen header={<AppHeader title={t('settings.title')} leading="none" />}><LoadingState label={t('app.loading')} /></Screen>;
  if (error || !settings) return <Screen header={<AppHeader title={t('settings.title')} leading="none" />}><ErrorState message={t('app.error')} retryLabel={t('app.retry')} onRetry={() => void retry()} /></Screen>;
  return <SettingsContent settings={settings} />;
}

function SettingsContent({ settings }: { settings: Settings }) {
  const { t } = useTranslation();
  const { setLanguage, setGroupSize, setReviewReminder, setReminderTime } = useSettings();
  const repository = useVocabulary();
  const [groupSize, setGroupSizeText] = useState(String(settings.reviewGroupSize));
  const [groupError, setGroupError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [reminderBusy, setReminderBusy] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [draftTime, setDraftTime] = useState(settings.reminderTime);

  function dateForTime(time: string): Date {
    const [hour, minute] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hour, minute, 0, 0);
    return date;
  }

  async function changeReminder(enabled: boolean) {
    setReminderBusy(true);
    try {
      const changed = await setReviewReminder(enabled);
      if (!changed) Alert.alert(t('settings.permissionDeniedTitle'), t('settings.permissionDenied'));
    } catch (cause) {
      if (__DEV__) console.error('Reminder save failed', cause);
      Alert.alert(t('app.error'), t('settings.reminderError'));
    } finally { setReminderBusy(false); }
  }

  async function saveReminderTime(time: string) {
    setReminderBusy(true);
    try { await setReminderTime(time); }
    catch (cause) {
      if (__DEV__) console.error('Reminder time save failed', cause);
      Alert.alert(t('app.error'), t('settings.reminderError'));
    } finally { setReminderBusy(false); }
  }

  function openTimePicker() {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: dateForTime(settings.reminderTime),
        mode: 'time',
        is24Hour: true,
        onChange: (event, date) => {
          if (event.type === 'set' && date) void saveReminderTime(`${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`);
        },
      });
    } else {
      setDraftTime(settings.reminderTime);
      setShowTimePicker(true);
    }
  }

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

  return <Screen header={<AppHeader title={t('settings.title')} leading="none" />}>
    <AppText variant="subtitle">{t('settings.language')}</AppText>
    <View style={{ gap: spacing.md }}>
      <AppButton title={t('settings.english')} variant={settings.language === 'en' ? 'primary' : 'secondary'} onPress={() => { void setLanguage('en').catch((cause: unknown) => { if (__DEV__) console.error('Language save failed', cause); Alert.alert(t('app.error')); }); }} />
      <AppButton title={t('settings.vietnamese')} variant={settings.language === 'vi' ? 'primary' : 'secondary'} onPress={() => { void setLanguage('vi').catch((cause: unknown) => { if (__DEV__) console.error('Language save failed', cause); Alert.alert(t('app.error')); }); }} />
    </View>
    <AppText variant="subtitle">{t('settings.groupSize')}</AppText>
    <FormField label={t('settings.groupSize')} value={groupSize} onChangeText={(value) => { setGroupSizeText(value); setGroupError(false); }} keyboardType="number-pad" error={groupError ? t('settings.invalidGroupSize') : undefined} />
    <AppButton title={t('app.save')} onPress={() => void saveGroupSize()} />
    <AppText variant="subtitle">{t('settings.reviewReminder')}</AppText>
    <View style={styles.reminderRow}>
      <AppText>{t('settings.reviewReminder')}</AppText>
      <Switch accessibilityLabel={t('settings.reviewReminder')} accessibilityState={{ checked: settings.reviewReminder }} value={settings.reviewReminder} onValueChange={(enabled) => void changeReminder(enabled)} disabled={reminderBusy} trackColor={{ false: colors.border, true: colors.primary }} thumbColor={colors.surface} />
    </View>
    <Pressable accessibilityRole="button" accessibilityLabel={t('settings.reminderTime')} disabled={reminderBusy} onPress={openTimePicker} style={styles.timeRow}>
      <AppText>{t('settings.reminderTime')}</AppText>
      <AppText>{settings.reminderTime}</AppText>
    </Pressable>
    {showTimePicker && Platform.OS === 'ios' ? <View>
      <DateTimePicker value={dateForTime(draftTime)} mode="time" display="spinner" is24Hour onChange={(_event, date) => {
        if (date) setDraftTime(`${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`);
      }} />
      <AppButton title={t('app.done')} disabled={reminderBusy} onPress={() => { setShowTimePicker(false); void saveReminderTime(draftTime); }} />
      <AppButton title={t('app.cancel')} variant="secondary" onPress={() => setShowTimePicker(false)} />
    </View> : null}
    <AppText variant="subtitle">{t('settings.export')}</AppText>
    <AppButton title={t('settings.export')} variant="secondary" onPress={() => void exportData()} disabled={busy} />
    <AppButton title={t('settings.import')} variant="secondary" onPress={() => void importData()} disabled={busy} />
  </Screen>;
}

const styles = StyleSheet.create({
  reminderRow: { minHeight: dimensions.inputHeight, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  timeRow: { minHeight: dimensions.inputHeight, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
