import { Component, ViewEncapsulation, inject, signal } from '@angular/core';
import { ButtonComponent } from 'ds/button';
import { ToastComponent, ToastService } from 'ds/toast';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-toast',
  standalone: true,
  imports: [ButtonComponent, DocsSectionComponent, ToastComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './toast.section.html',
  styleUrl: './toast.section.scss',
})
export class ToastSection {
  private readonly toast = inject(ToastService);

  readonly promiseRunning = signal(false);

  fire(variant: 'info' | 'success' | 'warning' | 'error'): void {
    const messages = {
      info: {
        title: 'Recompute queued',
        body: '3 logistics plans will update in a moment.',
      },
      success: {
        title: 'Alpha saved',
        body: '12 resource allocations updated.',
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
