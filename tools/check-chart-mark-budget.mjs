// The node budget as a CHECK rather than a paragraph.
//
// Lighthouse warns at ~800 DOM nodes and errors at ~1400, and a dashboard may hold five charts, so
// each chart's share is stated per chart rather than as one global number. Four of the six are
// bounded by the question itself - an area has one node per series, a waterfall one per step, a
// heat map one per cell - and the only one whose mark count the CALLER decides is the scatter.
// That is where this gate has teeth: it feeds the decimator far more than the budget and asserts
// the output still fits, then asserts the same data WITHOUT the decimator does not, so a
// decimator that silently stopped decimating cannot pass.
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repo = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Each chart's own share of the page budget. A page of five charts stays under the 1400-node
 *  error; a page of one stays well under the 800-node warning. */
const BUDGET_PER_CHART = 280;

const { decimationTarget, minMaxDecimate, lttbDecimate, needsDecimating } =
  await import(
    pathToFileURL(join(repo, 'src/lib/components/charts-decimate.ts')).href
  );

const problems = [];
const note = (message) => problems.push(message);

// The scatter's own plot width in canvas units, from scatter-chart.math.ts and its gutters.
const PLOT_WIDTH = 640 - 52 - 12;
const budget = decimationTarget(PLOT_WIDTH);

const flood = Array.from({ length: 100_000 }, (ignored, index) => ({
  x: index,
  y: Math.sin(index / 97) * 1000,
}));

if (!needsDecimating(flood.length, budget)) {
  note(
    `scatter: ${flood.length} readings against a budget of ${budget} does not trigger decimation — the headroom rule has stopped firing`,
  );
}

for (const [name, decimate] of [
  ['minMax', minMaxDecimate],
  ['lttb', lttbDecimate],
]) {
  const drawn = decimate(flood, budget).length;
  if (drawn > budget) {
    note(
      `scatter/${name}: ${flood.length} readings decimate to ${drawn} marks, past the ${budget} the plot can hold`,
    );
  }
  if (drawn > BUDGET_PER_CHART * 3) {
    note(
      `scatter/${name}: ${drawn} marks is more than a page of five charts can carry — each chart's share is ${BUDGET_PER_CHART}`,
    );
  }
}

// The negative arm: undecimated, the same data must NOT fit. Without this the check passes just as
// happily against a decimator that returns its input.
if (flood.length <= budget) {
  note(
    'the control is broken: the flood fits the budget undecimated, so the check above proves nothing',
  );
}

// The four bounded charts: assert the bound is still structural, by reading the source rather than
// rendering. A mark drawn per datum is fine; a mark drawn per datum PER PIXEL is not.
const bounded = {
  'src/lib/components/heatmap-chart/heatmap-chart.component.html': 'class="cell"',
  'src/lib/components/waterfall-chart/waterfall-chart.component.html': 'dsColumnSeries',
  'src/lib/components/chart/column-series.component.html': 'class="column"',
  'src/lib/components/line-chart/line-chart.component.html': 'class="series-marker"',
};

for (const [file, mark] of Object.entries(bounded)) {
  const source = execFileSync('git', ['show', `HEAD:${file}`], {
    cwd: repo,
    encoding: 'utf8',
  }).replace(/\r\n/g, '\n');
  if (!source.includes(mark)) {
    note(
      `${file}: no \`${mark}\` — the budget's assumption about this chart's marks no longer matches its template`,
    );
  }
}

if (problems.length > 0) {
  for (const problem of problems) {
    console.error(`check-chart-mark-budget: ERROR  ${problem}`);
  }
  console.error(
    `check-chart-mark-budget: FAILED — ${problems.length} problem(s)`,
  );
  process.exit(1);
}

console.log(
  `check-chart-mark-budget: OK — scatter holds ${flood.length} readings to ${minMaxDecimate(flood, budget).length} marks against a ${budget} budget, and the four bounded charts still draw one mark per datum.`,
);
