import { AppShellComponent } from '@ids-group-ltd/ids-design-system';
import { Component } from '@angular/core';

@Component({
  selector: 'app-legacy',
  imports: [AppShellComponent],
  template: `
    <ds-accordion [multi]="true"></ds-accordion>
    <ds-button size="l">Save</ds-button>
  `,
})
export class LegacyComponent {}
