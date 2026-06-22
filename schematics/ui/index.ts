import { Rule, SchematicsException, Tree } from '@angular-devkit/schematics';
import { strings } from '@angular-devkit/core';
import { NameSchema } from '../shared/schema';

/** Scaffolds a presentational standalone component (`*.component.ts`). */
export function ui(options: NameSchema): Rule {
  return (tree: Tree) => {
    const name = strings.dasherize(options.name);
    const cls = strings.classify(name);
    const dir = options.path ?? 'projects/app/src/app/shared/components';
    const filePath = `${dir}/${name}.component.ts`;

    if (tree.exists(filePath)) {
      throw new SchematicsException(`${filePath} already exists.`);
    }

    tree.create(
      filePath,
      `import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-${name}',
  template: \`<ng-content />\`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ${cls}Component {}
`,
    );
  };
}
