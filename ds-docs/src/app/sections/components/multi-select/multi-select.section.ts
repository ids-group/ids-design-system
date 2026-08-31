import { Component, ViewEncapsulation, signal } from '@angular/core';
import {
  DsChipTemplateDirective,
  DsOptionTemplateDirective,
  MultiSelectComponent,
  MultiSelectItem,
  MultiSelectOption,
  SelectComponent,
  SelectOption,
} from 'ds';
import { DocsSectionComponent } from '../../../shared/docs-section.component';
import { DocsNonmodalNoteComponent } from '../../../shared/docs-nonmodal-note.component';

@Component({
  selector: 'section-components-multi-select',
  standalone: true,
  imports: [
    MultiSelectComponent,
    SelectComponent,
    DsOptionTemplateDirective,
    DsChipTemplateDirective,
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
  protected readonly widthDemoValue = signal<string[]>(['design']);
  protected readonly assignees = signal<string[]>(['jordan']);
  protected readonly labels = signal<string[]>(['blocked']);
  protected readonly labelOptions: MultiSelectOption[] = [
    { value: 'blocked', label: 'Blocked' },
    { value: 'review', label: 'In review' },
    { value: 'ready', label: 'Ready for QA' },
  ];

  protected dotColour(value: string): string {
    const dots: Record<string, string> = {
      blocked: 'var(--error)',
      review: 'var(--warning)',
      ready: 'var(--success)',
    };

    return dots[value] ?? 'var(--border-strong)';
  }
  protected readonly assigneeItems: MultiSelectItem[] = [
    { value: 'unassigned', label: 'Unassigned' },
    {
      label: 'Product',
      options: [
        { value: 'avery', label: 'Avery Brooks' },
        { value: 'jordan', label: 'Jordan Lee' },
      ],
    },
    {
      label: 'Platform',
      options: [
        { value: 'morgan', label: 'Morgan Kirby' },
        { value: 'sam', label: 'Sam Rowe' },
      ],
    },
    {
      label: 'Contractors',
      disabled: true,
      options: [{ value: 'rue', label: 'Rue Castellan' }],
    },
  ];
  protected readonly widthDemoStatus = signal<string>('');
  protected readonly widthDemoStatuses: SelectOption[] = [
    { value: 'ready', label: 'Ready for QA' },
    { value: 'blocked', label: 'Blocked by upstream' },
    { value: 'review', label: 'Needs design review' },
  ];
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
