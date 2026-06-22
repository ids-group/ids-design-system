import {
  Rule,
  apply,
  applyTemplates,
  chain,
  mergeWith,
  move,
  url,
} from '@angular-devkit/schematics';
import { strings } from '@angular-devkit/core';
import { FeatureSchema } from './schema';

/**
 * Scaffolds a feature folder in the IDS app architecture:
 *   features/<name>/
 *     <name>.routes.ts   <name>.config.ts
 *     pages/<name>-list.page.ts
 *     components/index.ts   models/index.ts   services/index.ts
 */
export function feature(options: FeatureSchema): Rule {
  const name = strings.dasherize(options.name);
  const featuresPath = options.path ?? 'projects/app/src/app/features';
  const targetPath = `${featuresPath}/${name}`;

  const templateSource = apply(url('./files'), [
    applyTemplates({ ...strings, name }),
    move(targetPath),
  ]);

  return chain([mergeWith(templateSource)]);
}
