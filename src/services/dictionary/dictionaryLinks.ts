import * as WebBrowser from 'expo-web-browser';

export type Dictionary = 'oxford' | 'cambridge';

const bases: Record<Dictionary, string> = {
  oxford: 'https://www.oxfordlearnersdictionaries.com/search/english/?q=',
  cambridge: 'https://dictionary.cambridge.org/search/english/direct/?q=',
};

export function dictionaryUrl(dictionary: Dictionary, word: string): string {
  return bases[dictionary] + encodeURIComponent(word.trim());
}

export async function openDictionary(dictionary: Dictionary, word: string): Promise<void> {
  await WebBrowser.openBrowserAsync(dictionaryUrl(dictionary, word));
}
