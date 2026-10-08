// The components where a vertical clip cut glyphs keep clipping the inline axis only, compiled
// from their real stylesheets: a refactor that brings `overflow: hidden` back on one of these
// rules fails here even where it carries a waiver `check-glyph-clip` would accept.
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import * as sass from 'sass';
import { check, finish } from './probe-check.mjs';

const lib = join(dirname(fileURLToPath(import.meta.url)), '../../src/lib');
const css = (path) => sass.compile(join(lib, path), { style: 'expanded' }).css;

// The declarations of every rule whose selector ends with `selector`, outside any at-rule block
// unless `scope` names that block's prelude.
const declarationsOf = (text, selector, scope = null) => {
  const found = [];
  const rule = /([^{}]+)\{([^{}]*)\}/g;
  const blocks = scope
    ? text
        .split(scope)
        .slice(1)
        .map((part) => part.slice(0, part.indexOf('}\n}') + 1))
    : [text];
  for (const block of blocks) {
    for (const [, selectors, body] of block.matchAll(rule)) {
      if (selectors.split(',').some((one) => one.trim().endsWith(selector)))
        found.push(body);
    }
  }
  return found.join(';').replace(/\s+/g, ' ');
};

const inlineOnly = (file, selector) => {
  const body = declarationsOf(css(file), selector);
  check(
    `${file} ${selector} clips the inline axis only`,
    /overflow: clip visible/.test(body),
    true,
  );
  check(
    `${file} ${selector} never clips the block axis`,
    /overflow: (hidden|clip);/.test(body),
    false,
  );
};

inlineOnly('components/breadcrumbs/breadcrumbs.component.scss', '.breadcrumbs');
inlineOnly('components/breadcrumbs/breadcrumbs.component.scss', '.label');
inlineOnly('components/table/table.component.scss', '.th-text');
inlineOnly('components/table/table.component.scss', '.cell-clip-text');
inlineOnly('components/table/table.component.scss', 'thead th');
inlineOnly('components/select/select.component.scss', '.trigger-text');
inlineOnly('components/sidenav/sidenav-item.component.scss', '.item-label');
inlineOnly('components/date-picker/date-picker.component.scss', '.mask-ghost');
inlineOnly('components/filter-bar/filter-bar.component.scss', '.row');
inlineOnly('components/multi-select/multi-select.component.scss', '.fit');

const stat = css('components/stat/stat.component.scss');
const clamped = declarationsOf(stat, '.value');
check(
  'the clamped stat value clips under a line box as tall as the glyphs',
  /line-height: normal/.test(clamped) && /overflow: clip;/.test(clamped),
  true,
);
const single = declarationsOf(
  stat,
  '.value',
  '@container style(--_stat-value-lines: none)',
);
check(
  'the unclamped stat value is one flat line',
  /line-height: var\(--line-height-flat\)/.test(single),
  true,
);
check(
  'the unclamped stat value clips the inline axis only',
  /overflow: clip visible/.test(single),
  true,
);

finish('glyph-clip');
