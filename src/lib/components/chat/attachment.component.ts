import {
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { IconComponent } from '@ids-group-ltd/ids-design-system/icons';
import {
  DS_INTL,
  DS_INTL_DEFAULTS,
} from '@ids-group-ltd/ids-design-system/core';
import type { AttachmentKind } from './attachment.types';

/**
 * A file attached to a message: a type tile or an image preview, the file name and a second line
 * such as its size. Place it in the `[chips]` slot of `ds-chat-input`.
 */
@Component({
  selector: 'ds-attachment',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './attachment.component.html',
  styleUrl: './attachment.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    '[class]': "'kind-' + kind()",
  },
})
export class AttachmentComponent {
  private readonly intl = inject(DS_INTL);

  /** File name, shown on the first line and used in the remove button's accessible name. */
  readonly name = input.required<string>();
  /** Second line, such as `'PDF · 240 KB'`. */
  readonly meta = input<string>('');
  /** Draws the type tile and is announced before `meta`. */
  readonly kind = input<AttachmentKind>('file');
  /** Image shown in place of the tile when `kind` is `'image'`. */
  readonly previewUrl = input<string | null>(null);
  /** Shows a remove button that emits `removed`. */
  readonly removable = input(false, { transform: booleanAttribute });
  /** Fires when the remove button is pressed. */
  readonly removed = output<void>();

  private readonly labels = computed(() => ({
    ...DS_INTL_DEFAULTS.attachment,
    ...this.intl().attachment,
  }));
  protected readonly kindLabel = computed(() => this.labels()[this.kind()]);
  protected readonly removeLabel = computed(() =>
    this.labels().remove(this.name()),
  );
  protected readonly showPreview = computed(
    () => this.kind() === 'image' && !!this.previewUrl(),
  );
  protected readonly tileText = computed(
    () => ({ pdf: 'PDF', doc: 'DOC', image: 'IMG', file: 'FILE' })[this.kind()],
  );
}
