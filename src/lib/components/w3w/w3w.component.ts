import {
  Component,
  ViewEncapsulation,
  booleanAttribute,
  input,
  output,
} from '@angular/core';
import { IconComponent } from '../../icons/icon.component';

@Component({
  selector: 'ds-w3w',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './w3w.component.html',
  styleUrl: './w3w.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    '[attr.role]': "copyable() ? 'button' : null",
    '[attr.tabindex]': 'copyable() ? 0 : null',
    '[attr.aria-label]':
      "copyable() ? ('Copy what3words address ' + prefix() + address()) : null",
    '(click)': 'onCopy()',
    '(keydown.enter)': 'onCopy()',
    '(keydown.space)': 'onKeyActivate($event)',
  },
})
export class W3wComponent {
  /** Marker rendered before the address (e.g. the "///" glyph). */
  readonly prefix = input<string>('///');
  /** The three-word address, rendered after `prefix`. */
  readonly address = input.required<string>();
  /** Makes the address clickable/focusable and copies `prefix` + `address` to the clipboard. */
  readonly copyable = input(true, { transform: booleanAttribute });
  /** Fires with `address` after a successful copy. */
  readonly copied = output<string>();

  protected onKeyActivate(event: Event): void {
    event.preventDefault();
    this.onCopy();
  }

  protected onCopy(): void {
    if (!this.copyable()) {
      return;
    }
    const text = `${this.prefix()}${this.address()}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(text);
    }
    this.copied.emit(this.address());
  }
}
