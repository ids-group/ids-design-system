import { ComponentRef, Injectable, inject } from '@angular/core';
import {
  Overlay,
  OverlayRef,
  GlobalPositionStrategy,
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ToastRegionComponent } from './toast-region.component';
import {
  DS_TOAST_CONFIG,
  DS_TOAST_POSITION,
  DS_TOAST_POSITION_DEFAULT,
} from './toast.config';
import type {
  ToastEntry,
  ToastOptions,
  ToastPromiseMessages,
  ToastRef,
} from './toast.types';

// An error stays longer than a success: it usually needs reading, and often acting on.
const SETTLED_SUCCESS_MS = 4000;
const SETTLED_ERROR_MS = 6000;

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly overlay = inject(Overlay);
  private readonly position = inject(DS_TOAST_POSITION, { optional: true });
  private readonly toastConfig = inject(DS_TOAST_CONFIG, { optional: true });
  private overlayRef: OverlayRef | null = null;
  private regionRef: ComponentRef<ToastRegionComponent> | null = null;
  private nextId = 1;

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
      },
    );

    return source;
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
