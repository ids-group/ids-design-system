import {
  CurrencyPipe,
  DatePipe,
  DecimalPipe,
  PercentPipe,
} from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { BadgeComponent } from 'ds/badge';
import { StatComponent } from 'ds/stat';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-stat',
  standalone: true,
  imports: [
    BadgeComponent,
    StatComponent,
    DocsSectionComponent,
    CurrencyPipe,
    DatePipe,
    DecimalPipe,
    PercentPipe,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './stat.section.html',
  styleUrl: './stat.section.scss',
})
export class StatSection {
  protected readonly records = 147238;
  protected readonly premium = 4830000;
  protected readonly renewalRate = 0.867;
  protected readonly nextRecompute = new Date('2026-09-01T09:00:00Z');
}
