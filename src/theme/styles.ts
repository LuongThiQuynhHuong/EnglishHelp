import { StyleSheet } from 'react-native';
import { colors, radius, shadows, spacing } from './tokens';

export const commonStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  section: { gap: spacing.md, marginBottom: spacing.xl },
});
