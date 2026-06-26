import { Component, ViewEncapsulation, signal } from '@angular/core';
import { MultiSelectComponent, MultiSelectOption } from 'ds';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-multi-select',
  standalone: true,
  imports: [MultiSelectComponent, DocsSectionComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './multi-select.section.html',
  styleUrl: '../../../shared/section-demo.scss',
})
export class MultiSelectSection {
  protected readonly tags = signal<string[]>(['design', 'frontend']);
  protected readonly overflow = signal<string[]>([
    'design',
    'frontend',
    'research',
    'marketing',
  ]);

  protected readonly tagOptions: MultiSelectOption[] = [
    { label: 'Design', value: 'design' },
    { label: 'Frontend', value: 'frontend' },
    { label: 'Research', value: 'research' },
    { label: 'Marketing', value: 'marketing' },
    { label: 'Operations', value: 'operations' },
    { label: 'Finance', value: 'finance' },
  ];
}
