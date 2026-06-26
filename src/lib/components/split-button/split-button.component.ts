import {
  Component,
  ViewEncapsulation,
  booleanAttribute,
  input,
  output,
} from '@angular/core';
import { IconComponent } from '../../icons/icon.component';
import type { IconName } from '../../icons/icons.data';
import { MenuComponent } from '../menu/menu.component';
import { MenuItemComponent } from '../menu/menu-item.component';
import { PopoverComponent } from '../popover/popover.component';
import type { SplitButtonItem, SplitButtonVariant } from './split-button.types';

@Component({
  selector: 'ds-split-button',
  standalone: true,
  imports: [IconComponent, MenuComponent, MenuItemComponent, PopoverComponent],
  templateUrl: './split-button.component.html',
  styleUrl: './split-button.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    '[class.primary]': "variant() === 'primary'",
    '[class.outline]': "variant() === 'outline'",
  },
})
export class SplitButtonComponent {
  readonly label = input<string>('');
  readonly variant = input<SplitButtonVariant>('primary');
  readonly icon = input<IconName | null>(null);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly menuItems = input<readonly SplitButtonItem[]>([]);
  /** Accessible name for the dropdown trigger. */
  readonly menuLabel = input<string>('More actions');
  readonly pressed = output<MouseEvent>();
  readonly itemSelect = output<SplitButtonItem>();

  protected onItemSelect(item: SplitButtonItem): void {
    if (item.disabled) {
      return;
    }
    // ds-menu-item closes the popover itself via the injected DsOverlayCloseRef.
    this.itemSelect.emit(item);
  }

  protected onTriggerKeydown(
    event: KeyboardEvent,
    popover: PopoverComponent,
    trigger: HTMLElement,
  ): void {
    if (event.key === 'ArrowDown' && !popover.opened()) {
      event.preventDefault();
      popover.toggle(trigger);
    }
  }
}
