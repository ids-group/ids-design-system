import type { TableColumn } from '@ids-group-ltd/ids-design-system';

interface RunRow {
  readonly model: string;
}

export const columns: TableColumn<RunRow>[] = [
  { key: 'model', label: 'Model', sortable: true, truncate: true, width: 240 },
];
