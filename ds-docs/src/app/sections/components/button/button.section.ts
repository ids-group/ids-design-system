import { Component, ViewEncapsulation } from '@angular/core';
import { ButtonComponent, IconComponent } from 'ds';

interface VariantSpec {
  readonly label: string;
  readonly key: 'primary' | 'secondary' | 'tertiary' | 'outline' | 'error';
}

@Component({
  selector: 'section-components-button',
  standalone: true,
  imports: [ButtonComponent, IconComponent],
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
}
