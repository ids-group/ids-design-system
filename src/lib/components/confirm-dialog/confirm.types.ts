import { InjectionToken } from '@angular/core';
import type { IconName } from '../../icons/icons.data';

export type ConfirmTone = 'default' | 'danger';

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
  icon?: IconName;
  /** When set, the confirm button stays disabled until the user types this
   *  exact phrase — a guard for high-stakes destructive actions. */
  typeToConfirm?: string;
}

export interface ConfirmContext {
  options: ConfirmOptions;
  resolve: (result: boolean) => void;
}

export const CONFIRM_DATA = new InjectionToken<ConfirmContext>('CONFIRM_DATA');
