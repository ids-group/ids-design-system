/*
 * Public API Surface of @app/common/dev — PRODUCTION/STAGING stub.
 * Empty implementations so the dev panel + interceptors cost nothing in prod.
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';

@Component({
  selector: 'dev-panel',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevPanel {}

/** Empty — spreading this has zero effect. */
export const devInterceptors: HttpInterceptorFn[] = [];
