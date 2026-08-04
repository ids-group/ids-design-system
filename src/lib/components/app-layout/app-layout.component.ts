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
  isDevMode,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ScrollbarWidthService } from './scrollbar-width.service';
import { LayoutNavigationService } from './layout-navigation.service';
import { LayoutScrollService } from './layout-scroll.service';
import { nextControlId } from '../field-ids';

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
  providers: [LayoutScrollService],
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

  /** Whether the rail is currently an overlay rather than part of the layout. */
  readonly railOverlay = this.compact.asReadonly();

  /** Id of the rail panel, for a trigger's `aria-controls`. */
  readonly railId = nextControlId('ds-rail');

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

    // Not closeRail(): navigating is not a dismissal. The reader activated a link,
    // so focus belongs wherever the router put it - handing it back to the burger
    // would announce "Open navigation" instead of the page they asked for.
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
    // cdkTrapFocusAutoCapture returns focus only when the directive is DESTROYED, not when it flips
    // off, so without this the caret stays inside the now off-canvas panel. Whatever control claims
    // the rail through aria-controls owns it — dsRailTrigger and the DS-button forwarding both set it.
    this.content()
      .nativeElement.ownerDocument.querySelector<HTMLElement>(
        `[aria-controls="${this.railId}"]`,
      )
      ?.focus();
  }

  private watchDesktopBreakpoint(): void {
    // Single source of truth: the stylesheet's media block and this query both
    // resolve to `--bp-lg`. There is deliberately NO literal fallback — one here
    // could disagree with the scale and the rail would flip at a different width
    // than the CSS, silently. A missing value means the DS global styles were
    // never included, which breaks far more than this component, so say so.
    const lg = getComputedStyle(document.documentElement)
      .getPropertyValue('--bp-lg')
      .trim();
    if (!lg) {
      if (isDevMode()) {
        console.error(
          '[ds-app-layout] --bp-lg is not defined, so the responsive rail cannot know its breakpoint and stays in desktop layout. Include the DS global styles (@use "…/styles/ds") — or, à la carte, the partial that emits the breakpoint vars.',
        );
      }

      return;
    }
    const desktop = window.matchMedia(`(width >= ${lg})`);
    const sync = (): void => {
      this.compact.set(!desktop.matches);
      // Crossing UP drops the overlay state: leaving it set would re-open the
      // rail unprompted the next time the viewport narrows. Set the model
      // directly rather than calling closeRail(), whose focus restore has no
      // business firing here - the trigger it would focus is hidden on desktop.
      if (desktop.matches) {
        this.railOpen.set(false);
      }
    };
    sync();
    desktop.addEventListener('change', sync);
    this.destroyRef.onDestroy(() => desktop.removeEventListener('change', sync));
  }
}
