import { HttpInterceptorFn } from '@angular/common/http';
import { throttleInterceptor } from './throttle.interceptor';

/** Dev-only HTTP interceptors. Spread into provideHttpClient(withInterceptors(...)). */
export const devInterceptors: HttpInterceptorFn[] = [throttleInterceptor];

export { throttleInterceptor };
