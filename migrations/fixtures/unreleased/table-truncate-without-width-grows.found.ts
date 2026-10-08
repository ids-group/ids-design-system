import type { TableColumn } from '@ids-group-ltd/ids-design-system';

interface AuditRow {
  readonly details: string;
}

export const columns: TableColumn<AuditRow>[] = [
  { key: 'details', label: 'Details', truncate: true, cell: (row) => row.details },
];
