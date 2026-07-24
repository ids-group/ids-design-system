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
import { ShellScrollService } from './shell-scroll.service';

/**
 * Fixed-frame application shell: the host is pinned to the viewport
 * (`100dvh` + `overflow: hidden`) and ONLY the content region scrolls, so
 * the sidenav rail and the topbar stay put on pages taller than the
 * viewport. Consumers project their own chrome into the slots:
 *
 * ```html
 * <ds-app-shell>
 *   <ds-sidenav sidenav>…</ds-sidenav>
 *   <ds-topbar topbar>…</ds-topbar>
 *   <router-outlet />
 * </ds-app-shell>
 * ```
 *
 * The shell renders the `<main>` landmark itself — do not nest another
 * `<main>` in the content. Scroll-to-top on navigation is built in
 * (`ShellScrollService`); the content padding auto-compensates the native
 * scrollbar width so the right inset always equals the left one. The shell
 * requires the application router (`provideRouter`) because its scroll-to-top
 * service subscribes to navigation events.
 */
@Component({
  selector: 'ds-app-shell',
  standalone: true,
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.app-shell]': 'true',
    '[class.topbar-full]': "topbarSpan() === 'full'",
  },
  providers: [ShellScrollService],
})
export class AppShellComponent {
  /**
   * `'content'` (default): the rail spans the full viewport height on the
   * left and the topbar sits above the content column only. `'full'`: the
   * topbar spans the full width and the rail + content sit below it.
   */
  readonly topbarSpan = input<'content' | 'full'>('content');

  private readonly shellScroll = inject(ShellScrollService);
  private readonly content =
    viewChild.required<ElementRef<HTMLElement>>('content');

  constructor() {
    // Root service: instantiating it publishes --ds-scrollbar-width.
    inject(ScrollbarWidthService);

    afterNextRender(() => {
      this.shellScroll.setScrollContainer(this.content().nativeElement);
    });
  }
}
