import { Pressable, StyleSheet, View } from 'react-native';
import { router, Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import { AppIcon } from './AppIcon';
import { AppText } from './AppText';
import { colors, dimensions, radius, spacing } from '@/theme/tokens';

const icons = { index: 'home', review: 'review', settings: 'settings', profile: 'profile' } as const;
type BottomTabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];
export function BottomNavigation({ state, navigation }: BottomTabBarProps) {
  const { t } = useTranslation(); const insets = useSafeAreaInsets();
  return <View testID="bottom-navigation" style={[styles.bar, { minHeight: dimensions.bottomNavigationHeight + insets.bottom, paddingBottom: insets.bottom }]}>
    {state.routes.map((route, index) => {
      const name = route.name as keyof typeof icons;
      const active = state.index === index;
      const button = <Pressable key={route.key} accessibilityRole="tab" accessibilityState={{ selected: active }} accessibilityLabel={t(`tabs.${name === 'index' ? 'home' : name}`)} onPress={() => navigation.navigate(route.name)} style={styles.item}><AppIcon name={icons[name]} color={active ? colors.primaryDark : colors.text} /><AppText variant="small" style={{ color: active ? colors.primaryDark : colors.text }}>{t(`tabs.${name === 'index' ? 'home' : name}`)}</AppText></Pressable>;
      return index === 2 ? [<Pressable key="add" accessibilityRole="button" accessibilityLabel={t('vocabulary.addNew')} onPress={() => router.push('/vocabulary/new')} style={styles.add}><AppIcon name="add" size={26} color={colors.text} /></Pressable>, button] : button;
    })}
  </View>;
}
const styles = StyleSheet.create({ bar: { flexDirection: 'row', backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, alignItems: 'center', justifyContent: 'space-around', paddingTop: spacing.sm }, item: { flex: 1, alignItems: 'center', gap: spacing.xs, minHeight: 48 }, add: { width: 64, height: 64, marginTop: -28, borderRadius: radius.lg * 2, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: colors.text, shadowOpacity: 0.15, shadowRadius: 4 } });
