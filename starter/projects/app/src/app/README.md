# App structure

**Feature-first colocation + four stable layers.** Cross-app code lives in `@app/common`.
Design tokens / themes / global classes come from `@ids-group-ltd/ids-design-system` — **compose, don't redefine.**

| Layer              | What goes here                                                                                                                                                                                                                                                              |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `core/`            | App-wide **singletons**: `api/` (`*.api.ts`), `store/` (signal stores + `helpers/`), `notifications/` (`ToastNotificationService` → `ds-toast`), `breadcrumb/`, `scrollbar/`. One instance, not feature-specific. (Routing transition helpers live in `@app/common/utils`.) |
| `features/<name>/` | Everything for **one feature**, colocated — see `features/example/README.md`.                                                                                                                                                                                               |
| `layouts/`         | Route-mounted **shells** (`auth-layout`, `main-layout`) built on `ds-sidenav` / `ds-topbar`.                                                                                                                                                                                |
| `shared/`          | Cross-feature **reusable, no business logic**: `components/ directives/ pipes/ utils/ models/ constants/`.                                                                                                                                                                  |

Cross-cutting **infra** — `HttpService`, interceptors, guards, `GlobalErrorHandler`, auth store,
abstract `NotificationService` / `ErrorReporter` — lives in **`@app/common`** (`projects/common/src/lib/`),
so it's ready to share if a second app is added. Envs → `@app/common/config`; dev panel → `@app/common/dev`.

### Styles

`src/styles.scss` composes the design system + an app **brand layer**, in order:

| #   | Layer                                                                                            | File                                                | Scope          |
| --- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------- | -------------- |
| 1   | Design system (palette + theme + tokens + resets/typography)                                     | `@use '@ids-group-ltd/ids-design-system/styles/ds'` | `:root`        |
| 2   | **palette** — raw `--app-*` colour/scale primitives (source of truth)                            | `styles/_palette.scss`                              | `[data-brand]` |
| 3   | **theme** — binds palette onto DS semantic roles (`--primary*` + channels, surfaces, text, font) | `styles/_theme.scss`                                | `[data-brand]` |
| 4   | **app-vars** — app layout/feature tokens built from the DS scale (`--app-page-pad`…)             | `styles/_app-vars.scss`                             | `[data-brand]` |
| 5   | **ds-overrides** — per-component public `--ds-*` token tweaks                                    | `styles/_ds-overrides.scss`                         | `[data-brand]` |

**Naming convention:** brand-layer partials are `styles/_<concern>.scss` (leading
underscore = Sass partial); primitives use the `--app-*` namespace; the brand layer
is scoped under `[data-brand='app']` (set on `<html>` in `index.html`).

**Re-skinning a brand:** edit `_palette.scss` values (and the `--app-brand-h/s/l`
channels) — everything downstream re-skins because `_theme.scss` binds roles to
`--app-*`, never raw hex. The shipped example mirrors the DS default (blue), so it's
the override template; **delete the brand layer to ride the DS default theme as-is.**

**DS import — two equivalent forms:** (A, default) scoped package path
`@use '@ids-group-ltd/ids-design-system/styles/ds'`; (B, shorter) add the package
dir to `angular.json` `stylePreprocessorOptions.includePaths` then `@use 'styles/ds'`.
Cross-app SCSS partials (mixins/vars) → `projects/common/styles/` (already on `includePaths`).

Module boundaries between these layers are enforced by **Sheriff** (public API via `index.ts`).
