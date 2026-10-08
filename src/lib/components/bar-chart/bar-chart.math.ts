import type { BarChartRow, BarChartValue } from './bar-chart.types';

/** Where a row's bar starts and ends on the value axis. The track has no side below zero, so a
 *  negative number draws an empty track; a pair is normalised (a negative width draws nothing); a
 *  non-finite end collapses the extent to zero.
 *
 *  @internal */
export function barExtent(value: BarChartValue): { low: number; high: number } {
  if (typeof value === 'number') {
    return Number.isFinite(value)
      ? { low: 0, high: Math.max(0, value) }
      : { low: 0, high: 0 };
  }
  const [first, second] = value;

  return Number.isFinite(first) && Number.isFinite(second)
    ? { low: Math.min(first, second), high: Math.max(first, second) }
    : { low: 0, high: 0 };
}

/** A plain row's value as given, so a negative one is still reported; null for a pair or a non-finite value.
 *
 *  @internal */
export function plainValue(value: BarChartValue): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/** True when a row has no reading to draw: a non-finite number, or a pair with a non-finite end.
 *
 *  @internal */
export function isMissing(value: BarChartValue): boolean {
  return typeof value === 'number'
    ? !Number.isFinite(value)
    : !value.every((end) => Number.isFinite(end));
}

/** Largest finite value, or `explicitMax` when usable. One `Infinity` row must not become the track length. */
export function resolveMax(
  explicitMax: number | null,
  values: readonly number[],
): number {
  if (explicitMax !== null && Number.isFinite(explicitMax) && explicitMax > 0) {
    return explicitMax;
  }
  const finite = values.filter((value) => Number.isFinite(value));

  return finite.length ? Math.max(...finite) : 0;
}

/** Track share in percent. No upper bound: an explicit `max` below the data overflows and `.fill` caps it. */
export function widthPercent(value: number, max: number): number {
  // Math.max(NaN, 0) is NaN, and `width: NaN%` is dropped silently.
  if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) {
    return 0;
  }

  return Math.max((value / max) * 100, 0);
}

/** Each segment's share in percent, against the segments' OWN sum, never the row's `value`.
 *  Returns none without a positive finite total. */
export function segmentWidths(values: readonly number[]): number[] {
  const total = values
    .filter((value) => Number.isFinite(value) && value > 0)
    .reduce((sum, value) => sum + value, 0);
  if (total <= 0) {
    return [];
  }

  return values.map((value) =>
    Number.isFinite(value) && value > 0 ? (value / total) * 100 : 0,
  );
}

/** A row placed in the drawn list: a top-level row, or one level of `children` under its parent.
 *
 *  @internal */
export interface PlacedBarRow {
  readonly row: BarChartRow;
  readonly key: string;
  /** Null for a top-level row. */
  readonly parentKey: string | null;
  /** The span a child is measured against (its parent's); null for a top-level row, which uses `max`. */
  readonly scale: number | null;
  /** True on the first detached row after an attached one: a divider goes before it. */
  readonly startsDetached: boolean;
}

/** Every row with its children placed after it, whether or not they are shown.
 *
 *  @internal */
export function placeRows(data: readonly BarChartRow[]): PlacedBarRow[] {
  return data.flatMap((row, index) => {
    const key = row.id ?? String(index);
    const extent = barExtent(row.value);
    const parent: PlacedBarRow = {
      row,
      key,
      parentKey: null,
      scale: null,
      startsDetached: !!row.detached && index > 0 && !data[index - 1].detached,
    };

    return [
      parent,
      ...(row.children ?? []).map((child, childIndex) => ({
        row: child,
        // Scoped to the parent: positional keys would otherwise collide with the top-level rows.
        key: `${key}/${child.id ?? childIndex}`,
        parentKey: key,
        scale: extent.high - extent.low,
        startsDetached: false,
      })),
    ];
  });
}

/** The placed rows a reader sees: every top-level row, and the children of the expanded ones.
 *
 *  @internal */
export function shownRows<Row extends Pick<PlacedBarRow, 'parentKey'>>(
  placed: readonly Row[],
  expanded: ReadonlySet<string>,
): Row[] {
  return placed.filter(
    (entry) => entry.parentKey === null || expanded.has(entry.parentKey),
  );
}

/** The spans `partOfWhole` divides, a detached row's left out as NaN so it takes no share and adds nothing to the total.
 *
 *  @internal */
export function partSpans(data: readonly BarChartRow[]): number[] {
  return data.map((row) => {
    const extent = barExtent(row.value);

    return row.detached ? Number.NaN : extent.high - extent.low;
  });
}
