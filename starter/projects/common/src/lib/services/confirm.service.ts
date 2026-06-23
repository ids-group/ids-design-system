import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

/** Shape of a confirm-dialog request — the canonical contract for ConfirmService. */
export interface ConfirmConfig {
  message: string;
  title?: string;
}

/** Abstract confirm dialog — returns the user's choice as an Observable<boolean>. */
export abstract class ConfirmService {
  abstract confirm(config: ConfirmConfig): Observable<boolean>;
}

/**
 * Default implementation using the native `window.confirm`. The IDS design
 * system has no confirm-dialog component yet (tracked gap) — swap this for a
 * `ds-modal`-based implementation when one lands.
 */
@Injectable()
export class WindowConfirmService extends ConfirmService {
  confirm(config: ConfirmConfig): Observable<boolean> {
    return of(window.confirm(config.message));
  }
}
