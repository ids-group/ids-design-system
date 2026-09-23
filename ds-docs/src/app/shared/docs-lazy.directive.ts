import {
  DestroyRef,
  Directive,
  EmbeddedViewRef,
  OnInit,
  TemplateRef,
  ViewContainerRef,
  inject,
} from '@angular/core';
import { AppLayoutScrollService } from 'ds/app-layout';

// Past this much mounting in one task the next frame is late, so the queue yields and carries on
// in the next task.
const MOUNT_BUDGET_MS = 8;

// Built this far ahead of the fold rather than on it: building a chart in the very frame it
// scrolls in makes that frame late, and a tenth of the viewport ahead its entrance still plays on
// screen.
const ROOT_MARGIN = '10% 0px';

type Mount = () => void;

const pending = new Map<Element, Mount>();
const observers = new Map<Element | null, IntersectionObserver>();
let draining = false;

function drain(): void {
  const start = performance.now();
  for (const [placeholder, mount] of pending) {
    if (performance.now() - start > MOUNT_BUDGET_MS) {
      setTimeout(drain);

      return;
    }
    pending.delete(placeholder);
    mount();
  }
  draining = false;
}

function observerFor(root: Element | null): IntersectionObserver {
  let observer = observers.get(root);
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const mount = mounts.get(entry.target);
          if (!mount) {
            continue;
          }
          // A chart the reader has already scrolled past leaves the queue instead of being built
          // behind them.
          if (entry.isIntersecting) {
            pending.set(entry.target, mount);
          } else {
            pending.delete(entry.target);
          }
        }
        if (pending.size && !draining) {
          draining = true;
          setTimeout(drain);
        }
      },
      { root, rootMargin: ROOT_MARGIN },
    );
    observers.set(root, observer);
  }

  return observer;
}

const mounts = new WeakMap<Element, Mount>();

/**
 * Builds its element just before it first scrolls into view, a few at a time, and keeps it after
 * that. Until then a fixed-height placeholder holds its place.
 *
 * Two states, then. The first time a chart comes up to the fold it is built and plays its entrance
 * where the reader sees it. After that it is never rebuilt: scrolled off, it stays in the DOM and
 * `content-visibility` skips its style, layout and paint, so it costs nothing while hidden and
 * shows again as it was, without replaying anything. Charts the reader scrolls straight past are
 * never built at all.
 *
 * A design-sync card renders its whole chapter at once: it is a snapshot, and a headless page
 * reports nothing as intersecting.
 */
@Directive({ selector: '[docsLazy]', standalone: true })
export class DocsLazyDirective implements OnInit {
  private readonly template = inject(TemplateRef);
  private readonly container = inject(ViewContainerRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly scroller =
    inject(AppLayoutScrollService, { optional: true })?.scroller ?? null;

  ngOnInit(): void {
    if (
      window.__dsSectionsOnly ||
      typeof IntersectionObserver === 'undefined'
    ) {
      this.container.createEmbeddedView(this.template);

      return;
    }

    const anchor = this.container.element.nativeElement as Comment;
    const placeholder = document.createElement('div');
    placeholder.className = 'docs-lazy-placeholder';
    placeholder.setAttribute('aria-hidden', 'true');
    anchor.parentNode?.insertBefore(placeholder, anchor);

    const observer = observerFor(this.scroller?.() ?? null);
    const release = (): void => {
      observer.unobserve(placeholder);
      pending.delete(placeholder);
      placeholder.remove();
    };
    mounts.set(placeholder, () => {
      release();
      const view = this.container.createEmbeddedView(this.template);
      view.detectChanges();
      markRendered(view);
    });
    observer.observe(placeholder);
    this.destroyRef.onDestroy(release);
  }
}

function markRendered(view: EmbeddedViewRef<unknown>): void {
  for (const node of view.rootNodes) {
    if (node instanceof Element) {
      node.classList.add('docs-lazy');
    }
  }
}

declare global {
  interface Window {
    __dsSectionsOnly?: boolean;
  }
}
