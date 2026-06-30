import { Component, ViewEncapsulation } from '@angular/core';
import { ButtonComponent, ToggleButtonComponent, type ButtonVariant } from 'ds';
import { DocsSectionComponent } from '../../../shared/docs-section.component';
import {
  DocsMatrixComponent,
  type DocsMatrixRow,
} from '../../../shared/docs-matrix.component';
import {
  DocsTruncationComponent,
  TruncationRule,
} from '../../../shared/docs-truncation.component';

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
    DocsMatrixComponent,
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
    'text',
  ];

  /** Rows of the color × variant matrix (key = the colour). Every combination
      renders; `discouraged` flags the UX-weak ones (marked ⚠, see the API). */
  protected readonly combos: readonly DocsMatrixRow[] = [
    { key: 'primary', label: 'Primary', note: 'brand', dot: 'var(--primary)' },
    {
      key: 'secondary',
      label: 'Secondary',
      note: 'brand',
      dot: 'var(--secondary)',
    },
    {
      key: 'tertiary',
      label: 'Tertiary',
      note: 'brand',
      dot: 'var(--tertiary)',
    },
    {
      key: 'neutral',
      label: 'Neutral',
      note: 'neutral',
      dot: 'var(--text-secondary)',
      discouraged: ['solid'],
    },
    { key: 'error', label: 'Error', note: 'status', dot: 'var(--error)' },
    {
      key: 'success',
      label: 'Success',
      note: 'status',
      dot: 'var(--success)',
      discouraged: ['ghost', 'outline'],
    },
    {
      key: 'warning',
      label: 'Warning',
      note: 'status',
      dot: 'var(--warning)',
      discouraged: ['ghost', 'outline'],
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
