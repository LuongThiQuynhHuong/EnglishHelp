import { useState } from 'react';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '@/components/common/AppHeader';
import { AppText } from '@/components/common/AppText';
import { FormActions } from '@/components/common/FormActions';
import { PasswordInput } from '@/components/common/PasswordInput';
import { Screen } from '@/components/common/Screen';
import { useAuth } from '@/hooks/useAuth';
import { AuthError } from '@/services/auth/validation';
import { colors } from '@/theme/tokens';

export default function ChangePasswordScreen() {
  const { t } = useTranslation(); const { changePassword } = useAuth();
  const [current, setCurrent] = useState(''); const [next, setNext] = useState(''); const [confirm, setConfirm] = useState(''); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  async function save() { setBusy(true); setError(''); try { await changePassword(current, next, confirm); router.back(); } catch (cause) { setError(t(cause instanceof AuthError ? `auth.${cause.code}` : 'auth.unavailable')); } finally { setBusy(false); } }
  return <Screen header={<AppHeader title={t('profile.changePassword')} />}><PasswordInput label={t('profile.currentPassword')} value={current} onChangeText={setCurrent} /><PasswordInput label={t('profile.newPassword')} value={next} onChangeText={setNext} /><PasswordInput label={t('profile.confirmNewPassword')} value={confirm} onChangeText={setConfirm} />{!!error && <AppText style={{ color: colors.danger }}>{error}</AppText>}<FormActions onCancel={() => router.back()} onSave={() => void save()} saving={busy} /></Screen>;
}
