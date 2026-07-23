import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { Router } from '@angular/router';
import { IconComponent } from '../../icons/icon.component';
import { AvatarComponent } from '../avatar/avatar.component';
import { MenuComponent } from '../menu/menu.component';
import { MenuItemComponent } from '../menu/menu-item.component';
import { PopoverComponent } from '../popover/popover.component';
import type {
  SidenavAlertItem,
  SidenavSearchProvider,
  SidenavSearchResult,
} from './sidenav-footer.types';

interface SearchGroup {
  group: string;
  items: SidenavSearchResult[];
}

/**
 * Bottom block of the app sidenav: quick actions (Search / Alerts / Collapse)
 * and the signed-in user with an account menu (popover). Pinned to the bottom
 * via `margin-top: auto`. Collapse is driven by the parent (emits
 * `collapseToggled`, reflects `collapsed`); sign-out is delegated to the parent
 * (emits `signOutSelected`) so the layout keeps a single logout path.
 */
@Component({
  selector: 'ds-sidenav-footer',
  standalone: true,
  imports: [
    IconComponent,
    AvatarComponent,
    PopoverComponent,
    MenuComponent,
    MenuItemComponent,
  ],
  templateUrl: './sidenav-footer.component.html',
  styleUrl: './sidenav-footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: { '[class.collapsed]': 'collapsed()' },
})
export class SidenavFooterComponent {
  private readonly router = inject(Router);

  readonly userName = input('');
  readonly userRole = input('');
  /** Show the unread dot on the Alerts row. */
  readonly alerts = input(false);
  readonly collapsed = input(false);
  /** When set, the Search row opens a live results popover; unset keeps it inert. */
  readonly searchProvider = input<SidenavSearchProvider | null>(null);
  /** When non-null (even empty) the Alerts row opens a list popover; null keeps it inert. */
  readonly alertItems = input<readonly SidenavAlertItem[] | null>(null);
  /** Route for the account menu's "Your profile"; empty = the item is a no-op. */
  readonly profileRoute = input('');

  readonly collapseToggled = output<void>();
  /** Emitted when the Alerts popover is opened, so the layout can mark-all-read. */
  readonly alertsOpened = output<void>();
  /** Emitted when "Sign out" is chosen; the layout owns the actual logout flow. */
  readonly signOutSelected = output<void>();

  protected readonly query = signal('');

  protected readonly initials = computed(() => {
    const parts = this.userName().trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
      return '';
    }

    return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
  });

  /** Run the provider for the current query, grouped by `group` for display. */
  protected searchGroups(provider: SidenavSearchProvider): SearchGroup[] {
    const query = this.query().trim();
    if (!query) {
      return [];
    }

    const groups: SearchGroup[] = [];
    for (const result of provider(query)) {
      let group = groups.find((candidate) => candidate.group === result.group);
      if (!group) {
        group = { group: result.group, items: [] };
        groups.push(group);
      }

      group.items.push(result);
    }

    return groups;
  }

  protected goResult(result: SidenavSearchResult): void {
    this.query.set('');
    void this.router.navigate(
      [result.route],
      result.queryParams ? { queryParams: result.queryParams } : {},
    );
  }

  /** Activate the top result (Enter key). Returns whether a result was opened. */
  protected goFirst(provider: SidenavSearchProvider): boolean {
    const first = this.searchGroups(provider)[0]?.items[0];
    if (!first) {
      return false;
    }

    this.goResult(first);

    return true;
  }

  protected goAlert(alert: SidenavAlertItem): void {
    if (alert.route) {
      void this.router.navigate([alert.route]);
    }
  }

  protected goProfile(): void {
    if (this.profileRoute()) {
      void this.router.navigate([this.profileRoute()]);
    }
  }
}
