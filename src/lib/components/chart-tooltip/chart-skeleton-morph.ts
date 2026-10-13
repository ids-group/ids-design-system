import { chartTiming } from '@ids-group-ltd/ids-design-system/components';

/** How a mark with no placeholder arrives, and a placeholder with no mark leaves: from the
 *  baseline under it (`up`), from its inline start (`across`), or fading in place (`null`).
 *
 *  @internal */
export type ChartMorphGrowth = 'up' | 'across' | null;

interface Point {
  readonly x: number;
  readonly y: number;
}

interface Shape {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
  /** Polygon vertices in pixels from the box's top-left corner. */
  readonly clip: readonly Point[] | null;
  readonly color: string | null;
  readonly radius: string | null;
}

interface Placeholder {
  readonly role: string;
  readonly key: string | null;
  readonly ghost: HTMLElement;
  readonly shape: Shape;
}

/** Put on the figure while the drawn chart waits, hidden, for its geometry to land. */
const HOLD_CLASS = 'skeleton-morph';
// The real mark takes over from its ghost only once the ghost has (all but) landed on it.
const HANDOVER_AT = 0.95;
const BAND_SAMPLES = 24;
const PATH_SAMPLES = 96;
const MAX_WAIT_FRAMES = 60;
const COPIED_STYLES = [
  'background-color',
  'border-radius',
  'border-top',
  'border-right',
  'border-bottom',
  'border-left',
  'clip-path',
  'mask-image',
  'mask-composite',
  'mask-size',
  'mask-position',
  'mask-repeat',
] as const;

/**
 * Turns the loading skeleton inside `host` into the chart drawn in its place, in one motion. Call
 * while the skeleton is still in the DOM and the chart is about to replace it. Returns `null` when
 * there is nothing to morph: a skeleton that was not loading, or motion that is off.
 *
 * Placeholders are the skeleton's `ds-skeleton` elements and anything marked `data-morph`; the drawn
 * chart marks what they become with `data-morph`:
 * - `mark`: a placeholder travels to the mark with the same `data-morph-key`, else the same order,
 *   taking its size and colour; a mark without one arrives by `growth`, a placeholder without one
 *   leaves by it; under `up`, a mark with `data-morph-from="top"` (one hanging below the zero
 *   line) grows down from its top edge;
 * - `line`: the skeleton's band travels onto the first drawn line; the others draw on as they would;
 * - `hold`: stays hidden until the marks have landed;
 * - `self`: a part the chart animates from the skeleton itself, such as a ring turning its slices
 *   from the skeleton's: it skips its own entrance and travels from the `self` placeholder in the
 *   same order, which fades out on the way;
 * - `fade` (the default for a placeholder): fades out in place while the chart fades in.
 *
 * @internal
 */
export function startSkeletonMorph(
  host: HTMLElement,
  growth: ChartMorphGrowth,
  done: () => void,
): (() => void) | null {
  const growTiming = chartTiming(host, 'mark-grow');
  const elements = Array.from(
    host.querySelectorAll<HTMLElement>('ds-skeleton, [data-morph]'),
  );
  const loading = elements.some(
    (element) =>
      element.localName === 'ds-skeleton' &&
      !element.classList.contains('still'),
  );
  if (!growTiming || !loading || typeof host.animate !== 'function') {
    return null;
  }
  const timing: KeyframeAnimationOptions = { ...growTiming, fill: 'both' };

  const layer = document.createElement('div');
  layer.setAttribute('aria-hidden', 'true');
  layer.style.cssText =
    'position: absolute; inset: 0 auto auto 0; z-index: 1; pointer-events: none;';
  host.append(layer);
  const origin = layer.getBoundingClientRect();

  const placeholders: Placeholder[] = [];
  for (const element of elements) {
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      continue;
    }
    const style = getComputedStyle(element);
    const shape: Shape = {
      left: rect.left - origin.left,
      top: rect.top - origin.top,
      width: rect.width,
      height: rect.height,
      clip: parsePolygon(style.clipPath, rect),
      color: style.backgroundColor,
      radius: style.borderRadius,
    };
    const ghost = ghostAt(layer, shape);
    for (const property of COPIED_STYLES) {
      ghost.style.setProperty(property, style.getPropertyValue(property));
    }
    const role = element.dataset['morph'] ?? 'fade';
    ghost.dataset['morph'] = role;
    placeholders.push({
      role,
      key: element.dataset['morphKey'] ?? null,
      ghost,
      shape,
    });
  }
  host.classList.add(HOLD_CLASS);

  const animations: Animation[] = [];
  let frame = 0;
  let finished = false;
  const finish = (): void => {
    if (finished) {
      return;
    }
    finished = true;
    cancelAnimationFrame(frame);
    for (const animation of animations) {
      animation.cancel();
    }
    layer.remove();
    host.classList.remove(HOLD_CLASS);
    done();
  };

  const travel = (
    ghost: HTMLElement,
    from: Shape,
    to: Shape,
    startOpacity = 1,
  ): void => {
    const [start, end] = matchClips(from, to);
    animations.push(
      ghost.animate(
        [
          keyframe(start, startOpacity),
          { ...keyframe(end, 1), offset: HANDOVER_AT },
          keyframe(end, 0),
        ],
        timing,
      ),
    );
  };

  const carry = (
    target: Element,
    placeholder: Placeholder,
    to: Shape,
  ): void => {
    const from = placeholder.shape;
    const shift = `${from.left + from.width / 2 - (to.left + to.width / 2)}px ${from.top + from.height / 2 - (to.top + to.height / 2)}px`;
    const scale = `${to.width ? from.width / to.width : 1} ${to.height ? from.height / to.height : 1}`;
    animations.push(
      target.animate(
        [
          { translate: shift, scale },
          { translate: '0px 0px', scale: '1 1' },
        ],
        timing,
      ),
      placeholder.ghost.animate(
        [
          { ...boxFrame(from), opacity: 1 },
          { ...boxFrame(to), opacity: 0 },
        ],
        timing,
      ),
    );
  };

  const play = (body: HTMLElement): void => {
    const lineTarget = body.querySelector('[data-morph="line"]');
    const targets = Array.from(
      body.querySelectorAll(
        '[data-morph="mark"], [data-morph="hold"], [data-morph="self"]',
      ),
    );
    if (lineTarget) {
      targets.push(lineTarget);
    }
    for (const target of targets) {
      for (const animation of target.getAnimations({ subtree: true })) {
        if (animation.effect?.getTiming().iterations !== Infinity) {
          animation.finish();
        }
      }
    }
    const keyed = new Map<string, Placeholder>();
    const ordered: Placeholder[] = [];
    for (const placeholder of placeholders) {
      if (placeholder.role === 'mark' && placeholder.key !== null) {
        keyed.set(placeholder.key, placeholder);
      } else if (placeholder.role === 'mark') {
        ordered.push(placeholder);
      }
    }
    const arrived = new Set<Placeholder>();
    const line = placeholders.find(({ role }) => role === 'line');
    const selves = placeholders.filter(({ role }) => role === 'self');
    let nextOrdered = 0;
    let nextSelf = 0;

    for (const target of targets) {
      const role = target.getAttribute('data-morph');
      if (role === 'self') {
        const placeholder = selves[nextSelf++];
        if (placeholder) {
          arrived.add(placeholder);
          carry(target, placeholder, markShape(target, origin));
        }
        continue;
      }
      if (role === 'mark') {
        const key = target.getAttribute('data-morph-key');
        const placeholder =
          key === null ? ordered[nextOrdered++] : keyed.get(key);
        const to = markShape(target, origin);
        if (placeholder) {
          arrived.add(placeholder);
          travel(placeholder.ghost, placeholder.shape, to);
        } else {
          const from = collapse(to, growth, target);
          const ghost = ghostAt(layer, to);
          ghost.dataset['morph'] = 'mark';
          travel(ghost, from, to, from === to ? 0 : 1);
        }
      } else if (role === 'line' && line) {
        arrived.add(line);
        travel(
          line.ghost,
          bandOfPlaceholder(line.shape),
          lineShape(target, origin),
        );
      }
      animations.push(
        target.animate(
          [{ opacity: 0 }, { opacity: 0, offset: HANDOVER_AT }, { opacity: 1 }],
          timing,
        ),
      );
    }

    for (const placeholder of placeholders) {
      if (arrived.has(placeholder)) {
        continue;
      }
      animations.push(
        placeholder.ghost.animate(
          placeholder.role === 'mark'
            ? [
                keyframe(placeholder.shape, 1),
                keyframe(collapse(placeholder.shape, growth, body), 0),
              ]
            : [{ opacity: 1 }, { opacity: 0 }],
          timing,
        ),
      );
    }
    animations.push(body.animate([{ opacity: 0 }, { opacity: 1 }], timing));
    host.classList.remove(HOLD_CLASS);
    Promise.all(animations.map(({ finished }) => finished)).then(
      finish,
      () => undefined,
    );
  };

  let frames = 0;
  const waitForLanding = (): void => {
    frames++;
    const body = host.querySelector<HTMLElement>(':scope > .reload-overlay');
    if (
      body &&
      (frames >= MAX_WAIT_FRAMES ||
        (frames >= 2 && !body.querySelector('.measuring')))
    ) {
      play(body);
    } else if (frames >= MAX_WAIT_FRAMES) {
      finish();
    } else {
      frame = requestAnimationFrame(waitForLanding);
    }
  };
  frame = requestAnimationFrame(waitForLanding);

  return finish;
}

function ghostAt(layer: HTMLElement, shape: Shape): HTMLElement {
  const ghost = document.createElement('div');
  ghost.style.position = 'absolute';
  ghost.style.left = `${shape.left}px`;
  ghost.style.top = `${shape.top}px`;
  ghost.style.width = `${shape.width}px`;
  ghost.style.height = `${shape.height}px`;
  if (shape.color) {
    ghost.style.backgroundColor = shape.color;
  }
  layer.append(ghost);

  return ghost;
}

function boxFrame(shape: Shape): Keyframe {
  return {
    left: `${shape.left}px`,
    top: `${shape.top}px`,
    width: `${shape.width}px`,
    height: `${shape.height}px`,
  };
}

function keyframe(shape: Shape, opacity: number): Keyframe {
  return {
    ...boxFrame(shape),
    clipPath: shape.clip
      ? `polygon(${shape.clip.map(({ x, y }) => `${x}px ${y}px`).join(', ')})`
      : 'none',
    backgroundColor: shape.color ?? 'transparent',
    borderRadius: shape.radius ?? '0',
    opacity,
  };
}

// Clip paths interpolate only between polygons of as many vertices: a plain box becomes its four
// corners, and two polygons that cannot pair up fall back to their boxes.
function matchClips(from: Shape, to: Shape): [Shape, Shape] {
  const color = to.color ?? from.color;
  const radius = to.radius ?? from.radius;
  if (!from.clip && !to.clip) {
    return [from, { ...to, color, radius }];
  }
  const fromClip = from.clip ?? corners(from);
  const toClip = to.clip ?? corners(to);
  if (fromClip.length !== toClip.length) {
    return [
      { ...from, clip: null },
      { ...to, clip: null, color, radius },
    ];
  }

  return [
    { ...from, clip: fromClip },
    { ...to, clip: toClip, color, radius },
  ];
}

function corners({ width, height }: Shape): Point[] {
  return [
    { x: 0, y: 0 },
    { x: width, y: 0 },
    { x: width, y: height },
    { x: 0, y: height },
  ];
}

function collapse(
  shape: Shape,
  growth: ChartMorphGrowth,
  context: Element,
): Shape {
  if (growth === 'up') {
    const fromTop = context.getAttribute('data-morph-from') === 'top';

    return {
      ...shape,
      top: fromTop ? shape.top : shape.top + shape.height,
      height: 0,
      clip: shape.clip?.map(({ x }) => ({ x, y: 0 })) ?? null,
    };
  }
  if (growth === 'across') {
    const fromEnd = getComputedStyle(context).direction === 'rtl';

    return {
      ...shape,
      left: fromEnd ? shape.left + shape.width : shape.left,
      width: 0,
      clip: shape.clip?.map(({ y }) => ({ x: 0, y })) ?? null,
    };
  }

  return shape;
}

function markShape(target: Element, origin: DOMRect): Shape {
  const rect = target.getBoundingClientRect();
  const style = getComputedStyle(target);
  let clip: Point[] | null = null;
  if (target instanceof SVGPolygonElement) {
    const matrix = target.getScreenCTM();
    clip = matrix
      ? Array.from({ length: target.points.numberOfItems }, (unused, index) => {
          const { x, y } = target.points.getItem(index);
          const point = new DOMPoint(x, y).matrixTransform(matrix);

          return { x: point.x - rect.left, y: point.y - rect.top };
        })
      : null;
  } else if (target instanceof HTMLElement) {
    clip = parsePolygon(style.clipPath, rect);
  }

  return {
    left: rect.left - origin.left,
    top: rect.top - origin.top,
    width: rect.width,
    height: rect.height,
    clip,
    color: markColor(target),
    radius: target instanceof HTMLElement ? style.borderRadius : null,
  };
}

// The colour a mark is painted in: its own fill or background, else the first part of it that has one.
function markColor(target: Element): string | null {
  for (const element of [target, ...Array.from(target.querySelectorAll('*'))]) {
    if (element instanceof SVGGElement) {
      continue;
    }
    const style = getComputedStyle(element);
    const color =
      element instanceof SVGElement ? style.fill : style.backgroundColor;
    if (isPaint(color)) {
      return color;
    }
  }

  return null;
}

function isPaint(color: string): boolean {
  return (
    /^(rgb|hsl|color|lab|lch|oklab|oklch|#)/.test(color) &&
    !/^rgba\(\s*0,\s*0,\s*0,\s*0\s*\)$/.test(color)
  );
}

// The skeleton's band as evenly spaced vertices, so it pairs up with the drawn line's whatever the counts.
function bandOfPlaceholder(shape: Shape): Shape {
  const vertices = (shape.clip ?? corners(shape)).map(({ x, y }) => ({
    x: x + shape.left,
    y: y + shape.top,
  }));
  const half = Math.floor(vertices.length / 2);
  const upper = vertices.slice(0, half);
  const lower = vertices.slice(half).reverse();

  return polygonShape(band(upper, lower), shape.color, shape.radius);
}

function lineShape(target: Element, origin: DOMRect): Shape {
  const style = getComputedStyle(target);
  const matrix =
    target instanceof SVGGeometryElement ? target.getScreenCTM() : null;
  if (!(target instanceof SVGGeometryElement) || !matrix) {
    return markShape(target, origin);
  }
  const length = target.getTotalLength();
  const centre = Array.from({ length: PATH_SAMPLES + 1 }, (unused, index) => {
    const { x, y } = target.getPointAtLength((length * index) / PATH_SAMPLES);
    const point = new DOMPoint(x, y).matrixTransform(matrix);

    return { x: point.x - origin.left, y: point.y - origin.top };
  }).sort((first, second) => first.x - second.x);
  const half =
    (parseFloat(style.strokeWidth) * Math.hypot(matrix.a, matrix.b)) / 2 || 1;

  return polygonShape(
    band(
      centre.map(({ x, y }) => ({ x, y: y - half })),
      centre.map(({ x, y }) => ({ x, y: y + half })),
    ),
    isPaint(style.stroke) ? style.stroke : null,
    '0',
  );
}

function band(upper: readonly Point[], lower: readonly Point[]): Point[] {
  const start = upper[0]?.x ?? 0;
  const end = upper[upper.length - 1]?.x ?? start;
  const xs = Array.from(
    { length: BAND_SAMPLES },
    (unused, index) => start + ((end - start) * index) / (BAND_SAMPLES - 1),
  );

  return [
    ...xs.map((x) => ({ x, y: yAt(upper, x) })),
    ...xs.reverse().map((x) => ({ x, y: yAt(lower, x) })),
  ];
}

function yAt(points: readonly Point[], x: number): number {
  const after = points.findIndex((point) => point.x >= x);
  if (after <= 0) {
    return points[after === 0 ? 0 : points.length - 1]?.y ?? 0;
  }
  const before = points[after - 1];
  const next = points[after];
  const span = next.x - before.x;

  return span
    ? before.y + ((next.y - before.y) * (x - before.x)) / span
    : next.y;
}

function polygonShape(
  points: readonly Point[],
  color: string | null,
  radius: string | null,
): Shape {
  const left = Math.min(...points.map(({ x }) => x));
  const top = Math.min(...points.map(({ y }) => y));

  return {
    left,
    top,
    width: Math.max(...points.map(({ x }) => x)) - left,
    height: Math.max(...points.map(({ y }) => y)) - top,
    clip: points.map(({ x, y }) => ({ x: x - left, y: y - top })),
    color,
    radius,
  };
}

// A computed `polygon(...)` in pixels from the box's corner; lengths are `%`, `px` or a `calc()` of both.
function parsePolygon(value: string, box: DOMRect): Point[] | null {
  if (!value.startsWith('polygon(')) {
    return null;
  }
  const vertices = value
    .slice('polygon('.length, -1)
    .split(',')
    .map((vertex) => vertex.trim().match(/calc\([^)]*\)|\S+/g) ?? []);
  if (vertices[0]?.length === 1) {
    vertices.shift();
  }

  return vertices.map(([x = '0', y = '0']) => ({
    x: resolveLength(x, box.width),
    y: resolveLength(y, box.height),
  }));
}

function resolveLength(length: string, size: number): number {
  let total = 0;
  for (const [, sign, magnitude, unit] of length.matchAll(
    /([+-]?)\s*(-?[\d.]+)(%|px)?/g,
  )) {
    const value = parseFloat(magnitude) * (sign === '-' ? -1 : 1);
    total += unit === '%' ? (value / 100) * size : value;
  }

  return total;
}
