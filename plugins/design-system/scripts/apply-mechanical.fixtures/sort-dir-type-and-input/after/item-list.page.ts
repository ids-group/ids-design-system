import type {
  SortChangeEvent,
  SortDirection,
} from '@ids-group-ltd/ids-design-system';
import { computed, signal } from '@angular/core';

const direction = signal<SortDirection>('asc');
export const sortDir = computed<SortDirection>(() => direction());
export const onSort = (event: SortChangeEvent): void => direction.set(event.dir);
