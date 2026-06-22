import { Rule, SchematicsException, Tree } from '@angular-devkit/schematics';
import { strings } from '@angular-devkit/core';
import { NameSchema } from '../shared/schema';

/** Scaffolds a root-provided NgRx Signal Store skeleton in core/store. */
export function store(options: NameSchema): Rule {
  return (tree: Tree) => {
    const name = strings.dasherize(options.name);
    const cls = strings.classify(name);
    const dir = options.path ?? 'projects/app/src/app/core/store';
    const filePath = `${dir}/${name}.store.ts`;

    if (tree.exists(filePath)) {
      throw new SchematicsException(`${filePath} already exists.`);
    }

    tree.create(
      filePath,
      `import { computed } from '@angular/core';
import {
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';

interface ${cls}State {
  loading: boolean;
}

const initialState: ${cls}State = {
  loading: false,
};

export const ${cls}Store = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  withComputed((store) => ({
    isLoading: computed(() => store.loading()),
  })),

  withMethods(() => ({
    // inject the matching *.api.ts here and add load / create / update methods
    // (use createListLoader / createEditDataLoader from core/store/helpers).
  })),
);
`,
    );
  };
}
