import * as React from 'react';

/** Joins truthy class parts — mirrors the Angular components' `classes()` computeds. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * Renders a DS host element (`ds-button`, `ds-badge`, …). The compiled
 * stylesheet re-scopes each Angular component's styles onto its host tag, so
 * bindings must render the same tag the Angular selector names.
 */
export function host(
  tag: string,
  props: Record<string, unknown> | null,
  ...children: React.ReactNode[]
): React.ReactElement {
  return React.createElement(tag, props, ...children);
}

let uid = 0;
/** Mirrors the Angular `nextControlId()` helper for label/aria wiring. */
export function nextControlId(prefix: string): string {
  uid += 1;
  return `${prefix}-${uid}`;
}
