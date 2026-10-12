import {
  Component,
  ElementRef,
  ViewEncapsulation,
  computed,
  contentChildren,
  effect,
  inject,
  signal,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { MenuItemComponent } from './menu-item.component';
import { MenuAim } from './menu-aim';
import { isTextEntryTarget } from '@ids-group-ltd/ids-design-system/core';

@Component({
  selector: 'ds-menu',
  standalone: true,
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  providers: [
    { provide: MenuAim, useFactory: () => new MenuAim(inject(DOCUMENT)) },
  ],
  // data-focus="inset": the panel clips, so an outward ring is lost.
  host: {
    '(keydown)': 'onKeydown($event)',
    '(focusin)': 'onFocusIn($event)',
    '(focusout)': 'onFocusOut($event)',
    'data-focus': 'inset',
    '[class.has-icons]': 'anyIcon()',
  },
})
export class MenuComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly items = contentChildren(MenuItemComponent);

  /** One item with an icon makes every item reserve the slot, so the labels share one axis. */
  protected readonly anyIcon = computed(() =>
    this.items().some((item) => item.icon() !== null),
  );
  /** Index of the roving-focus item, the single one reachable via Tab. */
  private readonly activeIndex = signal(0);

  constructor() {
    // Disabled items stay in the roving order (APG) so their tooltip is reachable.
    effect(() => {
      const items = this.items();
      if (!items.length) {
        return;
      }
      let index = this.activeIndex();
      if (index >= items.length) {
        index = 0;
      }
      items.forEach((item, i) => item.tabbable.set(i === index));
    });
  }

  protected onFocusIn(event: FocusEvent): void {
    const index = this.items().findIndex((item) =>
      item.contains(event.target as Node | null),
    );
    if (index >= 0) {
      this.activeIndex.set(index);
    }
  }

  // APG: a menu always opens at its first item, so the roving stop goes back there once focus leaves.
  protected onFocusOut(event: FocusEvent): void {
    if (!this.host.nativeElement.contains(event.relatedTarget as Node | null)) {
      this.activeIndex.set(0);
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    const items = this.items();
    // A projected search field owns its typing; type-ahead would eat it.
    if (!items.length || isTextEntryTarget(event)) {
      return;
    }
    const count = items.length;
    const focused = items.findIndex((item) =>
      item.contains(event.target as Node | null),
    );
    const from = focused >= 0 ? focused : this.activeIndex();

    if (
      event.key.length === 1 &&
      /\S/.test(event.key) &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey
    ) {
      this.typeAhead(event.key, from, items);
      event.preventDefault();

      return;
    }

    let next: number;
    switch (event.key) {
      case 'ArrowDown':
        next = (from + 1) % count;
        break;
      case 'ArrowUp':
        next = (from - 1 + count) % count;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = count - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    this.focusItem(next);
  }

  private typeAhead(
    char: string,
    from: number,
    items: readonly MenuItemComponent[],
  ): void {
    const needle = char.toLowerCase();
    const count = items.length;
    for (let offset = 1; offset <= count; offset++) {
      const i = (from + offset) % count;
      const item = items[i];
      if (item.label().toLowerCase().startsWith(needle)) {
        this.focusItem(i);

        return;
      }
    }
  }

  private focusItem(index: number): void {
    this.activeIndex.set(index);
    this.items()[index].focus();
  }
}
