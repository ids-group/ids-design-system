import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  CardComponent,
  TabComponent,
  TabsComponent,
} from '@ids-group-ltd/ids-design-system';
import { AuthStore } from '@app/common';
import {
  parseTabFromQueryParams,
  setupTabResetOnNavigation,
} from '../../core/store/helpers';

const DASHBOARD_TABS = { Overview: 'overview', Activity: 'activity' } as const;
type DashboardTab = (typeof DASHBOARD_TABS)[keyof typeof DASHBOARD_TABS];
const TAB_ORDER: DashboardTab[] = ['overview', 'activity'];

@Component({
  selector: 'app-dashboard-page',
  imports: [CardComponent, TabsComponent, TabComponent],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly user = inject(AuthStore).currentUser;
  protected readonly activeTab = signal<DashboardTab>('overview');
  protected readonly selectedIndex = computed(() =>
    TAB_ORDER.indexOf(this.activeTab()),
  );

  constructor() {
    // Active tab lives in the URL (?tab=…); parse it on every navigation.
    this.route.queryParams
      .pipe(takeUntilDestroyed())
      .subscribe((queryParams) => {
        this.activeTab.set(
          parseTabFromQueryParams(
            queryParams as Record<string, string>,
            DASHBOARD_TABS,
            'overview',
          ),
        );
      });
    // Reset to the default tab when navigating away from /dashboard.
    setupTabResetOnNavigation(
      () => this.activeTab.set('overview'),
      '/dashboard',
    );
  }

  protected onTabChange(index: number): void {
    const tab = TAB_ORDER[index];
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: tab === 'overview' ? null : tab },
      queryParamsHandling: 'merge',
    });
  }
}
