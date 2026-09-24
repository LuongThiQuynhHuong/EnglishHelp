import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, typography } from '@/theme/tokens';

export default function TabsLayout() {
  const { t } = useTranslation();
  // Navigation labels re-render when the persisted app language changes.
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.primaryDark, tabBarInactiveTintColor: colors.muted, tabBarStyle: { backgroundColor: colors.surface }, tabBarLabelStyle: { fontSize: typography.small } }}>
      <Tabs.Screen name="index" options={{ title: t('tabs.home') }} />
      <Tabs.Screen name="vocabulary" options={{ title: t('tabs.vocabulary') }} />
      <Tabs.Screen name="review" options={{ title: t('tabs.review') }} />
      <Tabs.Screen name="search" options={{ title: t('tabs.search') }} />
      <Tabs.Screen name="settings" options={{ title: t('tabs.settings') }} />
    </Tabs>
  );
}
