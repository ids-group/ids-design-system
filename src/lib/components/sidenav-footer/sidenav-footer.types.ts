import type { IconName } from '@ids-group-ltd/ids-design-system/core';

/**
 * A notification rendered in the sidenav Alerts popover. The footer is
 * domain-agnostic: the layout derives its own alerts and feeds them in, and the
 * footer only knows how to render this shape.
 */
export interface SidenavAlertItem {
  readonly id: string;
  readonly icon: IconName;
  /** Tone of the leading icon chip (reuses the DS status palette). */
  readonly variant: 'success' | 'warning' | 'error' | 'info';
  readonly title: string;
  readonly body: string;
  /** Relative/display timestamp, e.g. "Jul 23". */
  readonly at: string;
  /** Optional router path to navigate to when the alert is clicked. */
  readonly route?: string;
}

/**
 * A single global-search hit rendered in the sidenav Search popover. The footer
 * stays domain-agnostic: the layout supplies a {@link SidenavSearchProvider} that maps
 * a query string to these results, so the footer never needs to know about the
 * app's sections or entities.
 */
export interface SidenavSearchResult {
  readonly id: string;
  /** Primary line (entity/section name). */
  readonly label: string;
  /** Optional secondary line (reference, email, type…). */
  readonly sublabel?: string;
  readonly icon?: IconName;
  /** Group heading the hit is filed under, e.g. "Sections". */
  readonly group: string;
  /** Router path to navigate to on select. */
  readonly route: string;
  /** Optional query params — used to deep-open in-page detail views. */
  readonly queryParams?: Record<string, string>;
}

/** A query -> results function supplied by the layout to the shared footer. */
export type SidenavSearchProvider = (
  query: string,
) => readonly SidenavSearchResult[];
