import { Component, ViewEncapsulation } from '@angular/core';
import {
  ButtonComponent,
  ToggleButtonComponent,
  type ButtonColor,
  type ButtonVariant,
} from 'ds';
import { DocsSectionComponent } from '../../../shared/docs-section.component';
import {
  DocsTruncationComponent,
  TruncationRule,
} from '../../../shared/docs-truncation.component';

interface ComboRow {
  readonly label: string;
  readonly color: ButtonColor;
  /** brand / neutral / status — shown next to the row label. */
  readonly note: string;
  /** CSS colour for the row swatch dot. */
  readonly dot: string;
  /** The variants legal for this colour (others render "—"). */
  readonly variants: readonly ButtonVariant[];
}

interface VariantSpec {
  readonly label: string;
  readonly variant: ButtonVariant;
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
  /** Columns of the color × variant matrix. */
  protected readonly variants: readonly ButtonVariant[] = [
    'solid',
    'tonal',
    'ghost',
    'outline',
  ];

  /** Rows of the color × variant matrix — each colour lists its legal variants.
      Cells outside a colour's legal variants render "—" (unsupported). */
  protected readonly combos: readonly ComboRow[] = [
    {
      label: 'Primary',
      color: 'primary',
      note: 'brand',
      dot: 'var(--primary)',
      variants: ['solid', 'tonal', 'ghost', 'outline'],
    },
    {
      label: 'Secondary',
      color: 'secondary',
      note: 'brand',
      dot: 'var(--secondary)',
      variants: ['solid', 'tonal', 'ghost', 'outline'],
    },
    {
      label: 'Tertiary',
      color: 'tertiary',
      note: 'brand',
      dot: 'var(--tertiary)',
      variants: ['solid', 'tonal', 'ghost', 'outline'],
    },
    {
      label: 'Neutral',
      color: 'neutral',
      note: 'neutral',
      dot: 'var(--text-secondary)',
      variants: ['tonal', 'ghost', 'outline'],
    },
    {
      label: 'Error',
      color: 'error',
      note: 'status',
      dot: 'var(--error)',
      variants: ['solid', 'tonal', 'ghost', 'outline'],
    },
    {
      label: 'Success',
      color: 'success',
      note: 'status',
      dot: 'var(--success)',
      variants: ['solid', 'tonal'],
    },
    {
      label: 'Warning',
      color: 'warning',
      note: 'status',
      dot: 'var(--warning)',
      variants: ['solid', 'tonal'],
    },
  ];

  /** Rows of the states matrix — primary colour in each variant. */
  protected readonly stateVariants: readonly VariantSpec[] = [
    { label: 'Solid', variant: 'solid' },
    { label: 'Tonal', variant: 'tonal' },
    { label: 'Ghost', variant: 'ghost' },
    { label: 'Outline', variant: 'outline' },
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
