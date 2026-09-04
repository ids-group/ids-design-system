import type { IconName } from '@ids-group-ltd/ids-design-system/core';

export interface TreeNode {
  id: string;
  label: string;
  icon?: IconName;
  children?: TreeNode[];
  disabled?: boolean;
}
