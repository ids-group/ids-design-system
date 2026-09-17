import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { registerComponentsFacade } from './register-components-facade.mjs';
import { check, finish } from './probe-check.mjs';

const components = registerComponentsFacade(import.meta.url, [
  'charts-scale.ts',
]);

const { axisDomain, chartPlot, chartViewHeight, valueScale } = await import(
  pathToFileURL(join(components, 'chart', 'chart.math.ts')).href
);

check('the plot leaves a gutter for each axis', chartPlot(640, 240, 46, 20), {
  left: 46,
  top: 20,
  width: 582,
  height: 240,
});
check('the plot width follows the measured width', chartPlot(320, 240, 46, 20), {
  left: 46,
  top: 20,
  width: 262,
  height: 240,
});
check('the plot height does NOT follow the measured width', chartPlot(320, 240, 46, 20).height, 240);
check('a width narrower than its gutters leaves no plot', chartPlot(40, 240, 46, 20).width, 0);
check('an unmeasured width leaves no plot', chartPlot(0, 240, 46, 20).width, 0);
check('a negative plot height is floored at zero', chartPlot(640, -50, 46, 20).height, 0);
check('a wider axis gutter takes it out of the plot', chartPlot(640, 240, 80, 20), {
  left: 80,
  top: 20,
  width: 548,
  height: 240,
});

check('an all-positive view budgets value space above only', chartViewHeight(240, 20), 290);
check('a domain reaching below zero budgets it at both ends', chartViewHeight(240, 20, true), 310);
check('the reservation is exactly one value space', chartViewHeight(240, 20, true) - chartViewHeight(240, 20, false), 20);
check('no value space leaves the category row alone', chartViewHeight(240, 0, true), 270);
check('the view height grows with the plot one for one', chartViewHeight(340, 20) - chartViewHeight(240, 20), 100);
check('the view height grows with value space one for one while positive', chartViewHeight(240, 30) - chartViewHeight(240, 20), 10);
check('the view height grows with value space two for one below zero', chartViewHeight(240, 30, true) - chartViewHeight(240, 20, true), 20);

check('one reported set rounds up to a tick', axisDomain([[10, 20, 30]], 5), {
  min: 0,
  max: 30,
});
check('two reported sets take the union', axisDomain([[10], [45]], 5), {
  min: 0,
  max: 50,
});
check('a reported negative opens the domain below zero', axisDomain([[-20, 40]], 5), {
  min: -20,
  max: 40,
});
check('zero is always in the domain', axisDomain([[8, 12]], 5), {
  min: 0,
  max: 12,
});
check('a non-finite reading is not a bound', axisDomain([[NaN, Infinity, 5]], 5), {
  min: 0,
  max: 5,
});
check('nothing reported is a degenerate domain', axisDomain([], 5), {
  min: 0,
  max: 0,
});
check('a pin widens the domain', axisDomain([[10]], 5, null, 100), {
  min: 0,
  max: 100,
});
check('a pin under the data does not clip it', axisDomain([[80]], 5, null, 10), {
  min: 0,
  max: 80,
});
check('a minimum pin opens the domain below zero', axisDomain([[10]], 5, -50, null), {
  min: -50,
  max: 10,
});
check('a minimum pin above zero does not raise the floor', axisDomain([[10]], 5, 5, null), {
  min: 0,
  max: 10,
});
check('a non-finite pin is ignored', axisDomain([[10]], 5, NaN, Infinity), {
  min: 0,
  max: 10,
});

const positive = valueScale({ min: 0, max: 100 }, 10, 200);
check('the domain floor sits on the baseline', positive(0), 210);
check('the domain ceiling sits at the plot top', positive(100), 10);
check('a mid value interpolates', positive(50), 110);
check('a value above the domain clamps to the top', positive(150), 10);
check('a value below the domain clamps to the baseline', positive(-10), 210);
check('an unplottable value falls to the baseline', positive(NaN), 210);

const signed = valueScale({ min: -50, max: 50 }, 0, 100);
check('zero sits mid-plot on a signed domain', signed(0), 50);
check('the signed ceiling sits at the plot top', signed(50), 0);
check('the signed floor sits on the baseline', signed(-50), 100);

const degenerate = valueScale({ min: 0, max: 0 }, 10, 200);
check('a degenerate domain puts everything on the baseline', degenerate(7), 210);

finish('chart-math');
