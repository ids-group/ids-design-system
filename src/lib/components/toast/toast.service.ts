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
    const entry: ToastEntry = {
      id,
      title: opts.title,
      body: opts.body,
      variant: opts.variant ?? 'info',
      dismissible: opts.dismissible ?? true,
      action: opts.action,
    };
    this.regionRef!.instance.add(entry);

    const ref: ToastRef = {
      id,
      dismiss: () => this.regionRef?.instance.remove(id),
    };

    const duration = opts.durationMs ?? 5000;
    // Loading toasts never auto-dismiss (duration 0 means indefinite).
    if (duration > 0 && opts.variant !== 'loading') {
      window.setTimeout(() => ref.dismiss(), duration);
    }

    return ref;
  }

  /** Show a loading toast for the duration of `promise`. Resolves/rejects are
   *  reflected in-place (same toast, no stack-up) as success/error variants. */
  promise<T>(source: Promise<T>, messages: ToastPromiseMessages): Promise<T> {
    const ref = this.show({
      body: messages.loading,
      variant: 'loading',
      dismissible: false,
      durationMs: 0,
    });

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
        });
        window.setTimeout(() => ref.dismiss(), 4000);
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
        });
        window.setTimeout(() => ref.dismiss(), 6000);
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
    const maxVisible = this.toastConfig?.maxVisible;
    if (maxVisible && maxVisible > 0) {
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
