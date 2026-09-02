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
   *  as earlier ones dismiss. Defaults to 5; `0` means unlimited.
   *
   *  A cap exists by default because an uncapped stack is worse than any of the
   *  systems this component is measured against — Material shows ONE snackbar and
   *  dismisses the previous, Carbon and Halstack both stack but expect a ceiling. */
  readonly maxVisible?: number;
}

export const DS_TOAST_CONFIG = new InjectionToken<DsToastConfig>(
  'DS_TOAST_CONFIG',
);
