import { Component, ViewEncapsulation, input, model } from '@angular/core';

@Component({
  selector: 'ds-radio',
  standalone: true,
  templateUrl: './radio.component.html',
  styleUrl: './radio.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class RadioComponent {
  readonly checked = model<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly name = input<string>('');
  readonly value = input<string>('');
  readonly inputId = input<string | null>(null);

  protected onChange(event: Event): void {
    this.checked.set((event.target as HTMLInputElement).checked);
  }
}
