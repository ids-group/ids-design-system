import { Component, ViewEncapsulation, input, output } from '@angular/core';
import { IconComponent } from '../../icons/icon.component';

@Component({
  selector: 'ds-w3w',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './w3w.component.html',
  styleUrl: './w3w.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    '(click)': 'onCopy()',
  },
})
export class W3wComponent {
  readonly prefix = input<string>('///');
  readonly address = input.required<string>();
  readonly copyable = input<boolean>(true);
  readonly copied = output<string>();

  protected onCopy(): void {
    if (!this.copyable()) return;
    const text = `${this.prefix()}${this.address()}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(text);
    }
    this.copied.emit(this.address());
  }
}
