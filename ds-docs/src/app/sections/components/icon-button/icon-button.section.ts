import { Component, ViewEncapsulation, signal } from '@angular/core';
import { IconButtonComponent, type IconButtonVariant } from 'ds';
import { DocsSectionComponent } from '../../../shared/docs-section.component';
import {
  DocsMatrixComponent,
  type DocsMatrixRow,
} from '../../../shared/docs-matrix.component';

@Component({
  selector: 'section-components-icon-button',
  standalone: true,
  imports: [DocsSectionComponent, DocsMatrixComponent, IconButtonComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './icon-button.section.html',
  styleUrl: './icon-button.section.scss',
})
export class IconButtonSection {
  /** Columns of the color × variant matrix (icon-button's fill taxonomy). */
  protected readonly variants: readonly IconButtonVariant[] = [
    'standard',
    'filled',
    'tonal',
    'outlined',
  ];

  /** Rows of the matrix — the shared `color` axis (key = the colour). All
      combinations are legal (no banned cells, unlike ds-button). */
  protected readonly colors: readonly DocsMatrixRow[] = [
    { key: 'primary', label: 'Primary', dot: 'var(--primary)' },
    { key: 'secondary', label: 'Secondary', dot: 'var(--secondary)' },
    { key: 'tertiary', label: 'Tertiary', dot: 'var(--tertiary)' },
    { key: 'neutral', label: 'Neutral', dot: 'var(--text-secondary)' },
    { key: 'error', label: 'Error', dot: 'var(--error)' },
    { key: 'success', label: 'Success', dot: 'var(--success)' },
    { key: 'warning', label: 'Warning', dot: 'var(--warning)' },
  ];

  protected readonly bookmarked = signal(true);
}
