# App structure

**Feature-first colocation + four stable layers.** Cross-app code lives in `@app/common`.
Design tokens / themes / global classes come from `@ids-group-ltd/ids-design-system` — **compose, don't redefine.**

| Layer | What goes here |
|---|---|
| `core/` | App-wide **singletons**: `api/` (`*.api.ts`), `store/` (signal stores + `helpers/`), `notifications/` (`ToastNotificationService` → `ds-toast`), `transitions/`, `config/`. One instance, not feature-specific. |
| `features/<name>/` | Everything for **one feature**, colocated — see `features/example/README.md`. |
| `layouts/` | Route-mounted **shells** (`auth-layout`, `main-layout`) built on `ds-sidenav` / `ds-topbar`. |
| `shared/` | Cross-feature **reusable, no business logic**: `components/ directives/ pipes/ utils/ models/ constants/`. |

Cross-cutting **infra** — `HttpService`, interceptors, guards, `GlobalErrorHandler`, auth store,
abstract `NotificationService` / `ErrorReporter` — lives in **`@app/common`** (`projects/common/src/lib/`),
so it's ready to share if a second app is added. Envs → `@app/common/config`; dev panel → `@app/common/dev`.

**Styles:** app globals + the DS import + brand overrides go in `src/styles.scss`
(`@use '@ids-group-ltd/ids-design-system/styles/ds';` then `[data-brand]` overrides).
Shared SCSS partials (mixins/vars) → `projects/common/styles/` (wired via `angular.json` `includePaths`).

Module boundaries between these layers are enforced by **Sheriff** (public API via `index.ts`).
