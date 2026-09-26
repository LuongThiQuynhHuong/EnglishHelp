import { useState } from 'react';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '@/components/common/AppHeader';
import { AppText } from '@/components/common/AppText';
import { FormActions } from '@/components/common/FormActions';
import { FormField } from '@/components/common/FormField';
import { ProfileAvatar } from '@/components/common/ProfileAvatar';
import { Screen } from '@/components/common/Screen';
import { useAuth } from '@/hooks/useAuth';
import { AuthError } from '@/services/auth/validation';
import { colors } from '@/theme/tokens';

export default function EditProfileScreen() {
  const { t } = useTranslation(); const { currentUser, updateProfile } = useAuth();
  const [name, setName] = useState(currentUser?.displayName ?? ''); const [avatar, setAvatar] = useState(currentUser?.avatarUri ?? ''); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  async function save() { setBusy(true); setError(''); try { await updateProfile(name, avatar); router.back(); } catch (cause) { setError(t(cause instanceof AuthError ? `auth.${cause.code}` : 'profile.updateError')); } finally { setBusy(false); } }
  return <Screen header={<AppHeader title={t('profile.edit')} />}><ProfileAvatar uri={avatar || null} /><FormField label={t('profile.displayName')} value={name} onChangeText={setName} /><FormField label={t('profile.avatarUrl')} value={avatar} onChangeText={setAvatar} autoCapitalize="none" keyboardType="url" /><AppText muted>{currentUser?.email}</AppText>{!!error && <AppText style={{ color: colors.danger }}>{error}</AppText>}<FormActions onCancel={() => router.back()} onSave={() => void save()} saving={busy} /></Screen>;
}
