import { InjectionToken, type Signal } from '@angular/core';

/** Contract that ds-timeline-item reads from its parent ds-timeline. */
export interface TimelineContract {
  /** The item that draws no connector above it. */
  readonly firstItem: Signal<object | undefined>;
  /** The item that draws no connector below it. */
  readonly lastItem: Signal<object | undefined>;
  /** How tightly the items are set. */
  readonly density: Signal<TimelineDensity>;
}

export type TimelineDensity = 'default' | 'compact';

export const TIMELINE = new InjectionToken<TimelineContract>('TIMELINE');
