import { Component, ViewEncapsulation } from '@angular/core';
import { FunnelChartComponent } from 'ds/funnel-chart';
import type { FunnelChartStage } from 'ds/funnel-chart';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

const SPECIMEN_STAGES: readonly FunnelChartStage[] = [
  { id: 'visited', label: 'Visited the site', value: 12400 },
  { id: 'viewed', label: 'Viewed a product', value: 7850 },
  { id: 'added', label: 'Added to basket', value: 3120 },
  { id: 'checkout', label: 'Started checkout', value: 1480 },
  { id: 'purchased', label: 'Purchased', value: 910 },
];

const ONE_STAGE: readonly FunnelChartStage[] = [
  { id: 'visited', label: 'Visited the site', value: 12400 },
];

const ALL_ZEROS_STAGES: readonly FunnelChartStage[] = [
  { id: 'visited', label: 'Visited the site', value: 0 },
  { id: 'viewed', label: 'Viewed a product', value: 0 },
  { id: 'purchased', label: 'Purchased', value: 0 },
];

const STEEP_DROP_STAGES: readonly FunnelChartStage[] = [
  { id: 'invited', label: 'Invited', value: 1000 },
  { id: 'activated', label: 'Activated', value: 10 },
];

const ZERO_FIRST_STAGE_STAGES: readonly FunnelChartStage[] = [
  { id: 'invited', label: 'Invited', value: 0 },
  { id: 'activated', label: 'Activated', value: 120 },
  { id: 'retained', label: 'Retained', value: 80 },
];

@Component({
  selector: 'section-charts-funnel-chart',
  standalone: true,
  imports: [FunnelChartComponent, DocsSectionComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './funnel-chart.section.html',
  styleUrl: './funnel-chart.section.scss',
})
export class FunnelChartSection {
  protected readonly specimenStages = SPECIMEN_STAGES;
  protected readonly emptyStages: readonly FunnelChartStage[] = [];
  protected readonly oneStage = ONE_STAGE;
  protected readonly allZerosStages = ALL_ZEROS_STAGES;
  protected readonly steepDropStages = STEEP_DROP_STAGES;
  protected readonly zeroFirstStageStages = ZERO_FIRST_STAGE_STAGES;
}
