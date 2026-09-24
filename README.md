# English Helper

English Helper is an offline-first React Native vocabulary app for Android and iOS. Vocabulary, review, search, settings, and JSON backups work without a network connection. Dictionary pages and remotely hosted vocabulary images need connectivity.

## Dependency choices

- **Expo SDK 57, React Native, React, and TypeScript:** a supported mobile foundation with compatible versions selected by Expo.
- **Expo Router:** tab and stack navigation using the Expo default project structure.
- **Expo SQLite:** local, transactional vocabulary and settings storage.
- **Expo Document Picker, File System, and Sharing:** select, read, write, and share JSON backup files. These do not store vocabulary images.
- **Expo Crypto:** stable UUIDs for vocabulary records.
- **Expo Web Browser:** open Oxford and Cambridge dictionary pages.
- **i18next and react-i18next:** bundled English and Vietnamese translations with live language switching.
- **Jest, jest-expo, and React Native Testing Library:** business logic and focused UI tests.

Vocabulary images are stored only as remote HTTP/HTTPS URLs. V1 has no image picker, upload service, or cloud storage dependency.

## Development

Install with `npm install`, then run `npm start` or `npm run android`. On macOS, `npm run ios` can open the iOS simulator. Run `npm run typecheck`, `npm run lint`, and `npm test` after changes.

The app uses five Expo Router tabs. Screen components live under `src/screens`; reusable UI lives under `src/components`; hooks call services and SQLite repositories. Translation resources are bundled in `src/i18n`, and design tokens are in `src/theme`. SQLite stores vocabulary and settings. English is the default language and review groups contain 30 words until changed in Settings.

## Using the app

1. Add a word with Vietnamese and English meanings. An optional image URL must use HTTP or HTTPS. A failed image preview does not prevent saving.
2. Search by word or either meaning, or choose a review mode. Group labels display their current word ranges and change with the group-size setting.
3. Enter answers, move between questions, and submit. Skipped words remain unanswered; review statistics update only on submission.
4. Use Settings to change language or group size and to export or import a JSON vocabulary backup.

Vocabulary and Settings are stored in `english-helper.db`. The schema is versioned with SQLite `PRAGMA user_version`; repository methods own SQL. Vocabulary images are references in the `image_url` TEXT column. The backup format uses `version: 1`, `exportedAt`, and a `vocabularies` array with `imageUrl` values. Import skips duplicate word/meaning content and reports invalid records and ID conflicts. Settings are not included in backups.

Review answers are compared after trimming, collapsing repeated whitespace, and case folding. Skipped questions do not change vocabulary statistics. Only submission saves review statistics. Active sessions are not restored after a restart.

JSON backups contain vocabulary and remote image URLs, not image content or settings. See `AGENTS.md` for architecture and contribution rules.

The app targets Android and iOS. Android can be run locally from Windows with a configured emulator or device. iOS validation requires a Mac, a suitable device workflow, or a cloud build. Remote images and dictionary pages require connectivity; the rest of the app works offline.
