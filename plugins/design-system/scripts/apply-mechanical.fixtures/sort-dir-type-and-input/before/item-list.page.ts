import type {
  SortChangeEvent,
  SortDir,
} from '@ids-group-ltd/ids-design-system';
import { computed, signal } from '@angular/core';

const direction = signal<SortDir>('asc');
export const sortDir = computed<SortDir>(() => direction());
export const onSort = (event: SortChangeEvent): void => direction.set(event.dir);
