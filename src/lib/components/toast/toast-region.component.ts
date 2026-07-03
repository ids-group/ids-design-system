import { Component, ViewEncapsulation, input, signal } from '@angular/core';
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

  add(entry: ToastEntry): void {
    const limit = this.maxVisible();
    if (limit > 0 && this.visibleEntries().length >= limit) {
      this.pendingQueue.push(entry);
    } else {
      this.visibleEntries.update((existing) => [...existing, entry]);
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
    const next = this.pendingQueue.shift()!;
    this.visibleEntries.update((existing) => [...existing, next]);
  }
}
