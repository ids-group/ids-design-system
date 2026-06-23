# App architecture guide

This starter is a reproducible, enforced front-end architecture for IDS apps — an
Angular workspace wired to the IDS design system, running on a mock backend with
no real services. It captures the proven PinkMoon.Frontend architecture, rebased
onto IDS. The **why** behind each choice lives in [`../decisions/`](../decisions/README.md) (ADRs).

## Layers at a glance

```
projects/
  app/                      the application
    src/app/
      core/                 app-wide singletons: api/ store/(+helpers) notifications/ transitions/ config/
      features/<name>/      self-contained features (components/ pages/ services/ models/ + *.routes/.config/…)
      layouts/              auth-layout + main-layout (ds-topbar / ds-sidenav)
      shared/               cross-feature reusable, no business logic
      app.config.ts         composition root (providers, router, interceptors, initializers)
      app.routes.ts         lazy routes + guards
  common/                   @app/common — shared library (source-only)
    src/lib/                api/ models/ tokens/ utils/ services/ notifications/ errors/ handlers/ auth/ store/ guards/ constants/
    config/                 @app/common/config — 6 typed environments
```

- **Boundary (enforced):** `common` must never import from `app`. Apps import
  `@app/common`. Lint-enforced by Sheriff (`sheriff.config.ts`) — see ADR-0005.
- **Cross-cutting infra** (data layer, auth, interceptors, guards, error handler,
  notification/error/auth abstractions) lives in `common`, ready to share with a
  second app.

## Stack & key patterns

| Concern        | Choice                                                              | ADR  |
| -------------- | ------------------------------------------------------------------- | ---- |
| Components     | Standalone-only, OnPush, **zoneless**                               | 0003 |
| State          | NgRx Signal Store + helpers (list/edit/loading, URL↔state)          | 0004 |
| Boundaries     | Sheriff (`barrelFileName: public-api.ts`; `common ↛ app`)           | 0005 |
| Data           | `ApiResult<T>` envelope + `HttpService(BASE_URL)` + opt-out tokens  | 0006 |
| Cross-cutting  | Pluggable `NotificationService`/`ErrorReporter`/`AuthProvider` (mock) | 0007 |
| UI             | IDS DS only (`ds-*`); styles via `@use '…/styles/ds'`               | 0008 |
| Feature shape  | `components/ pages/ services/ models/` + `*.routes/.config/…`        | 0009 |
| Forms          | Signal-based (`[(value)]`) — DS controls lack CVA                   | 0010 |
| Environments   | 6 typed + `fileReplacements` + DI tokens                            | 0011 |
| Auth           | Full `AuthStore` (refresh/silent-renew/tab-sync) behind `AuthProvider` | 0007 |

## Quick start (in this repo)

```bash
cd starter
bun install            # Windows: see the DS-link note below
bun start              # serves the app (mock auth: any credentials work)
bun run lint           # eslint + Sheriff boundaries
bun run build          # production build
bash infrastructure/scripts/ci-validate.sh   # the full CI gate
```

**DS dependency.** The app consumes `@ids-group-ltd/ids-design-system` via
`file:../dist/ds` for in-repo dev. Build the DS first (`npm run build:lib` at the
repo root). On **Windows local dev** the DS must be **copied** into
`node_modules/@ids-group-ltd/ids-design-system` (not a junction/symlink), or it
resolves the repo's `@angular/core` and you get an InputSignal "brand" mismatch.
On Linux/CI the `file:` install copies correctly. A real consumer installs the
published package from the registry instead (`.npmrc` + `NPM_TOKEN`).

## Using this as a new app (rename guide)

A scaffold generator (`ng add` / `ng g`) is planned (ADR-0016). Until then, copy
`starter/` and rename:

1. **Selector prefix `app`** → your prefix (e.g. `acme`): `eslint.config.mjs`
   (`component-selector`/`directive-selector`), every `selector: 'app-…'`, and the
   `app-` usages in templates.
2. **Path alias `@app/*`** → e.g. `@acme/*`: `tsconfig.json` `paths`, and all
   `@app/common` / `@app/common/config` imports.
3. **App/package name** in `package.json`, `angular.json` project name, `AppTitleStrategy` suffix.
4. **Environments** (`projects/common/config/src/environments/*`): real `baseUrl`s.
5. **DS dependency:** point at the published package + configure `.npmrc` / `NPM_TOKEN`.
6. **Auth:** swap `MockAuthProvider` → `HttpAuthProvider` (or your own) in `app.config.ts`.
7. **Remove the demo:** follow [`remove-demo.md`](remove-demo.md) (deletes the
   `items`/`admin` features, their api/store, routes, and nav links).

## Known DS gaps this starter surfaced

Tracked in the DS backlog (not starter bugs):

- **No `ControlValueAccessor`** on `ds-input`/`ds-select` → reactive forms don't
  bind; the starter uses signal forms (ADR-0010).
- **No confirm-dialog** → app-side `ConfirmService` (`window.confirm`) (ADR-0007).
- **No advanced data-grid** → the demo uses a lean table (ADR-0008).
