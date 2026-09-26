# MobileApp testing

Run these commands from `MobileApp/` after each implementation phase that changes code:

```text
npm run typecheck
npm run lint
npm test
```

Update tests when business logic changes. Cover review selection and scoring, normalization, imports and duplicates, and meaningful screen interactions. On Android and iOS devices when available, verify SQLite persistence, remote image fallback, file sharing, and dictionary links. For reminder changes, verify permission, scheduling, background delivery, time changes, and reboot behavior in an appropriate native build.
