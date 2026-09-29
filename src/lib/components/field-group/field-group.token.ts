import { InjectionToken, computed, inject, type Signal } from '@angular/core';
import type { DsSize } from '@ids-group-ltd/ids-design-system/core';

/** What a grouped control can read off the group that encloses it. */
export interface DsFieldGroupContext {
  /** The group's size, already resolved against `DS_CONFIG.control.size`. */
  readonly sizeResolved: () => DsSize;
  /** Whether the group is in error, counting an `error` string as well as the `invalid` flag. */
  readonly invalidResolved: () => boolean;
  /** Id a segment adds to its `aria-describedby`. */
  readonly messageId: () => string | null;
}

/**
 * Provided by `ds-field-group`, injected `{ optional: true }` by every control that can be a segment.
 *
 * DI rather than an input on each child: a segment with a forgotten input would render its own border mid-row.
 */
export const DS_FIELD_GROUP = new InjectionToken<DsFieldGroupContext>(
  'DS_FIELD_GROUP',
);

/**
 * Whether this control is a segment of a `ds-field-group`; bind it to a host `.in-group` class.
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
 * A segment's own error state, ORed with the enclosing group's.
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
