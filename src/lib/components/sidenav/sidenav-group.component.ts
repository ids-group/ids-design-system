import { Component, ViewEncapsulation, input, model } from '@angular/core';
import { IconComponent } from '../../icons/icon.component';
import type { IconName } from '../../icons/icons.data';

@Component({
  selector: 'ds-sidenav-group',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './sidenav-group.component.html',
  styleUrl: './sidenav-group.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class SidenavGroupComponent {
  readonly label = input<string>('');
  // Optional group icon (DS IconName). Consumers without a DS icon can project
  // custom content via the `[icon]` slot.
  readonly icon = input<IconName | null>(null);
  // When true the label/icon row becomes a clickable header that expands /
  // collapses the projected children with a caret rotation.
  readonly expandable = input<boolean>(false);
  // Two-way bindable open state. Defaults to open (true) so a non-expandable
  // group always shows its items.
  readonly expanded = model<boolean>(true);

  protected toggle(): void {
    if (!this.expandable()) {
      return;
    }
    this.expanded.update((value) => !value);
  }
}
