import { signal } from '@angular/core';
import type { ChartScales } from '@ids-group-ltd/ids-design-system';

type Source = Parameters<ChartScales['reportTooltip']>[1];

export function report(scales: ChartScales, base: Source): void {
  // @ts-expect-error after TS2353
  scales.reportTooltip('mark', { ...base, preferBelow: signal(true) });
  const throughVariable = { ...base, preferBelow: signal(true) };
  scales.reportTooltip('mark', throughVariable);
}
