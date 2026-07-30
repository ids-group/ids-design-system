import { InjectionToken } from '@angular/core';

/** Contract that ds-radio reads from its parent ds-radio-group, injected via
 *  token to avoid a circular import (radio-group → RadioComponent for
 *  contentChildren; radio → RadioGroupComponent for group injection). */
export interface RadioGroupContract {
  readonly value: () => unknown;
  readonly groupName: () => string;
  readonly isDisabled: () => boolean;
  isTabbable(radio: RadioGroupChild): boolean;
  select(value: unknown): void;
}

/** Contract the radio-group reads back from each projected radio. */
export interface RadioGroupChild {
  readonly value: () => unknown;
  readonly effectiveDisabled: () => boolean;
  focus(): void;
}

export const RADIO_GROUP = new InjectionToken<RadioGroupContract>(
  'RADIO_GROUP',
);
