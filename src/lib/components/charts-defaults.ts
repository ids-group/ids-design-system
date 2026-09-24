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

/** The five inputs every chart carries for the decisions an app makes once rather than per plot.
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
}

const NO_DATA_TABLE = signal<ChartDataTable | null>(null);
const NO_LINGER = signal<number | null>(null);

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
      inputs.dataTable ?? NO_DATA_TABLE,
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
      inputs.tooltipLingerMs ?? NO_LINGER,
      (config) => config.chart?.tooltipLingerMs,
      0,
    ),
  };
}
