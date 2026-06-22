import { Injectable, signal } from '@angular/core';

/** Holds dev-tool toggles read by dev interceptors + the dev panel. */
@Injectable({ providedIn: 'root' })
export class DevSettings {
  /** Artificial latency (ms) added to every HTTP response when > 0. */
  readonly throttleMs = signal(0);
}
