import {
  Component,
  DestroyRef,
  ViewEncapsulation,
  inject,
  signal,
} from '@angular/core';
import { ButtonComponent } from 'ds/button';
import {
  TimelineComponent,
  TimelineItemComponent,
  type TimelineStatus,
} from 'ds/timeline';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

const RUN_PLAN = [
  'Import the brief',
  'Generate screens',
  'Run the checks',
  'Publish the prototype',
];

@Component({
  selector: 'section-components-timeline',
  standalone: true,
  imports: [
    ButtonComponent,
    TimelineComponent,
    TimelineItemComponent,
    DocsSectionComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './timeline.section.html',
  styleUrl: '../../../shared/section-demo.scss',
})
export class TimelineSection {
  private readonly timers = new Set<ReturnType<typeof setTimeout>>();

  // The compact demo: every step is planned up front and turns running, then done.
  protected readonly runSteps = signal<
    readonly { heading: string; status: TimelineStatus }[]
  >(RUN_PLAN.map((heading) => ({ heading, status: 'pending' })));

  constructor() {
    inject(DestroyRef).onDestroy(() => this.timers.forEach(clearTimeout));
  }

  protected runPlan(): void {
    this.timers.forEach(clearTimeout);
    this.timers.clear();
    this.runSteps.set(
      RUN_PLAN.map((heading) => ({ heading, status: 'pending' })),
    );
    RUN_PLAN.forEach((_, index) => {
      this.later(() => this.setStatus(index, 'running'), 400 + index * 900);
      this.later(() => this.setStatus(index, 'done'), 1100 + index * 900);
    });
  }

  private setStatus(index: number, status: TimelineStatus): void {
    this.runSteps.update((steps) =>
      steps.map((step, i) => (i === index ? { ...step, status } : step)),
    );
  }

  private later(run: () => void, delay: number): void {
    const timer = setTimeout(() => {
      this.timers.delete(timer);
      run();
    }, delay);
    this.timers.add(timer);
  }

  protected readonly wrappedSteps: readonly {
    heading: string;
    time: string;
    status: TimelineStatus;
  }[] = [
    { heading: 'Import the brief', time: '09:41', status: 'done' },
    { heading: 'Generate screens', time: '09:42', status: 'done' },
    { heading: 'Publish the prototype', time: 'Running', status: 'running' },
  ];
}
