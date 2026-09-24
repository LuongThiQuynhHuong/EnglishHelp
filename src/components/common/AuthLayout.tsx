import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from './Screen';
import { AppText } from './AppText';
import { colors, spacing, typography } from '@/theme/tokens';

export function AuthLayout({ children, footer }: PropsWithChildren<{ footer: React.ReactNode }>) {
  return <Screen style={styles.screen} safeColor={colors.surface}><View style={styles.logo} accessibilityLabel="English Helper"><AppText style={styles.logoEnglish}>English</AppText><AppText style={styles.logoHelp}>Help</AppText></View><View style={styles.form}>{children}</View><View style={styles.footer}>{footer}</View></Screen>;
}
const styles = StyleSheet.create({
  screen: { backgroundColor: colors.surface, paddingHorizontal: spacing.lg },
  logo: { alignItems: 'center', justifyContent: 'center', minHeight: 160, flexGrow: 1, paddingVertical: spacing.xl },
  logoEnglish: { color: colors.primaryDark, fontSize: typography.title * 2, fontWeight: '700', lineHeight: typography.title * 1.7 },
  logoHelp: { color: colors.primary, fontSize: typography.title * 2, fontWeight: '700', lineHeight: typography.title * 1.7, marginTop: -spacing.md, marginLeft: spacing.xxl * 2 },
  form: { gap: spacing.lg },
  footer: { alignItems: 'center', marginTop: 'auto', paddingTop: spacing.xxl, paddingBottom: spacing.sm },
});
