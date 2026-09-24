import { cleanVocabularyInput, isHttpUrl, validateVocabularyInput } from '@/utils/vocabularyValidation';
import { normalizeSearchText, vocabularyContentKey } from '@/utils/searchNormalization';

describe('vocabulary validation and search', () => {
  it('accepts web image URLs without file extensions and does not check reachability', () => {
    expect(isHttpUrl('https://images.example.com/preview?id=42')).toBe(true);
    expect(validateVocabularyInput({ word: 'apple', vietnameseMeaning: 'táo', englishMeaning: 'fruit', imageUrl: 'https://images.example.com/preview?id=42', wordClass: null, ipa: null })).toBeNull();
    expect(isHttpUrl('file:///tmp/apple.jpg')).toBe(false);
    expect(isHttpUrl('ftp://example.com/apple.jpg')).toBe(false);
  });

  it('normalizes Vietnamese search and duplicate content while allowing distinct meanings', () => {
    expect(normalizeSearchText('  ĐIỆN   THOẠI  ')).toBe('dien thoai');
    expect(vocabularyContentKey(' Apple ', ' Quả táo ', 'Fruit')).toBe(vocabularyContentKey('apple', 'qua tao', 'fruit'));
    expect(vocabularyContentKey('apple', 'quả táo', 'fruit')).not.toBe(vocabularyContentKey('apple', 'quả táo', 'company'));
    expect(cleanVocabularyInput({ word: '  ice   cream ', vietnameseMeaning: ' kem ', englishMeaning: ' food ', imageUrl: ' ', wordClass: null, ipa: null }).imageUrl).toBeNull();
  });
});
