# 0007 — Pluggable cross-cutting abstractions (Notification / ErrorReporter / AuthProvider)

- **Status:** Accepted
- **Date:** 2026-06-19

## Context

Notifications, crash reporting, and the auth backend are app-specific, but the
shared library and features must depend on them without hard-coupling to a vendor.

## Options

1. Hard-wire concrete implementations (e.g. a specific toast lib, Sentry, one
   identity API) into `common`.
2. **Abstract base classes in `common`** + concrete implementations provided in
   `app.config.ts`.

## Decision

`common` exposes abstractions; the app provides implementations:

- `NotificationService` (abstract) → `ToastNotificationService` on IDS `ds-toast`.
- `ErrorReporter` (abstract) → `NoopErrorReporter` by default. **No Sentry** is
  shipped or referenced (removed per decision); wire your own reporter if needed.
- `AuthProvider` (abstract) → `MockAuthProvider` (runs with no backend) or
  `HttpAuthProvider`. `AuthStore` talks only to `AuthProvider`.
- `ConfirmService` (abstract) → `WindowConfirmService` (`window.confirm`), because
  the IDS DS has no confirm-dialog component yet (tracked gap).

## Consequences

- **+** `common`/features depend on interfaces; swapping vendors is a one-line
  provider change. The starter runs end-to-end with mocks (no server).
- **−** One indirection layer per concern.
