import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResult } from '../models/api-result.model';
import {
  ActivateAccountRequest,
  CurrentUserDto,
  ForgotPasswordRequest,
  JwtResult,
  LoginRequest,
  ResetPasswordRequest,
} from '../models/auth.model';
import { HttpService } from '../api/http.service';
import { AuthProvider } from './auth.provider';

/** Real auth backend over HttpService (`/api/auth/*`). Adjust endpoints to your API. */
@Injectable()
export class HttpAuthProvider extends AuthProvider {
  private readonly http = inject(HttpService);

  login(request: LoginRequest): Observable<ApiResult<JwtResult>> {
    return this.http.post<ApiResult<JwtResult>>('/auth/login', request);
  }

  logout(): Observable<ApiResult> {
    return this.http.post<ApiResult>('/auth/logout', {});
  }

  refreshToken(
    token: string,
    refreshToken: string,
  ): Observable<ApiResult<JwtResult>> {
    return this.http.post<ApiResult<JwtResult>>('/auth/refresh-token', {
      token,
      refreshToken,
    });
  }

  getCurrentUser(): Observable<ApiResult<CurrentUserDto>> {
    return this.http.get<ApiResult<CurrentUserDto>>('/auth/current-user');
  }

  forgotPassword(request: ForgotPasswordRequest): Observable<ApiResult> {
    return this.http.post<ApiResult>('/auth/forgot-password', request);
  }

  resetPassword(request: ResetPasswordRequest): Observable<ApiResult> {
    return this.http.post<ApiResult>('/auth/reset-password', request);
  }

  activateAccount(request: ActivateAccountRequest): Observable<ApiResult> {
    return this.http.post<ApiResult>('/account/activate', request);
  }
}
