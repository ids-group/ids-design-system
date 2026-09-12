import { InjectionToken, computed, inject, type Signal } from '@angular/core';
import type { DsSize } from '@ids-group-ltd/ids-design-system/core';

/** What a grouped control can read off the group that encloses it. */
export interface DsFieldGroupContext {
  /** The group's size, so a segment matches its neighbours without being told.
   *  Resolved, not the raw input: `size` is unset by default and falls back to
   *  `DS_CONFIG.control.size`, which a segment must not have to resolve again. */
  readonly sizeResolved: () => DsSize;
  /** Whether the GROUP is in error — RESOLVED, so an `error` string counts and not only the
   *  `invalid` flag. A segment ORs it into its own state, so focusing any of them announces the
   *  error: the pair is invalid, and a reader who tabs to the second segment must hear it too.
   *  Named for the resolved value so it cannot be confused with the group's raw `invalid` input. */
  readonly invalidResolved: () => boolean;
  /** The id of the group's message row, or `null` when it has no message. A
   *  segment adds it to `aria-describedby`, which is what connects the one
   *  sentence to every control it describes. */
  readonly messageId: () => string | null;
}

/**
 * Provided by `ds-field-group`, injected `{ optional: true }` by every control
 * that can be a segment.
 *
 * DI rather than a `[grouped]` input on each child: the alternative is manual,
 * and one segment where it was forgotten renders its own border and radius in
 * the middle of a glued row — a broken control that still looks deliberate.
 * Presence of the token IS the fact the child needs, and the consumer already
 * declared it by wrapping them.
 */
export const DS_FIELD_GROUP = new InjectionToken<DsFieldGroupContext>(
  'DS_FIELD_GROUP',
);

/**
 * Whether this control is a segment of a `ds-field-group`. Call it in a field
 * component and bind the result to a host `.in-group` class; the component's own
 * `.in-group` block then strips the chrome the group has taken over.
 *
 * A function so the six supported controls share one line instead of six copies
 * of the same optional inject — and so the contract has one place to change.
 * @internal
 */
export function inFieldGroup(): boolean {
  return !!inject(DS_FIELD_GROUP, { optional: true });
}

/**
 * The enclosing group, or `null`. Use it where the boolean is not enough — the
 * group's error state and the id of its message.
 * @internal
 */
export function fieldGroupContext(): DsFieldGroupContext | null {
  return inject(DS_FIELD_GROUP, { optional: true });
}

/**
 * A segment's own error state, ORed with the enclosing group's. The pair is what is invalid, so
 * every segment announces it: a reader who tabs straight to the second one has to hear it too,
 * and the group's border is not something a screen reader can see.
 * @internal
 */
export function groupInvalid(own: Signal<boolean>): Signal<boolean> {
  const group = fieldGroupContext();

  return computed(() => own() || (group?.invalidResolved() ?? false));
}

/**
 * The id of the enclosing group's message, for a segment's `aria-describedby` — one sentence
 * describing every control it covers. `null` outside a group, or when the group has no message.
 * @internal
 */
export function groupMessageId(): Signal<string | null> {
  const group = fieldGroupContext();

  return computed(() => group?.messageId() ?? null);
}

/** Joins ids for `aria-describedby`, dropping the empty ones. @internal */
export function describedByIds(
  ...ids: readonly (string | null | undefined)[]
): string | null {
  const present = ids.filter(Boolean);

  return present.length ? present.join(' ') : null;
}
