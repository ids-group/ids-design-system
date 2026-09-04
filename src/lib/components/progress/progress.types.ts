import type { DsStatus } from '@ids-group-ltd/ids-design-system/core';

export type ProgressVariant = 'default' | Exclude<DsStatus, 'info'>;
