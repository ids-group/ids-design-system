# Architecture Decision Records

Each ADR captures **one** decision: its context, the options weighed, what was
chosen, and the consequences. They record the **why** behind the structure so it
isn't silently undone later. Format: [MADR](https://adr.github.io/madr/) (lightweight).

When you make a new architectural decision, copy `0000-template.md`, give it the
next number, and link it here.

| #    | Decision                                                       | Status   |
| ---- | -------------------------------------------------------------- | -------- |
| 0001 | Record architecture decisions (this practice)                  | Accepted |
| 0002 | Multi-project workspace (`app` + `common`)                     | Accepted |
| 0003 | Standalone-only, `app.config.ts` composition root, zoneless    | Accepted |
| 0004 | State = NgRx Signal Store + reusable store helpers             | Accepted |
| 0005 | Module boundaries via Sheriff (not Nx)                         | Accepted |
| 0006 | Data layer: `ApiResult<T>` envelope + `HttpService`            | Accepted |
| 0007 | Pluggable cross-cutting abstractions (Notification/Error/Auth) | Accepted |
| 0008 | UI = IDS design system only (PrimeNG dropped)                  | Accepted |
| 0009 | Feature shape contract + naming                                | Accepted |
| 0010 | Forms: signal-based (DS form controls lack CVA)                | Accepted |
| 0011 | Six typed environments + DI tokens                             | Accepted |
| 0012 | `common` is source-only (not an ng-packagr library)            | Accepted |
| 0013 | Tooling: eslint/prettier/stylelint, strict tsconfig, CI, bun   | Accepted |
| 0014 | No automated tests in the starter (deferred)                   | Accepted |
| 0015 | No i18n in the starter (deferred → Transloco)                  | Accepted |
| 0016 | Scaffolding mechanism: template + schematics (Nx rejected)     | Proposed |
