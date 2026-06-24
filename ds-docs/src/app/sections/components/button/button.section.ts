import { Component, ViewEncapsulation } from '@angular/core';
import { ButtonComponent, IconComponent, type ButtonVariant } from 'ds';
import { DocsAwaitComponent } from '../../../shared/docs-await.component';
import { DocsSectionComponent } from '../../../shared/docs-section.component';
import {
  DocsTruncationComponent,
  TruncationRule,
} from '../../../shared/docs-truncation.component';

interface VariantSpec {
  readonly label: string;
  readonly key: ButtonVariant;
}

@Component({
  selector: 'section-components-button',
  standalone: true,
  imports: [
    ButtonComponent,
    DocsAwaitComponent,
    DocsSectionComponent,
    DocsTruncationComponent,
    IconComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './button.section.html',
  styleUrl: './button.section.scss',
})
export class ButtonSection {
  /** All variants, vertical axis of both the size and the state matrix. */
  protected readonly variants: readonly VariantSpec[] = [
    { label: 'Primary', key: 'primary' },
    { label: 'Secondary', key: 'secondary' },
    { label: 'Tertiary', key: 'tertiary' },
    { label: 'Outline', key: 'outline' },
    { label: 'Error', key: 'error' },
    { label: 'Success', key: 'success' },
    { label: 'Warning', key: 'warning' },
    { label: 'Text', key: 'text' },
  ];

  /** Horizontal axis of the state matrix. hover/focus/active are pinned for display. */
  protected readonly states = [
    'Default',
    'Hover',
    'Focus',
    'Active',
    'Disabled',
    'Loading',
  ] as const;

  protected readonly truncationRules: TruncationRule[] = [
    {
      field: 'Label',
      behaviour:
        'Single line, ellipsis on overflow. Buttons must fit — rephrase if you need multi-line. No tooltip.',
    },
    {
      field: 'Icon-only',
      behaviour:
        'No visible label; full label MUST live in aria-label and tooltip-on-hover.',
    },
    {
      field: 'Split-button menu items',
      behaviour: 'Single line, ellipsis. Tooltip on hover when clipped.',
    },
  ];
}
