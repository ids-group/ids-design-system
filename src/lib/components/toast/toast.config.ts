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
