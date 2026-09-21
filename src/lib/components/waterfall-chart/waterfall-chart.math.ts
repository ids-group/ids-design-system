import type {
  WaterfallChartBar,
  WaterfallChartStep,
} from './waterfall-chart.types';

/** Where each bar spans, walking the running sum from zero.
 *
 *  Every row adds its own value to the sum, including a total - a closing total carries `0` and so
 *  prints the sum reached. A delta then spans from the sum before it to the sum after; a total or a
 *  subtotal stands on zero and reaches the sum, which is what makes it a figure rather than a
 *  change. A non-finite reading adds nothing rather than poisoning every bar after it.
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

/** The span the value axis has to hold: every level a bar touches, plus zero, because a chain that
 *  never crosses the baseline still has to show where the baseline is.
 *
 *  @internal */
export function waterfallDomain(steps: readonly WaterfallChartStep[]): {
  min: number;
  max: number;
} {
  const levels = [0, ...steps.flatMap((step) => [step.from, step.to])].filter(
    (level) => Number.isFinite(level),
  );

  return { min: Math.min(...levels), max: Math.max(...levels) };
}
