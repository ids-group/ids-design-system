import { NgTemplateOutlet } from '@angular/common';
import { Component, ViewEncapsulation, computed, contentChildren, input, model } from '@angular/core';
import { IconComponent } from '../../icons/icon.component';
import { TabComponent } from './tab.component';
import type { TabsVariant } from './tabs.types';

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

  protected readonly tabs = contentChildren(TabComponent);

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
}
