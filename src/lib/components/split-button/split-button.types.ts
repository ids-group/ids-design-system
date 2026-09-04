import type { IconName } from '@ids-group-ltd/ids-design-system/core';

export type SplitButtonVariant = 'primary' | 'outline';

export interface SplitButtonItem {
  label: string;
  value?: string;
  icon?: IconName;
  disabled?: boolean;
  error?: boolean;
}
