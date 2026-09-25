import {
  Component,
  ViewEncapsulation,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { ButtonComponent } from 'ds/button';
import { ToastComponent, ToastRegionComponent, ToastService } from 'ds/toast';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-toast',
  standalone: true,
  imports: [
    ButtonComponent,
    DocsSectionComponent,
    ToastComponent,
    ToastRegionComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './toast.section.html',
  styleUrl: './toast.section.scss',
})
export class ToastSection {
  private readonly toast = inject(ToastService);
  private readonly stackSpecimen = viewChild.required(ToastRegionComponent);

  constructor() {
    afterNextRender(() => {
      const region = this.stackSpecimen();
      region.add({
        id: 1,
        variant: 'info',
        title: 'Recompute queued',
        body: '3 delivery schedules will update in a moment.',
        dismissible: true,
        durationMs: 0,
      });
      region.add({
        id: 2,
        variant: 'warning',
        title: 'Volume nearing limit',
        body: '92% / 95% on Lane 04.',
        dismissible: true,
        durationMs: 0,
      });
      region.add({
        id: 3,
        variant: 'success',
        title: 'Alpha saved',
        body: '12 staff rotas updated.',
        dismissible: true,
        durationMs: 0,
      });
      region.add({
        id: 4,
        variant: 'info',
        body: 'Report ready to download.',
        dismissible: true,
        durationMs: 0,
      });
    });
  }

  readonly promiseRunning = signal(false);

  fire(variant: 'info' | 'success' | 'warning' | 'error'): void {
    const messages = {
      info: {
        title: 'Recompute queued',
        body: '3 delivery schedules will update in a moment.',
      },
      success: {
        title: 'Alpha saved',
        body: '12 staff rotas updated.',
      },
      warning: { title: 'Volume nearing limit', body: '92% / 95% on Lane 04.' },
      error: {
        title: 'Inventory sync failed',
        body: 'Connection timed out — retrying in 30s.',
      },
    };
    const message = messages[variant];
    this.toast.show({ title: message.title, body: message.body, variant });
  }

  fireWithAction(): void {
    const ref = this.toast.show({
      title: 'Record deleted',
      body: 'Project Alpha was removed.',
      variant: 'info',
      action: { label: 'Undo', handler: () => ref.dismiss() },
    });
  }

  firePromise(): void {
    if (this.promiseRunning()) {
      return;
    }
    this.promiseRunning.set(true);
    const work = new Promise<string>((resolve, reject) => {
      setTimeout(
        () =>
          Math.random() > 0.4 ? resolve('done') : reject(new Error('timeout')),
        2500,
      );
    });
    this.toast
      .promise(work, {
        loading: 'Saving report…',
        success: 'Report saved successfully.',
        error: 'Save failed — please try again.',
      })
      .then(() => this.promiseRunning.set(false))
      .catch(() => this.promiseRunning.set(false));
  }

  // Keeps counting across presses, so a second press is visibly five NEW toasts.
  private queuedCount = 0;

  fireMaxVisible(): void {
    for (let i = 0; i < 5; i++) {
      this.queuedCount += 1;
      this.toast.show({
        body: `Queued notification #${this.queuedCount}`,
        variant: 'info',
        durationMs: 4000,
      });
    }
  }
}
