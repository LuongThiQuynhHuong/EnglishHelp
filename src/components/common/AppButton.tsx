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
      <AppText style={variant === 'danger' ? styles.dangerText : styles.text}>{title}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { minHeight: dimensions.touchTarget, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: radius.md, justifyContent: 'center', alignItems: 'center' },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.placeholder },
  danger: { backgroundColor: colors.dangerSurface },
  text: { fontWeight: '700', textAlign: 'center' },
  dangerText: { color: colors.danger, fontWeight: '700', textAlign: 'center' },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.75 },
});
