import { A11yModule } from '@angular/cdk/a11y';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DS_INTL } from '@ids-group-ltd/ids-design-system/core';
import { ScrollbarWidthService } from './scrollbar-width.service';
import { AppLayoutNavigationService } from './layout-navigation.service';
import {
  AppLayoutScrollService,
  type DsAppLayoutScrollReset,
} from './layout-scroll.service';
import { nextControlId } from '@ids-group-ltd/ids-design-system/components';

/**
 * Fixed-frame application layout: the host is pinned to the viewport and ONLY
 * the content region scrolls, so the sidenav rail and topbar stay put.
 * Consumers project their own chrome into the slots:
 *
 * ```html
 * <ds-app-layout>
 *   <ds-sidenav sidenav>…</ds-sidenav>
 *   <ds-topbar topbar>…</ds-topbar>
 *   <router-outlet />
 * </ds-app-layout>
 * ```
 *
 * The layout renders the `<main>` landmark itself, so do not nest another
 * `<main>` in the content. Scroll-to-top is built in (`AppLayoutScrollService`)
 * and fires when navigation changes the PATH; call `scrollToTop()` for other
 * changes that want the top. The content padding compensates the native
 * scrollbar width so the right inset equals the left. Requires the application
 * router (`provideRouter`).
 *
 * Below the `lg` breakpoint the rail becomes a modal overlay driven by
 * `[(railOpen)]`; put the burger wherever the design wants it inside your own
 * projected topbar.
 */
@Component({
  selector: 'ds-app-layout',
  standalone: true,
  imports: [A11yModule],
  templateUrl: './app-layout.component.html',
  styleUrl: './app-layout.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.app-layout]': 'true',
    '[class.topbar-full]': "topbarSpan() === 'full'",
    '[class.rail-open]': 'railOpen()',
    '(document:keydown.escape)': 'closeRail()',
  },
  providers: [AppLayoutScrollService],
})
export class AppLayoutComponent {
  /** `'content'` (default): rail spans the full height, topbar sits above the content only. `'full'`: topbar spans the full width. */
  readonly topbarSpan = input<'content' | 'full'>('content');

  /** Whether the rail is open as an overlay. Ignored at and above the `lg` breakpoint. */
  readonly railOpen = model(false);

  /** Accessible name for the rail while it is a modal overlay. Unset falls back to
   *  `DS_INTL.appLayout.railLabel`. */
  readonly railLabel = input<string | null>(null);
  private readonly intl = inject(DS_INTL);
  protected readonly railLabelResolved = computed(
    () => this.railLabel() ?? this.intl().appLayout.railLabel,
  );

  /**
   * Remember the content scroll per path and restore it on the way BACK. Off by
   * default. Restores on a history traversal, on `state: { dsRestoreScroll: true }`,
   * and on the first navigation after a reload.
   */
  readonly restoreScroll = input(false, { transform: booleanAttribute });

  /** Milliseconds to wait for the restored content to grow tall enough. Only with `restoreScroll`. */
  readonly restoreScrollTimeout = input(2000);

  /** When the content scroll resets to the top: on path change (`'path'`), also on query/fragment-only navigation (`'always'`), or never (`'never'`). */
  readonly scrollReset = input<DsAppLayoutScrollReset>('path');

  /** True only while the rail is an overlay; gates the dialog semantics. */
  protected readonly compact = signal(false);

  /** Whether the rail is currently an overlay rather than part of the layout. */
  readonly railOverlay = this.compact.asReadonly();

  /** Id of the rail panel, for a trigger's `aria-controls`. */
  readonly railId = nextControlId('ds-rail');

  private readonly layoutScroll = inject(AppLayoutScrollService);
  private readonly navigation = inject(AppLayoutNavigationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly content =
    viewChild.required<ElementRef<HTMLElement>>('content');

  constructor() {
    // Root service: instantiating it publishes --ds-scrollbar-width.
    inject(ScrollbarWidthService);

    effect(() => {
      this.layoutScroll.configureRestore(
        this.restoreScroll() ? this.restoreScrollTimeout() : null,
      );
      this.layoutScroll.configureReset(this.scrollReset());
    });

    afterNextRender(() => {
      this.layoutScroll.setScrollContainer(this.content().nativeElement);
      this.watchDesktopBreakpoint();
    });

    // Not closeRail(): returning focus to the burger would override where the router put it.
    this.navigation.pathChanged
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.railOpen.set(false));
  }

  /** Dismissal: Escape or the scrim. Restores focus, which navigation must not. */
  protected closeRail(): void {
    if (!this.railOpen()) {
      return;
    }
    this.railOpen.set(false);
    if (!this.compact()) {
      return;
    }
    // cdkTrapFocusAutoCapture returns focus only on destroy, so focus would stay in the off-canvas panel.
    this.content()
      .nativeElement.ownerDocument.querySelector<HTMLElement>(
        `[aria-controls="${this.railId}"]`,
      )
      ?.focus();
  }

  private watchDesktopBreakpoint(): void {
    // The host resolves `--bp-lg`, falling back to the Sass value its media queries use; the content element inherits it.
    const lg = getComputedStyle(this.content().nativeElement)
      .getPropertyValue('--_app-layout-desktop-min-width')
      .trim();
    const desktop = window.matchMedia(`(width >= ${lg})`);
    const sync = (): void => {
      this.compact.set(!desktop.matches);
      // Not closeRail(): its focus restore targets a trigger hidden on desktop.
      if (desktop.matches) {
        this.railOpen.set(false);
      }
    };
    sync();
    desktop.addEventListener('change', sync);
    this.destroyRef.onDestroy(() =>
      desktop.removeEventListener('change', sync),
    );
  }
}
