# 0009 — Feature shape contract + naming

- **Status:** Accepted
- **Date:** 2026-06-19

## Context

Consistency is the point of a starter: every feature should have a predictable
shape so there's no ambiguity about where code lives.

## Decision

Each feature is colocated and self-contained:

```
features/<name>/
  components/  pages/ (*.page.ts)  services/ (*-actions.service.ts)  models/ (Dto/FormModel/ListItem + mappers)
  <name>.routes.ts  <name>.config.ts  <name>.resolvers.ts  <name>.dialogs.ts  <name>.utils.ts
```

Naming: `*.component.ts` · `*.page.ts` · `*.store.ts` · `*.api.ts` ·
`*-actions.service.ts`; types `XxxDto` / `XxxFormModel` / `XxxListItem`; consts
`SCREAMING_SNAKE`. Stores are root-provided in `core/store`; action services are
route-scoped (listed in the feature route's `providers`). Reference: the `items`
demo feature; contract doc: `projects/app/src/app/features/example/README.md`.

## Consequences

- **+** Zero ambiguity; future `ng g feature` generators emit exactly this shape.
- **−** Small features carry a little structure they may not all need.
