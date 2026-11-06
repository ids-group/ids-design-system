import { Component } from '@angular/core';
import { SplitterComponent } from 'ds/splitter';

@Component({
  selector: 'app-splitter-fog-harness',
  imports: [SplitterComponent],
  template: `
    @for (fog of [false, true]; track fog) {
      <ds-splitter
        style="display: grid; width: 900px; height: 300px; margin: 16px"
        ariaLabel="List width"
        [attr.data-fog]="fog"
        [dragFog]="fog"
        [defaultSize]="300"
        [min]="200"
        [max]="600">
        <div start style="height: 100%; background: var(--surface-default)">
          List
        </div>

        <div end style="height: 100%; background: var(--surface-default)">
          Detail
        </div>
      </ds-splitter>
    }
  `,
})
export class SplitterFogHarnessPage {}
