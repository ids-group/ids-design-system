import { DS_INTL_DEFAULTS, type DsIntl } from '@ids-group-ltd/ids-design-system';

export const germanIntl: DsIntl = {
  ...DS_INTL_DEFAULTS,
  chart: {
    ...DS_INTL_DEFAULTS.chart,
    shareOfTotal: (share) => `${share} vom Gesamt`,
  },
};
