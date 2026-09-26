# MobileApp domain and data rules

## Database and vocabulary

SQLite is the V1 source of truth. Migrations use `PRAGMA user_version`; never wipe user data on upgrade errors. Schema version 2 adds local users, a persisted session, per-user settings, and vocabulary ownership, word class, and IPA. Schema version 3 adds per-user daily reminder enabled state and HH:mm time, defaulting to off at 20:00. Existing words and review statistics are copied into the new schema, then claimed by the first registered account.

Every vocabulary and settings repository operation is scoped by the authenticated user ID. Repository calls use bound SQL parameters; multirow imports and review updates use transactions. Multiple records may share an English word when their meanings differ.

`Vocabulary.imageUrl` is a remote HTTP/HTTPS URL or null. SQLite and backups never contain image bytes, Base64, or permanent local image paths. URL validation does not require a file extension. A failed remote preview shows a placeholder and does not block saving or reviewing. A future upload service may produce a URL for this field; V1 has no image picker, camera, upload, or cloud-storage dependency.

## Review

Groups sort by creation date then ID, divide by the current setting (default 30), and display dynamic word ranges. Random selection has no duplicates. Most mistaken sorts by incorrect count descending, then oldest review date, with never-reviewed first. Newest sorts by creation date descending. Answer comparison trims, collapses internal whitespace, and ignores case while preserving punctuation. Only submitted correct or incorrect answers change statistics; skipped answers do not. Active sessions are in memory and are discarded on restart.

## Backup

Backup V2 is JSON with `version: 2`, `exportedAt`, and `vocabularies`, including word class and IPA. V1 imports default those fields to null. Image data is only `imageUrl`. Imports validate records, discard external `userId` values, bind records to the current user, and skip duplicate content based on normalized word and both meanings. An ID collision with different content is invalid. Settings and credentials are not included.
