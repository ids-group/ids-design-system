import type {
  WaterfallChartBar,
  WaterfallChartStep,
} from './waterfall-chart.types';

/** Where each bar spans, walking the running sum from zero.
 *
 *  Every row adds its own value to the sum, a total included. A delta spans from the sum before it
 *  to the sum after; a total or subtotal stands on zero and reaches the sum. A non-finite reading
 *  adds nothing.
 *
 *  @internal */
export function waterfallSteps(
  data: readonly WaterfallChartBar[],
): readonly WaterfallChartStep[] {
  let running = 0;

  return data.map((datum) => {
    const from = running;
    const value = Number.isFinite(datum.value) ? datum.value : 0;
    running += value;
    const standsOnZero = datum.kind === 'total' || datum.kind === 'subtotal';

    return {
      label: datum.label,
      from: standsOnZero ? 0 : from,
      to: running,
      direction: standsOnZero ? 'total' : value < 0 ? 'decrease' : 'increase',
    };
  });
}
