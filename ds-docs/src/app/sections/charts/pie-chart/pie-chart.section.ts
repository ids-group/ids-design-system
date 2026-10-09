import { RouterLink } from '@angular/router';
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  signal,
} from '@angular/core';
import { PieChartComponent } from 'ds/pie-chart';
import type { PieChartSlice } from 'ds/pie-chart';
import { DocsChartDataEditorComponent } from '../../../shared/docs-chart-data-editor.component';
import { DocsReplayButtonComponent } from '../../../shared/docs-replay-button.component';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

const SPECIMEN_SLICES: readonly PieChartSlice[] = [
  { id: 'enterprise', label: 'Enterprise', value: 4820 },
  { id: 'business', label: 'Business', value: 3610 },
  { id: 'team', label: 'Team', value: 2140 },
  { id: 'starter', label: 'Starter', value: 1290 },
];

const VISIT_SLICES: readonly PieChartSlice[] = [
  { id: 'email', label: 'Email link', value: 28510 },
  { id: 'qr', label: 'QR scan', value: 2591 },
  { id: 'purl', label: 'Personal URL', value: 1296 },
];

const LARGE_SLICES: readonly PieChartSlice[] = [
  { id: 'email', label: 'Email link', value: 1086419 },
  { id: 'qr', label: 'QR scan', value: 98765 },
  { id: 'purl', label: 'Personal URL', value: 49383 },
];

const ONE_SLICE: readonly PieChartSlice[] = [
  { id: 'enterprise', label: 'Enterprise', value: 11860 },
];

const ALL_ZEROS_SLICES: readonly PieChartSlice[] = [
  { id: 'enterprise', label: 'Enterprise', value: 0 },
  { id: 'business', label: 'Business', value: 0 },
  { id: 'team', label: 'Team', value: 0 },
];

const NEGATIVE_SLICES: readonly PieChartSlice[] = [
  { id: 'renewals', label: 'Renewals', value: 4200 },
  { id: 'refunds', label: 'Refunds', value: -650 },
  { id: 'new-business', label: 'New business', value: 2800 },
];

const NINE_SLICES: readonly PieChartSlice[] = [
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

const SLOT_SLICES: readonly PieChartSlice[] = [
  { id: 'approved', label: 'Approved', value: 2400, slot: 6 },
  { id: 'referred', label: 'Referred', value: 1100, slot: 8 },
  { id: 'declined', label: 'Declined', value: 520 },
  { id: 'expired', label: 'Expired', value: 180 },
];

@Component({
  selector: 'section-charts-pie-chart',
  standalone: true,
  imports: [
    RouterLink,
    DocsReplayButtonComponent,
    DocsChartDataEditorComponent,
    DocsSectionComponent,
    PieChartComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pie-chart.section.html',
  styleUrls: ['../../../shared/section-demo.scss', './pie-chart.section.scss'],
})
export class PieChartSection {
  protected readonly interactionSlices =
    signal<readonly PieChartSlice[]>(SPECIMEN_SLICES);
  protected readonly dimSlices =
    signal<readonly PieChartSlice[]>(SPECIMEN_SLICES);
  protected readonly pinSlices =
    signal<readonly PieChartSlice[]>(SPECIMEN_SLICES);
  protected readonly lastSlice = signal('');
  protected readonly specimenSlices =
    signal<readonly PieChartSlice[]>(SPECIMEN_SLICES);
  protected readonly legendEndSlices =
    signal<readonly PieChartSlice[]>(SPECIMEN_SLICES);
  protected readonly legendBottomSlices =
    signal<readonly PieChartSlice[]>(SPECIMEN_SLICES);
  protected readonly legendNoneSlices =
    signal<readonly PieChartSlice[]>(SPECIMEN_SLICES);
  protected readonly thinRingSlices =
    signal<readonly PieChartSlice[]>(SPECIMEN_SLICES);
  protected readonly pieSlices =
    signal<readonly PieChartSlice[]>(SPECIMEN_SLICES);
  protected readonly centerLabelSlices =
    signal<readonly PieChartSlice[]>(SPECIMEN_SLICES);
  protected readonly centerValueSlices =
    signal<readonly PieChartSlice[]>(SPECIMEN_SLICES);
  protected readonly visitSlices =
    signal<readonly PieChartSlice[]>(VISIT_SLICES);
  protected readonly largeSlices =
    signal<readonly PieChartSlice[]>(LARGE_SLICES);
  protected readonly slotSlices = signal<readonly PieChartSlice[]>(SLOT_SLICES);
  protected readonly dataTableSlices =
    signal<readonly PieChartSlice[]>(SPECIMEN_SLICES);
  protected readonly emptySlices = signal<readonly PieChartSlice[]>([]);
  protected readonly loadingSlices =
    signal<readonly PieChartSlice[]>(SPECIMEN_SLICES);
  protected readonly oneSlice = signal<readonly PieChartSlice[]>(ONE_SLICE);
  protected readonly allZerosSlices =
    signal<readonly PieChartSlice[]>(ALL_ZEROS_SLICES);
  protected readonly negativeSlices =
    signal<readonly PieChartSlice[]>(NEGATIVE_SLICES);
  protected readonly nineSlices = signal<readonly PieChartSlice[]>(NINE_SLICES);
}
