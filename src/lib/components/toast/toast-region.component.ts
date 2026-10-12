import {
  DestroyRef,
  ElementRef,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { DS_CONFIG, DS_INTL } from '@ids-group-ltd/ids-design-system/core';
import { devWarn } from '@ids-group-ltd/ids-design-system/core';
import { moveFocusOutOf } from '@ids-group-ltd/ids-design-system/components';
import { DS_TOAST_POSITION_DEFAULT } from './toast.config';
import { ToastComponent } from './toast.component';
import type { ToastEntry } from './toast.types';

// Fallback floor; leaveDuration() reads the real length off the node.
const LEAVE_FALLBACK_MS = 180;

// Grace period once the pointer leaves a toast whose clock ran out under it.
const MIN_RESUME_MS = 600;

const DEFAULT_MAX_VISIBLE = 5;

const QUEUE_COUNT_CAP = 99;

@Component({
  selector: 'ds-toast-region',
  standalone: true,
  imports: [ToastComponent],
  templateUrl: './toast-region.component.html',
  styleUrl: './toast-region.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    role: 'region',
    '[attr.aria-label]': 'intl().toast.region',
    '(mouseenter)': 'onHover(true)',
    '(mouseleave)': 'onHover(false)',
    '(focusin)': 'onFocusIn($event)',
    '(focusout)': 'onFocusWithin($event)',
    '[class.stack-newest-last]': '!newestFirst',
  },
})
export class ToastRegionComponent {
  protected readonly intl = inject(DS_INTL);

  /** Cap on concurrently visible toasts. Extras are queued and shown as
   *  earlier ones dismiss. `0` = unlimited. */
  readonly maxVisible = input<number>(DEFAULT_MAX_VISIBLE);
  /** Show a `+N` strip while toasts wait behind `maxVisible`. */
  readonly showQueueCount = input(true, { transform: booleanAttribute });

  protected readonly visibleEntries = signal<readonly ToastEntry[]>([]);
  protected readonly leaving = signal<ReadonlySet<number>>(new Set());

  private readonly pendingQueue = signal<readonly ToastEntry[]>([]);

  protected readonly queuedLabel = computed(() => {
    const waiting = this.pendingQueue().length;
    if (waiting === 0 || !this.showQueueCount()) {
      return null;
    }

    return waiting > QUEUE_COUNT_CAP ? `+${QUEUE_COUNT_CAP}+` : `+${waiting}`;
  });
  private readonly timers = new Map<number, number>();
  private readonly leaveTimers = new Map<number, number>();
  private readonly remaining = new Map<number, number>();
  private readonly startedAt = new Map<number, number>();
  private hovered = false;
  private focusWithin = false;
  private focusOrigin: HTMLElement | null = null;

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly position = inject(DS_CONFIG).toast?.position;

  constructor() {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      devWarn(() =>
        this.maxVisible() < 0
          ? `<ds-toast-region> maxVisible is ${this.maxVisible()}; a negative cap means unlimited, which is what 0 says. Pass 0 if that is the intent.`
          : null,
      );
    }
    effect(() => {
      this.maxVisible();
      this.drainQueue();
    });
    // An uncancelled timer fires into a destroyed component.
    inject(DestroyRef).onDestroy(() => {
      this.timers.forEach((timer) => window.clearTimeout(timer));
      this.leaveTimers.forEach((timer) => window.clearTimeout(timer));
      this.timers.clear();
      this.leaveTimers.clear();
    });
  }

  /** Newest goes NEAREST the anchor; DOM order is the visual and reading order. */
  protected readonly newestFirst =
    (this.position?.verticalPosition ??
      DS_TOAST_POSITION_DEFAULT.verticalPosition) === 'top';

  add(entry: ToastEntry): void {
    const limit = this.maxVisible();
    if (limit > 0 && this.visibleEntries().length >= limit) {
      this.pendingQueue.update((queue) => [...queue, entry]);

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

  /** FLIP, not an absolute stack: that collapses the region to zero height inside the content-sized CDK pane. */
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
    // drainQueue arms from a timeout, with no user event nearby, so bank the pause state here.
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

  protected onFocusIn(event: FocusEvent): void {
    const from = event.relatedTarget;
    if (from instanceof HTMLElement && !this.host.nativeElement.contains(from)) {
      this.focusOrigin = from;
    }
    this.onFocusWithin(true);
  }

  // `focusout` also fires when focus moves BETWEEN elements inside the region; the containment check avoids re-flooring at MIN_RESUME_MS.
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

  /** Replaces fields of a visible or queued toast in place. Patching `durationMs`
   *  restarts the clock; on a QUEUED toast it takes effect on promotion. */
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
    this.pendingQueue.update((queue) =>
      queue.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)),
    );
  }

  remove(id: number): void {
    // A `ToastRef` outlives its toast, so dismiss() can arrive for an id nothing holds.
    const isVisible = this.visibleEntries().some((entry) => entry.id === id);
    const queued = this.pendingQueue().some((entry) => entry.id === id);
    if (!isVisible && !queued) {
      return;
    }

    this.clearCountdown(id);
    if (queued) {
      this.pendingQueue.update((queue) =>
        queue.filter((entry) => entry.id !== id),
      );

      return;
    }
    if (this.leaving().has(id)) {
      return;
    }
    const node = this.toastNodes().get(id);
    if (node) {
      // A neighbouring toast first, then where focus came from, as a dialog returns it.
      moveFocusOutOf(node, this.host.nativeElement, this.focusOrigin);
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

  /** The leave transition length is a public token, so read it off the node. Reduced
   *  motion zeroes it, so the floor applies only when there is nothing to measure. */
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
    this.pendingQueue.set([]);
  }

  private drainQueue(): void {
    while (this.pendingQueue().length) {
      const limit = this.maxVisible();
      if (limit > 0 && this.visibleEntries().length >= limit) {
        return;
      }
      const [next, ...rest] = this.pendingQueue();
      this.pendingQueue.set(rest);
      this.show(next);
    }
  }
}
