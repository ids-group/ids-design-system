import { Component, ViewEncapsulation, signal } from '@angular/core';
import { ButtonComponent } from 'ds/button';
import type { ButtonVariant } from 'ds/button';
import { SwitchComponent } from 'ds/switch';
import { DocsSectionComponent } from '../../../shared/docs-section.component';
import {
  DocsMatrixComponent,
  type DocsMatrixRow,
} from '../../../shared/docs-matrix.component';

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
    SwitchComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './button.section.html',
  styleUrl: './button.section.scss',
})
export class ButtonSection {
  /** Flips every cell of the colour x variant matrix to disabled, so the state can
   *  be compared against its live self without leaving the page. */
  protected readonly matrixDisabled = signal(false);

  /** Columns of the color × variant matrix. */
  protected readonly variants: readonly ButtonVariant[] = [
    'solid',
    'tonal',
    'outline',
    'ghost',
    'text',
  ];

  /** Rows of the color × variant matrix (key = the colour). Every combination
      renders; `discouraged` flags the UX-weak ones (marked ⚠, see the API).
      `text` is discouraged for every colour — prefer the global `.link` class. */
  protected readonly combos: readonly DocsMatrixRow[] = [
    {
      key: 'primary',
      label: 'Primary',
      note: 'brand',
      dot: 'var(--primary)',
      discouraged: ['text'],
    },
    {
      key: 'secondary',
      label: 'Secondary',
      note: 'brand',
      dot: 'var(--secondary)',
      discouraged: ['text'],
    },
    {
      key: 'tertiary',
      label: 'Tertiary',
      note: 'brand',
      dot: 'var(--tertiary)',
      discouraged: ['text'],
    },
    {
      key: 'neutral',
      label: 'Neutral',
      note: 'neutral',
      dot: 'var(--text-secondary)',
      discouraged: ['solid', 'text'],
    },
    {
      key: 'error',
      label: 'Error',
      note: 'status',
      dot: 'var(--error)',
      discouraged: ['text'],
    },
    {
      key: 'success',
      label: 'Success',
      note: 'status',
      dot: 'var(--success)',
      discouraged: ['outline', 'ghost', 'text'],
    },
    {
      key: 'warning',
      label: 'Warning',
      note: 'status',
      dot: 'var(--warning)',
      discouraged: ['outline', 'ghost', 'text'],
    },
  ];

  /** Rows of the states matrix — primary colour in each variant. */
  protected readonly stateVariants: readonly VariantSpec[] = [
    { label: 'Solid', variant: 'solid' },
    { label: 'Tonal', variant: 'tonal' },
    { label: 'Outline', variant: 'outline' },
    { label: 'Ghost', variant: 'ghost' },
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
}
