import { Component, ViewEncapsulation, inject, signal } from '@angular/core';
import { BadgeComponent } from 'ds/badge';
import { BannerComponent } from 'ds/banner';
import { ButtonComponent } from 'ds/button';
import type { DsStatus } from 'ds/core';
import { InputComponent } from 'ds/input';
import { ModalCardComponent, ModalComponent, ModalService } from 'ds/modal';
import { SelectComponent } from 'ds/select';
import type { SelectOption } from 'ds/select';
import {
  DocsTruncationComponent,
  TruncationRule,
} from '../../../shared/docs-truncation.component';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-modal',
  standalone: true,
  imports: [
    BadgeComponent,
    BannerComponent,
    ButtonComponent,
    DocsTruncationComponent,
    SelectComponent,
    InputComponent,
    ModalCardComponent,
    ModalComponent,
    DocsSectionComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './modal.section.html',
  styleUrls: ['../../../shared/section-demo.scss', './modal.section.scss'],
})
export class ModalSection {
  protected readonly truncationRules: TruncationRule[] = [
    {
      field: 'Title',
      behaviour:
        'Single line, ellipsis on overflow. Tooltip on hover when clipped. Keep the close button visible.',
    },
    {
      field: 'Body',
      behaviour:
        'Wrap, no clip. Scrolls inside the body when content exceeds the modal height.',
    },
    {
      field: 'Actions',
      behaviour:
        'Single line per label. If the row overflows, stack vertically full-width.',
    },
    {
      field: 'Form fields inside body',
      behaviour:
        'Inherit field truncation rules. Hints wrap to 2 lines; errors never clip.',
    },
  ];

  protected readonly statusSpecimens: {
    status: DsStatus;
    role: string;
    title: string;
    body: string;
  }[] = [
    {
      status: 'error',
      role: 'alertdialog',
      title: 'Payment failed',
      body: 'The card issuer declined the transaction. Nothing was charged.',
    },
    {
      status: 'warning',
      role: 'alertdialog',
      title: 'Cover lapses in 3 days',
      body: 'Renew before 15 Mar or the fleet policy stops mid-journey.',
    },
    {
      status: 'success',
      role: 'dialog',
      title: 'Policy issued',
      body: 'Documents are on their way to the broker and the insured.',
    },
    {
      status: 'info',
      role: 'dialog',
      title: 'Scheduled maintenance',
      body: 'Quoting is read-only on Sunday between 02:00 and 04:00 GMT.',
    },
  ];

  protected readonly ownerOptions: SelectOption[] = [
    { label: 'Avery Brooks', value: 'brooks' },
    { label: 'Sam Carter', value: 'carter' },
    { label: 'Jamie Lin', value: 'lin' },
    { label: 'Morgan Reyes', value: 'reyes' },
  ];

  private readonly modal = inject(ModalService);
  protected readonly confirmResult = signal('—');

  protected readonly xlOpen = signal(false);
  protected readonly fullscreenOpen = signal(false);
  protected readonly persistentOpen = signal(false);

  protected async askDelete(): Promise<void> {
    const ok = await this.modal.confirm({
      title: 'Delete "Q3 Roadmap"?',
      message:
        "This project and its 14 tasks will be permanently removed. This can't be undone.",
      confirmLabel: 'Delete project',
      tone: 'error',
      icon: 'trash',
    });
    this.confirmResult.set(ok ? 'Confirmed delete' : 'Cancelled');
  }

  protected async askTypeToConfirm(): Promise<void> {
    const ok = await this.modal.confirm({
      title: 'Delete database?',
      message: 'Type the database name to confirm.',
      confirmLabel: 'Delete',
      tone: 'error',
      icon: 'trash',
      typeToConfirm: 'production-db',
    });
    this.confirmResult.set(ok ? 'Confirmed' : 'Cancelled');
  }
}
