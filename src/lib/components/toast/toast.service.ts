import { ComponentRef, Injectable, inject } from '@angular/core';
import {
  Overlay,
  OverlayRef,
  GlobalPositionStrategy,
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { ToastRegionComponent } from './toast-region.component';
import {
  DS_TOAST_CONFIG,
  DS_TOAST_POSITION,
  DS_TOAST_POSITION_DEFAULT,
} from './toast.config';
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

// Long enough to gather a synchronous burst into one announcement, short enough that a
// single toast is not perceptibly late. It only has to outlast the loop that fires the
// burst, not any human interval.
const ANNOUNCE_COALESCE_MS = 120;

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly overlay = inject(Overlay);
  private readonly position = inject(DS_TOAST_POSITION, { optional: true });
  private readonly toastConfig = inject(DS_TOAST_CONFIG, { optional: true });
  private readonly announcer = inject(LiveAnnouncer);
  private overlayRef: OverlayRef | null = null;
  private regionRef: ComponentRef<ToastRegionComponent> | null = null;
  private nextId = 1;
  private pendingAnnouncements: string[] = [];
  private pendingAssertive = false;
  private announceTimer: number | undefined;

  show(opts: ToastOptions): ToastRef {
    this.ensureRegion();
    const id = this.nextId++;
    const variant = opts.variant ?? 'info';
    // Loading toasts never auto-dismiss (0 = indefinite). Nor does one carrying an
    // `action`: that button is the only way to take the action, the region sits last
    // in tab order, and a keyboard user cannot reach it inside five seconds.
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
  promise<T>(source: Promise<T>, messages: ToastPromiseMessages): Promise<T> {
    const ref = this.show({
      body: messages.loading,
      variant: 'loading',
      durationMs: 0,
    });

    // The settled duration is handed to the REGION rather than run here, because only
    // the region knows when the toast becomes visible. Run from here it burned down
    // while the toast was still queued behind `maxVisible`, and the result was spliced
    // out of the queue before anyone saw it.
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

  /** A toast is a status message, so a reader has to be told about it without being
   *  moved. The announcement does NOT ride the visual toast: `aria-live` on an element
   *  created together with its text announces nothing in NVDA or JAWS, which is three
   *  of the five variants. The CDK announcer's region is built once, at construction,
   *  and only its text changes — the shape screen readers actually fire on.
   *
   *  A burst is COALESCED into one announcement rather than queued, and that is not a
   *  preference. `LiveAnnouncer.announce()` clears the region synchronously and writes
   *  the text on a 100ms timeout, resolving its promise inside that callback — so even
   *  a strictly serialised chain loses everything but the last message: measured, each
   *  of five landed and was cleared again in the same millisecond, before a
   *  MutationObserver could see it, let alone a reader. Awaiting the promise cannot fix
   *  that, because it resolves before the write has been observed. One region change
   *  carrying every message is the only shape that survives. */
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
  }

  private buildPositionStrategy(): GlobalPositionStrategy {
    const config = this.position ?? DS_TOAST_POSITION_DEFAULT;
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
