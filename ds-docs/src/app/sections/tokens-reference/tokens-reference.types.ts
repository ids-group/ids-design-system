export interface ColourRow {
  name: string;
  value: string;
  notes: string;
  inverted?: boolean;
}
export interface RampSpec {
  label: string;
  prefix: string;
  stops: readonly number[];
  notes: string;
}
export interface TypeRow {
  name: string;
  value: string;
  sample: string;
  sampleClass:
    | 'sample-fs'
    | 'sample-lh'
    | 'sample-ls'
    | 'sample-fw'
    | 'sample-font';
  notes: string;
}
export interface SpacingRow {
  name: string;
  value: string;
  notes: string;
}
export interface RadiusRow {
  name: string;
  value: string;
  notes: string;
}
export interface ShadowRow {
  name: string;
  alias: string;
  notes: string;
}
export interface MotionRow {
  name: string;
  value: string;
  notes: string;
}
export interface SizeRow {
  name: string;
  value: string;
  notes: string;
}
export interface LayoutRow {
  name: string;
  value: string;
  notes: string;
}
export interface MiscRow {
  name: string;
  value: string;
  renderAs: 'bar' | 'opacity' | 'literal';
  notes: string;
}

export interface ComponentTokenRow {
  name: string;
  value: string;
  notes: string;
}
export interface ComponentTokenGroup {
  component: string;
  selector: string;
  description: string;
  tokens: readonly ComponentTokenRow[];
}

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
