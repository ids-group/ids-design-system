import { viewChild } from '@angular/core';
import { IconButtonComponent } from '@ids-group-ltd/ids-design-system';

export class PinToggleComponent {
  private readonly pin = viewChild.required(IconButtonComponent);

  protected isPinned(): boolean {
    return this.pin().selected();
  }
}
