import { Component, ViewEncapsulation } from '@angular/core';
import {
  ButtonComponent,
  ToggleButtonComponent,
  type ButtonColor,
  type ButtonFill,
} from 'ds';
import { DocsSectionComponent } from '../../../shared/docs-section.component';
import {
  DocsTruncationComponent,
  TruncationRule,
} from '../../../shared/docs-truncation.component';

interface ComboRow {
  readonly label: string;
  readonly color: ButtonColor;
  /** The fills legal for this colour (see the color × fill matrix). */
  readonly fills: readonly ButtonFill[];
}

interface FillSpec {
  readonly label: string;
  readonly fill: ButtonFill;
}

@Component({
  selector: 'section-components-button',
  standalone: true,
  imports: [
    ButtonComponent,
    DocsSectionComponent,
    DocsTruncationComponent,
    ToggleButtonComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './button.section.html',
  styleUrl: './button.section.scss',
})
export class ButtonSection {
  /** Columns of the color × fill matrix. */
  protected readonly fills: readonly ButtonFill[] = [
    'solid',
    'tonal',
    'ghost',
    'outline',
  ];

  /** Rows of the color × fill matrix — each colour lists its legal fills.
      Cells outside a colour's legal fills render as "—" (unsupported). */
  protected readonly combos: readonly ComboRow[] = [
    {
      label: 'Primary',
      color: 'primary',
      fills: ['solid', 'tonal', 'ghost', 'outline'],
    },
    {
      label: 'Secondary',
      color: 'secondary',
      fills: ['solid', 'tonal', 'ghost', 'outline'],
    },
    {
      label: 'Tertiary',
      color: 'tertiary',
      fills: ['solid', 'tonal', 'ghost', 'outline'],
    },
    {
      label: 'Neutral',
      color: 'neutral',
      fills: ['tonal', 'ghost', 'outline'],
    },
    {
      label: 'Error',
      color: 'error',
      fills: ['solid', 'tonal', 'ghost', 'outline'],
    },
    { label: 'Success', color: 'success', fills: ['solid', 'tonal'] },
    { label: 'Warning', color: 'warning', fills: ['solid', 'tonal'] },
  ];

  /** Rows of the states matrix — primary colour in each fill. */
  protected readonly stateFills: readonly FillSpec[] = [
    { label: 'Solid', fill: 'solid' },
    { label: 'Tonal', fill: 'tonal' },
    { label: 'Ghost', fill: 'ghost' },
    { label: 'Outline', fill: 'outline' },
  ];

  /** Horizontal axis of the states matrix. hover/focus/active are pinned for display. */
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
