import { MultiSelectComponent } from '@ids-group-ltd/ids-design-system';

export function read(field: MultiSelectComponent): boolean {
  const isDefault = field.placeholder() === 'Select…';
  // @ts-expect-error after TS2322
  const text: string = field.placeholder();
  return isDefault && text.length > 0;
}
