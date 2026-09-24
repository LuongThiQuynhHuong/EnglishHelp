import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, dimensions, spacing } from '@/theme/tokens';

type Props = PropsWithChildren<{ scroll?: boolean; style?: ViewStyle }>;

export function Screen({ children, scroll = true, style }: Props) {
  const content = <View style={[styles.content, !scroll && styles.fill, style]}>{children}</View>;
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {scroll ? <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">{content}</ScrollView> : content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1 },
  content: { width: '100%', maxWidth: dimensions.contentMaxWidth, alignSelf: 'center', padding: spacing.lg, gap: spacing.lg, flexGrow: 1 },
  fill: { flex: 1 },
});
