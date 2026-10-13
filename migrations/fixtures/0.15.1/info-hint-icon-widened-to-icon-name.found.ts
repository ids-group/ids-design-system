import { viewChild } from '@angular/core';
import { InfoHintComponent } from '@ids-group-ltd/ids-design-system';

export class HelpRowComponent {
  private readonly hint = viewChild.required(InfoHintComponent);

  protected iconKind(): 'help' | 'info' {
    return this.hint().icon();
  }
}
