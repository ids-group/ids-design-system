import type { BarChartRow } from '@ids-group-ltd/ids-design-system';

export const written: BarChartRow = { label: 'Q1', value: 4 };

export function total(rows: readonly BarChartRow[]): number {
  let sum = 0;
  for (const row of rows) {
    // @ts-expect-error after TS2365
    sum += row.value;
  }
  return sum;
}
