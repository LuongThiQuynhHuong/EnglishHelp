import { View } from 'react-native';
import { AppButton } from './AppButton';
import { AppText } from './AppText';
import { spacing } from '@/theme/tokens';

export function ErrorState({ message, retryLabel, onRetry }: { message: string; retryLabel?: string; onRetry?: () => void }) {
  return <View style={{ gap: spacing.md }}><AppText>{message}</AppText>{onRetry && retryLabel ? <AppButton title={retryLabel} onPress={onRetry} /> : null}</View>;
}
