import {
  Component,
  ElementRef,
  ViewEncapsulation,
  computed,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { IconComponent } from '../../icons/icon.component';
import type { TreeNode } from './tree.types';

interface VisibleNode {
  node: TreeNode;
  level: number;
  hasChildren: boolean;
  expanded: boolean;
}

@Component({
  selector: 'ds-tree',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './tree.component.html',
  styleUrl: './tree.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    role: 'tree',
    '(keydown)': 'onKeydown($event)',
  },
})
export class TreeComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Root-level nodes; nest via `children`. */
  readonly nodes = input<readonly TreeNode[]>([]);
  /** Two-way set of currently expanded node ids. */
  readonly expandedIds = model<Set<string>>(new Set());
  /** Two-way id of the currently selected node. */
  readonly selectedId = model<string | null>(null);
  /** Fires with the node when a row is selected (click or Enter/Space). */
  readonly nodeSelected = output<TreeNode>();

  private readonly activeId = signal<string | null>(null);

  // Depth-first list of currently-visible nodes; drives rendering and keyboard nav.
  protected readonly visibleNodes = computed<VisibleNode[]>(() => {
    const out: VisibleNode[] = [];
    const walk = (list: readonly TreeNode[], level: number): void => {
      for (const node of list) {
        const hasChildren = !!node.children?.length;
        const expanded = this.isExpanded(node.id);
        out.push({ node, level, hasChildren, expanded });
        if (hasChildren && expanded) {
          walk(node.children ?? [], level + 1);
        }
      }
    };
    walk(this.nodes(), 0);

    return out;
  });

  // The single roving-tabindex treeitem — the active node, or the first one.
  protected readonly effectiveActiveId = computed(
    () => this.activeId() ?? this.visibleNodes()[0]?.node.id ?? null,
  );

  protected isExpanded(id: string): boolean {
    return this.expandedIds().has(id);
  }

  protected isSelected(id: string): boolean {
    return this.selectedId() === id;
  }

  protected isActive(id: string): boolean {
    return this.effectiveActiveId() === id;
  }

  protected onRowClick(entry: VisibleNode): void {
    if (entry.node.disabled) {
      return;
    }
    this.select(entry.node);
    if (entry.hasChildren) {
      this.toggle(entry.node);
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    const visible = this.visibleNodes();
    const index = visible.findIndex(
      (entry) => entry.node.id === this.effectiveActiveId(),
    );
    if (index < 0) {
      return;
    }
    const current = visible[index];
    switch (event.key) {
      case 'ArrowDown':
        this.moveActive(index + 1);
        break;
      case 'ArrowUp':
        this.moveActive(index - 1);
        break;
      case 'Home':
        this.moveActive(0);
        break;
      case 'End':
        this.moveActive(visible.length - 1);
        break;
      case 'ArrowRight':
        if (current.hasChildren && !current.expanded) {
          this.toggle(current.node);
        } else if (current.hasChildren) {
          this.moveActive(index + 1);
        }
        break;
      case 'ArrowLeft':
        if (current.hasChildren && current.expanded) {
          this.toggle(current.node);
        } else {
          this.moveToParent(visible, index);
        }
        break;
      default:
        // Enter / Space activate the focused row via its native button click.
        return;
    }
    event.preventDefault();
  }

  private toggle(node: TreeNode): void {
    if (node.disabled || !node.children?.length) {
      return;
    }
    const next = new Set(this.expandedIds());
    if (next.has(node.id)) {
      next.delete(node.id);
    } else {
      next.add(node.id);
    }
    this.expandedIds.set(next);
  }

  private select(node: TreeNode): void {
    if (node.disabled) {
      return;
    }
    this.selectedId.set(node.id);
    this.activeId.set(node.id);
    this.nodeSelected.emit(node);
  }

  private moveActive(targetIndex: number): void {
    const visible = this.visibleNodes();
    if (targetIndex < 0 || targetIndex >= visible.length) {
      return;
    }
    this.focusNode(visible[targetIndex].node.id);
  }

  private moveToParent(visible: VisibleNode[], index: number): void {
    const level = visible[index].level;
    for (let i = index - 1; i >= 0; i--) {
      if (visible[i].level < level) {
        this.focusNode(visible[i].node.id);

        return;
      }
    }
  }

  private focusNode(id: string): void {
    this.activeId.set(id);
    this.host.nativeElement
      .querySelector<HTMLElement>(`[data-node-id="${id}"]`)
      ?.focus();
  }
}
