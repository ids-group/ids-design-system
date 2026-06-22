export interface NameSchema {
  /** Artifact name, e.g. `kit` or `truck-plan`. */
  name: string;
  /** Target folder (overrides the generator's default). */
  path?: string;
}
