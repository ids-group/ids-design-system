import type { DsStatus } from '../../core/status';

export type ProgressVariant = 'default' | Exclude<DsStatus, 'info'>;
