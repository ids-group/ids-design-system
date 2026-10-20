import { Component, signal } from '@angular/core';
import { SearchComponent } from '@ids-group-ltd/ids-design-system';

@Component({
  selector: 'app-order-search',
  imports: [SearchComponent],
  template: `
    <ds-search [value]="query()" (valueChange)="query.set($event)" />
    <button type="button" (click)="reset()">Clear</button>
  `,
})
export class OrderSearchComponent {
  readonly query = signal('');

  reset(): void {
    this.query.set(' ');
    setTimeout(() => this.query.set(''));
  }
}
