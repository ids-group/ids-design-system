import { Component, ViewEncapsulation, signal, inject } from '@angular/core';
import { ModalService, ButtonComponent } from 'ds';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-confirm-dialog',
  standalone: true,
  imports: [ButtonComponent, DocsSectionComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './confirm-dialog.section.html',
  styleUrl: '../../../shared/section-demo.scss',
})
export class ConfirmDialogSection {
  private readonly confirm = inject(ModalService);
  protected readonly result = signal('—');

  async askDelete(): Promise<void> {
    const ok = await this.confirm.confirm({
      title: 'Delete "Q3 Roadmap"?',
      message:
        "This project and its 14 tasks will be permanently removed. This can't be undone.",
      confirmLabel: 'Delete project',
      tone: 'danger',
      icon: 'trash',
    });
    this.result.set(ok ? 'Confirmed delete' : 'Cancelled');
  }

  async askTypeToConfirm(): Promise<void> {
    const ok = await this.confirm.confirm({
      title: 'Delete database?',
      message: 'Type the database name to confirm.',
      confirmLabel: 'Delete',
      tone: 'danger',
      icon: 'trash',
      typeToConfirm: 'production-db',
    });
    this.result.set(ok ? 'Confirmed' : 'Cancelled');
  }
}
