import { Component, input, output } from '@angular/core';
import { SwitchComponent } from '@ids-group-ltd/ids-design-system';

@Component({
  selector: 'app-confirm-switch',
  imports: [SwitchComponent],
  template: `<ds-switch [label]="label()" [checked]="checked()" (click)="onClick($event)" />`,
})
export class ConfirmSwitchComponent {
  readonly label = input.required<string>();
  readonly checked = input(false);
  readonly requestChange = output<boolean>();

  onClick(event: Event): void {
    event.preventDefault();
    this.requestChange.emit(!this.checked());
  }
}
