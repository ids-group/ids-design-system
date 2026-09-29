import { InjectionToken } from '@angular/core';

/** Contract ds-radio reads from its parent ds-radio-group; a token avoids the circular import. */
export interface RadioGroupContract {
  readonly value: () => unknown;
  readonly groupName: () => string;
  readonly isDisabled: () => boolean;
  isTabbable(radio: RadioGroupChild): boolean;
  select(value: unknown): void;
}

export interface RadioGroupChild {
  readonly value: () => unknown;
  readonly effectiveDisabled: () => boolean;
  focus(): void;
}

export const RADIO_GROUP = new InjectionToken<RadioGroupContract>(
  'RADIO_GROUP',
);
