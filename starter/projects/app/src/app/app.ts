import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DevPanel } from '@app/common/dev';
import { environment } from '@app/common/config';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DevPanel],
  template: `
    <router-outlet />
    @if (devEnabled) {
      <dev-panel />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  // Runtime gate (defense-in-depth on top of the prod-stub fileReplacement):
  // the panel never renders when the env opts out.
  protected readonly devEnabled = environment.features.enableProfiler;
}
