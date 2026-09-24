import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { AppIcon } from './AppIcon';
import { colors } from '@/theme/tokens';

export function ProfileAvatar({ uri }: { uri: string | null }) {
  const [failed, setFailed] = useState(false);
  return <View style={styles.avatar}>{uri && !failed ? <Image source={{ uri }} style={styles.image} onError={() => setFailed(true)} /> : <AppIcon name="profile" size={48} color={colors.primaryDark} />}</View>;
}
const styles = StyleSheet.create({ avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: colors.placeholder, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }, image: { width: '100%', height: '100%' } });
