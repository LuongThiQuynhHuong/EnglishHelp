# MobileApp code generation

- Use PascalCase for components and model types, camelCase for functions and hooks, and descriptive snake_case SQL column names. Prefer short functions with one purpose and strong TypeScript types; avoid `any`.
- Check existing components before adding one. Keep components small and business logic in hooks or services according to [architecture.md](architecture.md).
- Use English and Vietnamese translation keys for all user-facing strings, including alerts and accessibility labels. Use centralized theme colors and maintain accessible contrast.
- Comment on architectural reasons and non-obvious platform behavior, not self-evident statements.
- Use `npx expo install` for Expo native modules. Add frameworks, abstractions, or dependencies only when there is a concrete need within the approved app specification.
