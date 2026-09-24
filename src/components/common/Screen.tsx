import { createContext, useContext, type PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, dimensions, spacing } from '@/theme/tokens';

type Props = PropsWithChildren<{ scroll?: boolean; style?: ViewStyle; safeColor?: string; header?: React.ReactNode }>;
const ScreenSafeAreaContext = createContext({ includeBottom: true });

export function ScreenSafeAreaProvider({ includeBottom, children }: PropsWithChildren<{ includeBottom: boolean }>) {
  return <ScreenSafeAreaContext.Provider value={{ includeBottom }}>{children}</ScreenSafeAreaContext.Provider>;
}

export function Screen({ children, scroll = true, style, safeColor, header }: Props) {
  const { includeBottom } = useContext(ScreenSafeAreaContext);
  const content = <View style={[styles.content, !scroll && styles.fill, style]}>{children}</View>;
  const body = <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    {scroll ? <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}>{content}</ScrollView> : content}
  </KeyboardAvoidingView>;
  if (header) return <View style={styles.page}>
    <SafeAreaView testID="screen-header-safe-area" style={styles.headerSafe} edges={['top', 'left', 'right']}>{header}</SafeAreaView>
    <SafeAreaView testID="screen-safe-area" style={styles.safe} edges={includeBottom ? ['bottom', 'left', 'right'] : ['left', 'right']}>{body}</SafeAreaView>
  </View>;
  return (
    <SafeAreaView testID="screen-safe-area" style={[styles.safe, safeColor ? { backgroundColor: safeColor } : undefined]} edges={includeBottom ? ['top', 'bottom', 'left', 'right'] : ['top', 'left', 'right']}>
      {body}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  headerSafe: { backgroundColor: colors.primary },
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1 },
  content: { width: '100%', maxWidth: dimensions.contentMaxWidth, alignSelf: 'center', padding: spacing.lg, gap: spacing.lg, flexGrow: 1 },
  fill: { flex: 1 },
});
