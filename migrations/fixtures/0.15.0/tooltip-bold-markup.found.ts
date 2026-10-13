import type { TableColumn } from '@ids-group-ltd/ids-design-system';

interface NoteRow {
  readonly note: string;
}

export const columns: TableColumn<NoteRow>[] = [
  { key: 'note', label: 'Note', truncate: true },
];
