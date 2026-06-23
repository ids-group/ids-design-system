import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { Observable } from 'rxjs';
import { ApiResult } from '@app/common';
import { ItemApi, ItemListResult } from '../api/item.api';
import {
  BaseListParams,
  buildBaseQueryParams,
  buildSortingParameter,
  createEditDataLoader,
  createListLoader,
  parseBaseQueryParams,
  withListLoading,
} from './helpers';
import {
  EMPTY_ITEM_FORM,
  ItemDto,
  ItemFormModel,
  ItemListItem,
  dtoToFormModel,
} from '../../features/items/models';
import { ITEMS_CONFIG } from '../../features/items/items.config';

interface ListState {
  items: ItemListItem[];
  total: number;
  loading: boolean;
  params: BaseListParams;
}

interface EditState {
  formData: ItemFormModel;
  loading: boolean;
}

interface ItemState {
  list: ListState;
  edit: EditState;
}

const initialState: ItemState = {
  list: {
    items: [],
    total: 0,
    loading: false,
    params: {
      search: '',
      page: 0,
      pageSize: ITEMS_CONFIG.defaultPageSize,
      sortField: ITEMS_CONFIG.defaultSortField,
      sortOrder: ITEMS_CONFIG.defaultSortOrder,
    },
  },
  edit: { formData: EMPTY_ITEM_FORM, loading: false },
};

export const ItemStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  withComputed((store) => ({
    items: computed(() => store.list().items),
    total: computed(() => store.list().total),
    listLoading: computed(() => store.list().loading),
    editLoading: computed(() => store.edit().loading),
    formData: computed(() => store.edit().formData),
    params: computed(() => store.list().params),
    // URL-serialisable form of the current list params (omits defaults).
    queryParams: computed(() =>
      buildBaseQueryParams(store.list().params, ITEMS_CONFIG),
    ),
  })),

  withMethods((store) => {
    const api = inject(ItemApi);

    const patchList = (changes: Record<string, unknown>): void =>
      patchState(store, { list: { ...store.list(), ...changes } });
    const patchEdit = (changes: Record<string, unknown>): void =>
      patchState(store, { edit: { ...store.edit(), ...changes } });

    const VALID_SORT_FIELDS = ['name', 'category', 'quantity'];

    const loader = createListLoader<ApiResult<ItemListResult>>({
      getParams: () => store.list().params,
      patchList,
      // Send an explicit sort only when it differs from the default (buildSortingParameter).
      apiFn: (params) =>
        api.list(params, buildSortingParameter(params, ITEMS_CONFIG)),
      onSuccess: (result) => {
        if (result.isSuccess && result.data) {
          patchList({ items: result.data.items, total: result.data.total });
        }
      },
    });

    const loadEdit = createEditDataLoader<ItemDto, ItemFormModel>({
      patchEdit,
      apiFn: (id) => api.get(id),
      transform: dtoToFormModel,
      onLoaded: (formData) => patchEdit({ formData }),
    });

    return {
      loadList(): void {
        loader.loadList();
      },
      // URL is the source of truth: parse query params into list state, then load.
      applyQueryParams(queryParams: Record<string, string>): void {
        patchList({
          params: parseBaseQueryParams(
            queryParams,
            ITEMS_CONFIG,
            VALID_SORT_FIELDS,
          ),
        });
        loader.loadList();
      },
      /** Fast prefill from the already-loaded list cache (used by the edit resolver). */
      getItemFromList(id: string): ItemListItem | undefined {
        return store.list().items.find((item) => item.id === id);
      },
      loadForEdit(id: string): Observable<ApiResult<ItemFormModel>> {
        return loadEdit(id);
      },
      create(form: ItemFormModel): Observable<ApiResult<ItemDto>> {
        return api.create(form);
      },
      update(id: string, form: ItemFormModel): Observable<ApiResult<ItemDto>> {
        return api.update(id, form);
      },
      remove(id: string): Observable<ApiResult> {
        return withListLoading({
          patchList,
          apiFn: () => api.delete(id),
          onSuccess: () => loader.loadList(),
        });
      },
    };
  }),
);
