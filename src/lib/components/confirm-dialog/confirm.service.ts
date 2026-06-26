import { Injectable, Injector, inject } from '@angular/core';
import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ConfirmDialogComponent } from './confirm-dialog.component';
import { disposeWithLeave } from '../overlay-motion';
import {
  CONFIRM_DATA,
  type ConfirmContext,
  type ConfirmOptions,
} from './confirm.types';

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private readonly overlay = inject(Overlay);
  private readonly injector = inject(Injector);

  /** Open a confirmation dialog. Resolves true on confirm, false on cancel,
   *  backdrop click or Escape. */
  open(options: ConfirmOptions): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      const overlayRef = this.overlay.create({
        positionStrategy: this.overlay
          .position()
          .global()
          .centerHorizontally()
          .centerVertically(),
        hasBackdrop: true,
        backdropClass: 'cdk-overlay-dark-backdrop',
        panelClass: 'ds-overlay-pane',
        scrollStrategy: this.overlay.scrollStrategies.block(),
      });

      let settled = false;
      const finish = (result: boolean): void => {
        if (settled) {
          return;
        }
        settled = true;
        disposeWithLeave(overlayRef);
        resolve(result);
      };

      const context: ConfirmContext = { options, resolve: finish };
      const injector = Injector.create({
        parent: this.injector,
        providers: [{ provide: CONFIRM_DATA, useValue: context }],
      });

      overlayRef.backdropClick().subscribe(() => finish(false));
      overlayRef.keydownEvents().subscribe((event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          finish(false);
        }
      });
      overlayRef.attach(
        new ComponentPortal(ConfirmDialogComponent, null, injector),
      );
    });
  }
}
