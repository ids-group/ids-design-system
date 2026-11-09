import { Component } from '@angular/core';
import { ButtonComponent } from 'ds/button';
import { PopoverComponent, DsPopoverTrigger } from 'ds/popover';
import { TreeComponent } from 'ds/tree';
import type { TreeNode } from 'ds/tree';

const params = new URLSearchParams(location.search);

@Component({
  selector: 'app-density-overlay-harness',
  imports: [ButtonComponent, PopoverComponent, DsPopoverTrigger, TreeComponent],
  template: `
    <div [attr.data-density]="density">
      <ds-button id="trigger" [dsPopoverTrigger]="pop">
        Pick a screen
      </ds-button>

      <ds-popover #pop panelRole="dialog" panelLabel="Pick a screen">
        <ds-tree [nodes]="nodes" />
      </ds-popover>
    </div>
  `,
})
export class DensityOverlayHarnessPage {
  protected readonly density = params.get('density');
  protected readonly nodes: TreeNode[] = [
    {
      id: 'workspace',
      label: 'Workspace',
      children: [{ id: 'board', label: 'Board' }],
    },
  ];
}
