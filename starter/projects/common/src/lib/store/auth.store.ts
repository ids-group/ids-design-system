import { computed, DestroyRef, inject } from '@angular/core';
import {
  signalStore,
  withState,
  withComputed,
  withMethods,
  patchState,
} from '@ngrx/signals';
import {
  Observable,
  of,
  from,
  tap,
  catchError,
  switchMap,
  map,
  filter,
  retry,
  timeout,
  throwError,
  Subscription,
  timer,
  share,
  finalize,
} from 'rxjs';
import { Router } from '@angular/router';
import { ApiResult } from '../models/api-result.model';
import {
  ActivateAccountRequest,
  CurrentUser,
  CurrentUserDto,
  ForgotPasswordRequest,
  JwtResult,
  LoginRequest,
  ResetPasswordRequest,
} from '../models/auth.model';
import { USER_ROLES } from '../models/user.model';
import { AuthProvider } from '../auth/auth.provider';
import { TabSyncService } from '../services/tab-sync.service';
import { TokenStorageService } from '../services/token-storage.service';

const REFRESH_TIMEOUT_MS = 30_000;
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1500;

interface AuthState {
  currentUser: CurrentUser | null;
  isLoading: boolean;
}

const initialState: AuthState = {
  currentUser: null,
  isLoading: true,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  withComputed((store) => ({
    isAuthenticated: computed(() => !!store.currentUser()),
    isAdmin: computed(
      () => store.currentUser()?.roles?.includes(USER_ROLES.Admin) ?? false,
    ),
  })),

  withMethods((store) => {
    const auth = inject(AuthProvider);
    const tokenStorage = inject(TokenStorageService);
    const tabSync = inject(TabSyncService);
    const router = inject(Router);
    const destroyRef = inject(DestroyRef);

    let silentRenewSubscription: Subscription | undefined;
    let crossTabLoginSubscription: Subscription | undefined;
    let inFlightRefresh$: Observable<ApiResult<JwtResult>> | null = null;
    let loggedOut = false;

    destroyRef.onDestroy(() => {
      cancelSilentRenew();
      crossTabLoginSubscription?.unsubscribe();
      inFlightRefresh$ = null;
    });

    function cancelSilentRenew(): void {
      silentRenewSubscription?.unsubscribe();
      silentRenewSubscription = undefined;
    }

    function scheduleNextRenew(): void {
      const timeUntilRefresh = tokenStorage.getTimeUntilRefresh();

      if (timeUntilRefresh <= 0) {
        return;
      }

      silentRenewSubscription = timer(timeUntilRefresh)
        .pipe(
          filter(
            () => !!tokenStorage.getToken() && !!tokenStorage.getRefreshToken(),
          ),
          switchMap(() => refreshTokens()),
          tap((result) => {
            if (result.isSuccess && result.data) {
              scheduleNextRenew();
            }
          }),
        )
        .subscribe();
    }

    function scheduleSilentRenew(): void {
      cancelSilentRenew();
      scheduleNextRenew();
    }

    function clearState(): void {
      patchState(store, { currentUser: null });
      tokenStorage.clearTokens();
      tokenStorage.clearSessionActive();
    }

    function refreshTokens(): Observable<ApiResult<JwtResult>> {
      if (inFlightRefresh$) {
        return inFlightRefresh$;
      }

      const token = tokenStorage.getToken();
      const refreshToken = tokenStorage.getRefreshToken();

      if (!token || !refreshToken) {
        clearState();
        cancelSilentRenew();

        return of({
          isSuccess: false,
          failure: { message: 'No tokens available' },
        });
      }

      inFlightRefresh$ = auth.refreshToken(token, refreshToken).pipe(
        timeout(REFRESH_TIMEOUT_MS),
        retry({
          count: MAX_RETRY_ATTEMPTS,
          delay: RETRY_DELAY_MS,
          resetOnSuccess: true,
        }),
        tap((result) => {
          if (loggedOut) {
            return;
          }

          if (result.isSuccess && result.data) {
            tokenStorage.setTokens(
              result.data.token,
              result.data.refreshToken,
              result.data.expiresOn,
            );
          }
        }),
        catchError(() => {
          clearState();
          cancelSilentRenew();

          return of({
            isSuccess: false,
            failure: { message: 'Token refresh failed' },
          } as ApiResult<JwtResult>);
        }),
        finalize(() => {
          inFlightRefresh$ = null;
        }),
        share(),
      );

      return inFlightRefresh$;
    }

    function mapCurrentUser(dto: CurrentUserDto): CurrentUser {
      return {
        publicId: dto.publicId,
        email: dto.email,
        roles: dto.roles ?? [],
        fullName: dto.fullName ?? '',
        firstName: dto.firstName ?? '',
        lastName: dto.lastName ?? '',
        phoneNumber: dto.phoneNumber ?? '',
      };
    }

    function loadCurrentUser(): Observable<CurrentUser | null> {
      return auth.getCurrentUser().pipe(
        retry({
          count: MAX_RETRY_ATTEMPTS,
          delay: RETRY_DELAY_MS,
        }),
        map((result) => {
          if (result.isSuccess && result.data) {
            const user = mapCurrentUser(result.data);
            patchState(store, { currentUser: user });

            return user;
          }

          clearState();

          return null;
        }),
        catchError(() => {
          clearState();

          return of(null);
        }),
      );
    }

    function proceedWithAuth(): Observable<unknown> {
      const source$ = tokenStorage.isTokenExpired()
        ? refreshTokens().pipe(
            switchMap((result) =>
              result.isSuccess ? loadCurrentUser() : of(null),
            ),
          )
        : loadCurrentUser();

      return source$.pipe(
        tap((user) => {
          if (user) {
            scheduleSilentRenew();
          }
        }),
        catchError(() => of(null)),
        finalize(() => {
          patchState(store, { isLoading: false });
        }),
      );
    }

    return {
      isRememberMeEnabled(): boolean {
        return tokenStorage.isRememberMeEnabled();
      },

      setRememberMe(enabled: boolean): void {
        tokenStorage.setRememberMe(enabled);
      },

      login(request: LoginRequest): Observable<ApiResult<JwtResult>> {
        loggedOut = false;

        return auth.login(request).pipe(
          tap((result) => {
            if (result.isSuccess && result.data) {
              tokenStorage.setTokens(
                result.data.token,
                result.data.refreshToken,
                result.data.expiresOn,
              );
              tokenStorage.setSessionActive();
              tabSync.startRespondingToTabPings();

              scheduleSilentRenew();
            }
          }),
          switchMap((result) => {
            if (result.isSuccess) {
              return loadCurrentUser().pipe(
                map((user) =>
                  user
                    ? result
                    : ({
                        isSuccess: false,
                        failure: { message: 'Failed to load user profile' },
                      } as ApiResult<JwtResult>),
                ),
              );
            }

            return of(result);
          }),
        );
      },

      logout(): Observable<ApiResult> {
        loggedOut = true;

        return auth.logout().pipe(
          tap(() => {
            clearState();
            cancelSilentRenew();
          }),
          catchError(() => {
            clearState();
            cancelSilentRenew();

            return of({ isSuccess: true } as ApiResult);
          }),
        );
      },

      forgotPassword(request: ForgotPasswordRequest): Observable<ApiResult> {
        return auth.forgotPassword(request);
      },

      resetPassword(request: ResetPasswordRequest): Observable<ApiResult> {
        return auth.resetPassword(request);
      },

      activateAccount(request: ActivateAccountRequest): Observable<ApiResult> {
        return auth.activateAccount(request);
      },

      initialize(): Observable<unknown> {
        loggedOut = false;

        const unsubscribe = tabSync.listenForExternalChanges(
          () => {
            if (store.isLoading()) {
              return;
            }

            if (store.currentUser()) {
              scheduleSilentRenew();

              return;
            }

            crossTabLoginSubscription?.unsubscribe();

            crossTabLoginSubscription = loadCurrentUser()
              .pipe(
                tap((user) => {
                  if (user) {
                    tokenStorage.setSessionActive();
                    tabSync.startRespondingToTabPings();
                    scheduleSilentRenew();

                    if (router.url.startsWith('/auth')) {
                      router.navigate(['/']);
                    }
                  }
                }),
              )
              .subscribe();
          },
          () => {
            clearState();
            patchState(store, { isLoading: false });
            cancelSilentRenew();
            router.navigate(['/auth/login']);
          },
        );

        destroyRef.onDestroy(() => {
          unsubscribe();
          tabSync.stopRespondingToTabPings();
        });

        const token = tokenStorage.getToken();

        if (!token) {
          patchState(store, { isLoading: false });

          return of(null);
        }

        if (!tokenStorage.isRememberMeEnabled()) {
          if (tokenStorage.isSessionActive()) {
            tabSync.startRespondingToTabPings();

            return proceedWithAuth();
          }

          return from(tabSync.hasActiveSessionTabs()).pipe(
            switchMap((hasActiveTabs) => {
              if (!hasActiveTabs) {
                tokenStorage.clearTokens();
                patchState(store, { isLoading: false });

                return of(null);
              }

              tokenStorage.setSessionActive();
              tabSync.startRespondingToTabPings();

              return proceedWithAuth();
            }),
          );
        }

        tabSync.startRespondingToTabPings();

        return proceedWithAuth();
      },

      handleUnauthorized(): Observable<string> {
        return refreshTokens().pipe(
          switchMap((result) => {
            if (!result.isSuccess || !result.data) {
              router.navigate(['/auth/login']);

              return throwError(() => new Error('Token refresh failed'));
            }

            scheduleSilentRenew();

            return of(result.data.token);
          }),
        );
      },
    };
  }),
);
