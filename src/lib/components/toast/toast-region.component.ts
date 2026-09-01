import { Component, ViewEncapsulation, inject, input, signal } from '@angular/core';
import { DS_TOAST_POSITION, DS_TOAST_POSITION_DEFAULT } from './toast.config';
import { ToastComponent } from './toast.component';
import type { ToastEntry } from './toast.types';

// Must match the leave transition on :host in toast.component.scss (--duration-base).
const LEAVE_DURATION_MS = 180;

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
    this.startCountdown(entry);
  }

  private startCountdown(entry: ToastEntry): void {
    if (entry.durationMs <= 0) {
      return;
    }
    this.timers.set(
      entry.id,
      window.setTimeout(() => this.remove(entry.id), entry.durationMs),
    );
  }

  private clearCountdown(id: number): void {
    const timer = this.timers.get(id);
    if (timer !== undefined) {
      window.clearTimeout(timer);
      this.timers.delete(id);
    }
  }

  /** Replace fields of an already-visible or queued toast in place. */
  update(
    id: number,
    patch: Partial<
      Pick<ToastEntry, 'body' | 'title' | 'variant' | 'dismissible' | 'action'>
    >,
  ): void {
    const inVisible = this.visibleEntries().some((entry) => entry.id === id);
    if (inVisible) {
      this.visibleEntries.update((entries) =>
        entries.map((entry) =>
          entry.id === id ? { ...entry, ...patch } : entry,
        ),
      );

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
