import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { WORD_CLASSES, type WordClass } from '@/models/WordClass';
import { colors, dimensions, radius, spacing } from '@/theme/tokens';

export function WordClassPicker({ value, onChange }: { value: WordClass | null; onChange: (value: WordClass | null) => void }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return <View style={styles.field}><AppText style={styles.label}>{t('vocabulary.wordClass')}</AppText>
    <Pressable accessibilityRole="button" accessibilityLabel={t('vocabulary.wordClass')} onPress={() => setOpen(!open)} style={styles.select}><AppText>{value ? t(`wordClasses.${value}`) : t('vocabulary.selectWordClass')}</AppText><AppText>⌄</AppText></Pressable>
    {open && <ScrollView nestedScrollEnabled style={styles.options}><Pressable onPress={() => { onChange(null); setOpen(false); }} style={styles.option}><AppText>{t('vocabulary.selectWordClass')}</AppText></Pressable>{WORD_CLASSES.map((wordClass) => <Pressable key={wordClass} onPress={() => { onChange(wordClass); setOpen(false); }} style={styles.option}><AppText>{t(`wordClasses.${wordClass}`)}</AppText></Pressable>)}</ScrollView>}
  </View>;
}
const styles = StyleSheet.create({ field: { gap: spacing.sm }, label: { fontWeight: '700' }, select: { minHeight: dimensions.inputHeight, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md }, options: { maxHeight: 240, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, backgroundColor: colors.surface }, option: { padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border } });
