import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChildren,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { IconComponent } from '../../icons/icon.component';
import { TabComponent } from './tab.component';
import type { TabsOrientation, TabsVariant } from './tabs.types';

let nextId = 0;

@Component({
  selector: 'ds-tabs',
  standalone: true,
  imports: [NgTemplateOutlet, IconComponent],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    '[class.vertical-host]': "orientation() === 'vertical'",
  },
})
export class TabsComponent {
  readonly selectedIndex = model<number>(0);
  readonly variant = input<TabsVariant>('line');

  /** When true, a tab's content is instantiated only on first activation and
      kept alive thereafter. When false (default), all panels render eagerly. */
  readonly lazy = input(false, { transform: booleanAttribute });

  /** When true, the tab strip scrolls horizontally instead of wrapping. The
      active tab is scrolled into view on selection. */
  readonly scrollable = input(false, { transform: booleanAttribute });

  /** When true, each tab shows a close button. Clicking it emits tabClose with
      the tab's value (or label as fallback) and does not switch to that tab. */
  readonly closable = input(false, { transform: booleanAttribute });

  /** Controls whether the tab list and panel are stacked horizontally (default)
      or the tab list runs vertically beside the panel. */
  readonly orientation = input<TabsOrientation>('horizontal');

  /** Emitted when a close button is clicked. Carries the tab's value input, or
      its label when value is not set. The host is responsible for removing the
      tab from its list. */
  readonly tabClose = output<string>();

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly uid = `ds-tabs-${++nextId}`;

  protected readonly tabs = contentChildren(TabComponent);

  /** Tracks which tab indices have ever been activated (for lazy rendering). */
  private readonly activatedIndices = signal<ReadonlySet<number>>(new Set([0]));

  protected tabId(index: number): string {
    return `${this.uid}-tab-${index}`;
  }

  protected panelId(index: number): string {
    return `${this.uid}-panel-${index}`;
  }

  protected readonly tablistClasses = computed(() => {
    const parts = ['tabs'];
    if (this.variant() === 'pills') {
      parts.push('pills');
    }
    if (this.scrollable()) {
      parts.push('scrollable');
    }
    if (this.orientation() === 'vertical') {
      parts.push('vertical');
    }

    return parts.join(' ');
  });

  /** Whether the panel for a given index should be rendered (lazy gate). */
  protected isPanelVisible(index: number): boolean {
    if (!this.lazy()) {
      return index === this.selectedIndex();
    }

    return this.activatedIndices().has(index);
  }

  protected tabClasses(index: number, disabled: boolean): string {
    const parts = ['tab'];
    if (index === this.selectedIndex()) {
      parts.push('active');
    }
    if (disabled) {
      parts.push('disabled');
    }

    return parts.join(' ');
  }

  protected select(index: number, disabled: boolean): void {
    if (disabled) {
      return;
    }
    this.selectedIndex.set(index);
    if (this.lazy()) {
      this.activatedIndices.update((previous) => {
        if (previous.has(index)) {
          return previous;
        }

        return new Set([...previous, index]);
      });
    }
    if (this.scrollable()) {
      setTimeout(() => {
        const button = this.host.nativeElement.querySelector(
          `#${this.tabId(index)}`,
        ) as HTMLElement | null;
        button?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      });
    }
  }

  protected onCloseClick(event: MouseEvent, index: number): void {
    event.stopPropagation();
    const tab = this.tabs()[index];
    if (!tab) {
      return;
    }
    this.tabClose.emit(tab.value() ?? tab.label());
  }

  /** Roving keyboard navigation across the tablist (APG automatic activation).
      Arrow axis follows orientation: Left/Right for horizontal, Up/Down for vertical. */
  protected onKeydown(event: KeyboardEvent, index: number): void {
    const count = this.tabs().length;
    if (!count) {
      return;
    }
    const isVertical = this.orientation() === 'vertical';
    const forwardKey = isVertical ? 'ArrowDown' : 'ArrowRight';
    const backwardKey = isVertical ? 'ArrowUp' : 'ArrowLeft';
    // Keep both axes active so vertical also responds to Left/Right and
    // horizontal also responds to Up/Down for cross-axis discoverability,
    // matching the ARIA APG recommendation for roving tabindex.
    const forward =
      event.key === forwardKey ||
      (!isVertical && event.key === 'ArrowDown') ||
      (isVertical && event.key === 'ArrowRight');
    const backward =
      event.key === backwardKey ||
      (!isVertical && event.key === 'ArrowUp') ||
      (isVertical && event.key === 'ArrowLeft');

    let next: number;
    if (forward) {
      next = (index + 1) % count;
    } else if (backward) {
      next = (index - 1 + count) % count;
    } else if (event.key === 'Home') {
      next = 0;
    } else if (event.key === 'End') {
      next = count - 1;
    } else {
      return;
    }
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
      const element = this.host.nativeElement.querySelector(
        `#${this.tabId(next)}`,
      ) as HTMLElement | null;
      element?.focus();
    });
  }
}
