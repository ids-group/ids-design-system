import {
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { IconComponent } from '@ids-group-ltd/ids-design-system/icons';
import { DS_INTL, devWarn } from '@ids-group-ltd/ids-design-system/core';
import type { IconName } from '@ids-group-ltd/ids-design-system/core';
import { MenuComponent } from '@ids-group-ltd/ids-design-system/components/menu';
import { MenuItemComponent } from '@ids-group-ltd/ids-design-system/components/menu';
import { PopoverComponent } from '@ids-group-ltd/ids-design-system/components/popover';
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
  private readonly intl = inject(DS_INTL);

  constructor() {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      devWarn(() =>
        this.menuItems().length
          ? null
          : '[ds-split-button] has no `menuItems`, so the chevron is disabled — a chevron that opens' +
            ' nothing reads as a broken control. Pass the items, or use `ds-button` for a single' +
            ' action.',
      );
    }
  }

  /** Label text on the main button. */
  readonly label = input<string>('');
  /** Visual style — primary (solid) or outline. */
  readonly variant = input<SplitButtonVariant>('primary');
  /** Icon shown on the main button, before the label. */
  readonly icon = input<IconName | null>(null);
  /** Disables both the main button and the dropdown trigger. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Items listed in the dropdown menu. Empty disables the chevron. */
  readonly menuItems = input<readonly SplitButtonItem[]>([]);
  /** Accessible name for the dropdown trigger. Unset falls back to
   *  `DS_INTL.splitButton.menuLabel`. */
  readonly menuLabel = input<string | null>(null);
  protected readonly menuLabelResolved = computed(
    () => this.menuLabel() ?? this.intl().splitButton.menuLabel,
  );
  /** Fires when the main button (not the dropdown trigger) is clicked. */
  readonly pressed = output<MouseEvent>();
  /** The menu half only — a press on the main button is `pressed`, never this. */
  readonly itemSelected = output<SplitButtonItem>();

  protected onItemSelect(item: SplitButtonItem): void {
    if (item.disabled) {
      return;
    }
    // ds-menu-item closes the popover itself via the injected DsOverlayCloseRef.
    this.itemSelected.emit(item);
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
