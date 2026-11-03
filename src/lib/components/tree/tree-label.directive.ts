import { Directive, TemplateRef, inject } from '@angular/core';
import type { TreeNode } from './tree.types';

/** What a `dsTreeLabel` template is handed: the row's node, its nesting level (`0` for a root
 *  node) and whether the row is selected and disabled. */
export interface TreeLabelContext {
  readonly $implicit: TreeNode;
  readonly node: TreeNode;
  readonly level: number;
  readonly selected: boolean;
  readonly disabled: boolean;
}

/**
 * Content drawn in place of a `ds-tree` row's label, for a label of more than one line or one
 * that mixes styles.
 *
 * ```html
 * <ds-tree [nodes]="layers">
 *   <ng-template dsTreeLabel let-node>
 *     <span class="tag">{{ tags[node.id] }}</span>
 *     <span class="text">{{ node.label }}</span>
 *   </ng-template>
 * </ds-tree>
 * ```
 *
 * The row grows to the template's height and the label takes the width between the icon and
 * the trailing content, so an element inside it can cut its text with an ellipsis. The text the
 * template renders is the row's accessible name; a template that draws no text needs a
 * visually hidden element with the name in it. A click inside it selects the row as a click on
 * the default label does.
 */
@Directive({
  selector: 'ng-template[dsTreeLabel]',
  standalone: true,
})
export class TreeLabelDirective {
  readonly template = inject<TemplateRef<TreeLabelContext>>(TemplateRef);

  static ngTemplateContextGuard(
    _directive: TreeLabelDirective,
    _context: unknown,
  ): _context is TreeLabelContext {
    return true;
  }
}
