import { A11yModule } from '@angular/cdk/a11y';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  ViewEncapsulation,
  afterNextRender,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ScrollbarWidthService } from './scrollbar-width.service';
import { LayoutNavigationService } from './layout-navigation.service';
import { LayoutScrollService } from './layout-scroll.service';

/**
 * Fixed-frame application layout: the host is pinned to the viewport
 * (`100dvh` + `overflow: hidden`) and ONLY the content region scrolls, so
 * the sidenav rail and the topbar stay put on pages taller than the
 * viewport. Consumers project their own chrome into the slots:
 *
 * ```html
 * <ds-app-layout>
 *   <ds-sidenav sidenav>…</ds-sidenav>
 *   <ds-topbar topbar>…</ds-topbar>
 *   <router-outlet />
 * </ds-app-layout>
 * ```
 *
 * The layout renders the `<main>` landmark itself — do not nest another
 * `<main>` in the content. Scroll-to-top is built in (`LayoutScrollService`)
 * and fires when navigation changes the PATH, so a URL-driven list can page
 * and filter without losing the reader's place; inject the service and call
 * `scrollToTop()` for the changes that do want the top. The content padding
 * auto-compensates the native scrollbar width so the right inset always
 * equals the left one. The layout requires the application router
 * (`provideRouter`) because its scroll-to-top service subscribes to
 * navigation events.
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
  providers: [LayoutNavigationService, LayoutScrollService],
})
export class AppLayoutComponent {
  /**
   * `'content'` (default): the rail spans the full viewport height on the
   * left and the topbar sits above the content column only. `'full'`: the
   * topbar spans the full width and the rail + content sit below it.
   */
  readonly topbarSpan = input<'content' | 'full'>('content');

  /**
   * Whether the rail is open as an overlay. Only meaningful below the `lg`
   * breakpoint — above it the rail is always in the layout and this is
   * ignored. Two-way, so a burger in your topbar can drive it.
   */
  readonly railOpen = model(false);

  /** Accessible name for the rail while it is a modal overlay. */
  readonly railLabel = input<string>('Navigation');

  /**
   * True only while the rail is an overlay. Gates the dialog semantics: above
   * the breakpoint the rail is an ordinary region, and a permanent
   * `role="dialog"` there would lie to a screen reader.
   */
  protected readonly compact = signal(false);

  private readonly layoutScroll = inject(LayoutScrollService);
  private readonly navigation = inject(LayoutNavigationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly content =
    viewChild.required<ElementRef<HTMLElement>>('content');

  constructor() {
    // Root service: instantiating it publishes --ds-scrollbar-width.
    inject(ScrollbarWidthService);

    afterNextRender(() => {
      this.layoutScroll.setScrollContainer(this.content().nativeElement);
      this.watchDesktopBreakpoint();
    });

    this.navigation.pathChanged
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.closeRail());
  }

  protected closeRail(): void {
    this.railOpen.set(false);
  }

  // The width is read from the emitted --bp-lg so this query cannot drift from
  // the scale the stylesheet's media block uses.
  private watchDesktopBreakpoint(): void {
    const lg =
      getComputedStyle(document.documentElement)
        .getPropertyValue('--bp-lg')
        .trim() || '1024px';
    const desktop = window.matchMedia(`(width >= ${lg})`);
    const sync = (): void => {
      this.compact.set(!desktop.matches);
      // Crossing UP drops the overlay state: leaving it set would re-open the
      // rail unprompted the next time the viewport narrows.
      if (desktop.matches) {
        this.closeRail();
      }
    };
    sync();
    desktop.addEventListener('change', sync);
    this.destroyRef.onDestroy(() => desktop.removeEventListener('change', sync));
  }
}
