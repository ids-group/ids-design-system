export interface TableColumn<T = unknown> {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  truncate?: boolean;
  width?: number;
  align?: 'left' | 'right' | 'center';
  cell?: (row: T) => string;
  hideable?: boolean;
  hidden?: boolean;
}

export type SortDir = 'asc' | 'desc' | null;

export interface SortChangeEvent {
  key: string;
  dir: SortDir;
}
