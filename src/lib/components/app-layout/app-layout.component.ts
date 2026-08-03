import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  afterNextRender,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { ScrollbarWidthService } from './scrollbar-width.service';
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
 * auto-compensates the native
 * scrollbar width so the right inset always equals the left one. The layout
 * requires the application router (`provideRouter`) because its scroll-to-top
 * service subscribes to navigation events.
 */
@Component({
  selector: 'ds-app-layout',
  standalone: true,
  templateUrl: './app-layout.component.html',
  styleUrl: './app-layout.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.app-layout]': 'true',
    '[class.topbar-full]': "topbarSpan() === 'full'",
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

  private readonly layoutScroll = inject(LayoutScrollService);
  private readonly content =
    viewChild.required<ElementRef<HTMLElement>>('content');

  constructor() {
    // Root service: instantiating it publishes --ds-scrollbar-width.
    inject(ScrollbarWidthService);

    afterNextRender(() => {
      this.layoutScroll.setScrollContainer(this.content().nativeElement);
    });
  }
}
