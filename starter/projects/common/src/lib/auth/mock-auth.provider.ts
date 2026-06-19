import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { ApiResult } from '../models/api-result.model';
import { CurrentUserDto, JwtResult, LoginRequest } from '../models/auth.model';
import { USER_ROLES } from '../models/user.model';
import { AuthProvider } from './auth.provider';

/**
 * In-memory auth backend so the starter runs with no server. Any credentials
 * succeed; tokens are fake and valid for an hour. Swap for HttpAuthProvider
 * (or your own) in app.config.
 */
@Injectable()
export class MockAuthProvider extends AuthProvider {
  private readonly user: CurrentUserDto = {
    publicId: 'mock-user-1',
    email: 'admin@example.com',
    roles: [USER_ROLES.Admin],
    fullName: 'Mock Admin',
    firstName: 'Mock',
    lastName: 'Admin',
    phoneNumber: '',
  };

  login(_request: LoginRequest): Observable<ApiResult<JwtResult>> {
    return of<ApiResult<JwtResult>>({
      isSuccess: true,
      data: this.issueTokens(),
    }).pipe(delay(300));
  }

  logout(): Observable<ApiResult> {
    return of<ApiResult>({ isSuccess: true });
  }

  refreshToken(): Observable<ApiResult<JwtResult>> {
    return of<ApiResult<JwtResult>>({
      isSuccess: true,
      data: this.issueTokens(),
    });
  }

  getCurrentUser(): Observable<ApiResult<CurrentUserDto>> {
    return of<ApiResult<CurrentUserDto>>({ isSuccess: true, data: this.user });
  }

  forgotPassword(): Observable<ApiResult> {
    return of<ApiResult>({ isSuccess: true });
  }

  resetPassword(): Observable<ApiResult> {
    return of<ApiResult>({ isSuccess: true });
  }

  activateAccount(): Observable<ApiResult> {
    return of<ApiResult>({ isSuccess: true });
  }

  private issueTokens(): JwtResult {
    return {
      token: `mock-token-${Date.now()}`,
      refreshToken: `mock-refresh-${Date.now()}`,
      expiresOn: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    };
  }
}
