import { Component, ViewEncapsulation, signal } from '@angular/core';
import { MultiSelectComponent, MultiSelectOption } from 'ds';
import { DocsSectionComponent } from '../../../shared/docs-section.component';
import { DocsNonmodalNoteComponent } from '../../../shared/docs-nonmodal-note.component';

@Component({
  selector: 'section-components-multi-select',
  standalone: true,
  imports: [
    MultiSelectComponent,
    DocsSectionComponent,
    DocsNonmodalNoteComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './multi-select.section.html',
  styleUrls: [
    '../../../shared/section-demo.scss',
    './multi-select.section.scss',
  ],
})
export class MultiSelectSection {
  protected readonly tags = signal<string[]>(['design', 'frontend']);
  protected readonly overflow = signal<string[]>([
    'design',
    'frontend',
    'research',
    'marketing',
  ]);
  protected readonly fitted = signal<string[]>([
    'design',
    'frontend',
    'research',
    'marketing',
  ]);

  protected readonly priorityOptions: MultiSelectOption[] = [
    { label: 'Critical', value: 'critical', icon: 'flag' },
    { label: 'High', value: 'high', icon: 'chevronUp' },
    { label: 'Medium', value: 'medium', icon: 'minus' },
    { label: 'Low', value: 'low', icon: 'chevronDown' },
  ];
  protected readonly priority = signal<string[]>(['critical']);

  protected readonly tagOptions: MultiSelectOption[] = [
    { label: 'Design', value: 'design' },
    { label: 'Frontend', value: 'frontend' },
    { label: 'Research', value: 'research' },
    { label: 'Marketing', value: 'marketing' },
    { label: 'Operations', value: 'operations' },
    { label: 'Finance', value: 'finance' },
  ];
}
