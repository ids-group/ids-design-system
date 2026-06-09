import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  ElementRef,
  ViewEncapsulation,
  computed,
  contentChildren,
  inject,
  input,
  model,
} from '@angular/core';
import { IconComponent } from '../../icons/icon.component';
import { TabComponent } from './tab.component';
import type { TabsVariant } from './tabs.types';

let nextId = 0;

@Component({
  selector: 'ds-tabs',
  standalone: true,
  imports: [NgTemplateOutlet, IconComponent],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class TabsComponent {
  readonly selectedIndex = model<number>(0);
  readonly variant = input<TabsVariant>('line');

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly uid = `ds-tabs-${++nextId}`;

  protected readonly tabs = contentChildren(TabComponent);

  protected tabId(index: number): string {
    return `${this.uid}-tab-${index}`;
  }
  protected panelId(index: number): string {
    return `${this.uid}-panel-${index}`;
  }

  protected readonly tabsClasses = computed(() =>
    this.variant() === 'pills' ? 'tabs pills' : 'tabs',
  );

  protected readonly selectedTemplate = computed(() => {
    const idx = this.selectedIndex();
    const list = this.tabs();
    return list[idx]?.content() ?? null;
  });

  protected tabClasses(index: number, disabled: boolean): string {
    const parts = ['tab'];
    if (index === this.selectedIndex()) parts.push('active');
    if (disabled) parts.push('disabled');
    return parts.join(' ');
  }

  protected select(index: number, disabled: boolean): void {
    if (disabled) return;
    this.selectedIndex.set(index);
  }

  /** Roving keyboard navigation across the tablist (APG automatic activation). */
  protected onKeydown(event: KeyboardEvent, index: number): void {
    const count = this.tabs().length;
    if (!count) return;
    const forward = event.key === 'ArrowRight' || event.key === 'ArrowDown';
    const backward = event.key === 'ArrowLeft' || event.key === 'ArrowUp';
    let next: number;
    if (forward) next = (index + 1) % count;
    else if (backward) next = (index - 1 + count) % count;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = count - 1;
    else return;
    event.preventDefault();
    // Skip disabled tabs in the travel direction.
    const step = backward || event.key === 'End' ? -1 : 1;
    let guard = 0;
    while (this.tabs()[next]?.disabled() && guard < count) {
      next = (next + step + count) % count;
      guard++;
    }
    this.select(next, this.tabs()[next]?.disabled() ?? false);
    setTimeout(() => {
      const el = this.host.nativeElement.querySelector(
        `#${this.tabId(next)}`,
      ) as HTMLElement | null;
      el?.focus();
    });
  }
}
