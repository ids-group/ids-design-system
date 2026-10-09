import type { ChartScales } from '@ids-group-ltd/ids-design-system';

export interface AppScales extends Omit<ChartScales, 'reportTooltip' | 'releaseTooltip'> {}
// @ts-expect-error after TS2420
export abstract class AppScales implements ChartScales {}

// @ts-expect-error before TS2339
export type TooltipSource = Parameters<ChartScales['reportTooltip']>[1];
