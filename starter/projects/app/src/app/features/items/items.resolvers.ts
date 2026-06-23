import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { ItemStore } from '../../core/store/item.store';
import { ItemListItem } from './models';

/**
 * Prefill the edit form instantly from the list cache (if the user came from the
 * list), so the form shows data before the full `loadForEdit` API call returns.
 * Returns undefined on a cold load (deep link) — the form then waits for the API.
 */
export const itemEditPrefillResolver: ResolveFn<ItemListItem | undefined> = (
  route,
) => {
  const id = route.paramMap.get('id');

  return id ? inject(ItemStore).getItemFromList(id) : undefined;
};
