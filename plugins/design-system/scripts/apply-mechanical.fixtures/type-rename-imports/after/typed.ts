import type {
  DateRangeValue,
} from '@ids-group-ltd/ids-design-system';

export function width(value: DateRangeValue): number {
  return value.start ? 1 : 0;
}
