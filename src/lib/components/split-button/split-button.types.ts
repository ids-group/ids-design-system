import type { IconName } from '../../icons/icons.data';

export type SplitButtonVariant = 'primary' | 'outline';

export interface SplitButtonItem {
  label: string;
  value?: string;
  icon?: IconName;
  disabled?: boolean;
  error?: boolean;
}
