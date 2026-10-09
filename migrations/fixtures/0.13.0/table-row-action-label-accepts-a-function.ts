import type { TableRowAction } from '@ids-group-ltd/ids-design-system';

type Row = { id: string };

export const written: TableRowAction<Row> = { id: 'edit', label: 'Edit' };

export function read(action: TableRowAction<Row>): string {
  // @ts-expect-error after TS2322
  const text: string = action.label;
  // @ts-expect-error after TS2339
  return text + action.label.toUpperCase();
}
