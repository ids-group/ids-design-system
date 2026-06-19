import {
  defer,
  finalize,
  map,
  Observable,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { ApiResult } from '@app/common';

export interface BaseListParams {
  search: string;
  page: number;
  pageSize: number;
  sortField: string;
  sortOrder: 'Asc' | 'Desc';
}

export interface FeatureConfig {
  defaultPageSize: number;
  rowsPerPageOptions: number[];
  defaultSortField: string;
  defaultSortOrder: 'Asc' | 'Desc';
}

interface ListLoaderConfig<TResult> {
  getParams: () => BaseListParams;
  patchList: (changes: Record<string, unknown>) => void;
  apiFn: (params: BaseListParams) => Observable<TResult>;
  onSuccess: (result: TResult) => void;
}

/**
 * Subject-based list loader with switchMap orchestration: only the latest
 * request wins, loading state is managed automatically. The store is a
 * root-provided singleton, so the subscription lives for the app lifetime.
 */
export function createListLoader<TResult>(config: ListLoaderConfig<TResult>): {
  loadList(): void;
} {
  const loadRequested$ = new Subject<void>();

  loadRequested$
    .pipe(
      switchMap(() => {
        config.patchList({ loading: true });

        return config.apiFn(config.getParams()).pipe(
          tap((result) => config.onSuccess(result)),
          finalize(() => config.patchList({ loading: false })),
        );
      }),
    )
    .subscribe();

  return {
    loadList(): void {
      loadRequested$.next();
    },
  };
}

interface EditDataLoaderConfig<TDto, TForm> {
  patchEdit: (changes: Record<string, unknown>) => void;
  apiFn: (id: string) => Observable<ApiResult<TDto>>;
  transform: (dto: TDto) => TForm;
  onLoaded: (formModel: TForm) => void;
}

/**
 * Single-item loader with DTO→FormModel transformation + edit loading state.
 */
export function createEditDataLoader<TDto, TForm>(
  config: EditDataLoaderConfig<TDto, TForm>,
): (
  id: string,
  initPatch?: Record<string, unknown>,
) => Observable<ApiResult<TForm>> {
  return (id, initPatch) => {
    config.patchEdit({ loading: true, ...initPatch });

    return config.apiFn(id).pipe(
      map((result) => {
        if (result.isSuccess && result.data) {
          const formModel = config.transform(result.data);
          config.onLoaded(formModel);

          return { isSuccess: true, data: formModel } as ApiResult<TForm>;
        }

        return {
          isSuccess: false,
          failure: result.failure,
        } as ApiResult<TForm>;
      }),
      finalize(() => config.patchEdit({ loading: false })),
    );
  };
}

interface ListLoadingConfig<TResult> {
  patchList: (changes: Record<string, unknown>) => void;
  apiFn: () => Observable<TResult>;
  onSuccess?: (result: TResult) => void;
}

/**
 * Wraps a list-mutating action (delete, toggle status, …) with automatic
 * loading-state management.
 */
export function withListLoading<TResult extends { isSuccess: boolean }>(
  config: ListLoadingConfig<TResult>,
): Observable<TResult> {
  return defer(() => {
    config.patchList({ loading: true });

    return config.apiFn();
  }).pipe(
    tap((result) => {
      if (result.isSuccess && config.onSuccess) {
        config.onSuccess(result);
      }
    }),
    finalize(() => config.patchList({ loading: false })),
  );
}

/** Sorting param for API requests, or undefined when defaults apply. */
export function buildSortingParam(
  params: BaseListParams,
  config: FeatureConfig,
): { path: string; order: 'Asc' | 'Desc' } | undefined {
  if (
    params.sortField === config.defaultSortField &&
    params.sortOrder === config.defaultSortOrder
  ) {
    return undefined;
  }

  return { path: params.sortField, order: params.sortOrder };
}

/** Converts store params to URL query params, omitting defaults. */
export function buildBaseQueryParams(
  params: BaseListParams,
  config: FeatureConfig,
): Record<string, string | null> {
  return {
    search: params.search || null,
    page: params.page > 0 ? String(params.page) : null,
    pageSize:
      params.pageSize !== config.defaultPageSize
        ? String(params.pageSize)
        : null,
    sort:
      params.sortField !== config.defaultSortField ? params.sortField : null,
    order:
      params.sortOrder !== config.defaultSortOrder ? params.sortOrder : null,
  };
}

/** Parses URL query params back into store params, validating values. */
export function parseBaseQueryParams(
  queryParams: Record<string, string>,
  config: FeatureConfig,
  validSortFields: string[],
): BaseListParams {
  const search = queryParams['search'] || '';

  const pageNum = Number(queryParams['page']);
  const page = Number.isInteger(pageNum) && pageNum > 0 ? pageNum : 0;

  const size = Number(queryParams['pageSize']);
  const pageSize = config.rowsPerPageOptions.includes(size)
    ? size
    : config.defaultPageSize;

  const sortParam = queryParams['sort'] || '';
  const sortField = validSortFields.includes(sortParam)
    ? sortParam
    : config.defaultSortField;
  const sortOrder =
    queryParams['order'] === 'Asc' || queryParams['order'] === 'Desc'
      ? queryParams['order']
      : config.defaultSortOrder;

  return { search, page, pageSize, sortField, sortOrder };
}
