import type { ChartFormatLocation } from '@ids-group-ltd/ids-design-system';

const suffixes: Record<ChartFormatLocation, string> = { tick: '', tooltip: ' GBP' };

export function suffixFor(location: ChartFormatLocation): string {
  switch (location) {
    case 'tick':
      return '';
    case 'tooltip':
      return suffixes[location];
    default: {
      const unreachable: never = location;
      return unreachable;
    }
  }
}
