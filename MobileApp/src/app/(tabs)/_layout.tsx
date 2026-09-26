import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { BottomNavigation } from '@/components/common/BottomNavigation';
import { ScreenSafeAreaProvider } from '@/components/common/Screen';

export default function TabsLayout() {
  const { t } = useTranslation();
  // Navigation labels re-render when the persisted app language changes.
  return (
    <ScreenSafeAreaProvider includeBottom={false}><Tabs tabBar={(props) => <BottomNavigation {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: t('tabs.home') }} />
      <Tabs.Screen name="review" options={{ title: t('tabs.review') }} />
      <Tabs.Screen name="settings" options={{ title: t('tabs.settings') }} />
      <Tabs.Screen name="profile" options={{ title: t('tabs.profile') }} />
    </Tabs></ScreenSafeAreaProvider>
  );
}
