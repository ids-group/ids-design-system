import { InjectionToken } from '@angular/core';
import type { DsToastPosition } from './toast.types';

export const DS_TOAST_POSITION = new InjectionToken<DsToastPosition>(
  'DS_TOAST_POSITION',
);

export const DS_TOAST_POSITION_DEFAULT: DsToastPosition = {
  horizontalPosition: 'right',
  verticalPosition: 'top',
  offset: 'var(--space-6)',
};

export interface DsToastConfig {
  /** Maximum number of toasts visible at once. Extras are queued and shown
   *  as earlier ones dismiss. Defaults to unlimited when not provided. */
  readonly maxVisible?: number;
}

export const DS_TOAST_CONFIG = new InjectionToken<DsToastConfig>(
  'DS_TOAST_CONFIG',
);
