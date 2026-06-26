import { Component, ViewEncapsulation, signal } from '@angular/core';
import { TreeComponent, type TreeNode } from 'ds';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-tree',
  standalone: true,
  imports: [DocsSectionComponent, TreeComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './tree.section.html',
  styleUrl: '../../../shared/section-demo.scss',
})
export class TreeSection {
  protected readonly nodes: TreeNode[] = [
    {
      id: 'src',
      label: 'src',
      icon: 'folder',
      children: [
        {
          id: 'components',
          label: 'components',
          icon: 'folder',
          children: [
            { id: 'tokens', label: 'tokens.scss', icon: 'file' },
            { id: 'ds', label: 'ds.scss', icon: 'file' },
          ],
        },
        { id: 'index', label: 'index.ts', icon: 'file' },
      ],
    },
    {
      id: 'docs',
      label: 'docs',
      icon: 'folder',
      children: [{ id: 'readme', label: 'README.md', icon: 'file' }],
    },
  ];

  protected readonly expanded = signal(new Set(['src', 'components']));
  protected readonly selected = signal<string | null>('tokens');

  onSelect(node: TreeNode): void {
    this.selected.set(node.id);
  }
}
