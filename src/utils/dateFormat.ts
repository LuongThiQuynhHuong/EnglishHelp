import type { Language } from '@/models/Settings';

export function formatDate(iso: string, language: Language): string {
  return new Intl.DateTimeFormat(language === 'vi' ? 'vi-VN' : 'en-US', { dateStyle: 'medium' }).format(new Date(iso));
}
