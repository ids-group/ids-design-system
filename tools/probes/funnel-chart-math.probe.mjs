import {
  FUNNEL_TAIL_WIDTH,
  depthForAreaShare,
  funnelGeometry,
  rampPosition,
  sanitizeValues,
  stageDrop,
  stageDrops,
  stageGapUnits,
  stagePolygonPoints,
} from '../../src/lib/components/funnel-chart/funnel-chart.math.ts';
import { check, finish } from './probe-check.mjs';

const round = (value, places = 6) =>
  Number.isFinite(value)
    ? Math.round(value * 10 ** places) / 10 ** places
    : value;
const shapeOf = (stages) =>
  stages.map((stage) => ({
    top: round(stage.top),
    bottom: round(stage.bottom),
    topWidth: round(stage.topWidth),
    bottomWidth: round(stage.bottomWidth),
  }));
const everyNumber = (stages) =>
  stages.flatMap((stage) => [
    stage.top,
    stage.bottom,
    stage.topWidth,
    stage.bottomWidth,
  ]);
const stageArea = (stage) =>
  ((stage.topWidth + stage.bottomWidth) / 2) * (stage.bottom - stage.top);
const areaPerValue = (stages, values) =>
  stages.map((stage, index) => round(stageArea(stage) / values[index], 9));
const bandDepths = (stages) =>
  stages.map((stage) => round(stage.bottom - stage.top, 4));
const allSame = (list) => list.every((entry) => entry === list[0]);
const SHAPES = ['taper', 'width', 'area'];

const FUNNEL = [1000, 600, 300, 100];

// ---- taper: the fixed silhouette, where width encodes NOTHING ----------------
// The whole point of the default shape. Two datasets that share only their
// length must produce byte-identical geometry.
check(
  'taper geometry ignores the values entirely',
  shapeOf(funnelGeometry(FUNNEL, 'taper')),
  shapeOf(funnelGeometry([7, 7, 7, 7], 'taper')),
);
check(
  'taper opens at the full width',
  round(funnelGeometry(FUNNEL, 'taper')[0].topWidth),
  1,
);
check(
  'taper closes at the tail width',
  round(funnelGeometry(FUNNEL, 'taper')[3].bottomWidth),
  round(FUNNEL_TAIL_WIDTH),
);
check(
  'a non-finite tail width falls back to the design constant',
  round(funnelGeometry(FUNNEL, 'taper', NaN)[3].bottomWidth),
  round(FUNNEL_TAIL_WIDTH),
);
check(
  'taper spaces its stages evenly',
  bandDepths(funnelGeometry(FUNNEL, 'taper')),
  [0.25, 0.25, 0.25, 0.25],
);
check(
  'taper narrows monotonically',
  shapeOf(funnelGeometry(FUNNEL, 'taper')).map((stage) => stage.bottomWidth),
  [0.845, 0.69, 0.535, 0.38],
);

// ---- width: the boundary widths are read straight off the values -------------
check(
  'width makes each stage top proportional to its value',
  shapeOf(funnelGeometry(FUNNEL, 'width')).map((stage) => stage.topWidth),
  [1, 0.6, 0.3, 0.1],
);
check(
  'width closes the last stage flat, having nothing to taper towards',
  shapeOf(funnelGeometry(FUNNEL, 'width'))[3],
  { top: 0.75, bottom: 1, topWidth: 0.1, bottomWidth: 0.1 },
);
check(
  'width keeps the stage depths even',
  bandDepths(funnelGeometry(FUNNEL, 'width')),
  [0.25, 0.25, 0.25, 0.25],
);
// The defect 'area' exists to fix: a 1% tail is 1% of the width, far too narrow
// to carry a label.
check(
  'width collapses the tail of a steep funnel',
  round(funnelGeometry([1000, 10], 'width')[1].bottomWidth),
  0.01,
);
// The negative arm of the area claim below: if this ever goes constant, the two
// shapes have stopped differing and the area assertion proves nothing.
check(
  'width does NOT hold area proportional to value',
  allSame(areaPerValue(funnelGeometry(FUNNEL, 'width'), FUNNEL)),
  false,
);

// ---- area: the real solve ---------------------------------------------------
// Asserted as the PROPERTY, not as arithmetic copied out of the implementation:
// every stage's trapezoid area divided by its value must come out the same.
check(
  'area holds each stage area proportional to its value',
  allSame(areaPerValue(funnelGeometry(FUNNEL, 'area'), FUNNEL)),
  true,
);
check(
  'area keeps the taper silhouette at the mouth',
  round(funnelGeometry(FUNNEL, 'area')[0].topWidth),
  1,
);
check(
  'area keeps the taper silhouette at the tail',
  round(funnelGeometry(FUNNEL, 'area')[3].bottomWidth),
  round(FUNNEL_TAIL_WIDTH),
);
// The property 'area' is for: the tail is a fixed silhouette constant, so it
// stays labellable however steep the drop. Contrast the 'width' case above.
check(
  'area keeps the tail wide enough to label on a steep funnel',
  round(funnelGeometry([1000, 10], 'area')[1].bottomWidth),
  round(FUNNEL_TAIL_WIDTH),
);
// Equal AREAS are not equal DEPTHS on a narrowing silhouette: the wide mouth
// holds its share in less depth than the narrow tail. A linear split would make
// these four equal, which is exactly the bug the quadratic solve avoids.
check(
  'area deepens each band as the silhouette narrows',
  bandDepths(funnelGeometry([10, 10, 10, 10], 'area')),
  [0.1829, 0.21, 0.2546, 0.3526],
);
check(
  'area does not fall back to even spacing',
  bandDepths(funnelGeometry(FUNNEL, 'area')).join() ===
    bandDepths(funnelGeometry(FUNNEL, 'taper')).join(),
  false,
);
// A falling series spends less depth on every stage than on the one above it.
check(
  'area shortens each band as the values fall',
  bandDepths(funnelGeometry(FUNNEL, 'area')),
  [0.3928, 0.3141, 0.2082, 0.0849],
);

// ---- depthForAreaShare: the quadratic on its own ----------------------------
check('no area consumed is no depth', depthForAreaShare(0, 0.38), 0);
check(
  'all the area consumed is the full depth',
  round(depthForAreaShare(1, 0.38)),
  1,
);
check(
  'a silhouette that does not narrow splits area linearly',
  round(depthForAreaShare(0.3, 1)),
  0.3,
);
check(
  'a share above one is clamped to the full depth',
  round(depthForAreaShare(2, 0.38)),
  1,
);
check(
  'a negative share is clamped to no depth',
  depthForAreaShare(-1, 0.38),
  0,
);
check('a NaN share is clamped to no depth', depthForAreaShare(NaN, 0.38), 0);

// ---- one stage --------------------------------------------------------------
for (const shape of SHAPES) {
  check(
    `one stage spans the whole funnel in '${shape}'`,
    shapeOf(funnelGeometry([500], shape)).map((stage) => [
      stage.top,
      stage.bottom,
    ]),
    [[0, 1]],
  );
}
check(
  'one stage opens full width and closes at the tail in taper',
  shapeOf(funnelGeometry([500], 'taper'))[0],
  { top: 0, bottom: 1, topWidth: 1, bottomWidth: round(FUNNEL_TAIL_WIDTH) },
);
check(
  'one stage is a full-width rectangle in width',
  shapeOf(funnelGeometry([500], 'width'))[0],
  { top: 0, bottom: 1, topWidth: 1, bottomWidth: 1 },
);

// ---- all zeros: every ratio in the module is 0 / 0 --------------------------
for (const shape of SHAPES) {
  check(
    `an all-zero series produces no NaN in '${shape}'`,
    everyNumber(funnelGeometry([0, 0, 0], shape)).every(Number.isFinite),
    true,
  );
}
check(
  'an all-zero series falls back to even depths rather than dividing by zero',
  bandDepths(funnelGeometry([0, 0, 0], 'area')),
  bandDepths(funnelGeometry([0, 0, 0], 'taper')),
);
check(
  'an all-zero series draws no width in width',
  shapeOf(funnelGeometry([0, 0, 0], 'width')).map((stage) => stage.topWidth),
  [0, 0, 0],
);

// ---- a negative must not invert a shape -------------------------------------
check(
  'a negative value is clamped to zero',
  sanitizeValues([100, -50, 25]),
  [100, 0, 25],
);
for (const shape of SHAPES) {
  check(
    `a negative value never produces a negative width in '${shape}'`,
    everyNumber(funnelGeometry([100, -50, 25], shape)).every(
      (number) => number >= 0,
    ),
    true,
  );
}
check(
  'a negative value draws no width rather than a mirrored one',
  round(funnelGeometry([100, -50, 25], 'width')[1].topWidth),
  0,
);

// ---- NaN: silently drops the SVG attribute it reaches -----------------------
check(
  'a NaN value is replaced by zero',
  sanitizeValues([10, NaN, 20]),
  [10, 0, 20],
);
for (const shape of SHAPES) {
  check(
    `a NaN value produces no NaN geometry in '${shape}'`,
    everyNumber(funnelGeometry([10, NaN, 20], shape)).every(Number.isFinite),
    true,
  );
}

// ---- Infinity: the row that made the bar chart lie --------------------------
check(
  'an Infinity value is replaced by zero',
  sanitizeValues([10, Infinity, 20]),
  [10, 0, 20],
);
for (const shape of SHAPES) {
  check(
    `an Infinity value produces finite geometry in '${shape}'`,
    everyNumber(funnelGeometry([10, Infinity, 20], shape)).every(
      Number.isFinite,
    ),
    true,
  );
}
// The bar chart's lesson: the Infinity row must not become the scale and flatten
// every honest row beside it to nothing.
check(
  'a stage beside an Infinity stage keeps its own width',
  round(funnelGeometry([10, Infinity], 'width')[0].topWidth),
  1,
);

// ---- an empty array ---------------------------------------------------------
for (const shape of SHAPES) {
  check(
    `an empty series has no stages in '${shape}'`,
    funnelGeometry([], shape),
    [],
  );
}
check('an empty series sanitizes to nothing', sanitizeValues([]), []);
check('an empty series has no drops', stageDrops([]), []);

// ---- the drop between consecutive stages ------------------------------------
const roundDrops = (drops) => drops.map((drop) => round(drop));

check(
  'the drop runs between consecutive stages',
  roundDrops(stageDrops(FUNNEL)),
  [null, 0.4, 0.5, 0.666667],
);
// Not zero: a printed 0% would claim nobody fell away at the mouth.
check('the first stage has no drop', stageDrops(FUNNEL)[0], null);
check(
  'a zero predecessor gives no drop rather than dividing by zero',
  roundDrops(stageDrops([0, 50, 25])),
  [null, null, 0.5],
);
check('a zero first stage yields no NaN drop', stageDrop(0, 50), null);
check('a growing stage reports a negative drop', stageDrop(100, 150), -0.5);
check('a stage that empties reports a full drop', stageDrop(100, 0), 1);
check('a NaN predecessor gives no drop', stageDrop(NaN, 50), null);
check('a NaN value gives no drop', stageDrop(100, NaN), null);
check('an Infinity predecessor gives no drop', stageDrop(Infinity, 50), null);
check('an Infinity value gives no drop', stageDrop(100, Infinity), null);
check('a negative predecessor gives no drop', stageDrop(-100, 50), null);

// ---- the SVG attribute: where a non-finite number goes missing in silence ----
check(
  'a stage becomes four corners centred on the funnel axis',
  stagePolygonPoints(
    { topWidth: 1, bottomWidth: 0.5, top: 0, bottom: 0.5 },
    100,
    100,
    0,
  ),
  '0,0 100,0 75,50 25,50',
);
check(
  'the gap insets both ends of the stage ALONG the silhouette',
  stagePolygonPoints(
    { topWidth: 1, bottomWidth: 0.5, top: 0, bottom: 0.5 },
    100,
    100,
    10,
  ),
  // Not the boundary widths at the inset depths: a band running 1.0 to 0.5 over 50 units is 0.95
  // wide 5 units in and 0.55 wide 5 units short of its end.
  '2.5,5 97.5,5 77.5,45 22.5,45',
);
// A band shallower than the gap it must leave would otherwise cross its own
// edges and draw a bow tie, or collapse to a line and draw nothing.
check(
  'a band shallower than its gap keeps half a gap of depth',
  stagePolygonPoints(
    { topWidth: 1, bottomWidth: 0.5, top: 0.5, bottom: 0.52 },
    100,
    100,
    10,
  ),
  // Five units about the band's middle, at the band's own boundary widths.
  '0,48.5 100,48.5 75,53.5 25,53.5',
);
check(
  'a thin band at the foot stays inside the viewBox',
  stagePolygonPoints(
    { topWidth: 0.4, bottomWidth: 0.38, top: 0.99, bottom: 1 },
    100,
    100,
    10,
  ),
  '30,95 70,95 69,100 31,100',
);
check(
  'a zero-depth band stays a line',
  stagePolygonPoints(
    { topWidth: 0.4, bottomWidth: 0.38, top: 0.6, bottom: 0.6 },
    100,
    100,
    10,
  ),
  '30.5,60 69.5,60 69.5,60 30.5,60',
);
for (const bad of [NaN, Infinity, -Infinity]) {
  check(
    `a ${bad} width never reaches the points attribute`,
    stagePolygonPoints(
      { topWidth: bad, bottomWidth: 0.5, top: 0, bottom: 0.5 },
      100,
      100,
      0,
    ),
    '',
  );
  check(
    `a ${bad} depth never reaches the points attribute`,
    stagePolygonPoints(
      { topWidth: 1, bottomWidth: 0.5, top: bad, bottom: 0.5 },
      100,
      100,
      0,
    ),
    '',
  );
  check(
    `a ${bad} viewBox never reaches the points attribute`,
    stagePolygonPoints(
      { topWidth: 1, bottomWidth: 0.5, top: 0, bottom: 0.5 },
      bad,
      100,
      0,
    ),
    '',
  );
  check(
    `a ${bad} gap never reaches the points attribute`,
    stagePolygonPoints(
      { topWidth: 1, bottomWidth: 0.5, top: 0, bottom: 0.5 },
      100,
      100,
      bad,
    ),
    '',
  );
}
check(
  'every rendered stage of a real funnel carries points',
  funnelGeometry(FUNNEL, 'area')
    .map((geometry) => stagePolygonPoints(geometry, 100, 100, 3.5))
    .every((points) => points.length > 0 && !points.includes('NaN')),
  true,
);

// ---- the gap, which is a share of one stage and not a count of units --------
check(
  'two stages leave a gap of half a stage share',
  round(stageGapUnits(2, 100)),
  7,
);
check(
  'four stages leave the same gap on screen, in half the units',
  round(stageGapUnits(4, 100)),
  3.5,
);
check('no stages leave no gap', stageGapUnits(0, 100), 0);
check('a NaN stage count leaves no gap', stageGapUnits(NaN, 100), 0);
check('a NaN viewBox leaves no gap', stageGapUnits(3, NaN), 0);

// ---- the gap must inset the edges ALONG the silhouette ----------------------
// The defect this catches: the gap moved each band's drawn edges inwards but the widths were still
// read off the un-inset boundaries, so every band overhung the silhouette at its top and fell short
// at its bottom. The stack read as a fir tree with a jag at each seam.
const cornersOf = (points) =>
  points.split(' ').map((pair) => pair.split(',').map(Number));
// Every corner of every band, as { depth, halfWidth } in viewBox units.
const drawnCorners = (values, shape, gapUnits) => {
  const geometry = funnelGeometry(values, shape);

  return geometry.flatMap((band) =>
    cornersOf(stagePolygonPoints(band, 100, 100, gapUnits)).map(([x, y]) => ({
      depth: round(y, 4),
      halfWidth: round(Math.abs(x - 50), 4),
    })),
  );
};
// The taper silhouette, which 'taper' and 'area' both draw: full width at the mouth, tail width at
// the bottom, linear in between.
const silhouetteHalfWidth = (depth) =>
  round((50 * (1 - (1 - FUNNEL_TAIL_WIDTH) * (depth / 100))).toFixed(4), 4);

for (const shape of ['taper', 'area']) {
  check(
    `every drawn corner sits on the silhouette in '${shape}'`,
    drawnCorners(FUNNEL, shape, 7).every(
      (corner) =>
        Math.abs(corner.halfWidth - silhouetteHalfWidth(corner.depth)) < 0.01,
    ),
    true,
  );
}
// The negative arm: with no gap there is nothing to inset, so the corners are the boundary widths
// and the assertion above would pass on the broken code too.
check(
  'a gap of zero leaves the boundary widths untouched',
  cornersOf(stagePolygonPoints(funnelGeometry(FUNNEL, 'taper')[1], 100, 100, 0))
    .map(([x]) => round(Math.abs(x - 50), 4))
    .filter((_, index) => index === 1 || index === 2),
  [round(50 * funnelGeometry(FUNNEL, 'taper')[1].topWidth, 4), round(50 * funnelGeometry(FUNNEL, 'taper')[1].bottomWidth, 4)],
);
check(
  'a band narrower than its own gap keeps its top edge above its bottom edge',
  ((corners) =>
    corners[0][1] === corners[1][1] &&
    corners[2][1] === corners[3][1] &&
    corners[0][1] < corners[2][1])(
    cornersOf(
      stagePolygonPoints({ top: 0.5, bottom: 0.52, topWidth: 0.8, bottomWidth: 0.7 }, 100, 100, 40),
    ),
  ),
  true,
);

// ---- the ramp spread -------------------------------------------------------
check('the first ramped stage takes the light end', rampPosition(0, 7, 8), 0);
check('the last ramped stage takes the deep end', rampPosition(6, 7, 8), 7);
check(
  'a short funnel still reaches the deep end instead of stopping mid-ramp',
  rampPosition(2, 3, 8),
  7,
);
check(
  'seven ramped stages over eight steps repeat no step',
  new Set([0, 1, 2, 3, 4, 5, 6].map((index) => rampPosition(index, 7, 8))).size,
  7,
);
check('a single ramped stage takes the light end', rampPosition(0, 1, 8), 0);
check('an empty ramp yields no step to index', rampPosition(3, 5, 0), 0);
check(
  'an index past the ramped count is clamped, not wrapped',
  rampPosition(99, 4, 8),
  7,
);

finish('funnel-chart-math');
