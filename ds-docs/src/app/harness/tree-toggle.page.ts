import { Component, signal } from '@angular/core';
import { TreeComponent } from 'ds/tree';
import type { TreeNode, TreeToggleOn } from 'ds/tree';

const NODES: TreeNode[] = [
  {
    id: 'alpha',
    label: 'Alpha',
    children: [
      { id: 'alpha-1', label: 'Alpha one' },
      { id: 'alpha-2', label: 'Alpha two' },
    ],
  },
  {
    id: 'beta',
    label: 'Beta',
    children: [{ id: 'beta-1', label: 'Beta one' }],
  },
];

@Component({
  selector: 'app-tree-toggle-harness',
  imports: [TreeComponent],
  template: `
    @for (mode of modes; track mode) {
      <ds-tree
        style="width: 280px; margin-bottom: 24px"
        selection="multiple"
        [attr.data-mode]="mode"
        [nodes]="nodes"
        [toggleOn]="mode"
        [(expandedIds)]="expanded[mode]"
        [(selectedIds)]="selected[mode]" />
    }

    <ds-tree
      style="width: 280px"
      data-mode="static"
      [nodes]="nodes"
      [animate]="false"
      [(expandedIds)]="staticExpanded" />

    <div style="display: flex; justify-content: center; width: 480px">
      <ds-tree
        data-mode="fit"
        [nodes]="fitNodes"
        [(expandedIds)]="fitExpanded" />
    </div>
  `,
})
export class TreeToggleHarnessPage {
  protected readonly nodes = NODES;
  protected readonly modes: readonly TreeToggleOn[] = [
    'row',
    'caret',
    'doubleClick',
  ];
  protected readonly expanded = {
    row: signal(new Set<string>()),
    caret: signal(new Set<string>()),
    doubleClick: signal(new Set<string>()),
  };
  protected readonly staticExpanded = signal(new Set<string>());
  protected readonly fitNodes: TreeNode[] = [
    {
      id: 'fit',
      label: 'Fit',
      children: [{ id: 'fit-1', label: 'A child wider than its parent' }],
    },
  ];
  protected readonly fitExpanded = signal(new Set<string>());
  protected readonly selected = {
    row: signal<string[]>([]),
    caret: signal<string[]>([]),
    doubleClick: signal<string[]>([]),
  };
}
