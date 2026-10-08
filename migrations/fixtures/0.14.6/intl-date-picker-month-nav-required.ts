import { DS_INTL_DEFAULTS, type DsIntl } from '@ids-group-ltd/ids-design-system';

export const spread: DsIntl['datePicker'] = { ...DS_INTL_DEFAULTS.datePicker, placeholder: 'Pick a date' };

export function writtenOut(keys: Omit<DsIntl['datePicker'], 'previousMonth' | 'nextMonth'>): DsIntl['datePicker'] {
  // @ts-expect-error after TS2739
  return { ...keys };
}

export function onlyNext(keys: Omit<DsIntl['datePicker'], 'previousMonth'>): DsIntl['datePicker'] {
  // @ts-expect-error after TS2741
  return { ...keys };
}
