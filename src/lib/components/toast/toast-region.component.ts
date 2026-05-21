import { Component, ViewEncapsulation, signal } from '@angular/core';
import { ToastComponent } from './toast.component';
import type { ToastEntry } from './toast.types';

@Component({
  selector: 'ds-toast-region',
  standalone: true,
  imports: [ToastComponent],
  templateUrl: './toast-region.component.html',
  styleUrl: './toast-region.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class ToastRegionComponent {
  protected readonly entries = signal<readonly ToastEntry[]>([]);

  add(entry: ToastEntry): void {
    this.entries.update((existing) => [...existing, entry]);
  }

  remove(id: number): void {
    this.entries.update((existing) => existing.filter((entry) => entry.id !== id));
  }

  clear(): void {
    this.entries.set([]);
  }
}
