import {
  Component,
  ElementRef,
  ViewEncapsulation,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { IconComponent } from '../../icons/icon.component';
import type { IconName } from '../../icons/icons.data';
import { DsOverlayCloseRef } from '../../overlay/ds-overlay-close-ref';

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
  // The containing overlay (e.g. popover), if any — selecting an item closes it.
  // Optional, so menu-items also work standalone.
  private readonly closeRef = inject(DsOverlayCloseRef, { optional: true });
  private readonly button =
    viewChild.required<ElementRef<HTMLButtonElement>>('button');

  readonly icon = input<IconName | null>(null);
  readonly disabled = input<boolean>(false);
  readonly danger = input<boolean>(false);
  readonly pressed = output<MouseEvent>();

  /** Roving tabindex, owned by ds-menu — exactly one item is tabbable (0), the
   *  rest -1. Defaults true so a standalone item (outside ds-menu) stays
   *  reachable. */
  readonly tabbable = signal(true);

  /** Move keyboard focus to this item's control. */
  focus(): void {
    this.button().nativeElement.focus();
  }

  /** Whether `node` lives inside this item's control (used by ds-menu to find
   *  the currently focused item during keyboard nav). */
  contains(node: Node | null): boolean {
    return !!node && this.button().nativeElement.contains(node);
  }

  /** Visible label text — used by ds-menu's type-ahead. */
  label(): string {
    return this.button().nativeElement.textContent?.trim() ?? '';
  }

  protected onClick(event: MouseEvent): void {
    if (this.disabled()) {
      return;
    }
    this.pressed.emit(event);
    this.closeRef?.close();
  }
}
