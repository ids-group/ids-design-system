import {
  ElementRef,
  Component,
  ViewEncapsulation,
  inject,
  input,
  signal,
} from '@angular/core';
import { DS_TOAST_POSITION, DS_TOAST_POSITION_DEFAULT } from './toast.config';
import { ToastComponent } from './toast.component';
import type { ToastEntry } from './toast.types';

// Must match the leave transition on :host in toast.component.scss (--duration-base).
const LEAVE_DURATION_MS = 180;

// A toast whose clock ran out while the pointer was over it should not vanish the
// instant the pointer leaves — the reader gets this much to see it go.
const MIN_RESUME_MS = 600;

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
   *  earlier ones dismiss. 0 = unlimited (default). */
  readonly maxVisible = input<number>(0);

  protected readonly visibleEntries = signal<readonly ToastEntry[]>([]);
  protected readonly leaving = signal<ReadonlySet<number>>(new Set());

  private readonly pendingQueue: ToastEntry[] = [];
  private readonly timers = new Map<number, number>();
  private readonly remaining = new Map<number, number>();
  private readonly startedAt = new Map<number, number>();
  private hovered = false;
  private focusWithin = false;

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly position = inject(DS_TOAST_POSITION, { optional: true });

  /** Newest goes NEAREST the anchor, so the toast that just fired appears where the
   *  stack is pinned rather than at the far end of a list the reader has to hunt
   *  down. DOM order is the visual order, so this also keeps the reading order. */
  private readonly newestFirst =
    (this.position ?? DS_TOAST_POSITION_DEFAULT).verticalPosition === 'top';

  add(entry: ToastEntry): void {
    const limit = this.maxVisible();
    if (limit > 0 && this.visibleEntries().length >= limit) {
      this.pendingQueue.push(entry);

      return;
    }

    this.show(entry);
  }

  private show(entry: ToastEntry): void {
    this.visibleEntries.update((existing) =>
      this.newestFirst ? [entry, ...existing] : [...existing, entry],
    );
    this.arm(entry.id, entry.durationMs);
  }

  private arm(id: number, remaining: number): void {
    if (remaining <= 0) {
      return;
    }
    this.remaining.set(id, remaining);
    // A toast can be armed with no user event anywhere near it — promoteFromQueue runs from a
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

  /** A toast holding the pointer or the keyboard is being read or acted on, so its
   *  clock stops. Without this the only control for an `action` can be destroyed
   *  while the user is reaching for it — and the region sits last in tab order, so
   *  reaching it takes longer than the default five seconds on any real page. */
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

  /** Replace fields of an already-visible or queued toast in place.
   *
   *  Patching `durationMs` restarts the clock, and for a QUEUED toast it only takes
   *  effect on promotion — which is the whole point: `promise()` patches a loading
   *  toast (duration 0) into a settled one, and if that toast is still behind the cap
   *  its new duration must not start burning down while it is invisible. */
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
    this.clearCountdown(id);
    const queueIndex = this.pendingQueue.findIndex((entry) => entry.id === id);
    if (queueIndex !== -1) {
      this.pendingQueue.splice(queueIndex, 1);

      return;
    }
    if (this.leaving().has(id)) {
      return;
    }
    this.leaving.update((set) => new Set(set).add(id));
    setTimeout(() => {
      this.visibleEntries.update((existing) =>
        existing.filter((entry) => entry.id !== id),
      );
      this.leaving.update((set) => {
        const next = new Set(set);
        next.delete(id);

        return next;
      });
      this.promoteFromQueue();
    }, LEAVE_DURATION_MS);
  }

  protected isLeaving(id: number): boolean {
    return this.leaving().has(id);
  }

  clear(): void {
    this.timers.forEach((timer) => window.clearTimeout(timer));
    this.timers.clear();
    this.remaining.clear();
    this.startedAt.clear();
    this.visibleEntries.set([]);
    this.leaving.set(new Set());
    this.pendingQueue.length = 0;
  }

  private promoteFromQueue(): void {
    if (!this.pendingQueue.length) {
      return;
    }
    const limit = this.maxVisible();
    if (limit > 0 && this.visibleEntries().length >= limit) {
      return;
    }
    this.show(this.pendingQueue.shift()!);
  }
}
