import { Component, ViewEncapsulation, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TimePickerComponent, type TimePickerValue } from 'ds';
import { DocsSectionComponent } from '../../../shared/docs-section.component';
import { DocsNonmodalNoteComponent } from '../../../shared/docs-nonmodal-note.component';

@Component({
  selector: 'section-components-time-picker',
  standalone: true,
  imports: [
    TimePickerComponent,
    DocsSectionComponent,
    ReactiveFormsModule,
    DocsNonmodalNoteComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './time-picker.section.html',
  styleUrl: './time-picker.section.scss',
})
export class TimePickerSection {
  protected readonly single = signal<TimePickerValue>('09:30');
  protected readonly stepped = signal<TimePickerValue>(null);
  protected readonly bounded = signal<TimePickerValue>(null);
  protected readonly range = signal<TimePickerValue>(['09:00', '17:00']);
  protected readonly timeControl = new FormControl<string | null>(null);

  /** disabledTime demo — block the lunch hour (works on zero-padded 24h strings). */
  protected readonly noLunch = (time: string): boolean =>
    time >= '12:00' && time < '13:00';
}
