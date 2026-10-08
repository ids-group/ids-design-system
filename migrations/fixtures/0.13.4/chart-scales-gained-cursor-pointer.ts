import type { ChartScales } from '@ids-group-ltd/ids-design-system';

type ScalesWithoutCursor = Omit<ChartScales, 'cursorPointer' | 'cursorOrigin'>;

export function asScales(own: ScalesWithoutCursor): ChartScales {
  // @ts-expect-error after TS2739
  return own;
}
