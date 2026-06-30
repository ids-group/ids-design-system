import { Component, ViewEncapsulation, signal } from '@angular/core';
import {
  IconButtonComponent,
  type ButtonColor,
  type IconButtonVariant,
} from 'ds';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

interface ColorRow {
  readonly label: string;
  readonly color: ButtonColor;
  readonly dot: string;
}

@Component({
  selector: 'section-components-icon-button',
  standalone: true,
  imports: [DocsSectionComponent, IconButtonComponent],
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

  /** Rows of the matrix — the shared `color` axis. All combinations are legal
      (no banned cells, unlike ds-button). */
  protected readonly colors: readonly ColorRow[] = [
    { label: 'Primary', color: 'primary', dot: 'var(--primary)' },
    { label: 'Secondary', color: 'secondary', dot: 'var(--secondary)' },
    { label: 'Tertiary', color: 'tertiary', dot: 'var(--tertiary)' },
    { label: 'Neutral', color: 'neutral', dot: 'var(--text-secondary)' },
    { label: 'Error', color: 'error', dot: 'var(--error)' },
    { label: 'Success', color: 'success', dot: 'var(--success)' },
    { label: 'Warning', color: 'warning', dot: 'var(--warning)' },
  ];

  protected readonly bookmarked = signal(true);
}
