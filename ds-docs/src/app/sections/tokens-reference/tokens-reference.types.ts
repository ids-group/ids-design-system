export interface GenTokenRow {
  name: string;
  value: string;
  notes: string;
  kind: 'color' | 'length' | 'font' | 'motion' | 'other';
  inverted?: boolean;
}
export interface GenTokenGroup {
  title: string;
  subtitle: string;
  rows: GenTokenRow[];
}
