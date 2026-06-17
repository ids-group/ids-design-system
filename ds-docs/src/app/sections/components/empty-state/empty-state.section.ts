import { Component, ViewEncapsulation } from '@angular/core';
import { ButtonComponent, EmptyStateComponent, IconComponent } from 'ds';
import { DocsSectionComponent } from '../../../shared/docs-section.component';
import {
  DocsTruncationComponent,
  TruncationRule,
} from '../../../shared/docs-truncation.component';

@Component({
  selector: 'section-components-empty-state',
  standalone: true,
  imports: [
    ButtonComponent,
    DocsSectionComponent,
    DocsTruncationComponent,
    EmptyStateComponent,
    IconComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './empty-state.section.html',
  styleUrl: './empty-state.section.scss',
})
export class EmptyStateComponentSection {
  protected readonly truncationRules: TruncationRule[] = [
    {
      field: 'Title',
      behaviour:
        'Wraps to a second line if needed. Never clip — the user needs the full sentence to understand the state.',
    },
    {
      field: 'Body',
      behaviour:
        "Wraps, no clip. Capped at ~360 px via max-width so a long sentence doesn't span the full card width.",
    },
    {
      field: 'CTA label',
      behaviour:
        'Short verb phrases only (Retry, Allocate resources). If the action needs a sentence, the empty state copy is wrong.',
    },
    {
      field: 'Icon',
      behaviour:
        "Fixed 28 px inside a 64 px rounded tile. Doesn't scale with title length — always centred above the title.",
    },
  ];
}
