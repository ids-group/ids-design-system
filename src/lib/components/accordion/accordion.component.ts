import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'ds-accordion',
  standalone: true,
  imports: [],
  template: `<ng-content></ng-content>`,
  styles: [`
    :host {
      display: block;
      border: var(--border-width-default) solid var(--border-divider);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }
  `],
  encapsulation: ViewEncapsulation.Emulated,
})
export class AccordionComponent {}
