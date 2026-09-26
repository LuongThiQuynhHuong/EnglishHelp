import { StyleSheet, View } from 'react-native';
import { AppButton } from './AppButton';
import { spacing } from '@/theme/tokens';
import { useTranslation } from 'react-i18next';

export function FormActions({ onCancel, onSave, saving = false }: { onCancel: () => void; onSave: () => void; saving?: boolean }) {
  const { t } = useTranslation();
  return <View style={styles.row}><AppButton title={t('app.cancel')} variant="secondary" onPress={onCancel} style={styles.button} /><AppButton title={t('app.save')} onPress={onSave} disabled={saving} style={styles.button} /></View>;
}
const styles = StyleSheet.create({ row: { flexDirection: 'row', gap: spacing.md, marginTop: 'auto' }, button: { flex: 1 } });
