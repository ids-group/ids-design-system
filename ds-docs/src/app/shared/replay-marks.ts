const CHARTS =
  'ds-bar-chart,ds-column-chart,ds-pie-chart,ds-funnel-chart,ds-line-chart,ds-heatmap-chart,ds-scatter-chart,ds-waterfall-chart,ds-chart';

// Every element a chart gives an entrance to, found by the animation it declares rather than by a
// list of mark classes: a chart that gains a mark, or names one differently, is replayed too.
function animatedMarks(chart: Element): (HTMLElement | SVGElement)[] {
  return [...chart.querySelectorAll<HTMLElement | SVGElement>('*')].filter(
    (element) => getComputedStyle(element).animationName.includes('ds-chart'),
  );
}

/** The charts this control speaks for: the ones in its own specimen cell, or — on a card that is
 *  one chart and one control — whatever stands above it. */
function chartsNear(host: Element): Element[] {
  const cell = host.closest('.state-cell');
  if (cell) {
    return [...cell.querySelectorAll(CHARTS)];
  }
  for (
    let sibling = host.previousElementSibling;
    sibling;
    sibling = sibling.previousElementSibling
  ) {
    if (sibling.matches(CHARTS)) {
      return [sibling];
    }
    const nested = [...sibling.querySelectorAll(CHARTS)];
    if (nested.length) {
      return nested;
    }
  }

  return [];
}

/**
 * Run the entrance again on the marks already on screen.
 *
 * NOT by emptying the data and putting it back: that renders the empty state for a frame, so the
 * chart flashes "No data" on its way to replaying — the reader watches a defect rather than the
 * animation. Restarting the animation the marks already declare shows exactly what a consumer sees
 * when the data lands, with nothing else moving.
 */
export function replayMarks(host: Element): void {
  const marks = chartsNear(host).flatMap(animatedMarks);
  for (const mark of marks) {
    mark.style.animationName = 'none';
  }
  // Read a layout property between the two writes, or the browser coalesces them and the animation
  // never restarts.
  void document.body.offsetWidth;
  for (const mark of marks) {
    mark.style.animationName = '';
  }
}
