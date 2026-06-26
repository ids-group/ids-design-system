import type { IconName } from '../../icons/icons.data';

export interface TreeNode {
  id: string;
  label: string;
  icon?: IconName;
  children?: TreeNode[];
  disabled?: boolean;
}
