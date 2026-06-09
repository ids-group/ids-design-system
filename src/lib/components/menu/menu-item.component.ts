import { Component, ViewEncapsulation, inject, input, output } from '@angular/core';
import { IconComponent } from '../../icons/icon.component';
import type { IconName } from '../../icons/icons.data';
import { PopoverRef } from '../popover/popover-ref';

@Component({
  selector: 'ds-menu-item',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './menu-item.component.html',
  styleUrl: './menu-item.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  // The host sits between the role="menu" <ul> and the role="menuitem" button,
  // so mark it presentational to keep the menu→menuitem ownership intact.
  host: { role: 'none' },
})
export class MenuItemComponent {
  // A containing popover, if any — selecting an item dismisses it (a menu pick
  // closes the menu). Optional, so menu-items also work outside a popover.
  private readonly popoverRef = inject(PopoverRef, { optional: true });

  readonly icon = input<IconName | null>(null);
  readonly disabled = input<boolean>(false);
  readonly danger = input<boolean>(false);
  readonly pressed = output<MouseEvent>();

  protected onClick(event: MouseEvent): void {
    if (this.disabled()) return;
    this.pressed.emit(event);
    this.popoverRef?.close();
  }
}
