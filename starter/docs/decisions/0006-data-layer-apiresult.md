# 0006 — Data layer: `ApiResult<T>` envelope + `HttpService`

- **Status:** Accepted
- **Date:** 2026-06-19

## Context

Feature code shouldn't deal with raw `HttpErrorResponse`, scattered base-URL
strings, or ad-hoc error shapes. Error handling and retries should be opt-out-able
per request.

## Options

1. Call `HttpClient` directly in features, handle errors case by case.
2. **A thin `HttpService` + a uniform `ApiResult<T>` envelope** returned by every call.

## Decision

`HttpService` wraps `HttpClient`, injects a `BASE_URL` token, prefixes `/api`, and
threads `ExecutionOptions`. Every API method returns `ApiResult<T>`
(`{ isSuccess, data?, failure? }`); `getFailureMessage()` standardizes messages.
Per-request `HttpContext` tokens (`MANUAL_ERROR_HANDLING`, `HTTP_RETRY_COUNT`) opt
out of the default error toast / enable retries. Per-entity `*.api.ts` classes
own their endpoints.

## Consequences

- **+** No raw `HttpErrorResponse` escapes; `isSuccess` is always checked.
- **+** Cross-cutting HTTP behavior is composable and opt-out per call.
- **−** A wrapping layer to learn; APIs must conform to the envelope.
