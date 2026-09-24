import { Pressable, StyleSheet, type ViewStyle } from 'react-native';
import { AppText } from './AppText';
import { colors, dimensions, radius, spacing } from '@/theme/tokens';

type Props = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  style?: ViewStyle;
};

export function AppButton({ title, onPress, variant = 'primary', disabled = false, style }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.base, styles[variant], disabled && styles.disabled, pressed && styles.pressed, style]}
    >
      <AppText style={variant === 'danger' ? styles.dangerText : variant === 'secondary' ? styles.secondaryText : styles.text}>{title}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { minHeight: dimensions.buttonHeight, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: radius.sm, justifyContent: 'center', alignItems: 'center' },
  primary: { backgroundColor: colors.primaryDark },
  secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.primaryDark },
  danger: { backgroundColor: colors.dangerSurface },
  text: { color: colors.surface, fontWeight: '700', textAlign: 'center' },
  secondaryText: { color: colors.primaryDark, fontWeight: '700', textAlign: 'center' },
  dangerText: { color: colors.danger, fontWeight: '700', textAlign: 'center' },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.75 },
});
