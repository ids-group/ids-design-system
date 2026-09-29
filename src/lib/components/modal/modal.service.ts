import { Injectable, Injector, inject } from '@angular/core';
import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ModalConfirmComponent } from './modal-confirm.component';
import { disposeWithLeave } from '@ids-group-ltd/ids-design-system/components';
import {
  MODAL_CONFIRM_DATA,
  type ModalConfirmContext,
  type ModalConfirmOptions,
} from './modal-confirm.types';

@Injectable({ providedIn: 'root' })
export class ModalService {
  private readonly overlay = inject(Overlay);
  private readonly injector = inject(Injector);

  /** Open a confirmation dialog. Resolves true on confirm, false on cancel,
   *  backdrop click or Escape. */
  confirm(options: ModalConfirmOptions): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      const overlayRef = this.overlay.create({
        positionStrategy: this.overlay
          .position()
          .global()
          .centerHorizontally()
          .centerVertically(),
        hasBackdrop: true,
        backdropClass: 'cdk-overlay-dark-backdrop',
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

      const context: ModalConfirmContext = { options, resolve: finish };
      const injector = Injector.create({
        parent: this.injector,
        providers: [{ provide: MODAL_CONFIRM_DATA, useValue: context }],
      });

      overlayRef.backdropClick().subscribe(() => finish(false));
      overlayRef.keydownEvents().subscribe((event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          finish(false);
        }
      });
      overlayRef.attach(
        new ComponentPortal(ModalConfirmComponent, null, injector),
      );

      // The library ships no CDK dark-backdrop CSS, so paint the scrim from the DS token, as ds-modal does.
      if (overlayRef.backdropElement) {
        overlayRef.backdropElement.style.backgroundColor =
          'var(--surface-scrim)';
      }
    });
  }
}
