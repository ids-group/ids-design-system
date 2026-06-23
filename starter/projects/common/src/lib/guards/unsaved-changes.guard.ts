import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { ConfirmService } from '../services/confirm.service';

/** Pages implement this to opt into the unsaved-changes prompt. */
export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
}

export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (
  component,
) => {
  if (!component.hasUnsavedChanges()) {
    return true;
  }

  return inject(ConfirmService).confirm({
    message: 'You have unsaved changes. Are you sure you want to leave this page?',
    title: 'Unsaved Changes',
  });
};
