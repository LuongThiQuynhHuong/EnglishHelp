import { useCallback, useEffect, useState, type PropsWithChildren } from 'react';
import { I18nextProvider } from 'react-i18next';
import { SQLiteProvider } from 'expo-sqlite';
import i18n from '@/i18n';
import { SettingsProvider } from '@/hooks/useSettings';
import { migrateDatabase } from '@/services/database/migrations';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { Screen } from '@/components/common/Screen';
import { ReviewSessionProvider } from './ReviewSessionProvider';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { syncReviewReminder } from '@/services/reminders/reviewReminder';

export function AppProviders({ children }: PropsWithChildren) {
  const [databaseError, setDatabaseError] = useState(false);
  const [databaseReady, setDatabaseReady] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  function retryDatabase() {
    setDatabaseError(false);
    setDatabaseReady(false);
    setRetryKey((value) => value + 1);
  }

  const initializeDatabase = useCallback(async (database: Parameters<typeof migrateDatabase>[0]) => {
    await migrateDatabase(database);
    setDatabaseReady(true);
  }, []);

  return (
    <SafeAreaProvider><I18nextProvider i18n={i18n}>
      {databaseError ? (
        <Screen>
          <ErrorState message={i18n.t('app.error')} retryLabel={i18n.t('app.retry')} onRetry={retryDatabase} />
        </Screen>
      ) : (
        <>
          {!databaseReady && <Screen><LoadingState label={i18n.t('app.loading')} /></Screen>}
          <SQLiteProvider
            key={retryKey}
            databaseName="english-helper.db"
            onInit={initializeDatabase}
            onError={(cause) => {
              if (__DEV__) console.error('Database initialization failed', cause);
              setDatabaseError(true);
            }}
          >
            <AuthProvider><AuthenticatedProviders>{children}</AuthenticatedProviders></AuthProvider>
          </SQLiteProvider>
        </>
      )}
    </I18nextProvider></SafeAreaProvider>
  );
}

function AuthenticatedProviders({ children }: PropsWithChildren) {
  const { currentUser, isLoading } = useAuth();
  useEffect(() => {
    if (!isLoading && !currentUser) void syncReviewReminder(null, null).catch((cause: unknown) => { if (__DEV__) console.error('Reminder cleanup failed', cause); });
  }, [currentUser, isLoading]);
  if (!currentUser) return <>{children}</>;
  return <SettingsProvider key={currentUser.id}><ReviewSessionProvider>{children}</ReviewSessionProvider></SettingsProvider>;
}
