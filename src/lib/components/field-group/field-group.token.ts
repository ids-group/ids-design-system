import { InjectionToken, computed, inject, type Signal } from '@angular/core';
import type { DsSize } from '@ids-group-ltd/ids-design-system/core';

/** What a grouped control can read off the group that encloses it. */
export interface DsFieldGroupContext {
  /** The group's size, so a segment matches its neighbours. Resolved (unset falls back to `DS_CONFIG.control.size`), so a segment need not resolve again. */
  readonly sizeResolved: () => DsSize;
  /** Whether the GROUP is in error, resolved so an `error` string counts and not only the `invalid` flag. A segment ORs it into its own state,
   *  so tabbing to any segment announces the error. Distinct from the group's raw `invalid` input. */
  readonly invalidResolved: () => boolean;
  /** A segment adds this to its `aria-describedby`, connecting the group's one sentence to every control it describes. */
  readonly messageId: () => string | null;
}

/**
 * Provided by `ds-field-group`, injected `{ optional: true }` by every control that can be a segment.
 *
 * DI rather than a `[grouped]` input on each child: a segment where the input was forgotten would render its own border and radius
 * mid-row. Presence of the token IS the fact the child needs.
 */
export const DS_FIELD_GROUP = new InjectionToken<DsFieldGroupContext>(
  'DS_FIELD_GROUP',
);

/**
 * Whether this control is a segment of a `ds-field-group`. Bind the result to a host `.in-group` class; the component's `.in-group`
 * block then strips the chrome the group has taken over.
 * @internal
 */
export function inFieldGroup(): boolean {
  return !!inject(DS_FIELD_GROUP, { optional: true });
}

/**
 * The enclosing group, or `null`. For where the boolean is not enough: the group's error state and message id.
 * @internal
 */
export function fieldGroupContext(): DsFieldGroupContext | null {
  return inject(DS_FIELD_GROUP, { optional: true });
}

/**
 * A segment's own error state, ORed with the enclosing group's: the pair is what is invalid, so every segment announces it.
 * @internal
 */
export function groupInvalid(own: Signal<boolean>): Signal<boolean> {
  const group = fieldGroupContext();

  return computed(() => own() || (group?.invalidResolved() ?? false));
}

/**
 * The id of the enclosing group's message, for a segment's `aria-describedby`.
 * @internal
 */
export function groupMessageId(): Signal<string | null> {
  const group = fieldGroupContext();

  return computed(() => group?.messageId() ?? null);
}

/** @internal */
export function describedByIds(
  ...ids: readonly (string | null | undefined)[]
): string | null {
  const present = ids.filter(Boolean);

  return present.length ? present.join(' ') : null;
}
