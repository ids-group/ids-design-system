# IDS App Starter

A reproducible, enforced front-end architecture for IDS apps — an Angular
workspace (`app` + `common`) wired to the IDS design system, running on a mock
backend with **no real services**. Copy it to start a new app.

**What's inside:** standalone + zoneless Angular · NgRx Signal Store + helpers ·
`ApiResult<T>` data layer · pluggable Notification / ErrorReporter / AuthProvider
(mock) · full auth (refresh / silent-renew / tab-sync) · IDS design system UI ·
Sheriff-enforced module boundaries · 6 typed environments · CI gate + lefthook ·
a demo `items` CRUD feature dogfooding every pattern.

## Quick start

```bash
cd starter
bun install            # Windows DS-link note: docs/architecture/README.md
bun start              # mock auth — any credentials sign you in
```

## Docs

- **Architecture guide** → [`docs/architecture/README.md`](docs/architecture/README.md)
  (layers, stack, quick start, new-app rename guide, known DS gaps)
- **Decision records (the why)** → [`docs/decisions/README.md`](docs/decisions/README.md)
- **App layer map** → [`projects/app/src/app/README.md`](projects/app/src/app/README.md)
- **Feature shape contract** → [`projects/app/src/app/features/example/README.md`](projects/app/src/app/features/example/README.md)

## Commands

```bash
bun start          # dev server
bun run build      # production build
bun run lint       # eslint + Sheriff module boundaries
bun run lint:styles
bun run format     # prettier check (format:fix to write)
bash infrastructure/scripts/ci-validate.sh   # full CI gate
```
