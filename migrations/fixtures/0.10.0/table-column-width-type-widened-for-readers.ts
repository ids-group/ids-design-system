import type { TableColumn } from '@ids-group-ltd/ids-design-system';

const takeWidth = (width: number): number => width;

export function readWidths(columns: TableColumn<{ id: string }>[]): number {
  let sum = 0;
  const fixed: Record<string, number> = {};
  for (const col of columns) {
    if (col.width === undefined) continue;
    // @ts-expect-error after TS2365
    sum += col.width;
    // @ts-expect-error after TS2322
    fixed[col.key] = col.width;
    // @ts-expect-error after TS2345
    takeWidth(col.width);
  }
  return sum;
}

export const written: TableColumn<{ id: string }> = { key: 'id', label: 'Id', width: 120 };
