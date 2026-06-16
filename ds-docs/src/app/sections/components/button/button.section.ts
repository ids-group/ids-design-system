import { Component, ViewEncapsulation } from '@angular/core';
import { ButtonComponent, IconComponent } from 'ds';
import { DocsAwaitComponent } from '../../../shared/docs-await.component';
import { DocsSectionComponent } from '../../../shared/docs-section.component';
import { DocsTruncationComponent, TruncationRule } from '../../../shared/docs-truncation.component';

interface VariantSpec {
  readonly label: string;
  readonly key: 'primary' | 'secondary' | 'tertiary' | 'outline' | 'error';
}

@Component({
  selector: 'section-components-button',
  standalone: true,
  imports: [ButtonComponent, DocsAwaitComponent, DocsSectionComponent, DocsTruncationComponent, IconComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './button.section.html',
  styleUrl: './button.section.scss',
})
export class ButtonSection {
  protected readonly variants: readonly VariantSpec[] = [
    { label: 'Primary',   key: 'primary' },
    { label: 'Secondary', key: 'secondary' },
    { label: 'Tertiary',  key: 'tertiary' },
    { label: 'Outline',   key: 'outline' },
    { label: 'Error',     key: 'error' },
  ];

  protected readonly truncationRules: TruncationRule[] = [
    { field: 'Label', behaviour: 'Single line, ellipsis on overflow. Buttons must fit — rephrase if you need multi-line. No tooltip.' },
    { field: 'Icon-only', behaviour: 'No visible label; full label MUST live in aria-label and tooltip-on-hover.' },
    { field: 'Split-button menu items', behaviour: 'Single line, ellipsis. Tooltip on hover when clipped.' },
  ];
}
