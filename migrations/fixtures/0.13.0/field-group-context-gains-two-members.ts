import type { DsFieldGroupContext, DsSize } from '@ids-group-ltd/ids-design-system';

// @ts-expect-error after TS2420
export class AppGroupContext implements DsFieldGroupContext {
  readonly sizeResolved = (): DsSize => 'md';
}

// @ts-expect-error after TS2739
export const literal: DsFieldGroupContext = { sizeResolved: () => 'md' };

export const restored: DsFieldGroupContext = {
  sizeResolved: () => 'md',
  // @ts-expect-error before TS2353
  invalidResolved: () => false,
  messageId: () => null,
};
