import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AuthLayout } from '@/components/common/AuthLayout';
import { FormField } from '@/components/common/FormField';
import { PasswordInput } from '@/components/common/PasswordInput';
import { AppButton } from '@/components/common/AppButton';
import { AppText } from '@/components/common/AppText';
import { useAuth } from '@/hooks/useAuth';
import { AuthError } from '@/services/auth/validation';
import { colors, spacing } from '@/theme/tokens';

export default function LoginScreen() {
  const { t } = useTranslation(); const { login } = useAuth();
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  async function submit() {
    setError(''); setBusy(true);
    try { await login(email, password, remember); }
    catch (cause) { setError(t(cause instanceof AuthError ? `auth.${cause.code}` : 'auth.unavailable')); }
    finally { setBusy(false); }
  }
  return <AuthLayout footer={<Pressable onPress={() => router.push('/signup')} accessibilityRole="button"><AppText>{t('auth.noAccount')} <AppText style={styles.link}>{t('auth.signUp')}</AppText></AppText></Pressable>}>
    <FormField label={t('auth.email')} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
    <PasswordInput label={t('auth.password')} value={password} onChangeText={setPassword} />
    <View style={styles.row}><Pressable accessibilityRole="checkbox" accessibilityState={{ checked: remember }} onPress={() => setRemember(!remember)} style={styles.row}><AppText style={styles.link}>{remember ? '☑' : '□'}</AppText><AppText>{t('auth.rememberMe')}</AppText></Pressable><Pressable onPress={() => Alert.alert(t('auth.forgotPassword'), t('auth.localRecoveryUnavailable'))}><AppText style={styles.link}>{t('auth.forgotPassword')}</AppText></Pressable></View>
    {!!error && <AppText style={styles.error}>{error}</AppText>}
    <AppButton title={t('auth.login')} onPress={() => void submit()} disabled={busy} />
  </AuthLayout>;
}
const styles = StyleSheet.create({ row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm }, link: { color: colors.primaryDark, fontWeight: '700' }, error: { color: colors.danger } });
