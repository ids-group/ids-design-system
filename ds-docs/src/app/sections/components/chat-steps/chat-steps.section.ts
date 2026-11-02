import {
  Component,
  DestroyRef,
  ViewEncapsulation,
  inject,
  signal,
} from '@angular/core';
import { ButtonComponent } from 'ds/button';
import {
  ChatStepComponent,
  ChatStepsComponent,
  type ChatStepStatus,
} from 'ds/chat';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

const RUN_PLAN = [
  'Import the brief',
  'Generate screens',
  'Run the checks',
  'Publish the prototype',
];

@Component({
  selector: 'section-components-chat-steps',
  standalone: true,
  imports: [
    ButtonComponent,
    ChatStepsComponent,
    ChatStepComponent,
    DocsSectionComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './chat-steps.section.html',
  styleUrl: '../../../shared/section-demo.scss',
})
export class ChatStepsSection {
  private readonly timers = new Set<ReturnType<typeof setTimeout>>();

  protected readonly runSteps = signal<
    readonly { heading: string; status: ChatStepStatus }[]
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

  private setStatus(index: number, status: ChatStepStatus): void {
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
}
