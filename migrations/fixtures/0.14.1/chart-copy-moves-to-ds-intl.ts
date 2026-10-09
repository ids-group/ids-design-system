import { provideDsConfig } from '@ids-group-ltd/ids-design-system';

export const deleted = provideDsConfig({ chart: {} });

// @ts-expect-error after TS2353
export const kept = provideDsConfig({ chart: { emptyText: 'Nothing yet' } });
