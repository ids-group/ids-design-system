import * as React from 'react';

/**
 * ModalConfirm — the real ModalConfirmComponent, run by Angular behind `<ds-modal-confirm>`.
 * Confirmation dialog — port of `ds-modal-confirm`, the card that `ModalService.confirm(options)` raises in Angular. Props flatten `ModalConfirmOptions` 1:1 and `onResolved(boolean)` mirrors the service's promise. Renders the `alertdialog` card only, in normal flow — in Angular the service supplies the centred CDK overlay + scrim around it (wrap in your own scrim or a containing block if you need that look).
 */
export interface ModalConfirmProps {
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const ModalConfirm: React.ComponentType<ModalConfirmProps>;
