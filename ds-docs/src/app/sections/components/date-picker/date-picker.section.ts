import { Component, ViewEncapsulation } from '@angular/core';
import { DatePickerComponent } from 'ds/date-picker';
import type { DatePickerPreset } from 'ds/date-picker';
import { DocsSectionComponent } from '../../../shared/docs-section.component';
import { DocsNonmodalNoteComponent } from '../../../shared/docs-nonmodal-note.component';

@Component({
  selector: 'section-components-date-picker',
  standalone: true,
  imports: [
    DatePickerComponent,
    DocsSectionComponent,
    DocsNonmodalNoteComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './date-picker.section.html',
  styleUrls: [
    '../../../shared/section-demo.scss',
    './date-picker.section.scss',
  ],
})
export class DatePickerSection {
  protected readonly minDateToday = new Date();

  protected readonly maxDateThirtyDays = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate() + 30,
  );

  /** Saturday=6, Sunday=0 — JS Date.getDay() weekday numbering. */
  protected readonly disableWeekends = (date: Date): boolean => {
    const day = date.getDay();

    return day === 0 || day === 6;
  };

  /** Date-of-birth demo: no future dates, open near a realistic birth year */
  protected readonly today = new Date();
  protected readonly birthDefaultDate = new Date(1990, 0, 1);

  protected readonly rangePresets: readonly DatePickerPreset[] = [
    {
      label: 'Today',
      value: new Date(),
    },
    {
      label: 'Yesterday',
      value: (() => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        return yesterday;
      })(),
    },
    {
      label: 'Last 7 days',
      value: (() => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 6);

        return [start, end] as [Date, Date];
      })(),
    },
    {
      label: 'Last 30 days',
      value: (() => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 29);

        return [start, end] as [Date, Date];
      })(),
    },
  ];
}
