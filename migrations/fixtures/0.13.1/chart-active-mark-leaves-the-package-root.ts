import type { Signal } from '@angular/core';
// @ts-expect-error after TS2305
import type { ChartActiveMark } from '@ids-group-ltd/ids-design-system';
import type { ChartActiveMark as EntryPointMark } from '@ids-group-ltd/ids-design-system/components/chart-tooltip';

export class AppMark implements EntryPointMark {
  constructor(
    readonly index: Signal<number>,
    readonly origin: Signal<Element | null>,
  ) {}
  enter(index: number, event: Event): void {}
  leave(): void {}
}

export type Root = ChartActiveMark;
