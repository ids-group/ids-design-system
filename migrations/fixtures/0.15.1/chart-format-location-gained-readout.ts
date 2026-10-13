import type { ChartFormatLocation, ChartValueFormat } from '@ids-group-ltd/ids-design-system';

// @ts-expect-error after TS2741
export const suffixes: Record<ChartFormatLocation, string> = { tick: '', tooltip: ' GBP' };

export function suffixFor(location: ChartFormatLocation): string {
  switch (location) {
    case 'tick':
      return '';
    case 'tooltip':
      return ' GBP';
    default: {
      // @ts-expect-error after TS2322
      const unreachable: never = location;
      return unreachable;
    }
  }
}

export const money: ChartValueFormat = (value, location) => `${value}${suffixFor(location)}`;
