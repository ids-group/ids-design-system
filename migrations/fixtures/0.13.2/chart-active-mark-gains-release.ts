import { signal } from '@angular/core';
import type { ChartActiveMark } from '@ids-group-ltd/ids-design-system/components/chart-tooltip';

// @ts-expect-error after TS2420
export class AppMark implements ChartActiveMark {
  readonly index = signal(-1);
  readonly origin = signal<Element | null>(null);
  enter(index: number, event: Event): void {}
  leave(): void {}
}

// @ts-expect-error after TS2739
export const literal: ChartActiveMark = {
  index: signal(-1),
  origin: signal<Element | null>(null),
  enter: () => {},
  leave: () => {},
};
