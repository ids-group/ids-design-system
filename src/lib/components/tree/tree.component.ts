import {
  Component,
  ElementRef,
  ViewEncapsulation,
  afterEveryRender,
  afterNextRender,
  booleanAttribute,
  computed,
  contentChild,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { IconComponent } from '@ids-group-ltd/ids-design-system/icons';
import {
  DS_INTL,
  DS_INTL_DEFAULTS,
} from '@ids-group-ltd/ids-design-system/core';
import { TreeLabelDirective } from './tree-label.directive';
import { TreeTrailingDirective } from './tree-trailing.directive';
import type { TreeNode, TreeSelection, TreeToggleOn } from './tree.types';

interface VisibleNode {
  node: TreeNode;
  level: number;
  hasChildren: boolean;
  expanded: boolean;
}

const FOCUSABLE =
  'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';
const PARKED_TABINDEX = 'data-ds-tree-tabindex';

let nextId = 0;

@Component({
  selector: 'ds-tree',
  standalone: true,
  imports: [IconComponent, NgTemplateOutlet],
  templateUrl: './tree.component.html',
  styleUrl: './tree.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    role: 'tree',
    '[attr.aria-multiselectable]': "multiple() ? 'true' : null",
    '[class.is-animated]': 'animate()',
    '(keydown)': 'onKeydown($event)',
    '(pointerleave)': 'hover(null)',
  },
})
export class TreeComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly intl = inject(DS_INTL);

  /** Root-level nodes; nest via `children`. */
  readonly nodes = input<readonly TreeNode[]>([]);
  /** Ids of the expanded nodes. */
  readonly expandedIds = model<Set<string>>(new Set());
  /** `'multiple'` reads and writes `selectedIds`; `'single'` reads and writes `selectedId`. */
  readonly selection = input<TreeSelection>('single');
  /** Id of the selected node, in `'single'` selection. */
  readonly selectedId = model<string | null>(null);
  /** Ids of the selected nodes, in `'multiple'` selection. */
  readonly selectedIds = model<string[]>([]);
  /** What expands and collapses a parent. `'row'`: activating the row (click, Enter, Space) selects
   *  it and toggles it. `'caret'`: activating the row only selects it, and the chevron is a button of
   *  its own that toggles. `'doubleClick'`: a click selects, a double click toggles. In every mode
   *  ArrowRight expands and ArrowLeft collapses the focused row. */
  readonly toggleOn = input<TreeToggleOn>('row');
  /** Rows slide open and shut and the chevron turns when a parent expands or collapses. Off under
   *  `prefers-reduced-motion: reduce`. */
  readonly animate = input(true, { transform: booleanAttribute });
  /** Fires with the node when a row is selected (click or Enter/Space), not when one is deselected. */
  readonly nodeSelected = output<TreeNode>();
  /** Fires with the node under the pointer or newly focused, and `null` when the pointer leaves the tree. */
  readonly nodeHover = output<TreeNode | null>();

  protected readonly label = contentChild(TreeLabelDirective);
  protected readonly trailing = contentChild(TreeTrailingDirective);
  protected readonly idPrefix = `ds-tree-${++nextId}`;

  private readonly activeId = signal<string | null>(null);
  private hoveredId: string | null = null;
  // The rows of the first render are not revealed by a toggle, so they appear without motion.
  private readonly rendered = signal(false);

  protected readonly motion = computed(() => this.animate() && this.rendered());
  protected readonly multiple = computed(() => this.selection() === 'multiple');
  protected readonly labels = computed(() => ({
    ...DS_INTL_DEFAULTS.tree,
    ...this.intl().tree,
  }));

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

  protected readonly effectiveActiveId = computed(
    () => this.activeId() ?? this.visibleNodes()[0]?.node.id ?? null,
  );

  constructor() {
    // Content inside a trailing template can change without a signal of the tree changing,
    // so its tab stops are re-parked after every render.
    afterEveryRender({ write: () => this.parkTrailingTabStops() });
    afterNextRender(() => this.rendered.set(true));
  }

  protected isExpanded(id: string): boolean {
    return this.expandedIds().has(id);
  }

  protected isSelected(id: string): boolean {
    return this.multiple()
      ? this.selectedIds().includes(id)
      : this.selectedId() === id;
  }

  protected isActive(id: string): boolean {
    return this.effectiveActiveId() === id;
  }

  protected onRowClick(entry: VisibleNode, event: MouseEvent): void {
    // The second click of a double click belongs to the toggle, not to a second selection.
    if (
      this.fromTrailing(event) ||
      (this.toggleOn() === 'doubleClick' && event.detail > 1)
    ) {
      return;
    }
    this.activate(entry, event.shiftKey || event.ctrlKey || event.metaKey);
  }

  protected onRowDoubleClick(entry: VisibleNode, event: MouseEvent): void {
    if (
      this.toggleOn() !== 'doubleClick' ||
      this.fromTrailing(event) ||
      event.shiftKey ||
      event.ctrlKey ||
      event.metaKey
    ) {
      return;
    }
    this.toggle(entry.node);
  }

  protected onCaretClick(entry: VisibleNode, event: MouseEvent): void {
    event.stopPropagation();
    if (entry.node.disabled) {
      return;
    }
    this.focusNode(entry.node.id);
    this.toggle(entry.node);
  }

  protected onRowFocus(entry: VisibleNode): void {
    this.activeId.set(entry.node.id);
    this.hover(entry.node);
  }

  protected hover(node: TreeNode | null): void {
    const id = node?.id ?? null;
    if (id === this.hoveredId) {
      return;
    }
    this.hoveredId = id;
    this.nodeHover.emit(node);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (this.fromTrailing(event)) {
      return;
    }
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
      case 'Enter':
      case ' ':
        if (!event.repeat) {
          this.activate(
            current,
            event.shiftKey || event.ctrlKey || event.metaKey,
          );
        }
        break;
      default:
        return;
    }
    event.preventDefault();
  }

  // A modified activation in multiple selection only adds or removes the node; every other
  // activation selects the node alone, and toggles a parent when the row is the toggle.
  private activate(entry: VisibleNode, modified: boolean): void {
    const node = entry.node;
    if (node.disabled) {
      return;
    }
    this.activeId.set(node.id);
    if (this.multiple() && modified) {
      const ids = this.selectedIds();
      if (ids.includes(node.id)) {
        this.selectedIds.set(ids.filter((id) => id !== node.id));
      } else {
        this.selectedIds.set([...ids, node.id]);
        this.nodeSelected.emit(node);
      }

      return;
    }
    if (this.multiple()) {
      this.selectedIds.set([node.id]);
    } else {
      this.selectedId.set(node.id);
    }
    this.nodeSelected.emit(node);
    if (entry.hasChildren && this.toggleOn() === 'row') {
      this.toggle(node);
    }
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
      .querySelector<HTMLElement>(
        `.row-shell:not(.is-leaving) > [data-node-id="${CSS.escape(id)}"]`,
      )
      ?.focus();
  }

  private fromTrailing(event: Event): boolean {
    return (
      event.target instanceof Element && !!event.target.closest('.trailing')
    );
  }

  // The tree keeps one tab stop: controls in a trailing template are tabbable on the active
  // row only, and get their own tabindex back when their row becomes active.
  private parkTrailingTabStops(): void {
    const activeId = this.effectiveActiveId();
    for (const area of this.host.nativeElement.querySelectorAll('.trailing')) {
      const onActiveRow =
        area.closest('[data-node-id]')?.getAttribute('data-node-id') ===
        activeId;
      const controls = area.querySelectorAll<HTMLElement>(
        onActiveRow ? `[${PARKED_TABINDEX}]` : FOCUSABLE,
      );
      for (const control of controls) {
        if (onActiveRow) {
          const own = control.getAttribute(PARKED_TABINDEX);
          control.removeAttribute(PARKED_TABINDEX);
          if (own) {
            control.setAttribute('tabindex', own);
          } else {
            control.removeAttribute('tabindex');
          }
        } else if (!control.hasAttribute(PARKED_TABINDEX)) {
          control.setAttribute(
            PARKED_TABINDEX,
            control.getAttribute('tabindex') ?? '',
          );
          control.setAttribute('tabindex', '-1');
        }
      }
    }
  }
}
