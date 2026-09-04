import { InjectionToken, inject } from '@angular/core';
import type { DsSize } from '@ids-group-ltd/ids-design-system/core';

/** What a grouped control can read off the group that encloses it. */
export interface DsFieldGroupContext {
  /** The group's size, so a segment matches its neighbours without being told.
   *  Resolved, not the raw input: `size` is unset by default and falls back to
   *  `DS_CONFIG.control.size`, which a segment must not have to resolve again. */
  readonly sizeResolved: () => DsSize;
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
 */
export function inFieldGroup(): boolean {
  return !!inject(DS_FIELD_GROUP, { optional: true });
}
