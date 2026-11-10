import { Component, ViewEncapsulation, signal } from '@angular/core';
import { BadgeComponent } from 'ds/badge';
import { IconButtonComponent } from 'ds/icon-button';
import { TooltipDirective } from 'ds/tooltip';
import {
  TreeComponent,
  TreeLabelDirective,
  TreeTrailingDirective,
} from 'ds/tree';
import type { TreeNode, TreeToggleOn } from 'ds/tree';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-tree',
  standalone: true,
  imports: [
    BadgeComponent,
    DocsSectionComponent,
    IconButtonComponent,
    TooltipDirective,
    TreeComponent,
    TreeLabelDirective,
    TreeTrailingDirective,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './tree.section.html',
  styleUrls: ['../../../shared/section-demo.scss', './tree.section.scss'],
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
  protected readonly selectedLabel = signal('tokens.scss');

  protected readonly toggleModes: readonly TreeToggleOn[] = [
    'row',
    'caret',
    'doubleClick',
  ];
  protected readonly toggleExpanded = {
    row: signal(new Set(['src'])),
    caret: signal(new Set(['src'])),
    doubleClick: signal(new Set(['src'])),
  };
  protected readonly toggleSelected = {
    row: signal<string | null>(null),
    caret: signal<string | null>(null),
    doubleClick: signal<string | null>(null),
  };

  protected readonly motionExpanded = {
    on: signal(new Set(['src'])),
    off: signal(new Set(['src'])),
  };

  protected readonly layers: TreeNode[] = [
    {
      id: 'shell',
      label: 'App shell',
      icon: 'layers',
      children: [
        { id: 'header', label: 'Header', icon: 'box' },
        { id: 'sidenav', label: 'Sidenav', icon: 'box' },
      ],
    },
    {
      id: 'checkout',
      label: 'Checkout',
      icon: 'file',
      children: [
        { id: 'summary', label: 'Order summary' },
        { id: 'payment', label: 'Payment form' },
        { id: 'pay', label: 'Pay button', icon: 'box' },
      ],
    },
  ];

  protected readonly badges: Record<string, string> = {
    shell: '2 screens',
    header: 'ds',
    sidenav: 'ds',
    pay: 'ds',
  };

  protected readonly layersExpanded = signal(new Set(['shell', 'checkout']));
  protected readonly layersSelected = signal(['header', 'summary', 'pay']);
  protected readonly hovered = signal<string | null>(null);
  protected readonly hidden = signal<string | null>(null);

  protected readonly elements: TreeNode[] = [
    {
      id: 'page',
      label: 'Checkout page',
      children: [
        {
          id: 'card',
          label: 'Order summary for the customer with delivery and VAT lines',
          children: [
            { id: 'heading', label: 'Order summary' },
            { id: 'total', label: '£1,240.00' },
          ],
        },
        {
          id: 'actions',
          label: 'Actions',
          children: [{ id: 'pay', label: 'Pay now' }],
        },
      ],
    },
  ];

  protected readonly tags: Record<string, string> = {
    page: 'main',
    card: 'ds-card',
    heading: 'h2',
    total: 'span.order-total.is-highlighted.with-currency-symbol',
    actions: 'div',
    pay: 'ds-button',
  };

  protected readonly elementsExpanded = signal(
    new Set(['page', 'card', 'actions']),
  );
  protected readonly elementSelected = signal<string | null>('heading');

  protected readonly singleNode: TreeNode[] = [
    { id: 'node', label: 'Node label', icon: 'file' },
  ];

  protected readonly singleNodeDisabled: TreeNode[] = [
    { id: 'node', label: 'Node label', icon: 'file', disabled: true },
  ];
}
