const CHARTS =
  'ds-bar-chart,ds-column-chart,ds-donut-chart,ds-funnel-chart,ds-line-chart';

// What `animate.enter` puts the class on, chart by chart — the element that ANIMATES, which for a
// bar row and a column is the fill inside it rather than the row. A class list rather than a
// library API: this is a docs affordance, and a chart that renamed a mark leaves the button inert
// rather than breaking anything.
const MARKS = '.fill,.bar,.ring-svg,.stage,.series-line,.series-area';

const ENTER = 'mark-enter';

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
 * animation. Re-running the class the charts already animate from shows exactly what a consumer
 * sees when the data lands, with nothing else moving.
 */
export function replayMarks(host: Element): void {
  const marks = chartsNear(host).flatMap((chart) => [
    ...chart.querySelectorAll(MARKS),
  ]);
  for (const mark of marks) {
    mark.classList.remove(ENTER);
  }
  // Read a layout property between the two writes, or the browser coalesces them and the animation
  // never restarts.
  void document.body.offsetWidth;
  for (const mark of marks) {
    mark.addEventListener('animationend', () => mark.classList.remove(ENTER), {
      once: true,
    });
    mark.classList.add(ENTER);
  }
}
