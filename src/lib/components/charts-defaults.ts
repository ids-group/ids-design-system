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

/** The inputs every chart carries for the decisions an app makes once rather than per plot.
 *
 *  @internal */
export interface ChartDefaultInputs {
  readonly frame: Signal<ChartFrame | null>;
  /** Absent on a chart with no annex table of its own - the container, the heat map. */
  readonly dataTable?: Signal<ChartDataTable | null>;
  readonly emptyText: Signal<string | null>;
  readonly errorText: Signal<string | null>;
  readonly valueFormat: Signal<ChartValueFormat | null>;
  /** Absent on a chart with no tooltip of its own. */
  readonly tooltipLingerMs?: Signal<number | null>;
  /** Absent on a chart with nothing to pin. */
  readonly pinOnClick?: Signal<boolean | null>;
  /** Absent on a chart with no tooltip of its own. */
  readonly tooltipSwatches?: Signal<boolean | null>;
}

// No chart takes the delay as an input: it is an app-wide setting, `DS_CONFIG.chart.hoverDelayMs`.
const NO_HOVER_DELAY_INPUT = signal<number | null>(null);

// Read when the value is, not when the chart is built: a chart's own optional inputs are declared
// after the shared base that calls this, so at that moment they do not exist yet.
function optional<T>(
  input: () => Signal<T | null> | undefined,
): Signal<T | null> {
  return computed(() => input()?.() ?? null);
}

/** How long a resting pointer waits before a chart answers it, when nothing sets it.
 *
 *  @internal */
export const CHART_HOVER_DELAY_MS = 0;

/** How long a tooltip outlives the pointer leaving its mark, when nothing sets it. Long enough
 *  that the pointer crossing the gap to the next mark finds the same panel and it glides there,
 *  where a shorter wait closes it and opens a new one.
 *
 *  @internal */
export const CHART_TOOLTIP_LINGER_MS = 500;

/** Each resolved input → `DS_CONFIG.chart` → the built-in; copy resolves input → `DS_INTL.chart`.
 *  Call from an injection context.
 *
 *  @internal */
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
    hoverDelayMs: resolveWithConfig(
      NO_HOVER_DELAY_INPUT,
      (config) => config.chart?.hoverDelayMs,
      CHART_HOVER_DELAY_MS,
    ),
    tooltipSwatches: resolveWithConfig<boolean | 'auto'>(
      optional(() => inputs.tooltipSwatches),
      (config) => config.chart?.tooltipSwatches,
      'auto',
    ),
  };
}
