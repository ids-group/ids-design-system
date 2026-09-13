import { Component, ViewEncapsulation } from '@angular/core';
import { DonutChartComponent } from 'ds/donut-chart';
import type { DonutChartSlice } from 'ds/donut-chart';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

const SPECIMEN_SLICES: readonly DonutChartSlice[] = [
  { id: 'enterprise', label: 'Enterprise', value: 4820 },
  { id: 'business', label: 'Business', value: 3610 },
  { id: 'team', label: 'Team', value: 2140 },
  { id: 'starter', label: 'Starter', value: 1290 },
];

const ONE_SLICE: readonly DonutChartSlice[] = [
  { id: 'enterprise', label: 'Enterprise', value: 11860 },
];

const ALL_ZEROS_SLICES: readonly DonutChartSlice[] = [
  { id: 'enterprise', label: 'Enterprise', value: 0 },
  { id: 'business', label: 'Business', value: 0 },
  { id: 'team', label: 'Team', value: 0 },
];

const NEGATIVE_SLICES: readonly DonutChartSlice[] = [
  { id: 'renewals', label: 'Renewals', value: 4200 },
  { id: 'refunds', label: 'Refunds', value: -650 },
  { id: 'new-business', label: 'New business', value: 2800 },
];

const NINE_SLICES: readonly DonutChartSlice[] = [
  { id: 'london', label: 'London', value: 3200 },
  { id: 'manchester', label: 'Manchester', value: 2450 },
  { id: 'birmingham', label: 'Birmingham', value: 2100 },
  { id: 'leeds', label: 'Leeds', value: 1780 },
  { id: 'glasgow', label: 'Glasgow', value: 1540 },
  { id: 'bristol', label: 'Bristol', value: 1310 },
  { id: 'cardiff', label: 'Cardiff', value: 1080 },
  { id: 'belfast', label: 'Belfast', value: 860 },
  { id: 'newcastle', label: 'Newcastle', value: 640 },
];

const SLOT_SLICES: readonly DonutChartSlice[] = [
  { id: 'approved', label: 'Approved', value: 2400, slot: 6 },
  { id: 'referred', label: 'Referred', value: 1100, slot: 8 },
  { id: 'declined', label: 'Declined', value: 520 },
  { id: 'expired', label: 'Expired', value: 180 },
];

@Component({
  selector: 'section-charts-donut-chart',
  standalone: true,
  imports: [DonutChartComponent, DocsSectionComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './donut-chart.section.html',
  styleUrl: './donut-chart.section.scss',
})
export class DonutChartSection {
  protected readonly specimenSlices = SPECIMEN_SLICES;
  protected readonly emptySlices: readonly DonutChartSlice[] = [];
  protected readonly oneSlice = ONE_SLICE;
  protected readonly allZerosSlices = ALL_ZEROS_SLICES;
  protected readonly negativeSlices = NEGATIVE_SLICES;
  protected readonly nineSlices = NINE_SLICES;
  protected readonly slotSlices = SLOT_SLICES;
}
