import { Rule, SchematicsException, Tree } from '@angular-devkit/schematics';
import { strings } from '@angular-devkit/core';
import { NameSchema } from '../shared/schema';

/** Scaffolds a routed standalone page component (`*.page.ts`). */
export function page(options: NameSchema): Rule {
  return (tree: Tree) => {
    const name = strings.dasherize(options.name);
    const cls = strings.classify(name);
    const dir = options.path ?? 'projects/app/src/app/features';
    const filePath = `${dir}/${name}.page.ts`;

    if (tree.exists(filePath)) {
      throw new SchematicsException(`${filePath} already exists.`);
    }

    tree.create(
      filePath,
      `import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-${name}-page',
  template: \`<h1>${cls}</h1>\`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ${cls}Page {}
`,
    );
  };
}
