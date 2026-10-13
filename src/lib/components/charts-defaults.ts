import { computed, inject, signal, type Signal } from '@angular/core';
import {
  DS_INTL,
  injectDsLocale,
  resolveWithConfig,
} from '@ids-group-ltd/ids-design-system/core';
import type {
  ChartDataTable,
  ChartFrame,
  ChartValueFormat,
} from '@ids-group-ltd/ids-design-system/core';
import { chartValueFormat } from './charts-format';

/** The inputs every chart carries for app-wide decisions. @internal */
export interface ChartDefaultInputs {
  readonly frame: Signal<ChartFrame | null>;
  readonly dataTable?: Signal<ChartDataTable | null>;
  readonly emptyText: Signal<string | null>;
  readonly errorText: Signal<string | null>;
  readonly valueFormat: Signal<ChartValueFormat | null>;
  readonly tooltipLingerMs?: Signal<number | null>;
  readonly pinOnClick?: Signal<boolean | null>;
  readonly tooltipSwatches?: Signal<boolean | null>;
}

const NO_HOVER_DELAY_INPUT = signal<number | null>(null);

// Lazy: a chart's own optional inputs are declared after the base that calls this, so they do not exist yet.
function optional<T>(
  input: () => Signal<T | null> | undefined,
): Signal<T | null> {
  return computed(() => input()?.() ?? null);
}

const CHART_HOVER_DELAY_MS = 0;

/** How long a pointer rests on a mark before the chart answers, in milliseconds:
 *  `DS_CONFIG.chart.hoverDelayMs`, else `0`. Call from an injection context. @internal */
export function chartHoverDelayMs(): Signal<number> {
  return resolveWithConfig(
    NO_HOVER_DELAY_INPUT,
    (config) => config.chart?.hoverDelayMs,
    CHART_HOVER_DELAY_MS,
  );
}

/** Default tooltip linger, in milliseconds; long enough to cross to the next mark. @internal */
export const CHART_TOOLTIP_LINGER_MS = 500;

/** Resolves each input, then `DS_CONFIG.chart`, then the built-in; copy resolves input, then `DS_INTL.chart`.
 *  Call from an injection context. @internal */
export function resolveChartDefaults(inputs: ChartDefaultInputs) {
  const locale = injectDsLocale();
  const intl = inject(DS_INTL);

  return {
    locale,
    frame: resolveWithConfig(
      inputs.frame,
      (config) => config.chart?.frame,
      'auto' as ChartFrame,
    ),
    dataTable: resolveWithConfig(
      optional(() => inputs.dataTable),
      (config) => config.chart?.dataTable,
      'none' as ChartDataTable,
    ),
    emptyText: computed(() => inputs.emptyText() ?? intl().chart.empty),
    errorText: computed(() => inputs.errorText() ?? intl().chart.error),
    valueFormat: resolveWithConfig(
      inputs.valueFormat,
      (config) => config.chart?.valueFormat,
      chartValueFormat(locale),
    ),
    tooltipLingerMs: resolveWithConfig(
      optional(() => inputs.tooltipLingerMs),
      (config) => config.chart?.tooltipLingerMs,
      CHART_TOOLTIP_LINGER_MS,
    ),
    pinOnClick: resolveWithConfig(
      optional(() => inputs.pinOnClick),
      (config) => config.chart?.pinOnClick,
      true,
    ),
    hoverDelayMs: chartHoverDelayMs(),
    tooltipSwatches: resolveWithConfig<boolean | 'auto'>(
      optional(() => inputs.tooltipSwatches),
      (config) => config.chart?.tooltipSwatches,
      'auto',
    ),
  };
}
