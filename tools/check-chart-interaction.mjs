#!/usr/bin/env node
// Three things a chart can silently lose, each of which was actually lost once:
//
//   1. HOVER PARITY — a chart that accepts `interactive` but has no hover rule, no pointer cursor,
//      no focus route or no tooltip. Three of the five failed this before the interaction phase.
//   2. AN ORPHAN `--ds-chart-*` TOKEN — declared in the public layer and reaching no rule, so a
//      consumer sets it and nothing happens, with no error anywhere.
//   3. `track $index` ON A DATA LOOP — which rewrites every mark's attributes on a reorder and
//      makes the enter/exit staging animate the wrong marks.
//
//   node tools/check-chart-interaction.mjs
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chartComponents, templateOf } from './chart-components.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// Loops whose items have no datum identity of their own: a placeholder, a tick, an axis label, one
// segment of a broken line, a table cell. `$index` is the only key these have.
const KEYLESS_LOOPS =
  /^(skeleton\w*|\w*[Tt]icks|categoryLabels|\w*[Pp]aths|polylines|tableRows|cells)$/;

const problems = [];

function withoutComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|\s)\/\/.*$/gm, '$1');
}

const charts = chartComponents();

for (const { name: component, base } of charts) {
  const script = readFileSync(`${base}.ts`, 'utf8');
  const template = templateOf(base);
  const styles = existsSync(`${base}.scss`)
    ? readFileSync(`${base}.scss`, 'utf8')
    : '';

  // Neither end of a composed chart draws its own marks: the container projects them, and a preset
  // hands them to a series inside that container. `interactive` still reaches both, for the plot's
  // ARIA role and to pass along. The hover state, the cursor and the tooltip belong to whichever
  // component owns the marks; demanding them here would make the other two write rules for
  // elements they do not own, which is how a gate teaches the wrong lesson. The focus ring below is
  // NOT part of that exemption: it is keyed on a mark this component's own template draws, and an
  // outline on an SVG element is wrong whoever else the component also composes.
  const projectsItsMarks = /<ng-content\b/.test(template);
  const delegatesItsMarks = /<ds-chart[\s>]/.test(template);

  if (/readonly interactive = input\(/.test(script)) {
    if (!projectsItsMarks && !delegatesItsMarks) {
      if (!/chart-interactive\.(fades|dims)\(/.test(styles)) {
        problems.push(
          `${component}: accepts \`interactive\` and derives no hover state — include ` +
            `chart-interactive.fades() or .dims()`,
        );
      }
      if (!/cursor:\s*pointer|chart-interactive\.clickable\(/.test(styles)) {
        problems.push(
          `${component}: accepts \`interactive\` and offers no pointer cursor`,
        );
      }
      if (!/readonly tooltip = input</.test(script)) {
        problems.push(
          `${component}: accepts \`interactive\` and declares no \`tooltip\` trigger`,
        );
      }
    }

    // Only an SVG mark needs a rule of its own. `outline` on an SVG element paints its BOUNDING
    // BOX rather than its silhouette, so the library's catch-all ring is wrong there and the chart
    // has to draw one; an HTML mark takes that catch-all and needs nothing.
    const svgMarkIsFocusable =
      /<(?:svg:)?(path|polygon|circle|rect|line|g)\s[^>]*\[attr\.tabindex\]/s.test(
        template,
      );
    if (svgMarkIsFocusable && !/drawn-focus-ring/.test(styles)) {
      problems.push(
        `${component}: a focusable SVG mark and no drawn focus ring — an outline there paints the ` +
          `bounding box, not the mark`,
      );
    }
  }

  for (const [, iterable] of template.matchAll(
    /@for\s*\(\s*[\w$]+\s+of\s+(?:[\w$]+\.)?([\w]+)\(?\)?\s*;\s*track\s+\$index/g,
  )) {
    if (!KEYLESS_LOOPS.test(iterable)) {
      problems.push(
        `${component}: \`@for (… of ${iterable}; track $index)\` — key a mark by its datum, never by ` +
          `its position`,
      );
    }
  }
}

// The DECLARATION lines only. A token named inside a comment is not a declaration — scraping those
// is what once made a count of this very set wrong by one.
const publicLayer = withoutComments(
  readFileSync(
    join(ROOT, 'src', 'lib', 'styles', '_tokens-charts.scss'),
    'utf8',
  ),
);
const declared = [
  ...new Set(
    [...publicLayer.matchAll(/^\s*(--ds-chart-[\w-]+)\s*:/gm)].map(
      (match) => match[1],
    ),
  ),
];

const sources = [];
function collect(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) collect(path);
    else if (/\.(scss|ts|html)$/.test(entry.name)) sources.push(path);
  }
}
collect(join(ROOT, 'src', 'lib'));

const referenced = new Set();
for (const path of sources) {
  const body = withoutComments(readFileSync(path, 'utf8'));
  for (const [, name] of body.matchAll(/var\(\s*(--ds-chart-[\w-]+)/g)) {
    referenced.add(name);
  }
}

for (const token of declared) {
  if (!referenced.has(token)) {
    problems.push(
      `${token} is declared in the public layer and reaches no rule — a consumer sets it and ` +
        `nothing happens`,
    );
  }
}

for (const line of problems)
  console.error(`check-chart-interaction: ERROR  ${line}`);

if (problems.length) {
  console.error(
    `check-chart-interaction: FAILED — ${problems.length} problem(s)`,
  );
  process.exit(1);
}

console.log(
  `check-chart-interaction: ${charts.length} chart(s) (${charts.map((chart) => chart.name).join(', ')}) ` +
    `and ${declared.length} public token(s) OK.`,
);
