import type { IconName } from '../../icons/icons.data';

export interface SegmentedOption {
  label: string;
  value: string;
  icon?: IconName;
  disabled?: boolean;
}
