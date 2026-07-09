import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IconComponent } from '../../icons/icon.component';
import { TooltipDirective } from '../tooltip/tooltip.directive';
import type { IconName } from '../../icons/icons.data';
import { SIDENAV } from './sidenav.token';

@Component({
  selector: 'ds-sidenav-item',
  standalone: true,
  imports: [
    IconComponent,
    RouterLink,
    RouterLinkActive,
    NgTemplateOutlet,
    TooltipDirective,
  ],
  templateUrl: './sidenav-item.component.html',
  styleUrl: './sidenav-item.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class SidenavItemComponent {
  // `icon` is optional — consumers without a DS IconName can project a custom
  // icon via the `[icon]` content slot. When both are supplied, the input
  // wins (legacy DS-consumer behaviour).
  readonly icon = input<IconName | null>(null);
  readonly label = input.required<string>();
  readonly href = input<string>('');
  // Angular RouterLink accepts both string and array forms — mirror that so
  // consumers can pass dynamic segments (e.g. `['/programs', id, 'overview']`).
  readonly routerLink = input<string | readonly unknown[] | null>(null);
  readonly active = input(false, { transform: booleanAttribute });
  readonly badge = input<number | null>(null);
  readonly hasAlert = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });

  private readonly sidenav = inject(SIDENAV, { optional: true });

  /** Tooltip text shown when collapsed; empty string suppresses the tooltip when expanded. */
  protected readonly collapsedTooltip = computed(() =>
    this.sidenav?.collapsed() ? this.label() : '',
  );

  // Only name the link via aria-label when collapsed (icon-only, the .item-label
  // is display:none). Expanded, the visible label names it and any aria-label
  // would override it — suppressing the badge count / alert dot from the name.
  protected readonly collapsedAriaLabel = computed(() =>
    this.sidenav?.collapsed() ? this.label() : null,
  );

  protected readonly linkClasses = computed(() => {
    const parts = ['item'];
    if (this.active()) {
      parts.push('active');
    }
    if (this.disabled()) {
      parts.push('disabled');
    }

    return parts.join(' ');
  });
}
