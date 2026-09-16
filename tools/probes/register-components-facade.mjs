import { register } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// A math module reaches the foundation's scale/format helpers by package specifier, which is
// the only spelling ng-packagr accepts across an entry-point boundary and the one thing node
// cannot resolve outside a real install. This maps the specifier onto the foundation's own
// sources for the length of a probe run, and returns the `components` directory so the caller
// can import its own math module by file URL.
export function registerComponentsFacade(probeUrl, files) {
  const components = join(
    dirname(fileURLToPath(probeUrl)),
    '..',
    '..',
    'src',
    'lib',
    'components',
  );
  const entryPointFacade =
    'data:text/javascript,' +
    files
      .map(
        (file) =>
          `export * from ${JSON.stringify(pathToFileURL(join(components, file)).href)};`,
      )
      .join('');

  register(
    `data:text/javascript,export async function resolve(specifier, context, next) {
       if (specifier === '@ids-group-ltd/ids-design-system/components') {
         return { url: ${JSON.stringify(entryPointFacade)}, shortCircuit: true };
       }
       return next(specifier, context);
     }`,
  );

  return components;
}
