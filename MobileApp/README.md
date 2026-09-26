# English Helper MobileApp

MobileApp is the offline-first React Native vocabulary app for Android and iOS. Local accounts, vocabulary, review, search, settings, reminders, and JSON backups work offline. Remote images and dictionary pages require connectivity.

## Setup and build

From the repository root, enter the mobile project and install its dependencies:

```text
cd MobileApp
npm install
npm start
```

Run the remaining commands from `MobileApp`. `npm start` launches Expo. Use `npm run android` with a configured Android emulator or device, or `npm run ios` on macOS with an iOS simulator. iOS validation requires a Mac, a suitable device workflow, or a cloud build. Native configuration changes require rebuilding the app. Use a development or production build to verify app-specific notification permissions and background delivery.

## Development checks

```text
npm run typecheck
npm run lint
npm test
```

Jest, jest-expo, and React Native Testing Library cover business logic and focused UI interactions. Verify SQLite persistence, remote image fallback, file sharing, dictionary links, notification permission, background delivery, time changes, and reboot behavior on Android and iOS devices when available.

## Architecture and dependencies

- Expo SDK 57, React Native, React, and TypeScript provide the mobile foundation. Expo Router handles tab and stack navigation.
- `src/app/` contains thin route files; `src/screens/` contains screen components; `src/components/` contains reusable UI.
- `src/hooks/` connects screens to state and services and implements the authentication and settings providers. `src/providers/` composes shared providers and holds review session state.
- `src/services/database/` owns Expo SQLite migrations and repositories. `src/services/auth/` uses @noble/hashes and Expo Crypto for salted password hashes. `src/services/review/` owns review logic, and `src/services/importExport/` owns JSON backups.
- `src/services/reminders/` uses Expo Notifications for local review alerts; the settings screen uses the native DateTimePicker. `src/services/dictionary/` opens Oxford and Cambridge pages through Expo Web Browser.
- Expo Document Picker, File System, and Sharing support backup files. Expo Crypto supplies vocabulary UUIDs. `react-native-svg` renders the logo and navigation icons.
- `src/i18n/` bundles English and Vietnamese translations with i18next and react-i18next. `src/theme/` owns design tokens; `src/models/` and `src/utils/` hold domain types and reusable logic.

The bottom bar has Home, Review, Settings, and Profile, with a center Add action. English is the default language, and review groups contain 30 words until changed in Settings. Vocabulary images are stored only as remote HTTP/HTTPS URLs. V1 has no image picker, upload service, or cloud storage dependency.

## Using the app

1. Register with an email and password, or sign in to an existing local account. Remember Me keeps the session across app restarts. Profile provides display name, optional remote avatar URL, password change, and logout. Local-only accounts have no email recovery service.
2. Use Add to save a word with Vietnamese and English meanings, optional word class and IPA, and an optional HTTP/HTTPS image URL. A failed image preview does not prevent saving.
3. Search Home by word or either meaning, or choose a review mode. Group labels display their current word ranges and change with the group-size setting.
4. Enter answers, move between questions, and submit. Skipped words remain unanswered; review statistics update only on submission.
5. Use Settings to change language or group size, choose a daily Review Reminder time, and export or import a JSON vocabulary backup. Enabling the reminder asks for notification permission. If permission is denied, the reminder stays off.

## Persistence and platform behavior

SQLite schema version 2 adds `users`, `auth_session`, and `user_settings`, plus `user_id`, `word_class`, and `ipa` on vocabulary. Schema version 3 adds `review_reminder` (off by default) and `reminder_time` (20:00 by default) to per-user settings. Repository queries enforce user ownership. Existing vocabulary and review counters migrate to the first account registered after upgrade; later accounts start empty. Passwords use salted PBKDF2-SHA256 hashes. Local account IDs leave room for future provider IDs. Repository methods own SQL, and vocabulary images remain remote URLs in `image_url`.

The reminder is a native repeating local notification at the selected device time, so it can appear while the app is backgrounded or closed. Changing its time replaces the old schedule; turning it off or signing out removes the scheduled alert. On launch, the app checks saved settings and restores a missing schedule without creating duplicates. Android native builds use an app-specific notification channel and declare `SCHEDULE_EXACT_ALARM`; Android 13+ also asks for notification permission. Expo Go uses its fallback channel because its native channel provider is unavailable.

Backup version 2 includes word class and IPA. Version 1 backups still import, with those fields set to null. Imports always assign the currently signed-in user as owner. Backups contain vocabulary and remote image URLs; they omit account information, password hashes, settings, and image bytes. Import skips duplicate word/meaning content and reports invalid records and ID conflicts.

Review answers are compared after trimming, collapsing repeated whitespace, and case folding. Skipped questions do not change vocabulary statistics. Only submission saves review statistics. Active sessions are not restored after a restart.

See [AI/README.md](AI/README.md) for mobile implementation instructions and [AGENTS.md](../AGENTS.md) for shared repository rules.
