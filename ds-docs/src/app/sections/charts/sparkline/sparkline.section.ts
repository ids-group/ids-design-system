import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { SparklineComponent } from 'ds/sparkline';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

const MONTHS: readonly string[] = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const AVAILABILITY: readonly number[] = [
  99.5, 99.4, 99.2, 98.7, 93.1, 96.8, 98.9, 99.3, 99.1, 99.4, 99.5, 99.4,
];

const ROWS = [
  {
    name: 'Sessions',
    value: '48,210',
    data: [310, 342, 330, 365, 402, 398, 441, 460, 452, 488, 471, 482],
  },
  {
    name: 'Signups',
    value: '1,904',
    data: [120, 118, 131, 125, 142, 160, 151, 170, 166, 181, 175, 190],
  },
  {
    name: 'Churn',
    value: '2.1%',
    data: [3.4, 3.1, 3.3, 2.9, 2.8, 2.6, 2.7, 2.4, 2.5, 2.2, 2.3, 2.1],
  },
  { name: 'Uptime', value: '99.4%', data: AVAILABILITY },
];

@Component({
  selector: 'section-charts-sparkline',
  standalone: true,
  imports: [DocsSectionComponent, SparklineComponent],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sparkline.section.html',
  styleUrls: ['../../../shared/section-demo.scss', './sparkline.section.scss'],
})
export class SparklineSection {
  protected readonly months = MONTHS;
  protected readonly availability = AVAILABILITY;
  protected readonly rows = ROWS;
  protected readonly gapped: readonly (number | null)[] = [
    12,
    14,
    13,
    null,
    null,
    17,
    19,
    18,
    21,
    null,
    24,
    23,
  ];
  protected readonly percent = (value: number): string => `${value}%`;
}
