import { DS_INTL_DEFAULTS, type DsIntl } from '@ids-group-ltd/ids-design-system';

export const spread: DsIntl['field'] = { ...DS_INTL_DEFAULTS.field, optional: 'optional' };

export function writtenOut(keys: Omit<DsIntl['field'], 'overLimit'>): DsIntl['field'] {
  // @ts-expect-error after TS2741
  return { ...keys };
}
