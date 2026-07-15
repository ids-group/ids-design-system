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
  /** Icon shown before the label; omit to project a custom icon via the `[icon]` slot instead. */
  readonly icon = input<IconName | null>(null);
  /** Visible link text; also used as the tooltip/aria-label when the rail is collapsed. */
  readonly label = input.required<string>();
  /** Plain `href` target, used when `routerLink` is not set. */
  readonly href = input<string>('');
  /** Angular `RouterLink` target — string or array form for dynamic segments. */
  readonly routerLink = input<string | readonly unknown[] | null>(null);
  /** Applies the active style; also drives `aria-current` when not using `routerLink`. */
  readonly active = input(false, { transform: booleanAttribute });
  /** Numeric count shown at the end of the item. */
  readonly badge = input<number | null>(null);
  /** Shows an alert dot alongside the badge. */
  readonly hasAlert = input(false, { transform: booleanAttribute });
  /** Disables the item — non-navigable and styled as inactive. */
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
