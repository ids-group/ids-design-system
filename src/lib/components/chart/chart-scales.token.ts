import { InjectionToken, Signal } from '@angular/core';
import type { ChartAxis } from '@ids-group-ltd/ids-design-system/core';
import type {
  ChartTooltipContext,
  ChartTooltipEntry,
  ChartTooltipOrigin,
} from '@ids-group-ltd/ids-design-system/components/chart-tooltip';

/** A mark's reading at the cursor's category, with the height it is drawn at. */
export interface ChartAxisEntry extends ChartTooltipEntry {
  /** Where the reading is drawn, in plot pixels from the top; a category panel orders rows by it. */
  readonly y?: number;
}

/** What a mark hands the container to open its panel: the mark decides the content and anchor, the container ensures a plot never opens two. */
export interface ChartTooltipSource {
  readonly context: Signal<ChartTooltipContext | null>;
  readonly origin: Signal<ChartTooltipOrigin | null>;
  /** Whether the mark is held; a held panel takes the pointer. */
  readonly pinned?: Signal<boolean>;
  /** Whether this mark shows a tooltip; absent means it does. Two such marks turn the category cursor on under `cursor="auto"`. */
  readonly offersTooltip?: Signal<boolean>;
  /** Whether the mark's own panel is about the category, as `tooltip="axis"` is; one such mark turns
   *  the category cursor on under `cursor="auto"`. */
  readonly readsCategory?: Signal<boolean>;
  /** Whether the mark sits in a stack; its own panel hangs over the stack's top, clear of the segments above it. */
  readonly stacked?: Signal<boolean>;
  /** This mark's reading at the cursor's category as an element; a category panel hangs over the highest. Absent falls back to `origin`. */
  readonly axisOrigin?: Signal<Element | null>;
  /** What this mark reads at the cursor's category, whatever its own tooltip setting. */
  readonly axisEntries?: Signal<readonly ChartAxisEntry[]>;
  /** The drawn element of each `axisEntries` reading, same order; the keyboard focuses it. */
  readonly axisPointElements?: Signal<readonly (Element | null)[]>;
}

/** The drawable rectangle inside `ds-chart`, in CSS pixels; one `viewBox` user unit is one pixel. */
export interface ChartPlot {
  readonly width: number;
  readonly height: number;
  readonly left: number;
  readonly top: number;
}

/** What `ds-chart` offers the marks projected into it: a shared coordinate space, value domain and
 *  active category. A mark reports the values it will draw and reads its coordinates back. */
export interface ChartScales {
  readonly categories: Signal<readonly string[]>;
  readonly plot: Signal<ChartPlot>;
  /** Whether the plot has its real width yet; until then the scales use a stand-in. Absent means always measured. */
  readonly measured?: Signal<boolean>;
  /** The centre of a category's band. */
  readonly xPosition: Signal<(index: number) => number>;
  /** Clamped into the plot. */
  readonly yPosition: Signal<(value: number) => number>;
  readonly bandWidth: Signal<number>;
  /** The rectangle a secondary-axis mark draws in. */
  readonly secondaryPlot: Signal<ChartPlot>;
  /** `yPosition` for the second value axis. */
  readonly secondaryYPosition: Signal<(value: number) => number>;
  readonly hasSecondaryAxis: Signal<boolean>;
  /** The y of value zero. */
  readonly zeroOffset: Signal<number>;
  /** The category under the pointer or the keyboard, or `-1` for none. */
  readonly activeIndex: Signal<number>;
  /** Whether the category cursor answers the pointer; while it does, marks answer focus and clicks only. Absent means off. */
  readonly cursorOn?: Signal<boolean>;
  /** The category whose axis label the pointer is on, while the category cursor is off. */
  readonly categoryLabelHover?: Signal<{
    readonly index: number;
    readonly event: PointerEvent;
  } | null>;
  /** How long a resting pointer waits before a mark answers it. Absent means at once. */
  readonly hoverDelayMs?: Signal<number>;
  /** The band over the active category. `null` while `cursor` is off or nothing is active. */
  readonly cursorOrigin: Signal<Element | null>;
  /** Where the pointer last was, in client pixels. `null` while `cursor` is off or the pointer has left. */
  readonly cursorPointer: Signal<{
    readonly x: number;
    readonly y: number;
  } | null>;
  setActiveIndex(index: number): void;
  /** Contributes values to the shared domain under a caller-owned id; the same id replaces its earlier report.
   *  Call from an `effect`: required inputs are unreadable in the constructor. */
  reportDomain(id: string, values: readonly number[], axis?: ChartAxis): void;
  /** Withdraws a contribution. */
  releaseDomain(id: string): void;
  /** Offers a panel to open while this mark is active; the same id replaces the offer. */
  reportTooltip(id: string, source: ChartTooltipSource): void;
  releaseTooltip(id: string): void;
}

export const CHART_SCALES = new InjectionToken<ChartScales>('CHART_SCALES');
