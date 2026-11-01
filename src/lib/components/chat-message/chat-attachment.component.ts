import { Component, ViewEncapsulation, input, model } from '@angular/core';
import { IconComponent } from '@ids-group-ltd/ids-design-system/icons';
import type { IconName } from '@ids-group-ltd/ids-design-system/core';

let nextId = 0;

/**
 * A chip in a message's `[attachments]` slot that opens to show what was attached as it was when
 * sent. The default slot is the snapshot, shown in a framed preview. A plain file with nothing to show is a `ds-tag`.
 */
@Component({
  selector: 'ds-chat-attachment',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './chat-attachment.component.html',
  styleUrl: './chat-attachment.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    '[class.is-expanded]': 'expanded()',
  },
})
export class ChatAttachmentComponent {
  /** Chip text: the file name, or the picked element's name. */
  readonly label = input.required<string>();
  /** Where it came from, shown muted after the label: the page or screen it was picked on. */
  readonly source = input<string>('');
  /** Icon before the label. */
  readonly icon = input<IconName | null>('paperclip');
  /** Whether the snapshot is open, two-way bound. */
  readonly expanded = model<boolean>(false);

  protected readonly snapshotId = `ds-chat-attachment-${++nextId}`;

  protected toggle(): void {
    this.expanded.set(!this.expanded());
  }
}
