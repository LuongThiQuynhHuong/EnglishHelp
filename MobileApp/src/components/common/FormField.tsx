import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { AppText } from './AppText';
import { colors, dimensions, radius, spacing, typography } from '@/theme/tokens';

type Props = TextInputProps & { label: string; error?: string };

export function FormField({ label, error, style, ...rest }: Props) {
  return (
    <View style={styles.field}>
      <AppText style={styles.label}>{label}</AppText>
      <TextInput accessibilityLabel={label} placeholderTextColor={colors.muted} style={[styles.input, style]} {...rest} />
      {error ? <AppText variant="small" style={styles.error}>{error}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing.sm },
  label: { fontWeight: '700' },
  input: { minHeight: dimensions.inputHeight, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, backgroundColor: colors.surface, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: typography.body, color: colors.text },
  error: { color: colors.danger },
});
