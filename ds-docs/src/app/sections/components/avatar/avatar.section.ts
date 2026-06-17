import { Component, ViewEncapsulation } from '@angular/core';
import { AvatarComponent, AvatarGroupComponent } from 'ds';
import {
  DocsTruncationComponent,
  TruncationRule,
} from '../../../shared/docs-truncation.component';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-avatar',
  standalone: true,
  imports: [
    AvatarComponent,
    AvatarGroupComponent,
    DocsTruncationComponent,
    DocsSectionComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './avatar.section.html',
  styleUrl: './avatar.section.scss',
})
export class AvatarSection {
  protected readonly truncationRules: TruncationRule[] = [
    {
      field: 'Initials fallback',
      behaviour: '2 chars max — no clip. Generated from first + last name.',
    },
    {
      field: 'Adjacent name label',
      behaviour: 'Single line, ellipsis. Tooltip on hover with full name.',
    },
    {
      field: '+N overflow',
      behaviour:
        'Numeric only — no clip. Hidden member names are not surfaced by the component.',
    },
  ];
}
