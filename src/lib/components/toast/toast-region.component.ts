import { Component, ViewEncapsulation, signal } from '@angular/core';
import { ToastComponent } from './toast.component';
import type { ToastEntry } from './toast.types';

// Must match the leave transition on :host in toast.component.scss (--dur-base).
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
  protected readonly entries = signal<readonly ToastEntry[]>([]);
  protected readonly leaving = signal<ReadonlySet<number>>(new Set());

  add(entry: ToastEntry): void {
    this.entries.update((existing) => [...existing, entry]);
  }

  remove(id: number): void {
    if (this.leaving().has(id)) return;
    this.leaving.update((set) => new Set(set).add(id));
    setTimeout(() => {
      this.entries.update((existing) => existing.filter((entry) => entry.id !== id));
      this.leaving.update((set) => {
        const next = new Set(set);
        next.delete(id);
        return next;
      });
    }, LEAVE_DURATION_MS);
  }

  protected isLeaving(id: number): boolean {
    return this.leaving().has(id);
  }

  clear(): void {
    this.entries.set([]);
    this.leaving.set(new Set());
  }
}
