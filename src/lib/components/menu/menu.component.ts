import {
  Component,
  ViewEncapsulation,
  contentChildren,
  effect,
  signal,
} from '@angular/core';
import { MenuItemComponent } from './menu-item.component';
import { isTextEntryTarget } from '@ids-group-ltd/ids-design-system/core';

@Component({
  selector: 'ds-menu',
  standalone: true,
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  // Keyboard nav bubbles up from the focused menuitem button. Hand-rolled roving
  // (mirrors ds-tabs) — kept signal-based and consistent with the rest of the DS.
  // data-focus: the panel clips (`overflow: hidden` rounds the flush rows), so every
  // focus ring inside it has to be drawn inward. This is the local switch _focus.scss
  // documents for exactly that, set on the clipping element itself.
  host: { '(keydown)': 'onKeydown($event)', 'data-focus': 'inset' },
})
export class MenuComponent {
  private readonly items = contentChildren(MenuItemComponent);
  /** Index of the roving-focus item — the single item reachable via Tab. */
  private readonly activeIndex = signal(0);

  constructor() {
    // Roving tabindex: exactly one item is tabbable (0), the rest -1. Disabled
    // items stay in the order (APG menu practice) — they're focusable so a
    // tooltip explaining why can be read; activation is blocked in menu-item.
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

  protected onKeydown(event: KeyboardEvent): void {
    const items = this.items();
    // A projected search/filter field owns its typing — type-ahead below would
    // eat every character it receives.
    if (!items.length || isTextEntryTarget(event)) {
      return;
    }
    const count = items.length;
    const focused = items.findIndex((item) =>
      item.contains(event.target as Node | null),
    );
    const from = focused >= 0 ? focused : this.activeIndex();

    // Single-character type-ahead: jump to the next item whose label starts
    // with the typed character.
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
    // Disabled items are NOT skipped — they stay reachable (APG); onClick blocks
    // their activation.
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
