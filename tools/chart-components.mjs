// Which components the chart gates cover. Both `check-chart-aria` and `check-chart-interaction`
// need the same answer, and each once had its own copy that read exactly one file per directory.
//
// Two things that copy got wrong. A directory is a chart when it is `chart` or ends in `-chart`,
// so the container itself counts while `chart-legend` and `chart-tooltip` - chrome beside a plot,
// not a plot - still do not. And a chart directory holds MORE than one component: the series
// components are built inside `components/chart/`, so keying on `<dir>/<dir>.component.*` leaves
// every one of them ungated.
//
// Keyed by the component's own file base, which keeps `bar-chart/bar-chart.component.*` named
// `bar-chart` and brings `chart/bar-series.component.*` in as `bar-series`.
import { readdirSync, existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const COMPONENTS = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'src',
  'lib',
  'components',
);

const CHART_DIRECTORY = /(^|-)chart$/;
const SUFFIX = '.component.ts';

export function chartComponents() {
  const found = [];
  for (const entry of readdirSync(COMPONENTS, { withFileTypes: true })) {
    if (!entry.isDirectory() || !CHART_DIRECTORY.test(entry.name)) continue;
    const directory = join(COMPONENTS, entry.name);
    for (const file of readdirSync(directory)) {
      if (!file.endsWith(SUFFIX)) continue;
      const name = file.slice(0, -SUFFIX.length);
      found.push({ name, base: join(directory, `${name}.component`) });
    }
  }

  return found.sort((a, b) => a.name.localeCompare(b.name));
}

/** The markup a component renders, wherever it lives. A component with an inline `template:`
 *  has none of its own, and its own source is then the markup - returning '' there would pass
 *  every template rule by having nothing to test. */
export function templateOf(base) {
  return existsSync(`${base}.html`)
    ? readFileSync(`${base}.html`, 'utf8')
    : readFileSync(`${base}.ts`, 'utf8');
}
