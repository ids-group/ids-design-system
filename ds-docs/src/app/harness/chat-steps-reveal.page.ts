import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ChatStepComponent, ChatStepsComponent } from 'ds/chat';
import type { ChatStepStatus } from 'ds/chat';

const params = new URLSearchParams(location.search);

@Component({
  selector: 'app-chat-steps-reveal-harness',
  imports: [ChatStepsComponent, ChatStepComponent],
  template: `
    <div style="width: 360px; padding: 16px">
      <ds-chat-steps
        [minRunningMs]="minRunningMs"
        [revealStaggerMs]="revealStaggerMs">
        @for (heading of headings; track heading) {
          <ds-chat-step [heading]="heading" [status]="status()" />
        }
      </ds-chat-steps>
    </div>
  `,
})
export class ChatStepsRevealHarnessPage {
  protected readonly minRunningMs = Number(params.get('min') ?? 0);
  protected readonly revealStaggerMs = Number(params.get('stagger') ?? 0);
  protected readonly headings = [
    'Read the screen',
    'Find the button',
    'Apply the colour',
  ];
  protected readonly status = signal<ChatStepStatus>('pending');

  constructor() {
    const cycle = () => {
      this.status.set('pending');
      setTimeout(() => this.status.set('done'), 900);
    };
    cycle();
    const timer = setInterval(cycle, 3600);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }
}
