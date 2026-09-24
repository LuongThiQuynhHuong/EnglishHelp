import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import i18n from '@/i18n';
import type { Language, Settings } from '@/models/Settings';
import { SettingsRepository } from '@/services/database/settingsRepository';
import { useAuth } from './useAuth';

type SettingsContextValue = {
  settings: Settings | null;
  loading: boolean;
  error: boolean;
  retry: () => Promise<void>;
  setLanguage: (language: Language) => Promise<void>;
  setGroupSize: (size: number) => Promise<void>;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: PropsWithChildren) {
  const db = useSQLiteContext();
  const { currentUser } = useAuth();
  const repository = useMemo(() => new SettingsRepository(db, currentUser?.id ?? ''), [db, currentUser?.id]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const retry = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const value = await repository.get();
      await i18n.changeLanguage(value.language);
      setSettings(value);
    } catch (cause) {
      if (__DEV__) console.error('Settings load failed', cause);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [repository]);

  useEffect(() => {
    let active = true;
    void repository.get().then(async (value) => {
      await i18n.changeLanguage(value.language);
      if (active) setSettings(value);
    }).catch((cause: unknown) => {
      if (__DEV__) console.error('Settings load failed', cause);
      if (active) setError(true);
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [repository]);

  const setLanguage = useCallback(async (language: Language) => {
    await repository.setLanguage(language);
    await i18n.changeLanguage(language);
    setSettings((current) => current ? { ...current, language } : current);
  }, [repository]);

  const setGroupSize = useCallback(async (size: number) => {
    await repository.setGroupSize(size);
    setSettings((current) => current ? { ...current, reviewGroupSize: size } : current);
  }, [repository]);

  return <SettingsContext.Provider value={{ settings, loading, error, retry, setLanguage, setGroupSize }}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const value = useContext(SettingsContext);
  if (!value) throw new Error('SettingsProvider is missing');
  return value;
}
