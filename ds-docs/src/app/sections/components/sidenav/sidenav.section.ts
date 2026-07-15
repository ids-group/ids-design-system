import { Component, ViewEncapsulation } from '@angular/core';
import {
  SidenavComponent,
  SidenavGroupComponent,
  SidenavItemComponent,
} from 'ds';
import { DocsSectionComponent } from '../../../shared/docs-section.component';
import {
  DocsTruncationComponent,
  TruncationRule,
} from '../../../shared/docs-truncation.component';

@Component({
  selector: 'section-components-sidenav',
  standalone: true,
  imports: [
    SidenavComponent,
    SidenavGroupComponent,
    SidenavItemComponent,
    DocsSectionComponent,
    DocsTruncationComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './sidenav.section.html',
  styleUrls: [
    '../../../shared/section-demo.scss',
    './sidenav.section.scss',
  ],
})
export class SidenavSection {
  protected readonly truncationRules: TruncationRule[] = [
    {
      field: 'Item label (expanded)',
      behaviour:
        'Single line, ellipsis at panel width. Tooltip on hover when clipped.',
    },
    {
      field: 'Item label (collapsed)',
      behaviour:
        'Hidden — the full label moves to a tooltip on hover or keyboard focus.',
    },
    {
      field: 'Count badge',
      behaviour:
        'No clip — numeric, fixed surface area. Caps at 99+ if needed.',
    },
    {
      field: 'Group label',
      behaviour:
        'Uppercase, single line, no clip. Wraps if forced (unlikely at panel widths).',
    },
    {
      field: 'Brand name',
      behaviour:
        'Single line, ellipsis at panel width. Tooltip on hover. Hidden entirely when collapsed.',
    },
    {
      field: 'User name (footer)',
      behaviour:
        'Single line, ellipsis. Tooltip on hover. Role row truncates the same way.',
    },
  ];
}
