import {
  DestroyRef,
  ElementRef,
  InjectionToken,
  PLATFORM_ID,
  Signal,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DS_CONFIG } from '@ids-group-ltd/ids-design-system/core';

/** Provided by a chart that has already waited for the viewport, so its `ds-chart` builds at once.
 *
 *  @internal */
export const CHART_RENDER_GATE_PASSED = new InjectionToken<boolean>(
  'CHART_RENDER_GATE_PASSED',
);

type Build = () => void;

const builders = new WeakMap<Element, Build>();
const near = new Map<Element, Build>();
const ahead = new Map<Element, Build>();
const observers = new Map<Element | null, Map<string, IntersectionObserver>>();
let draining = false;
let idleScheduled = false;
let budgetMs = 8;

function drain(): void {
  const start = performance.now();
  for (const [host, build] of near) {
    if (performance.now() - start > budgetMs) {
      setTimeout(drain);

      return;
    }
    near.delete(host);
    build();
  }
  draining = false;
}

// An idle period with less than this left would run a build into the next frame.
const IDLE_ROOM_MS = 12;

function buildWhileIdle(deadline: IdleDeadline): void {
  idleScheduled = false;
  for (const [host, build] of ahead) {
    if (deadline.timeRemaining() < IDLE_ROOM_MS) {
      break;
    }
    ahead.delete(host);
    build();
  }
  scheduleIdle();
}

function scheduleIdle(): void {
  if (
    idleScheduled ||
    !ahead.size ||
    typeof requestIdleCallback === 'undefined'
  ) {
    return;
  }
  idleScheduled = true;
  requestIdleCallback(buildWhileIdle);
}

function observer(
  root: Element | null,
  margin: string,
  queue: Map<Element, Build>,
  schedule: () => void,
): IntersectionObserver {
  let byMargin = observers.get(root);
  if (!byMargin) {
    byMargin = new Map();
    observers.set(root, byMargin);
  }
  const key = `${queue === near ? 'near' : 'ahead'} ${margin}`;
  let found = byMargin.get(key);
  if (!found) {
    found = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const build = builders.get(entry.target);
          if (build && entry.isIntersecting) {
            queue.set(entry.target, build);
          } else {
            queue.delete(entry.target);
          }
        }
        schedule();
      },
      { root, rootMargin: margin },
    );
    byMargin.set(key, found);
  }

  return found;
}

function scheduleDrain(): void {
  if (near.size && !draining) {
    draining = true;
    setTimeout(drain);
  }
}

// A margin on the root only widens the root: an element in a scrolling container is clipped by it
// first, so the container must be the root. Overflow alone is not enough (a sideways-only scroller
// computes `overflow-y: auto` too), so it must also be taller inside than out.
function scrollRoot(host: Element): Element | null {
  for (let node = host.parentElement; node; node = node.parentElement) {
    const overflow = getComputedStyle(node).overflowY;
    if (
      (overflow === 'auto' ||
        overflow === 'scroll' ||
        overflow === 'overlay') &&
      node.scrollHeight > node.clientHeight
    ) {
      return node;
    }
  }

  return null;
}

/** Whether a chart may build its plot yet, under `DS_CONFIG.chart.rendering`. `true` from the start
 *  unless `deferUntilVisible` is on; then `true` once the chart nears the viewport or is built ahead
 *  while the page is idle, and it stays `true`. Call from an injection context.
 *
 *  @internal */
export function chartRenderGate(): Signal<boolean> {
  const rendering = inject(DS_CONFIG).chart?.rendering;
  // `skipSelf`: a preset provides the token to its own view and must not read it back.
  const passed = inject(CHART_RENDER_GATE_PASSED, {
    optional: true,
    skipSelf: true,
  });
  if (
    !rendering?.deferUntilVisible ||
    passed ||
    !isPlatformBrowser(inject(PLATFORM_ID)) ||
    typeof IntersectionObserver === 'undefined'
  ) {
    return signal(true).asReadonly();
  }

  const ready = signal(false);
  const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  budgetMs = rendering.frameBudgetMs ?? budgetMs;
  const skipWhileOffscreen = rendering.skipWhileOffscreen ?? true;
  let release: () => void = () => undefined;

  afterNextRender(() => {
    const root = scrollRoot(host);
    const watchers = [
      observer(root, rendering.visibleMargin ?? '10% 0px', near, scheduleDrain),
    ];
    if (rendering.buildAheadWhileIdle ?? true) {
      watchers.push(
        observer(
          root,
          rendering.buildAheadMargin ?? '100% 0px',
          ahead,
          scheduleIdle,
        ),
      );
    }
    release = () => {
      for (const watcher of watchers) {
        watcher.unobserve(host);
      }
      near.delete(host);
      ahead.delete(host);
    };
    builders.set(host, () => {
      release();
      if (skipWhileOffscreen) {
        // `auto` remembers the last rendered height, so skipping moves nothing.
        host.style.contentVisibility = 'auto';
        host.style.containIntrinsicBlockSize = 'auto 300px';
      }
      ready.set(true);
    });
    for (const watcher of watchers) {
      watcher.observe(host);
    }
  });
  inject(DestroyRef).onDestroy(() => release());

  return ready.asReadonly();
}
