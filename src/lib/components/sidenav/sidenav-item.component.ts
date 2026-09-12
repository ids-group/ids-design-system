import { dsAriaCurrent } from '@ids-group-ltd/ids-design-system/components';
import type {
  DsAriaCurrent,
  DsLinkModifiers,
  DsRouterLink,
} from '@ids-group-ltd/ids-design-system/components';
import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IconComponent } from '@ids-group-ltd/ids-design-system/icons';
import { TooltipDirective } from '@ids-group-ltd/ids-design-system/components/tooltip';
import type { IconName } from '@ids-group-ltd/ids-design-system/core';
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
  readonly routerLink = input<DsRouterLink>(null);
  /** Applies the active style; also drives `aria-current` when not using `routerLink`. */
  readonly active = input(false, { transform: booleanAttribute });
  /** Overrides what an active item announces. Unset, an exact match announces `page` and a prefix
   *  match announces `true` — in a sidenav the prefix case is "you are in this section", which is
   *  exactly what `true` means. */
  readonly ariaCurrent = input<DsAriaCurrent | null | undefined>(undefined);
  /** Numeric count shown at the end of the item. */
  readonly badge = input<number | null>(null);
  /** Shows an alert dot alongside the badge. */
  readonly hasAlert = input(false, { transform: booleanAttribute });
  /** Disables the item — non-navigable and styled as inactive. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Emitted on click, carrying the `MouseEvent`. On an `href` item,
   *  `preventDefault()` intercepts navigation (e.g. a docs sidebar driving
   *  scroll-spy); a `routerLink` item navigates regardless — Angular's
   *  RouterLink ignores `defaultPrevented` — so treat it as a click hook there. */
  readonly activate = output<MouseEvent>();

  /** Whether THIS item draws its edge marker when active. Unset follows the parent
   *  `ds-sidenav`, then on — the same "null means not deciding" reading as the rest
   *  of the library, so a sidenav-wide `[rail]="false"` is not fought per item. */
  readonly rail = input<boolean | null, unknown>(null, {
    transform: (value) => (value == null ? null : booleanAttribute(value)),
  });

  private readonly sidenav = inject(SIDENAV, { optional: true });

  private readonly noModifiers = computed<DsLinkModifiers>(() => ({}));
  protected readonly ariaCurrentResolved = dsAriaCurrent(
    this.routerLink,
    this.noModifiers,
    this.ariaCurrent,
  );

  protected readonly railResolved = computed(
    () => this.rail() ?? this.sidenav?.rail() ?? true,
  );

  protected onActivate(event: MouseEvent): void {
    if (this.disabled()) {
      return;
    }
    this.activate.emit(event);
  }

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
    // The routerLink variant gets `active` from routerLinkActive, not from here,
    // so the rail opt-out has to be a class of its own rather than folded in.
    if (!this.railResolved()) {
      parts.push('no-rail');
    }
    if (this.disabled()) {
      parts.push('disabled');
    }

    return parts.join(' ');
  });
}
