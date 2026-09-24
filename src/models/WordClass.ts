export const WORD_CLASSES = ['noun', 'verb', 'adjective', 'adverb', 'pronoun', 'preposition', 'conjunction', 'interjection', 'determiner', 'article', 'auxiliaryVerb', 'modalVerb', 'phrasalVerb', 'idiom', 'phrase', 'abbreviation', 'acronym', 'numeral', 'prefix', 'suffix', 'other'] as const;
export type WordClass = typeof WORD_CLASSES[number];
export const isWordClass = (value: unknown): value is WordClass => typeof value === 'string' && WORD_CLASSES.some((item) => item === value);
