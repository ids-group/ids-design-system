import {
  Component,
  ViewEncapsulation,
  booleanAttribute,
  input,
  model,
} from '@angular/core';
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
  /** Group heading text. */
  readonly label = input<string>('');
  /** Optional group icon; omit to project custom content via the `[icon]` slot instead. */
  readonly icon = input<IconName | null>(null);
  /** When true, the label/icon row becomes a clickable header that expands/collapses the group. */
  readonly expandable = input(false, { transform: booleanAttribute });
  /** Two-way bindable open state; defaults open so a non-expandable group always shows its items. */
  readonly expanded = model<boolean>(true);

  protected toggle(): void {
    if (!this.expandable()) {
      return;
    }
    this.expanded.update((value) => !value);
  }
}
