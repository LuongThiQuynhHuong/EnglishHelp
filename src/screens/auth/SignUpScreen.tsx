import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AuthLayout } from '@/components/common/AuthLayout';
import { FormField } from '@/components/common/FormField';
import { PasswordInput } from '@/components/common/PasswordInput';
import { AppButton } from '@/components/common/AppButton';
import { AppText } from '@/components/common/AppText';
import { useAuth } from '@/hooks/useAuth';
import { AuthError } from '@/services/auth/validation';
import { colors } from '@/theme/tokens';

export default function SignUpScreen() {
  const { t } = useTranslation(); const { register } = useAuth();
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  async function submit() {
    setError(''); setBusy(true);
    try { await register(email, password, confirmation); }
    catch (cause) { setError(t(cause instanceof AuthError ? `auth.${cause.code}` : 'auth.unavailable')); }
    finally { setBusy(false); }
  }
  return <AuthLayout footer={<Pressable onPress={() => router.replace('/login')} accessibilityRole="button"><AppText>{t('auth.haveAccount')} <AppText style={styles.link}>{t('auth.signIn')}</AppText></AppText></Pressable>}>
    <FormField label={t('auth.emailRequired')} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
    <PasswordInput label={t('auth.passwordRequired')} value={password} onChangeText={setPassword} />
    <PasswordInput label={t('auth.confirmPasswordRequired')} value={confirmation} onChangeText={setConfirmation} />
    {!!error && <AppText style={styles.error}>{error}</AppText>}
    <AppButton title={t('auth.signUp')} onPress={() => void submit()} disabled={busy} />
  </AuthLayout>;
}
const styles = StyleSheet.create({ link: { color: colors.primaryDark, fontWeight: '700' }, error: { color: colors.danger } });
