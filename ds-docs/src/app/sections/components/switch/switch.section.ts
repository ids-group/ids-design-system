import { Component, ViewEncapsulation, inject, signal } from '@angular/core';
import { ModalService } from 'ds/modal';
import { SwitchComponent } from 'ds/switch';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-switch',
  standalone: true,
  imports: [DocsSectionComponent, SwitchComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './switch.section.html',
  styleUrls: ['../../../shared/section-demo.scss', './switch.section.scss'],
})
export class SwitchSection {
  private readonly modal = inject(ModalService);
  protected readonly aiPaused = signal(false);

  protected async askPause(next: boolean): Promise<void> {
    if (!next) {
      this.aiPaused.set(false);

      return;
    }
    const confirmed = await this.modal.confirm({
      title: 'Pause AI engine?',
      message:
        'All AI recommendations will be suspended platform-wide immediately.',
      confirmLabel: 'Pause engine',
      tone: 'error',
    });
    if (confirmed) {
      this.aiPaused.set(true);
    }
  }
}
