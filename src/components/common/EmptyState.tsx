import { View } from 'react-native';
import { AppText } from './AppText';

export function EmptyState({ message }: { message: string }) {
  return <View accessibilityRole="text"><AppText muted>{message}</AppText></View>;
}
