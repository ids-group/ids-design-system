import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ExecutionOptions } from '../models/http.model';
import { BASE_URL } from '../tokens/environment.tokens';

/** Thin wrapper over HttpClient: prepends the env base URL + `/api`, threads ExecutionOptions. */
@Injectable({ providedIn: 'root' })
export class HttpService {
  public readonly baseUrl = inject(BASE_URL);

  protected readonly http = inject(HttpClient);
  protected readonly apiPrefix = '/api';

  public get<T>(
    resource: string,
    executionOptions: ExecutionOptions = new ExecutionOptions(),
    responseType?: 'json' | 'text' | 'blob' | 'arraybuffer',
  ) {
    return this.http.get<T>(`${this.baseUrl}${this.apiPrefix}${resource}`, {
      ...this.beforeExecute(executionOptions),
      responseType: (responseType || 'json') as 'json',
    });
  }

  public post<T>(
    resource: string,
    body?: unknown,
    executionOptions: ExecutionOptions = new ExecutionOptions(),
  ) {
    return this.http.post<T>(
      `${this.baseUrl}${this.apiPrefix}${resource}`,
      body,
      this.beforeExecute(executionOptions),
    );
  }

  public put<T>(
    resource: string,
    body: unknown,
    executionOptions: ExecutionOptions = new ExecutionOptions(),
  ) {
    return this.http.put<T>(
      `${this.baseUrl}${this.apiPrefix}${resource}`,
      body,
      this.beforeExecute(executionOptions),
    );
  }

  public delete<T>(
    resource: string,
    executionOptions: ExecutionOptions = new ExecutionOptions(),
  ) {
    return this.http.delete<T>(
      `${this.baseUrl}${this.apiPrefix}${resource}`,
      this.beforeExecute(executionOptions),
    );
  }

  protected beforeExecute(
    executionOptions: ExecutionOptions = new ExecutionOptions(),
  ) {
    const headers = new HttpHeaders();
    let params = new HttpParams();

    if (executionOptions.getMethod) {
      params = params.append('timestamp', Date.now() + '');
    }

    if (executionOptions.params) {
      for (const param of Object.keys(executionOptions.params)) {
        params = params.append(param, executionOptions.params[param]);
      }
    }

    return { headers, params, context: executionOptions.context };
  }
}
