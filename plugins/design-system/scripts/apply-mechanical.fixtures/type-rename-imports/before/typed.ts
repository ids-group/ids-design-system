import type {
  RangeValue,
} from '@ids-group-ltd/ids-design-system';

export function width(value: RangeValue): number {
  return value.start ? 1 : 0;
}
