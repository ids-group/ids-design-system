import { Rule, SchematicsException, Tree } from '@angular-devkit/schematics';
import { strings } from '@angular-devkit/core';
import { NameSchema } from '../shared/schema';

/** Scaffolds an `*.api.ts` class returning the ApiResult envelope, in core/api. */
export function dataAccess(options: NameSchema): Rule {
  return (tree: Tree) => {
    const name = strings.dasherize(options.name);
    const cls = strings.classify(name);
    const dir = options.path ?? 'projects/app/src/app/core/api';
    const filePath = `${dir}/${name}.api.ts`;

    if (tree.exists(filePath)) {
      throw new SchematicsException(`${filePath} already exists.`);
    }

    tree.create(
      filePath,
      `import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResult, HttpService } from '@app/common';

@Injectable({ providedIn: 'root' })
export class ${cls}Api {
  private readonly http = inject(HttpService);

  list(): Observable<ApiResult<unknown[]>> {
    return this.http.get<ApiResult<unknown[]>>('/${name}');
  }

  get(id: string): Observable<ApiResult<unknown>> {
    return this.http.get<ApiResult<unknown>>(\`/${name}/\${id}\`);
  }
}
`,
    );
  };
}
