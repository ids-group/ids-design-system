import { Directive, TemplateRef, inject } from '@angular/core';
import type { TreeNode } from './tree.types';

/** What a `dsTreeTrailing` template is handed: the row's node, as `$implicit` and again as `node`. */
export interface TreeTrailingContext {
  readonly $implicit: TreeNode;
  readonly node: TreeNode;
}

/**
 * Content drawn at the end of every `ds-tree` row: a badge, a count, a small icon button.
 *
 * ```html
 * <ds-tree [nodes]="layers">
 *   <ng-template dsTreeTrailing let-node>
 *     <ds-badge size="sm">{{ node.id }}</ds-badge>
 *   </ng-template>
 * </ds-tree>
 * ```
 *
 * A click inside it neither selects nor toggles the row. Its controls are tab stops only on
 * the focused row: Tab from that row reaches them, and the other rows' controls stay out of
 * the tab order.
 */
@Directive({
  selector: 'ng-template[dsTreeTrailing]',
  standalone: true,
})
export class TreeTrailingDirective {
  readonly template = inject<TemplateRef<TreeTrailingContext>>(TemplateRef);

  static ngTemplateContextGuard(
    _directive: TreeTrailingDirective,
    _context: unknown,
  ): _context is TreeTrailingContext {
    return true;
  }
}
