import type { IconName } from '@ids-group-ltd/ids-design-system/core';

export interface SegmentedOption {
  label: string;
  value: string;
  icon?: IconName;
  disabled?: boolean;
}
