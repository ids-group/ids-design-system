import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { BASE_URL, ENVIRONMENT_NAME } from '@app/common';
import { DevSettings } from './dev-settings.service';

/**
 * Floating dev panel (dev/staging only — replaced by an empty stub in prod via
 * public-api.prod.ts). Shows the active environment + lets you throttle HTTP and
 * inspect localStorage. Extend with more views as needed.
 */
@Component({
  selector: 'dev-panel',
  template: `
    <button
      type="button"
      class="dev-fab"
      (click)="open.set(!open())"
    >
      DEV
    </button>

    @if (open()) {
      <aside class="dev-panel">
        <h2>Dev tools — {{ envName }}</h2>
        <dl>
          <dt>API base</dt>
          <dd>{{ baseUrl }}</dd>
        </dl>

        <section>
          <h3>Network throttle</h3>
          @for (ms of presets; track ms) {
            <button
              type="button"
              [class.active]="settings.throttleMs() === ms"
              (click)="settings.throttleMs.set(ms)"
            >
              {{ ms }}ms
            </button>
          }
        </section>

        <section>
          <h3>localStorage</h3>
          <ul>
            @for (key of storageKeys(); track key) {
              <li>{{ key }}</li>
            } @empty {
              <li class="muted">(empty)</li>
            }
          </ul>
        </section>
      </aside>
    }
  `,
  styles: `
    .dev-fab {
      position: fixed;
      right: 12px;
      bottom: 12px;
      z-index: 9999;
      font: 700 11px/1 monospace;
      padding: 6px 9px;
      border: 0;
      border-radius: 6px;
      background: #161a28;
      color: #9be8a0;
      cursor: pointer;
    }
    .dev-panel {
      position: fixed;
      right: 12px;
      bottom: 48px;
      z-index: 9999;
      width: 260px;
      max-height: 70vh;
      overflow: auto;
      padding: 12px 14px;
      border-radius: 10px;
      background: #0f1729;
      color: #d6e2ff;
      font: 12px/1.5 monospace;
      box-shadow: 0 8px 28px rgb(0 0 0 / 0.4);
    }
    h2 { margin: 0 0 8px; font-size: 13px; }
    h3 { margin: 12px 0 4px; font-size: 11px; color: #8fb3bb; }
    dl { margin: 0; }
    dd { margin: 0 0 4px; word-break: break-all; }
    button[type='button'].active { background: #2e54ff; color: #fff; }
    section button {
      margin: 0 4px 4px 0;
      border: 0;
      border-radius: 4px;
      padding: 3px 7px;
      background: #232a3d;
      color: inherit;
      cursor: pointer;
    }
    ul { margin: 0; padding-left: 16px; }
    .muted { color: #6b7aa3; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevPanel {
  protected readonly settings = inject(DevSettings);
  protected readonly envName = inject(ENVIRONMENT_NAME);
  protected readonly baseUrl = inject(BASE_URL);

  protected readonly open = signal(false);
  protected readonly presets = [0, 500, 2000];

  protected storageKeys(): string[] {
    return Object.keys(localStorage);
  }
}
