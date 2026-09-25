# English Helper

English Helper is an offline-first React Native vocabulary app for Android and iOS. Local accounts, vocabulary, review, Home search, settings, and JSON backups work without a network connection. Dictionary pages and remotely hosted images need connectivity.

## Dependency choices

- **Expo SDK 57, React Native, React, and TypeScript:** a supported mobile foundation with compatible versions selected by Expo.
- **Expo Router:** tab and stack navigation using the Expo default project structure.
- **Expo SQLite:** local, transactional accounts, sessions, vocabulary, and per-user settings.
- **@noble/hashes and Expo Crypto:** salted PBKDF2-SHA256 password hashes and cryptographic random salts.
- **react-native-svg:** renders the supplied logo and navigation icons on Android and iOS.
- **Expo Document Picker, File System, and Sharing:** select, read, write, and share JSON backup files. These do not store vocabulary images.
- **Expo Crypto:** stable UUIDs for vocabulary records.
- **Expo Web Browser:** open Oxford and Cambridge dictionary pages.
- **Expo Notifications and the native DateTimePicker:** daily local review alerts and an Android/iOS time picker.
- **i18next and react-i18next:** bundled English and Vietnamese translations with live language switching.
- **Jest, jest-expo, and React Native Testing Library:** business logic and focused UI tests.

Vocabulary images are stored only as remote HTTP/HTTPS URLs. V1 has no image picker, upload service, or cloud storage dependency.

## Development

Install with `npm install`, then run `npm start` or `npm run android`. On macOS, `npm run ios` can open the iOS simulator. Run `npm run typecheck`, `npm run lint`, and `npm test` after changes.

After sign in, the bottom bar has Home, Review, Settings, and Profile, with a raised Add action in the center. Home contains vocabulary browsing and search. Screen components live under `src/screens`; reusable UI lives under `src/components`; hooks call services and SQLite repositories. Translation resources are bundled in `src/i18n`, and design tokens are in `src/theme`. English is the default language and review groups contain 30 words until changed in Settings.

## Using the app

1. Register with an email and password, or sign in to an existing local account. Remember Me keeps the session across app restarts. Profile provides display name, optional remote avatar URL, password change, and logout. Local-only accounts have no email recovery service.
2. Use the center Add action to save a word with Vietnamese and English meanings, optional word class and IPA, and an optional HTTP/HTTPS image URL. A failed image preview does not prevent saving.
3. Search Home by word or either meaning, or choose a review mode. Group labels display their current word ranges and change with the group-size setting.
4. Enter answers, move between questions, and submit. Skipped words remain unanswered; review statistics update only on submission.
5. Use Settings to change language or group size, choose a daily Review Reminder time, and export or import a JSON vocabulary backup. Enabling the reminder asks for notification permission. If permission is denied, the reminder stays off.

SQLite schema version 2 adds `users`, `auth_session`, and `user_settings`, plus `user_id`, `word_class`, and `ipa` on vocabulary. Schema version 3 adds `review_reminder` (off by default) and `reminder_time` (20:00 by default) to per-user settings. Repository queries enforce user ownership. Existing vocabulary and review counters migrate to the first account registered after upgrade; later accounts start empty. Passwords use salted PBKDF2-SHA256 hashes. Local account IDs leave room for future provider IDs. Repository methods own SQL, and vocabulary images remain remote URLs in `image_url`.

The reminder is a native repeating local notification at the selected device time, so it can appear while the app is backgrounded or closed. Changing its time replaces the old schedule; turning it off or signing out removes the scheduled alert. On launch, the app checks saved settings and restores a missing schedule without creating duplicates. Android native builds use an app-specific notification channel and declare `SCHEDULE_EXACT_ALARM`; Android 13+ also asks for notification permission. Expo Go uses its fallback channel because its native channel provider is unavailable. Use a development or production build to verify app-specific permissions and background delivery. Native configuration changes require rebuilding the app. Verify permission, background delivery, time changes, and reboot behavior on Android and iOS devices.

Backup version 2 includes word class and IPA. Version 1 backups still import, with those fields set to null. Imports always assign the currently signed-in user as owner. Backups contain vocabulary and remote image URLs; they omit account information, password hashes, settings, and image bytes. Import skips duplicate word/meaning content and reports invalid records and ID conflicts.

Review answers are compared after trimming, collapsing repeated whitespace, and case folding. Skipped questions do not change vocabulary statistics. Only submission saves review statistics. Active sessions are not restored after a restart.

See `AGENTS.md` for architecture and contribution rules.

The app targets Android and iOS. Android can be run locally from Windows with a configured emulator or device. iOS validation requires a Mac, a suitable device workflow, or a cloud build. Remote images and dictionary pages require connectivity; the rest of the app works offline.
