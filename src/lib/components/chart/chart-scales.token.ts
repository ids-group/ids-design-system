import { InjectionToken, Signal } from '@angular/core';
import type { ChartAxis } from '@ids-group-ltd/ids-design-system/core';
import type {
  ChartTooltipContext,
  ChartTooltipEntry,
  ChartTooltipOrigin,
} from '@ids-group-ltd/ids-design-system/components/chart-tooltip';

/** A mark's reading at the cursor's category, with the height it is drawn at. */
export interface ChartAxisEntry extends ChartTooltipEntry {
  /** Where the reading is drawn, in plot pixels from the top. A category panel orders rows by it;
   *  readings without one follow the placed ones. */
  readonly y?: number;
}

/** What a mark hands the container to open its panel. The mark decides what the panel says and
 *  where it points; the container decides that there is one, so a plot never opens two. */
export interface ChartTooltipSource {
  readonly context: Signal<ChartTooltipContext | null>;
  readonly origin: Signal<ChartTooltipOrigin | null>;
  /** Whether the mark is held. A held panel takes the pointer so its text can be selected. */
  readonly pinned?: Signal<boolean>;
  /** Whether this mark shows a tooltip at all; absent means it does. Two such marks make the plot
   *  composed, which turns the category cursor on under `cursor="auto"`. */
  readonly offersTooltip?: Signal<boolean>;
  /** Whether the mark's own panel is about the category, as `tooltip="axis"` is. One such mark
   *  turns the category cursor on under `cursor="auto"`. */
  readonly readsCategory?: Signal<boolean>;
  /** This mark's reading at the cursor's category, as an element, pointer over it or not. A category
   *  panel hangs over the highest of these. Absent falls back to `origin`. */
  readonly axisOrigin?: Signal<Element | null>;
  /** What this mark reads at the cursor's category, whatever its own tooltip setting; a per-mark
   *  tooltip still belongs in the category panel. */
  readonly axisEntries?: Signal<readonly ChartAxisEntry[]>;
}

/** The drawable rectangle inside `ds-chart`, in CSS pixels: the container sizes its `viewBox`
 *  so one user unit is one pixel at every card width. The gutters outside it carry the axis labels. */
export interface ChartPlot {
  readonly width: number;
  readonly height: number;
  readonly left: number;
  readonly top: number;
}

/** What `ds-chart` offers the marks projected into it: a shared coordinate space, value domain and
 *  active category.
 *
 *  A mark reports the values it intends to draw and reads its coordinates back; it never sees other
 *  marks and the container never learns what kind of mark it holds. */
export interface ChartScales {
  readonly categories: Signal<readonly string[]>;
  readonly plot: Signal<ChartPlot>;
  /** Whether the plot has its real width yet; until then the scales use a stand-in width, so a mark
   *  that waits for this builds its geometry once. Absent means always measured. */
  readonly measured?: Signal<boolean>;
  /** The centre of a category's band; a mark with its own width subtracts half of `bandWidth`. */
  readonly xPosition: Signal<(index: number) => number>;
  /** Clamped into the plot, so an out-of-domain value lands on an edge, not over the axis labels. */
  readonly yPosition: Signal<(value: number) => number>;
  readonly bandWidth: Signal<number>;
  /** The rectangle a secondary-axis mark draws in: `plot`, or the lower plot when the axes are stacked. */
  readonly secondaryPlot: Signal<ChartPlot>;
  /** `yPosition` for the second value axis; identical to `yPosition` while no mark reports against it. */
  readonly secondaryYPosition: Signal<(value: number) => number>;
  readonly hasSecondaryAxis: Signal<boolean>;
  /** The y of value zero: the baseline a bar grows from. */
  readonly zeroOffset: Signal<number>;
  /** The category under the pointer or the keyboard, or `-1` for none. */
  readonly activeIndex: Signal<number>;
  /** Whether the category cursor answers the pointer. While it does, its band is the only hover
   *  area: marks answer focus and clicks only. Absent means off. */
  readonly cursorOn?: Signal<boolean>;
  /** The category whose axis label the pointer is on, with the event, while the category cursor is off. */
  readonly categoryLabelHover?: Signal<{
    readonly index: number;
    readonly event: PointerEvent;
  } | null>;
  /** How long a resting pointer waits before a mark answers it, shared by every mark. Absent means at once. */
  readonly hoverDelayMs?: Signal<number>;
  /** The band over the active category, for a panel anchored to the category. `null` while `cursor`
   *  is off or nothing is active. */
  readonly cursorOrigin: Signal<Element | null>;
  /** Where the pointer last was, in client pixels, for a panel anchored to the cursor. `null` while
   *  `cursor` is off or the pointer has left. */
  readonly cursorPointer: Signal<{
    readonly x: number;
    readonly y: number;
  } | null>;
  setActiveIndex(index: number): void;
  /** Contributes values to the shared domain under a caller-owned id; reporting the same id again
   *  replaces it. Call from an `effect`: required inputs are unreadable in the constructor, and the
   *  effect re-reports on change. */
  reportDomain(id: string, values: readonly number[], axis?: ChartAxis): void;
  /** Withdraws a contribution; a mark does this in `ngOnDestroy`. */
  releaseDomain(id: string): void;
  /** Offers the container a panel to open while this mark is active; the same id replaces the offer. */
  reportTooltip(id: string, source: ChartTooltipSource): void;
  releaseTooltip(id: string): void;
}

export const CHART_SCALES = new InjectionToken<ChartScales>('CHART_SCALES');
