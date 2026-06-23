# Removing the demo

The starter ships a working demo (auth, dashboard, an `items` CRUD feature, an
admin route) so it runs end-to-end on a mock backend. Delete it before building
your real app — the architecture (core/common/shared, data layer, auth, Sheriff
boundaries, styles) stays.

## 1. Delete the demo feature folders

```
projects/app/src/app/features/items/      # the CRUD demo (pages, components, store-bound)
projects/app/src/app/features/admin/       # the adminGuard demo page
```

Keep `features/not-found/` (real 404) and `features/auth/` (real login).

## 2. Remove the demo's data + store

```
projects/app/src/app/core/api/item.api.ts        # in-memory demo API
projects/app/src/app/core/store/item.store.ts    # demo Signal Store
```

Keep `core/store/helpers/` — those are reusable.

## 3. Unwire the routes

In `projects/app/src/app/app.routes.ts` remove the `items` and `admin` route
entries (and the `adminGuard` import if unused elsewhere). Point the empty
redirect at your first real feature instead of `dashboard` if you replace it.

## 4. Update the shell

In `projects/app/src/app/layouts/main-layout/main-layout.html` remove the
`Items` and `Admin` `<ds-sidenav-item>` links.

## 5. Dashboard

`features/dashboard/` is a thin example (tabbed). Either keep it as your landing
page or replace its content. The tab + breadcrumb wiring is a reference pattern.

## 6. Verify

```bash
bun run lint    # Sheriff confirms no dangling cross-feature imports
bun run build
```

The MockAuthProvider, dev panel, interceptors, and styles brand layer are
infrastructure — keep them and swap the mock providers for real ones
(`app.config.ts`: `AuthProvider` → `HttpAuthProvider`, real env `baseUrl`s).
