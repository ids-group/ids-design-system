import { DS_INTL_DEFAULTS, type DsIntl } from '@ids-group-ltd/ids-design-system';

export const spread: DsIntl['chart'] = { ...DS_INTL_DEFAULTS.chart, title: 'Graph' };

export function writtenOut(keys: Omit<DsIntl['chart'], 'rangeTotal'>): DsIntl['chart'] {
  // @ts-expect-error after TS2741
  return { ...keys };
}
