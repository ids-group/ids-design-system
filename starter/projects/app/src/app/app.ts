import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DevPanel } from '@app/common/dev';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DevPanel],
  template: `
    <router-outlet />
    <dev-panel />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
