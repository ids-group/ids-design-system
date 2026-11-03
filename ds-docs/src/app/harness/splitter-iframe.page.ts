import { Component } from '@angular/core';
import { SplitterComponent } from 'ds/splitter';

@Component({
  selector: 'app-splitter-iframe-harness',
  imports: [SplitterComponent],
  template: `
    <ds-splitter
      style="width: 900px; height: 400px"
      ariaLabel="List width"
      [defaultSize]="300"
      [min]="120"
      [max]="600">
      <div start style="height: 100%">List</div>

      <iframe
        end
        title="Preview"
        sandbox="allow-scripts"
        style="display: block; width: 100%; height: 100%; border: 0"
        srcdoc="<body style='margin:0;height:100vh;background:#eef'>Preview</body>">
      </iframe>
    </ds-splitter>
  `,
})
export class SplitterIframeHarnessPage {}
