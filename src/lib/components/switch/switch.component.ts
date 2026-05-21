import { Component, ViewEncapsulation, computed, input, model } from '@angular/core';

@Component({
  selector: 'ds-switch',
  standalone: true,
  templateUrl: './switch.component.html',
  styleUrl: './switch.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class SwitchComponent {
  readonly checked = model<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly name = input<string | null>(null);
  readonly variant = input<'default' | 'success' | 'error'>('default');
  readonly inputId = input<string | null>(null);

  protected readonly classes = computed(() => {
    const variant = this.variant();
    return variant === 'default' ? 'switch' : `switch ${variant}`;
  });

  protected onChange(event: Event): void {
    this.checked.set((event.target as HTMLInputElement).checked);
  }
}
