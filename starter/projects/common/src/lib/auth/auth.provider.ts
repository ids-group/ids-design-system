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

/**
 * Pluggable auth backend. AuthStore talks to this, never to HttpClient directly.
 * Provide `MockAuthProvider` (runs with no backend) or `HttpAuthProvider` (real)
 * in app.config.
 */
export abstract class AuthProvider {
  abstract login(request: LoginRequest): Observable<ApiResult<JwtResult>>;
  abstract logout(): Observable<ApiResult>;
  abstract refreshToken(
    token: string,
    refreshToken: string,
  ): Observable<ApiResult<JwtResult>>;
  abstract getCurrentUser(): Observable<ApiResult<CurrentUserDto>>;
  abstract forgotPassword(
    request: ForgotPasswordRequest,
  ): Observable<ApiResult>;
  abstract resetPassword(request: ResetPasswordRequest): Observable<ApiResult>;
  abstract activateAccount(
    request: ActivateAccountRequest,
  ): Observable<ApiResult>;
}
