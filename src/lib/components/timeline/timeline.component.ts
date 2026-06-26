import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'ds-timeline',
  standalone: true,
  template: '<ng-content></ng-content>',
  styleUrl: './timeline.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    role: 'list',
  },
})
export class TimelineComponent {}
