# 0004 — State = NgRx Signal Store + reusable store helpers

- **Status:** Accepted
- **Date:** 2026-06-19

## Context

The app needs predictable, signal-friendly state for lists (paged/sorted/filtered)
and edit forms, with consistent loading-state handling.

## Options

1. **Plain signal services** — `signal()`/`computed()` in `@Injectable` services.
2. **NgRx Signal Store** (`@ngrx/signals`) — `withState/withComputed/withMethods/withHooks`.
3. NgRx Store (Redux-style) — heavier, action/reducer ceremony.

## Decision

**NgRx Signal Store**, one store per domain (`core/store/*.store.ts`,
`providedIn: 'root'`). Reusable helpers in `core/store/helpers/` —
`createListLoader`, `createEditDataLoader`, `withListLoading` (switchMap +
single-flight loading), URL↔state round-trip, and `debouncedLoading` (anti-flicker).

## Consequences

- **+** Cohesive state units; the helpers remove repeated list/edit boilerplate.
- **+** Signal-native — integrates with OnPush/zoneless directly.
- **−** A dependency (`@ngrx/signals`) and its conventions to learn.
