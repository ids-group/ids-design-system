import {
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  output,
} from '@angular/core';
import { IconComponent } from '../../icons/icon.component';
import type { IconName } from '../../icons/icons.data';
import { resolveDividers } from './modal-defaults';
import type { ModalSize } from './modal.types';
import type { DsStatus } from '../../core/status';

let nextId = 0;

@Component({
  selector: 'ds-modal-card',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './modal-card.component.html',
  styleUrl: './modal.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class ModalCardComponent {
  /** Card width — sm/md/lg/xl/fullscreen. */
  readonly size = input<ModalSize>('md');
  /** Severity — drives the icon-badge tint, the title colour, the DEFAULT icon and
   *  the ARIA role, which is the same set `ds-alert`'s variant drives. Null (the
   *  default) is a neutral dialog. It picks an icon as well as a tint because a tint
   *  alone signals by colour only; `icon` overrides the pick. */
  readonly status = input<DsStatus | null>(null);
  /** Card title, shown in the header and used for `aria-labelledby`. */
  readonly title = input.required<string>();
  /** Secondary line under the title. Not part of the accessible name. */
  readonly subtitle = input<string | null>(null);
  /** Shows the header close button. */
  readonly showClose = input(true, { transform: booleanAttribute });
  /** Draws the rules under the header and over the actions. Turning them off also
   *  tightens the vertical padding they were sized for. Unset falls back to
   *  `DS_CONFIG.modal.dividers`, then `true`. */
  readonly dividers = input<boolean | null, unknown>(null, {
    transform: (value) => (value == null ? null : booleanAttribute(value)),
  });
  protected readonly dividersResolved = resolveDividers(this.dividers);
  /** Icon badge shown next to the title. Overrides the icon `status` would pick. */
  readonly icon = input<IconName | null>(null);
  /** ARIA role. Unset, an error or warning becomes `alertdialog` — the role for a
   *  dialog that interrupts with something the reader must act on — and anything
   *  else stays `dialog`. Same split `ds-alert` makes between `alert` and `status`. */
  readonly dialogRole = input<'dialog' | 'alertdialog' | null>(null);
  /** Fires when the header close button is clicked. */
  readonly closed = output<void>();

  protected readonly titleId = `ds-modal-title-${++nextId}`;

  /** Status picks the glyph so a severity is never carried by colour alone. */
  protected readonly resolvedIcon = computed<IconName | null>(() => {
    const explicit = this.icon();
    if (explicit) {
      return explicit;
    }
    switch (this.status()) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warn';
      case 'success':
        return 'success';
      case 'info':
        return 'info';
      default:
        return null;
    }
  });

  protected readonly resolvedRole = computed<'dialog' | 'alertdialog'>(() => {
    const explicit = this.dialogRole();
    if (explicit) {
      return explicit;
    }
    const status = this.status();

    return status === 'error' || status === 'warning'
      ? 'alertdialog'
      : 'dialog';
  });

  protected readonly classes = computed(() => {
    const parts = ['modal', this.size()];
    const status = this.status();
    if (status) {
      parts.push(status);
    }
    if (!this.dividersResolved()) {
      parts.push('no-dividers');
    }

    return parts.join(' ');
  });

  protected onClose(): void {
    this.closed.emit();
  }
}
