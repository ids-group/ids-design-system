import { dsAriaCurrent } from '@ids-group-ltd/ids-design-system/components';
import type {
  DsAriaCurrent,
  DsLinkModifiers,
  DsRouterLink,
} from '@ids-group-ltd/ids-design-system/components';
import {
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IconComponent } from '@ids-group-ltd/ids-design-system/icons';
import { DS_INTL } from '@ids-group-ltd/ids-design-system/core';
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
  protected readonly intl = inject(DS_INTL);

  /** Group heading text. */
  readonly label = input<string>('');
  /** Optional group icon; omit to project custom content via the `[icon]` slot instead. */
  readonly icon = input<IconName | null>(null);
  /** When true, the label/icon row becomes a clickable header that expands/collapses the group. */
  readonly expandable = input(false, { transform: booleanAttribute });
  /** Makes the group a destination as well as a container: the header navigates here and the
   *  caret becomes a separate control. Unset, the whole header only expands. */
  readonly routerLink = input<DsRouterLink>(null);
  /** Overrides what the group header announces when it is itself a destination. Unset, the page
   *  the reader is on announces `page` and the section containing it announces `true`. */
  readonly ariaCurrent = input<DsAriaCurrent | null | undefined>(undefined);
  /** Two-way bindable open state; defaults open so a non-expandable group always shows its items. */
  readonly expanded = model<boolean>(true);

  /** A header that navigates hands the caret its own button; one that does not is the button. */
  private readonly noModifiers = computed<DsLinkModifiers>(() => ({}));
  protected readonly ariaCurrentResolved = dsAriaCurrent(
    this.routerLink,
    this.noModifiers,
    this.ariaCurrent,
  );

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
