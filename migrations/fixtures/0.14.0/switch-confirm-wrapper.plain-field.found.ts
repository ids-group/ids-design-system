import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SwitchComponent } from '@ids-group-ltd/ids-design-system';

@Component({
  selector: 'app-guarded-switch',
  imports: [SwitchComponent],
  template: `<ds-switch [label]="label" [checked]="checked" (click)="onClick($event)" />`,
})
export class GuardedSwitchComponent {
  @Input() label = '';
  @Input() checked = false;
  @Output() toggled = new EventEmitter<boolean>();

  onClick(event: Event): void {
    event.preventDefault();
    this.toggled.emit(!this.checked);
  }
}
