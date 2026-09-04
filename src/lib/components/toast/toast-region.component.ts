import {
  DestroyRef,
  ElementRef,
  Component,
  ViewEncapsulation,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { DS_CONFIG } from '@ids-group-ltd/ids-design-system/core';
import { devWarn } from '@ids-group-ltd/ids-design-system/core';
import { DS_TOAST_POSITION_DEFAULT } from './toast.config';
import { ToastComponent } from './toast.component';
import type { ToastEntry } from './toast.types';

// Only the floor: see leaveDuration(), which reads the real length off the node.
const LEAVE_FALLBACK_MS = 180;

// A toast whose clock ran out while the pointer was over it should not vanish the
// instant the pointer leaves — the reader gets this much to see it go.
const MIN_RESUME_MS = 600;

const DEFAULT_MAX_VISIBLE = 5;

@Component({
  selector: 'ds-toast-region',
  standalone: true,
  imports: [ToastComponent],
  templateUrl: './toast-region.component.html',
  styleUrl: './toast-region.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    role: 'region',
    'aria-label': 'Notifications',
    '(mouseenter)': 'onHover(true)',
    '(mouseleave)': 'onHover(false)',
    '(focusin)': 'onFocusWithin(true)',
    '(focusout)': 'onFocusWithin($event)',
  },
})
export class ToastRegionComponent {
  /** Cap on concurrently visible toasts. Extras are queued and shown as
   *  earlier ones dismiss. `0` = unlimited. */
  readonly maxVisible = input<number>(DEFAULT_MAX_VISIBLE);

  protected readonly visibleEntries = signal<readonly ToastEntry[]>([]);
  protected readonly leaving = signal<ReadonlySet<number>>(new Set());

  private readonly pendingQueue: ToastEntry[] = [];
  private readonly timers = new Map<number, number>();
  private readonly leaveTimers = new Map<number, number>();
  private readonly remaining = new Map<number, number>();
  private readonly startedAt = new Map<number, number>();
  private hovered = false;
  private focusWithin = false;

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly position = inject(DS_CONFIG).toast?.position;

  constructor() {
    devWarn(() =>
      this.maxVisible() < 0
        ? `<ds-toast-region> maxVisible is ${this.maxVisible()}; a negative cap means unlimited, which is what 0 says. Pass 0 if that is the intent.`
        : null,
    );
    effect(() => {
      this.maxVisible();
      this.drainQueue();
    });
    // An uncancelled timer fires into a destroyed component: invisible in an app that
    // never tears the root down, a stream of "N timers still in the queue" under fakeAsync.
    inject(DestroyRef).onDestroy(() => {
      this.timers.forEach((timer) => window.clearTimeout(timer));
      this.leaveTimers.forEach((timer) => window.clearTimeout(timer));
      this.timers.clear();
      this.leaveTimers.clear();
    });
  }

  /** Newest goes NEAREST the anchor, so the toast that just fired appears where the
   *  stack is pinned rather than at the far end of a list the reader has to hunt
   *  down. DOM order is the visual order, so this also keeps the reading order. */
  private readonly newestFirst =
    (this.position?.verticalPosition ??
      DS_TOAST_POSITION_DEFAULT.verticalPosition) === 'top';

  add(entry: ToastEntry): void {
    const limit = this.maxVisible();
    if (limit > 0 && this.visibleEntries().length >= limit) {
      this.pendingQueue.push(entry);

      return;
    }

    this.show(entry);
  }

  private show(entry: ToastEntry): void {
    const before = this.measureTops();
    this.visibleEntries.update((existing) =>
      this.newestFirst ? [entry, ...existing] : [...existing, entry],
    );
    this.arm(entry.id, entry.durationMs);
    this.slideNeighbours(before);
  }

  /** FLIP, rather than the usual absolute stack: absolute positioning collapses the region
   *  to zero height, and it lives in a CDK pane sized to its content, so the hit area goes
   *  with it. */
  private slideNeighbours(before: Map<number, number>): void {
    if (!before.size) {
      return;
    }
    requestAnimationFrame(() => {
      const nodes = this.toastNodes();
      const deltas: [HTMLElement, number][] = [];
      for (const [id, node] of nodes) {
        const previousTop = before.get(id);
        if (previousTop === undefined) {
          continue;
        }
        const delta = previousTop - node.getBoundingClientRect().top;
        if (delta) {
          deltas.push([node, delta]);
        }
      }
      for (const [node, delta] of deltas) {
        node.style.setProperty('--_toast-shift', `${delta}px`);
        node.classList.add('shifting');
      }
      requestAnimationFrame(() => {
        for (const [node] of deltas) {
          node.classList.remove('shifting');
          node.style.removeProperty('--_toast-shift');
        }
      });
    });
  }

  private toastNodes(): Map<number, HTMLElement> {
    const nodes = new Map<number, HTMLElement>();
    const elements =
      this.host.nativeElement.querySelectorAll<HTMLElement>('ds-toast');
    this.visibleEntries().forEach((entry, index) => {
      const node = elements[index];
      if (node) {
        nodes.set(entry.id, node);
      }
    });

    return nodes;
  }

  private measureTops(): Map<number, number> {
    const tops = new Map<number, number>();
    for (const [id, node] of this.toastNodes()) {
      tops.set(id, node.getBoundingClientRect().top);
    }

    return tops;
  }

  private arm(id: number, remaining: number): void {
    if (remaining <= 0) {
      return;
    }
    this.remaining.set(id, remaining);
    // A toast can be armed with no user event anywhere near it — drainQueue runs from a
    // timeout — so this has to bank rather than trust that a pause event will follow.
    if (this.hovered || this.focusWithin) {
      this.startedAt.delete(id);

      return;
    }
    this.startedAt.set(id, Date.now());
    const existing = this.timers.get(id);
    if (existing !== undefined) {
      window.clearTimeout(existing);
    }
    this.timers.set(
      id,
      window.setTimeout(() => this.remove(id), remaining),
    );
  }

  private clearCountdown(id: number): void {
    const timer = this.timers.get(id);
    if (timer !== undefined) {
      window.clearTimeout(timer);
      this.timers.delete(id);
    }
    this.remaining.delete(id);
    this.startedAt.delete(id);
  }

  protected onHover(entered: boolean): void {
    this.hovered = entered;
    this.syncPause();
  }

  // `focusout` bubbles, so it also fires when focus moves BETWEEN elements inside the region —
  // tabbing from the action to the close button. Without the containment check that reads as
  // leaving, and every round trip re-floors the remainder at MIN_RESUME_MS.
  protected onFocusWithin(event: FocusEvent | true): void {
    this.focusWithin =
      event === true ||
      (event.relatedTarget instanceof Node &&
        this.host.nativeElement.contains(event.relatedTarget));
    this.syncPause();
  }

  private syncPause(): void {
    const shouldPause = this.hovered || this.focusWithin;
    if (shouldPause === this.paused) {
      return;
    }
    if (shouldPause) {
      this.pauseAll();
    } else {
      this.resumeAll();
    }
  }

  private get paused(): boolean {
    return this.timers.size === 0 && this.remaining.size > 0;
  }

  private pauseAll(): void {
    const now = Date.now();
    for (const [id, timer] of this.timers) {
      window.clearTimeout(timer);
      const left =
        (this.remaining.get(id) ?? 0) - (now - (this.startedAt.get(id) ?? now));
      this.remaining.set(id, Math.max(left, MIN_RESUME_MS));
    }
    this.timers.clear();
  }

  private resumeAll(): void {
    for (const [id, left] of [...this.remaining]) {
      this.arm(id, left);
    }
  }

  /** Replace fields of an already-visible or queued toast in place. Patching
   *  `durationMs` restarts the clock, and on a QUEUED toast it takes effect only on
   *  promotion — otherwise a duration would burn down while the toast is invisible. */
  update(
    id: number,
    patch: Partial<
      Pick<
        ToastEntry,
        'body' | 'title' | 'variant' | 'dismissible' | 'action' | 'durationMs'
      >
    >,
  ): void {
    const inVisible = this.visibleEntries().some((entry) => entry.id === id);
    if (inVisible) {
      this.visibleEntries.update((entries) =>
        entries.map((entry) =>
          entry.id === id ? { ...entry, ...patch } : entry,
        ),
      );
      if (patch.durationMs !== undefined) {
        this.clearCountdown(id);
        this.arm(id, patch.durationMs);
      }

      return;
    }
    const queueIndex = this.pendingQueue.findIndex((entry) => entry.id === id);
    if (queueIndex !== -1) {
      this.pendingQueue[queueIndex] = {
        ...this.pendingQueue[queueIndex],
        ...patch,
      };
    }
  }

  remove(id: number): void {
    // A `ToastRef` outlives its toast, so dismiss() can arrive for an id nothing holds.
    const isVisible = this.visibleEntries().some((entry) => entry.id === id);
    const queueIndex = this.pendingQueue.findIndex((entry) => entry.id === id);
    if (!isVisible && queueIndex === -1) {
      return;
    }

    this.clearCountdown(id);
    if (queueIndex !== -1) {
      this.pendingQueue.splice(queueIndex, 1);

      return;
    }
    if (this.leaving().has(id)) {
      return;
    }
    this.leaving.update((set) => new Set(set).add(id));
    this.leaveTimers.set(
      id,
      window.setTimeout(() => {
        this.leaveTimers.delete(id);
        this.visibleEntries.update((existing) =>
          existing.filter((entry) => entry.id !== id),
        );
        this.leaving.update((set) => {
          const next = new Set(set);
          next.delete(id);

          return next;
        });
        this.drainQueue();
      }, this.leaveDuration(id)),
    );
  }

  /** The leave transition is a public token, so its length is whatever the consumer
   *  set — read it off the node rather than assuming. Reduced motion zeroes it, which
   *  is why the floor applies only when there is nothing to measure. */
  private leaveDuration(id: number): number {
    const node = this.toastNodes().get(id);
    if (!node) {
      return LEAVE_FALLBACK_MS;
    }
    const declared = getComputedStyle(node)
      .transitionDuration.split(',')
      .map((part) => parseFloat(part) * 1000)
      .filter((ms) => !Number.isNaN(ms));

    return declared.length ? Math.max(...declared) : LEAVE_FALLBACK_MS;
  }

  protected isLeaving(id: number): boolean {
    return this.leaving().has(id);
  }

  clear(): void {
    this.timers.forEach((timer) => window.clearTimeout(timer));
    this.leaveTimers.forEach((timer) => window.clearTimeout(timer));
    this.timers.clear();
    this.leaveTimers.clear();
    this.remaining.clear();
    this.startedAt.clear();
    this.visibleEntries.set([]);
    this.leaving.set(new Set());
    this.pendingQueue.length = 0;
  }

  private drainQueue(): void {
    while (this.pendingQueue.length) {
      const limit = this.maxVisible();
      if (limit > 0 && this.visibleEntries().length >= limit) {
        return;
      }
      this.show(this.pendingQueue.shift()!);
    }
  }
}
