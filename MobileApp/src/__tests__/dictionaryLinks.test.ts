import { dictionaryUrl } from '@/services/dictionary/dictionaryLinks';

it('encodes a word or phrase for both dictionary search pages', () => {
  expect(dictionaryUrl('oxford', ' ice cream ')).toBe('https://www.oxfordlearnersdictionaries.com/search/english/?q=ice%20cream');
  expect(dictionaryUrl('cambridge', "don't")).toBe('https://dictionary.cambridge.org/search/english/direct/?q=don\'t');
});
