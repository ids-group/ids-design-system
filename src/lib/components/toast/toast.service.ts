import { ComponentRef, Injectable, inject } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ToastRegionComponent } from './toast-region.component';
import type { ToastOptions, ToastRef, ToastEntry } from './toast.types';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly overlay = inject(Overlay);
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
    };
    this.regionRef!.instance.add(entry);

    const ref: ToastRef = {
      id,
      dismiss: () => this.regionRef?.instance.remove(id),
    };

    const duration = opts.durationMs ?? 5000;
    if (duration > 0) {
      window.setTimeout(() => ref.dismiss(), duration);
    }
    return ref;
  }

  dismissAll(): void {
    this.regionRef?.instance.clear();
  }

  private ensureRegion(): void {
    if (this.overlayRef) return;
    this.overlayRef = this.overlay.create({ hasBackdrop: false });
    this.regionRef = this.overlayRef.attach(new ComponentPortal(ToastRegionComponent));
  }
}
