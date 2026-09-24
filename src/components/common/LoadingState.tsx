import { ActivityIndicator, View } from 'react-native';
import { AppText } from './AppText';
import { colors, spacing } from '@/theme/tokens';

export function LoadingState({ label }: { label: string }) {
  return <View style={{ alignItems: 'center', gap: spacing.md }}><ActivityIndicator color={colors.primaryDark} /><AppText>{label}</AppText></View>;
}
