export type ApiPropKind = 'input' | 'input-required' | 'model' | 'output';
export type ComponentStatus = 'stable' | 'new' | 'deprecated';

export interface ApiProp {
  readonly name: string;
  readonly kind: ApiPropKind;
  /** Display type text, e.g. "ButtonColor", "boolean", "string | null". */
  readonly type: string;
  /** Literal members when the type is a string-literal union; else null. */
  readonly union: readonly string[] | null;
  /** Default literal text; null for required inputs and outputs. */
  readonly default: string | null;
  readonly required: boolean;
  /** Final resolved description (JSDoc → editorial → ''). */
  readonly description: string;
}

export interface ComponentApi {
  readonly key: string;
  readonly selector: string;
  /** true for an element selector (`ds-x`), false for an attribute (`[dsX]`). */
  readonly isElement: boolean;
  readonly className: string;
  readonly status: ComponentStatus;
  readonly importName: string;
  readonly importPath: string;
  readonly summary: string | null;
  /** input / input-required / model (models render here with a two-way tag). */
  readonly inputs: readonly ApiProp[];
  readonly outputs: readonly ApiProp[];
}
