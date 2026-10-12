import type { ChartGaps } from '@ids-group-ltd/ids-design-system/core';

export type { LinePoint } from '@ids-group-ltd/ids-design-system/components';

export const LINE_CHART_DEFAULT_TICK_COUNT = 5;

/** One reading per category. A longer series loses its tail and a shorter one ends early rather than
 *  throwing. Anything that is not a finite number is a missing reading, so `NaN` and `Infinity`
 *  follow the `gaps` policy rather than reaching a coordinate. */
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
