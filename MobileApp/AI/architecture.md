# MobileApp architecture

English Helper is an Android/iOS React Native vocabulary app using Expo SDK 57, TypeScript, Expo Router, Expo SQLite, Expo Notifications, the native DateTimePicker, i18next, and Jest. Vocabulary, review, search, settings, reminders, and JSON backup work offline. Remote images and dictionary pages require connectivity.

- `src/app/` contains thin Expo Router route files. Login and Sign Up are public; protected tabs are Home, Review, Settings, and Profile, with a center Add action. Screen implementations belong in `src/screens/`.
- `src/components/` holds small reusable UI. `src/hooks/` connects screens to state and services; database, filesystem, dictionary URLs, review selection, and backup parsing stay out of UI components.
- `src/services/database/` owns SQL migrations and repositories. `src/services/auth/` owns local credential validation and hashing behind an auth service interface. `src/services/review/` owns pure review logic and submission. `src/services/importExport/` owns backups. `src/services/reminders/` owns notification permission and schedule reconciliation.
- `src/models/` defines domain and backup types. `src/utils/` holds reusable normalization and validation. `src/theme/` and `src/i18n/` own design tokens and translation resources.

Keep state local to a screen unless multiple routes need it. `AuthProvider` restores the persisted session and owns the current user. `SettingsProvider` loads that user's settings and changes the bundled i18n language. `ReviewSessionProvider` holds an unfinished session in memory, guards against double submission, and unmounts at logout. `useVocabularyList` refreshes on route focus; screens do not retain SQLite rows as an independent long-term source of truth.

The reminder adapter loads local Expo Notifications modules without the push-token package entry that fails in Android Expo Go. Expo Go uses the native fallback channel; app-specific channel creation runs only in Android native builds.
