import { answersMatch, normalizeAnswer } from '@/utils/answerNormalization';

it('trims, collapses internal whitespace, and ignores case while preserving punctuation', () => {
  expect(normalizeAnswer('  ICE\n  CREAM  ')).toBe('ice cream');
  expect(answersMatch(' Ice   Cream ', 'ice cream')).toBe(true);
  expect(answersMatch('dont', "don't")).toBe(false);
});
