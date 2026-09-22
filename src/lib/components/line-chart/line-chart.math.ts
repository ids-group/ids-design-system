import type { ChartGaps } from '@ids-group-ltd/ids-design-system/core';

export type { LinePoint } from '@ids-group-ltd/ids-design-system/components';

export const LINE_CHART_DEFAULT_TICK_COUNT = 5;

/** One reading per category, however long the series actually was. A series longer
 *  than `categories` loses its tail and a shorter one ends early: a line that stops
 *  short is a defect the reader can see, while a thrown error takes down the page
 *  around it. Anything that is not a finite number is a missing reading, so `NaN`
 *  and `Infinity` follow the `gaps` policy rather than reaching a coordinate. */
export function alignSeriesValues(
  data: readonly (number | null)[],
  categoryCount: number,
  gaps: ChartGaps,
): (number | null)[] {
  const length =
    Number.isFinite(categoryCount) && categoryCount > 0
      ? Math.floor(categoryCount)
      : 0;
  const aligned: (number | null)[] = [];
  for (let index = 0; index < length; index++) {
    const raw = data[index];
    const reading =
      typeof raw === 'number' && Number.isFinite(raw) ? raw : null;
    aligned.push(reading === null && gaps === 'zero' ? 0 : reading);
  }

  return aligned;
}

/** Largest finite reading across the given series, or zero. Never negative: this
 *  feeds the ceiling handed to `ds-chart`, which raises its domain and never lowers
 *  it, so a negative here would pin an axis below its own data. */
export function domainMaxOf(
  valueGroups: readonly (readonly (number | null)[])[],
): number {
  let max = 0;
  for (const values of valueGroups) {
    for (const value of values) {
      if (value !== null && Number.isFinite(value) && value > max) {
        max = value;
      }
    }
  }

  return max;
}

/** Which palette slot a series draws from. Pinning `slot` keeps every other series
 *  on its own colour when one is hidden; left out, a series takes the colour of its
 *  position. */
export function paletteIndexFor(
  slot: number | undefined,
  index: number,
  paletteSize: number,
): number {
  if (!Number.isFinite(paletteSize) || paletteSize < 1) {
    return 0;
  }
  const chosen =
    slot !== undefined && Number.isFinite(slot) && slot >= 1
      ? Math.floor(slot) - 1
      : index;

  return ((chosen % paletteSize) + paletteSize) % paletteSize;
}
