import { Injectable } from '@angular/core';
import {
  JWT_KEY,
  REFRESH_TOKEN_KEY,
  TOKEN_EXPIRES_KEY,
  REMEMBER_ME_KEY,
  SESSION_ACTIVE_KEY,
} from '../constants/storage-keys.constants';

const TOKEN_EXPIRY_BUFFER_MS = 60_000;
const TOKEN_REFRESH_BUFFER_MS = 120_000;

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  getToken(): string | null {
    return localStorage.getItem(JWT_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  getTokenExpiration(): Date | null {
    const expires = localStorage.getItem(TOKEN_EXPIRES_KEY);

    if (!expires) {
      return null;
    }

    const date = new Date(expires);

    return isNaN(date.getTime()) ? null : date;
  }

  setTokens(jwt: string, refreshToken: string, expiresOn: string): void {
    localStorage.setItem(JWT_KEY, jwt);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(TOKEN_EXPIRES_KEY, expiresOn);
  }

  clearTokens(): void {
    localStorage.removeItem(JWT_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRES_KEY);

    sessionStorage.removeItem(JWT_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_EXPIRES_KEY);
  }

  setRememberMe(enabled: boolean): void {
    localStorage.setItem(REMEMBER_ME_KEY, enabled.toString());
  }

  isRememberMeEnabled(): boolean {
    return localStorage.getItem(REMEMBER_ME_KEY) === 'true';
  }

  setSessionActive(): void {
    sessionStorage.setItem(SESSION_ACTIVE_KEY, 'true');
  }

  clearSessionActive(): void {
    sessionStorage.removeItem(SESSION_ACTIVE_KEY);
  }

  isSessionActive(): boolean {
    return sessionStorage.getItem(SESSION_ACTIVE_KEY) === 'true';
  }

  isTokenExpired(): boolean {
    const expiration = this.getTokenExpiration();

    if (!expiration) {
      return true;
    }

    return expiration.getTime() - TOKEN_EXPIRY_BUFFER_MS <= Date.now();
  }

  getTimeUntilRefresh(): number {
    const expiration = this.getTokenExpiration();

    if (!expiration) {
      return 0;
    }

    const timeUntilRefresh =
      expiration.getTime() - TOKEN_REFRESH_BUFFER_MS - Date.now();

    return Math.max(0, timeUntilRefresh);
  }
}
