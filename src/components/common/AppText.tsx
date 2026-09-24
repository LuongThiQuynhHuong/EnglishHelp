import type { PropsWithChildren } from 'react';
import { Text, type TextProps, type TextStyle } from 'react-native';
import { colors, typography } from '@/theme/tokens';

type Variant = 'body' | 'small' | 'subtitle' | 'title';
type Props = PropsWithChildren<TextProps & { variant?: Variant; muted?: boolean }>;

const sizes: Record<Variant, number> = {
  body: typography.body,
  small: typography.small,
  subtitle: typography.subtitle,
  title: typography.title,
};

export function AppText({ children, variant = 'body', muted = false, style, ...rest }: Props) {
  const base: TextStyle = {
    color: muted ? colors.muted : colors.text,
    fontSize: sizes[variant],
    fontWeight: variant === 'title' || variant === 'subtitle' ? '700' : '400',
  };
  return <Text {...rest} style={[base, style]}>{children}</Text>;
}
