# Feature shape (template)

`example/` documents the **canonical feature shape**. Copy it (or run `ng g feature <name>`)
— don't wire `example/` itself into routes.

```
features/<name>/
  components/   # components used ONLY by this feature
                #   nested sub-components live INSIDE their parent component's folder
                #   + index.ts barrel
  pages/        # routed views: *.page.ts (+ .html / .scss)   + index.ts
  services/     # *-actions.service.ts — UI orchestration (confirm dialogs, toasts,
                #   navigation side effects); route-scoped via the route's providers[]
  models/       # XxxDto (API wire) / XxxFormModel (form state) / XxxListItem (list row)
                #   + mapper fns (dtoToFormModel, dtoToListItem)   + index.ts
  <name>.routes.ts      # feature routes — route-scoped providers, titles, breadcrumb data
  <name>.config.ts      # SCREAMING_SNAKE consts + types (tabs, defaults)
  <name>.resolvers.ts   # ResolveFn (e.g. edit-prefill from the list store)
  <name>.dialogs.ts     # dialog config factories (pure functions)
  <name>.utils.ts       # pure helpers
```

**Conventions**

- File suffixes: `*.component.ts` · `*.page.ts` · `*.store.ts` · `*.api.ts` · `*-actions.service.ts`
- Types: `XxxDto` / `XxxFormModel` / `XxxListItem`; consts `SCREAMING_SNAKE`
- Every sub-folder exports through an `index.ts` **barrel** (Sheriff public API)
- **Stores** are root-provided and live in `core/store/`; **action services** are **route-scoped**
- Data calls go through a `core/api/*.api.ts` class returning `ApiResult<T>` (never raw HttpErrorResponse)
