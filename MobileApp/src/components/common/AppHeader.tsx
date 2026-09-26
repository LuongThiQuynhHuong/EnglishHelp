import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AppText } from './AppText';
import { AppIcon, type AppIconName } from './AppIcon';
import { colors, dimensions, spacing, typography } from '@/theme/tokens';

export type HeaderAction = { icon: AppIconName; label: string; onPress: () => void; color?: string };
type Props = { title: string; leading?: 'back' | 'menu' | 'none'; onLeadingPress?: () => void; actions?: HeaderAction[] };

export function AppHeader({ title, leading = 'back', onLeadingPress, actions = [] }: Props) {
  const { t } = useTranslation();
  const leadingAction = leading === 'none' ? null : {
    icon: leading,
    label: leading === 'menu' ? t('app.menu') : t('app.back'),
    onPress: onLeadingPress ?? (leading === 'menu' ? () => router.push('/(tabs)/profile') : () => router.back()),
  } as const;
  return <View testID="app-header" style={styles.header}>
    <View style={styles.side}>{leadingAction && <HeaderIcon {...leadingAction} />}</View>
    <AppText numberOfLines={1} style={styles.title}>{title}</AppText>
    <View style={[styles.side, styles.actions]}>{actions.map((action) => <HeaderIcon key={action.label} {...action} />)}</View>
  </View>;
}

function HeaderIcon({ icon, label, onPress, color = colors.text }: HeaderAction) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} hitSlop={spacing.sm} onPress={onPress} style={({ pressed }) => [styles.icon, pressed && styles.pressed]}><AppIcon name={icon} size={dimensions.headerIconSize} color={color} /></Pressable>;
}

const styles = StyleSheet.create({
  header: { height: dimensions.headerHeight, backgroundColor: colors.primary, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center' },
  side: { width: dimensions.headerSideWidth, flexDirection: 'row', alignItems: 'center' },
  actions: { justifyContent: 'flex-end' },
  icon: { width: dimensions.touchTarget, height: dimensions.touchTarget, justifyContent: 'center', alignItems: 'center' },
  title: { flex: 1, textAlign: 'center', fontSize: typography.subtitle, fontWeight: '700' },
  pressed: { opacity: 0.65 },
});
