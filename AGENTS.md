# English Helper agent guide

## Purpose and stack

English Helper is an Android/iOS React Native vocabulary learning app. It uses Expo SDK 57, TypeScript, Expo Router, Expo SQLite, i18next, and Jest. Vocabulary, review, search, settings, and JSON backup work offline; remote images and dictionary pages require connectivity.

## Architecture and folders

- `src/app/` holds thin Expo Router route files. Five tabs lead to Home, Vocabulary, Review, Search, and Settings. Keep screens in `src/screens/`.
- `src/components/` holds small reusable UI. Check existing components before adding another.
- `src/hooks/` connects screens to state and services. Keep database, filesystem, dictionary URLs, review selection, and backup parsing out of UI components.
- `src/services/database/` owns SQL migrations and repositories. `src/services/review/` owns pure review logic and submission. `src/services/importExport/` owns backups.
- `src/models/` defines domain and backup types. `src/utils/` holds reusable normalization and validation. `src/theme/` and `src/i18n/` own design tokens and translation resources.

Use PascalCase for components and model types, camelCase for functions and hooks, and descriptive names for SQL columns in snake_case. Prefer short functions with one purpose. Add comments for architectural reasons and non-obvious platform behavior, not self-evident statements.

State is local to a screen unless multiple routes need it. `SettingsProvider` loads persisted settings and changes the bundled i18n language. `ReviewSessionProvider` holds an unfinished session in memory and guards against double submission. `useVocabularyList` refreshes when a route gains focus; screens never retain SQLite rows as an independent long-term source of truth.

## Required rules

1. Do not hardcode user-facing strings in components. Use English and Vietnamese translation keys, including alerts and accessibility labels.
2. Do not hardcode colors in components. Use the centralized theme; keep contrast accessible.
3. Keep components small and business logic outside UI.
4. Use strong TypeScript types; avoid `any`.
5. Reuse existing components before making duplicates.
6. Update tests when changing business logic and run typecheck, lint, and relevant tests after each phase.
7. Update this file and `README.md` when architecture or dependency choices change.
8. Do not add frameworks, abstractions, or dependencies beyond the approved specification without a concrete need.

## Database and vocabulary

SQLite is the V1 source of truth. Migrations use `PRAGMA user_version`; never wipe user data on upgrade errors. `vocabularies` has UUID IDs, English word, both meanings, nullable `image_url`, UTC timestamps, review statistics, and a derived normalized search field. `settings` stores language and review group size. Repository calls use bound SQL parameters; multirow imports and review updates use transactions. Multiple records may share an English word when their meanings differ.

`Vocabulary.imageUrl` is a remote HTTP/HTTPS URL or null. SQLite and backups never contain image bytes, Base64, or permanent local image paths. URL validation does not require a file extension. A failed remote preview shows a placeholder and does not block saving or reviewing. A future upload service may produce a URL for this same field; V1 has no image picker, camera, upload, or cloud-storage dependency.

## Review and backup rules

Groups sort by creation date then ID, and divide by the current setting (default 30); labels display the dynamic word range. Random selection has no duplicates. Most mistaken sorts by incorrect count descending, then oldest review date, with never-reviewed first. Newest sorts by creation date descending. Answer comparison trims, collapses internal whitespace, and ignores case while preserving punctuation. Only submitted correct/incorrect answers change statistics; skipped answers do not. Active sessions are in memory and are discarded on restart.

Backup V1 is JSON with `version: 1`, `exportedAt`, and `vocabularies`; image data is only `imageUrl`. Imports validate records and skip duplicate content based on normalized word and both meanings. An ID collision with different content is invalid. Settings are not included.

## Commands and testing

```text
npm start
npm run android
npm run ios
npm run typecheck
npm run lint
npm test
```

Use `npx expo install` for Expo native modules. Test review selection/scoring, normalization, imports, duplicates, and meaningful screen interactions. Verify SQLite persistence, remote image fallback, file sharing, and dictionary links on Android and iOS devices when available.
