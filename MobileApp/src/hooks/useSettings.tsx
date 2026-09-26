import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import i18n from '@/i18n';
import type { Language, Settings } from '@/models/Settings';
import { SettingsRepository } from '@/services/database/settingsRepository';
import { requestReminderPermission, syncReviewReminder } from '@/services/reminders/reviewReminder';
import { useAuth } from './useAuth';

type SettingsContextValue = {
  settings: Settings | null;
  loading: boolean;
  error: boolean;
  retry: () => Promise<void>;
  setLanguage: (language: Language) => Promise<void>;
  setGroupSize: (size: number) => Promise<void>;
  setReviewReminder: (enabled: boolean) => Promise<boolean>;
  setReminderTime: (time: string) => Promise<void>;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: PropsWithChildren) {
  const db = useSQLiteContext();
  const { currentUser } = useAuth();
  const userId = currentUser?.id ?? null;
  const repository = useMemo(() => new SettingsRepository(db, userId ?? ''), [db, userId]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const retry = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const value = await repository.get();
      await i18n.changeLanguage(value.language);
      await syncReviewReminder(userId, value).catch((cause: unknown) => { if (__DEV__) console.error('Reminder sync failed', cause); });
      setSettings(value);
    } catch (cause) {
      if (__DEV__) console.error('Settings load failed', cause);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [repository, userId]);

  useEffect(() => {
    let active = true;
    void repository.get().then(async (value) => {
      await i18n.changeLanguage(value.language);
      if (!active) return;
      await syncReviewReminder(userId, value).catch((cause: unknown) => { if (__DEV__) console.error('Reminder sync failed', cause); });
      if (active) setSettings(value);
    }).catch((cause: unknown) => {
      if (__DEV__) console.error('Settings load failed', cause);
      if (active) setError(true);
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [repository, userId]);

  const setLanguage = useCallback(async (language: Language) => {
    await repository.setLanguage(language);
    await i18n.changeLanguage(language);
    setSettings((current) => current ? { ...current, language } : current);
  }, [repository]);

  const setGroupSize = useCallback(async (size: number) => {
    await repository.setGroupSize(size);
    setSettings((current) => current ? { ...current, reviewGroupSize: size } : current);
  }, [repository]);

  const setReviewReminder = useCallback(async (enabled: boolean): Promise<boolean> => {
    if (enabled && !(await requestReminderPermission())) return false;
    await repository.setReviewReminder(enabled);
    setSettings((current) => current ? { ...current, reviewReminder: enabled } : current);
    if (settings) await syncReviewReminder(userId, { ...settings, reviewReminder: enabled });
    return true;
  }, [repository, settings, userId]);

  const setReminderTime = useCallback(async (time: string) => {
    await repository.setReminderTime(time);
    setSettings((current) => current ? { ...current, reminderTime: time } : current);
    if (settings) await syncReviewReminder(userId, { ...settings, reminderTime: time });
  }, [repository, settings, userId]);

  return <SettingsContext.Provider value={{ settings, loading, error, retry, setLanguage, setGroupSize, setReviewReminder, setReminderTime }}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const value = useContext(SettingsContext);
  if (!value) throw new Error('SettingsProvider is missing');
  return value;
}
