import { Component, ViewEncapsulation, inject, signal } from '@angular/core';
import {
  BannerComponent,
  ButtonComponent,
  DropdownComponent,
  type DropdownOption,
  InputComponent,
  ModalCardComponent,
  ModalComponent,
  ModalService,
} from 'ds';
import {
  DocsTruncationComponent,
  TruncationRule,
} from '../../../shared/docs-truncation.component';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-modal',
  standalone: true,
  imports: [
    BannerComponent,
    ButtonComponent,
    DocsTruncationComponent,
    DropdownComponent,
    InputComponent,
    ModalCardComponent,
    ModalComponent,
    DocsSectionComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './modal.section.html',
  styleUrl: './modal.section.scss',
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

  protected readonly ownerOptions: DropdownOption[] = [
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
      tone: 'danger',
      icon: 'trash',
    });
    this.confirmResult.set(ok ? 'Confirmed delete' : 'Cancelled');
  }

  protected async askTypeToConfirm(): Promise<void> {
    const ok = await this.modal.confirm({
      title: 'Delete database?',
      message: 'Type the database name to confirm.',
      confirmLabel: 'Delete',
      tone: 'danger',
      icon: 'trash',
      typeToConfirm: 'production-db',
    });
    this.confirmResult.set(ok ? 'Confirmed' : 'Cancelled');
  }
}
