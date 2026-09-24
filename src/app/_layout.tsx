import { Stack } from 'expo-router';
import { AppProviders } from '@/providers/AppProviders';
import { useAuth } from '@/hooks/useAuth';
import { LoadingState } from '@/components/common/LoadingState';
import { Screen } from '@/components/common/Screen';
import { useTranslation } from 'react-i18next';

export default function RootLayout() {
  return <AppProviders><AuthenticatedStack /></AppProviders>;
}

function AuthenticatedStack() {
  const { isAuthenticated, isLoading } = useAuth();
  const { t } = useTranslation();
  if (isLoading) return <Screen><LoadingState label={t('app.loading')} /></Screen>;
  return <Stack screenOptions={{ headerShown: false }}>
    <Stack.Protected guard={!isAuthenticated}><Stack.Screen name="login" /><Stack.Screen name="signup" /></Stack.Protected>
    <Stack.Protected guard={isAuthenticated}><Stack.Screen name="(tabs)" /><Stack.Screen name="vocabulary" /><Stack.Screen name="review" /><Stack.Screen name="profile" /></Stack.Protected>
  </Stack>;
}
