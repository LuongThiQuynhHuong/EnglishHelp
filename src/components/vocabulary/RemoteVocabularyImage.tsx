import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { colors, dimensions, radius, spacing } from '@/theme/tokens';

export function RemoteVocabularyImage({ url }: { url: string | null }) {
  // Remount on URL change so a failed old URL cannot hide a newly entered URL.
  return <ImageContent key={url ?? 'empty'} url={url} />;
}

function ImageContent({ url }: { url: string | null }) {
  const { t } = useTranslation();
  const [failed, setFailed] = useState(false);
  if (!url || failed) return <View style={styles.placeholder}><AppText muted>{t('vocabulary.imageUnavailable')}</AppText></View>;
  return <Image source={{ uri: url }} onError={() => setFailed(true)} accessibilityLabel={t('vocabulary.imagePreview')} style={styles.image} resizeMode="cover" />;
}

const styles = StyleSheet.create({
  image: { width: '100%', aspectRatio: dimensions.imageAspectRatio, borderRadius: radius.md, backgroundColor: colors.placeholder },
  placeholder: { width: '100%', aspectRatio: dimensions.imageAspectRatio, borderRadius: radius.md, backgroundColor: colors.placeholder, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
});
