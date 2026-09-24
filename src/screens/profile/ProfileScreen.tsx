import { Alert, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '@/components/common/AppHeader';
import { AppButton } from '@/components/common/AppButton';
import { AppText } from '@/components/common/AppText';
import { ProfileAvatar } from '@/components/common/ProfileAvatar';
import { Screen } from '@/components/common/Screen';
import { useAuth } from '@/hooks/useAuth';
import { spacing } from '@/theme/tokens';

export default function ProfileScreen() {
  const { t } = useTranslation(); const { currentUser, logout } = useAuth();
  if (!currentUser) return null;
  async function signOut() { try { await logout(); } catch { Alert.alert(t('app.error'), t('auth.unavailable')); } }
  return <Screen header={<AppHeader title={t('profile.title')} leading="none" />}><View style={styles.identity}><ProfileAvatar uri={currentUser.avatarUri} /><AppText variant="subtitle">{currentUser.displayName}</AppText><AppText muted>{currentUser.email}</AppText></View>
    <AppButton title={t('profile.edit')} onPress={() => router.push('/profile/edit')} />
    <AppButton title={t('profile.changePassword')} variant="secondary" onPress={() => router.push('/profile/password')} />
    <AppButton title={t('profile.logout')} variant="danger" onPress={() => void signOut()} />
  </Screen>;
}
const styles = StyleSheet.create({ identity: { alignItems: 'center', gap: spacing.sm, marginVertical: spacing.xl } });
