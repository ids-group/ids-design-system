import {
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  model,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IconComponent } from '@ids-group-ltd/ids-design-system/icons';
import type { IconName } from '@ids-group-ltd/ids-design-system/core';

@Component({
  selector: 'ds-sidenav-group',
  standalone: true,
  imports: [IconComponent, NgTemplateOutlet, RouterLink, RouterLinkActive],
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
  /** Makes the group a destination of its own as well as a container: the header navigates here
   *  and the caret becomes a separate control, because one control cannot both go somewhere and
   *  stay to open something. Unset (the default) the whole header only expands — a heading that
   *  navigates closes the page being read the moment someone reaches for the group beneath it. */
  readonly routerLink = input<string | readonly unknown[] | null>(null);
  /** Two-way bindable open state; defaults open so a non-expandable group always shows its items. */
  readonly expanded = model<boolean>(true);

  /** A header that navigates hands the caret its own button; one that does not is the button. */
  protected readonly headerNavigates = computed(
    () => this.expandable() && this.routerLink() !== null,
  );

  protected toggle(): void {
    if (!this.expandable()) {
      return;
    }
    this.expanded.update((value) => !value);
  }
}
