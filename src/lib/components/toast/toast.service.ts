import { ComponentRef, DestroyRef, Injectable, inject } from '@angular/core';
import {
  Overlay,
  OverlayRef,
  GlobalPositionStrategy,
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { DS_CONFIG } from '../../core/ds-config';
import { ToastRegionComponent } from './toast-region.component';
import { DS_TOAST_POSITION_DEFAULT } from './toast.config';
import type {
  ToastEntry,
  ToastVariant,
  ToastOptions,
  ToastPromiseMessages,
  ToastRef,
} from './toast.types';

// An error stays longer than a success: it usually needs reading, and often acting on.
const SETTLED_SUCCESS_MS = 4000;
const SETTLED_ERROR_MS = 6000;

// Has to outlast the loop that fires a burst, not any human interval.
const ANNOUNCE_COALESCE_MS = 120;

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly overlay = inject(Overlay);
  private readonly toastConfig = inject(DS_CONFIG).toast;
  private readonly announcer = inject(LiveAnnouncer);
  private overlayRef: OverlayRef | null = null;
  private regionRef: ComponentRef<ToastRegionComponent> | null = null;
  private nextId = 1;
  private pendingAnnouncements: string[] = [];
  private pendingAssertive = false;
  private announceTimer: number | undefined;
  private scrimWatcher: MutationObserver | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.announceTimer);
      this.scrimWatcher?.disconnect();
      this.overlayRef?.dispose();
      this.overlayRef = null;
      this.regionRef = null;
    });
  }

  show(opts: ToastOptions): ToastRef {
    this.ensureRegion();
    const id = this.nextId++;
    const variant = opts.variant ?? 'info';
    // An `action` toast cannot expire: that button is the only way to take the action,
    // the region is the last child of `body`, and a keyboard user cannot cross a page
    // to reach it inside five seconds.
    const durationMs =
      variant === 'loading' || opts.action ? 0 : (opts.durationMs ?? 5000);
    const entry: ToastEntry = {
      id,
      title: opts.title,
      body: opts.body,
      variant,
      // Nothing that cannot expire may also be unclosable, or it holds a slot for the
      // life of the page — which is how a hung promise blocked the whole region.
      dismissible: durationMs > 0 ? (opts.dismissible ?? true) : true,
      action: opts.action,
      durationMs,
    };
    // The region runs the countdown, because only it knows when the toast became
    // visible — started here, one queued behind `maxVisible` expires unseen.
    this.regionRef!.instance.add(entry);
    this.announce(variant, entry.body, entry.title);

    return {
      id,
      dismiss: () => this.regionRef?.instance.remove(id),
    };
  }

  /** Show a loading toast for the duration of `source`. Resolution and rejection are
   *  reflected in-place (same toast, no stack-up) as success/error variants, each with
   *  its own auto-dismiss delay.
   *
   *  Returns `source` itself, so the caller still owns rejection handling — an
   *  un-`catch`ed call produces an unhandled rejection exactly as it would without a
   *  toast. */
  promise<T>(
    source: Promise<T>,
    messages: ToastPromiseMessages<T>,
  ): Promise<T> {
    const ref = this.show({
      body: messages.loading,
      variant: 'loading',
      durationMs: 0,
    });

    // The duration goes to the region for the reason given on `add()` above: run from
    // here it burns down while the toast is still queued, and the result is spliced out
    // of the queue unseen.
    source.then(
      (value) => {
        const successBody =
          typeof messages.success === 'function'
            ? messages.success(value)
            : messages.success;
        this.regionRef?.instance.update(ref.id, {
          body: successBody,
          variant: 'success',
          dismissible: true,
          durationMs: SETTLED_SUCCESS_MS,
        });
        this.announce('success', successBody);
      },
      (reason: unknown) => {
        const errorBody =
          typeof messages.error === 'function'
            ? messages.error(reason)
            : messages.error;
        this.regionRef?.instance.update(ref.id, {
          body: errorBody,
          variant: 'error',
          dismissible: true,
          durationMs: SETTLED_ERROR_MS,
        });
        this.announce('error', errorBody);
      },
    );

    return source;
  }

  /** The announcement must NOT ride the visual toast: `aria-live` on an element created
   *  together with its text announces nothing in NVDA or JAWS. The CDK announcer's region
   *  exists from construction and only its text changes.
   *
   *  Serialising a burst does not work either — `announce()` clears the region and writes
   *  on a timeout, resolving its promise inside that callback, so the next message wipes
   *  the previous one before anything can read it. One region change carrying every
   *  message is the only shape that survives. */
  private announce(variant: ToastVariant, body: string, title?: string): void {
    const spoken = [title, body].filter(Boolean).join('. ');
    if (!spoken) {
      return;
    }
    this.pendingAnnouncements.push(spoken);
    if (variant === 'error' || variant === 'warning') {
      this.pendingAssertive = true;
    }
    clearTimeout(this.announceTimer);
    this.announceTimer = window.setTimeout(() => {
      const message = this.pendingAnnouncements.join('. ');
      const politeness = this.pendingAssertive ? 'assertive' : 'polite';
      this.pendingAnnouncements = [];
      this.pendingAssertive = false;
      this.announcer.announce(message, politeness);
    }, ANNOUNCE_COALESCE_MS);
  }

  dismissAll(): void {
    this.regionRef?.instance.clear();
  }

  private ensureRegion(): void {
    if (this.overlayRef) {
      return;
    }
    this.overlayRef = this.overlay.create({
      hasBackdrop: false,
      panelClass: 'ds-toast-panel',
      positionStrategy: this.buildPositionStrategy(),
    });
    this.regionRef = this.overlayRef.attach(
      new ComponentPortal(ToastRegionComponent),
    );
    // A configured 0 is forwarded, not skipped: since the region's own default became
    // a cap, 0 is the only way left to ask for an uncapped stack, and swallowing it
    // would silently hand that consumer the default instead.
    const maxVisible = this.toastConfig?.maxVisible;
    if (typeof maxVisible === 'number' && maxVisible >= 0) {
      this.regionRef.setInput('maxVisible', maxVisible);
    }
    this.keepAboveScrims();
  }

  /** Keeps the toast above a scrim opened AFTER it. `--layer-toast` cannot: CDK gives
   *  every overlay host `popover="manual"`, and the browser's top layer paints in the
   *  order things were shown, ignoring z-index. Re-showing the host is the only lever.
   *
   *  Scrimmed overlays only — the published scale puts `--layer-tooltip` above the
   *  toast, so raising over a tooltip would contradict our own documentation. */
  private keepAboveScrims(): void {
    const host = this.overlayRef?.hostElement;
    const container = host?.parentElement;
    if (!host || !container || typeof host.showPopover !== 'function') {
      return;
    }
    this.scrimWatcher = new MutationObserver((records) => {
      const scrimAppeared = records.some((record) =>
        [...record.addedNodes].some(
          (node) =>
            node instanceof HTMLElement &&
            node !== host &&
            (node.classList.contains('cdk-overlay-backdrop') ||
              node.querySelector?.('.cdk-overlay-backdrop')),
        ),
      );
      if (!scrimAppeared || !host.isConnected) {
        return;
      }
      // The top layer has no "raise"; nothing paints between these two calls.
      try {
        host.hidePopover();
        host.showPopover();
      } catch {
        // no-empty needs a body: the host may not be showing, and that is fine
      }
    });
    this.scrimWatcher.observe(container, { childList: true, subtree: true });
  }

  private buildPositionStrategy(): GlobalPositionStrategy {
    const config = {
      ...DS_TOAST_POSITION_DEFAULT,
      ...this.toastConfig?.position,
    };
    const strategy = this.overlay.position().global();
    if (config.verticalPosition === 'top') {
      strategy.top(config.offset);
    } else {
      strategy.bottom(config.offset);
    }
    if (config.horizontalPosition === 'left') {
      strategy.left(config.offset);
    } else if (config.horizontalPosition === 'right') {
      strategy.right(config.offset);
    } else {
      strategy.centerHorizontally();
    }

    return strategy;
  }
}
