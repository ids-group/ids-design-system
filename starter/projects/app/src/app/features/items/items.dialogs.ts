/**
 * Dialog config factories for the items feature — pure functions returning the
 * args for ConfirmService. Keeps confirm copy/options out of the action service.
 */
export interface ConfirmConfig {
  message: string;
  title: string;
}

export function deleteItemConfirm(name: string): ConfirmConfig {
  return {
    message: `Delete "${name}"? This can't be undone.`,
    title: 'Delete item',
  };
}
