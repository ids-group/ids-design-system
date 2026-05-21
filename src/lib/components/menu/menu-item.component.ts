import { Component, ViewEncapsulation, input, output } from '@angular/core';
import { IconComponent } from '../../icons/icon.component';
import type { IconName } from '../../icons/icons.data';

@Component({
  selector: 'ds-menu-item',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './menu-item.component.html',
  styleUrl: './menu-item.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class MenuItemComponent {
  readonly icon = input<IconName | null>(null);
  readonly disabled = input<boolean>(false);
  readonly danger = input<boolean>(false);
  readonly pressed = output<MouseEvent>();

  protected onClick(event: MouseEvent): void {
    if (this.disabled()) return;
    this.pressed.emit(event);
  }
}
