import { Component, ViewEncapsulation, inject } from '@angular/core';
import { ButtonComponent, ToastComponent, ToastService } from 'ds';
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
}
