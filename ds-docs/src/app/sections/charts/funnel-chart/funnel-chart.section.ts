import { RouterLink } from '@angular/router';
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  signal,
} from '@angular/core';
import { FunnelChartComponent } from 'ds/funnel-chart';
import type { FunnelChartStage } from 'ds/funnel-chart';
import { DocsChartDataEditorComponent } from '../../../shared/docs-chart-data-editor.component';
import { DocsReplayButtonComponent } from '../../../shared/docs-replay-button.component';
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
  imports: [
    RouterLink,
    DocsChartDataEditorComponent,
    DocsSectionComponent,
    FunnelChartComponent,
    DocsReplayButtonComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './funnel-chart.section.html',
  styleUrls: [
    '../../../shared/section-demo.scss',
    './funnel-chart.section.scss',
  ],
})
export class FunnelChartSection {
  protected readonly specimenStages =
    signal<readonly FunnelChartStage[]>(SPECIMEN_STAGES);
  protected readonly taperStages =
    signal<readonly FunnelChartStage[]>(SPECIMEN_STAGES);
  protected readonly widthStages =
    signal<readonly FunnelChartStage[]>(SPECIMEN_STAGES);
  protected readonly areaStages =
    signal<readonly FunnelChartStage[]>(SPECIMEN_STAGES);
  protected readonly steepDropWidthStages =
    signal<readonly FunnelChartStage[]>(STEEP_DROP_STAGES);
  protected readonly steepDropAreaStages =
    signal<readonly FunnelChartStage[]>(STEEP_DROP_STAGES);
  protected readonly stageTableStages =
    signal<readonly FunnelChartStage[]>(SPECIMEN_STAGES);
  protected readonly dataTableStages =
    signal<readonly FunnelChartStage[]>(SPECIMEN_STAGES);
  protected readonly staggerStages =
    signal<readonly FunnelChartStage[]>(SPECIMEN_STAGES);
  protected readonly dropStages =
    signal<readonly FunnelChartStage[]>(SPECIMEN_STAGES);
  protected readonly interactionStages =
    signal<readonly FunnelChartStage[]>(SPECIMEN_STAGES);
  protected readonly pinStages =
    signal<readonly FunnelChartStage[]>(SPECIMEN_STAGES);
  protected readonly pinDimStages =
    signal<readonly FunnelChartStage[]>(SPECIMEN_STAGES);
  protected readonly lastStage = signal('');
  protected readonly emptyStages = signal<readonly FunnelChartStage[]>([]);
  protected readonly loadingStages =
    signal<readonly FunnelChartStage[]>(SPECIMEN_STAGES);
  protected readonly oneStage = signal<readonly FunnelChartStage[]>(ONE_STAGE);
  protected readonly allZerosStages =
    signal<readonly FunnelChartStage[]>(ALL_ZEROS_STAGES);
  protected readonly zeroFirstStageStages = signal<readonly FunnelChartStage[]>(
    ZERO_FIRST_STAGE_STAGES,
  );
}
