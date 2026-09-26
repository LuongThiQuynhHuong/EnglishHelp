import i18n from '@/i18n';
import en from '@/i18n/en/translation';
import vi from '@/i18n/vi/translation';

describe('bundled translations', () => {
  it('starts in English and can switch to Vietnamese without loading resources', async () => {
    expect(i18n.t('tabs.review')).toBe('Review');
    await i18n.changeLanguage('vi');
    expect(i18n.t('tabs.review')).toBe('Ôn tập');
    await i18n.changeLanguage('en');
  });
});

it('has matching translation keys in English and Vietnamese', () => {
  function keys(value: object, prefix = ''): string[] {
    return Object.entries(value).flatMap(([key, child]) => typeof child === 'object' ? keys(child, `${prefix}${key}.`) : [`${prefix}${key}`]);
  }
  expect(keys(vi).sort()).toEqual(keys(en).sort());
});
