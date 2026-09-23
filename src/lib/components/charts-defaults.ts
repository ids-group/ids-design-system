import { signal, type Signal } from '@angular/core';
import { resolveWithConfig } from '@ids-group-ltd/ids-design-system/core';
import type {
  ChartDataTable,
  ChartFrame,
  ChartValueFormat,
} from '@ids-group-ltd/ids-design-system/core';
import { defaultChartFormat } from './charts-format';

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

/** Each resolved input → `DS_CONFIG.chart` → the built-in. Call from an injection context.
 *
 *  @internal */
export function resolveChartDefaults(inputs: ChartDefaultInputs) {
  return {
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
    emptyText: resolveWithConfig(
      inputs.emptyText,
      (config) => config.chart?.emptyText,
      'No data',
    ),
    errorText: resolveWithConfig(
      inputs.errorText,
      (config) => config.chart?.errorText,
      'Could not load the data',
    ),
    valueFormat: resolveWithConfig(
      inputs.valueFormat,
      (config) => config.chart?.valueFormat,
      defaultChartFormat,
    ),
    tooltipLingerMs: resolveWithConfig(
      inputs.tooltipLingerMs ?? NO_LINGER,
      (config) => config.chart?.tooltipLingerMs,
      0,
    ),
  };
}
