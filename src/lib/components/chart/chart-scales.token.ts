import { InjectionToken, Signal } from '@angular/core';
import type { ChartAxis } from '@ids-group-ltd/ids-design-system/core';

/** The drawable rectangle inside `ds-chart`, in CSS pixels: the container measures itself and
 *  sizes its `viewBox` so one user unit is one pixel. A length written into a mark is therefore
 *  the length it says it is, at every card width. The gutters outside it carry the axis labels. */
export interface ChartPlot {
  readonly width: number;
  readonly height: number;
  readonly left: number;
  readonly top: number;
}

/** What `ds-chart` offers the marks projected into it: one shared coordinate space, one shared
 *  value domain, and one shared idea of which category the reader is on.
 *
 *  A mark injects the token, reports the values it intends to draw, and reads its coordinates
 *  back. It never sees the other marks, and the container never learns what kind of mark it is
 *  holding - which is what lets a reference line, a bar series and an annotation share an axis
 *  without any of them importing the others. */
export interface ChartScales {
  readonly categories: Signal<readonly string[]>;
  readonly plot: Signal<ChartPlot>;
  /** The CENTRE of a category's band. A mark with a width of its own subtracts half of
   *  `bandWidth` to reach its leading edge. */
  readonly xPosition: Signal<(index: number) => number>;
  /** Clamped into the plot, so a value outside the drawn domain lands on an edge rather than
   *  over the axis labels. */
  readonly yPosition: Signal<(value: number) => number>;
  readonly bandWidth: Signal<number>;
  /** The rectangle a secondary-axis mark draws in. The same one as `plot` unless the two axes are
   *  stacked, where it is the lower of the two plots. */
  readonly secondaryPlot: Signal<ChartPlot>;
  /** `yPosition` for the second value axis. Identical to it while no mark has reported against
   *  that axis, so a mark may read it without first asking whether one exists. */
  readonly secondaryYPosition: Signal<(value: number) => number>;
  readonly hasSecondaryAxis: Signal<boolean>;
  /** The y of value zero, which is the baseline a bar grows from and the line a signed domain
   *  is read against. */
  readonly zeroOffset: Signal<number>;
  /** The category under the pointer or the keyboard, or `-1` for none. */
  readonly activeIndex: Signal<number>;
  /** The band drawn over the active category, for a mark that anchors a panel to the CATEGORY
   *  rather than to one of its own marks. `null` while `cursor` is off or nothing is active. */
  readonly cursorOrigin: Signal<Element | null>;
  /** Where the pointer last was, in client pixels, for a mark that anchors a panel to the cursor
   *  rather than to a reading. `null` while `cursor` is off or the pointer has left. */
  readonly cursorPointer: Signal<{
    readonly x: number;
    readonly y: number;
  } | null>;
  setActiveIndex(index: number): void;
  /** Contributes values to the shared domain under an id the caller owns. Reporting again with
   *  the same id replaces that contribution.
   *
   *  Call it from an `effect`: a mark whose values come from a required `input` cannot read them
   *  in its constructor, and the effect is also what re-reports when they change. */
  reportDomain(id: string, values: readonly number[], axis?: ChartAxis): void;
  /** Withdraws a contribution, which a mark does in `ngOnDestroy`. */
  releaseDomain(id: string): void;
}

export const CHART_SCALES = new InjectionToken<ChartScales>('CHART_SCALES');
