import { InjectionToken } from '@angular/core';
import type { IconName } from '../../icons/icons.data';

export type ModalConfirmTone = 'default' | 'danger';

export interface ModalConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ModalConfirmTone;
  icon?: IconName;
  /** When set, the confirm button stays disabled until the user types this
   *  exact phrase — a guard for high-stakes destructive actions. */
  typeToConfirm?: string;
}

export interface ModalConfirmContext {
  options: ModalConfirmOptions;
  resolve: (result: boolean) => void;
}

export const MODAL_CONFIRM_DATA = new InjectionToken<ModalConfirmContext>(
  'MODAL_CONFIRM_DATA',
);
