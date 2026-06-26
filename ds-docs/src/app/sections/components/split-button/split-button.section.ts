import { Component, ViewEncapsulation, signal } from '@angular/core';
import { SplitButtonComponent, SplitButtonItem } from 'ds';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-split-button',
  standalone: true,
  imports: [DocsSectionComponent, SplitButtonComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './split-button.section.html',
  styleUrl: '../../../shared/section-demo.scss',
})
export class SplitButtonSection {
  protected readonly saveActions: SplitButtonItem[] = [
    { label: 'Save as…', value: 'save-as', icon: 'copy' },
    { label: 'Save a copy', value: 'copy' },
    { label: 'Discard changes', value: 'discard', icon: 'trash', danger: true },
  ];

  protected readonly exportActions: SplitButtonItem[] = [
    { label: 'CSV', value: 'csv' },
    { label: 'PDF', value: 'pdf' },
    { label: 'JSON', value: 'json' },
  ];

  protected readonly lastAction = signal('');

  onSave(): void {
    this.lastAction.set('Save');
  }

  onPick(item: SplitButtonItem): void {
    this.lastAction.set(item.label);
  }
}
