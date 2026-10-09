import type { ChartValueFormat } from '@ids-group-ltd/ids-design-system';

export const oneArgument: ChartValueFormat = (value) => String(value);

// @ts-expect-error before TS2322
export const twoArguments: ChartValueFormat = (value: number, location: 'tick' | 'tooltip') =>
  location === 'tick' ? `${Math.round(value / 1000)}k` : String(value);
