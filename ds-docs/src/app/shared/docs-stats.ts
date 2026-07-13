// Live docs stats — derived, never hardcoded, so the home page can't drift from
// reality. Counts come from the nav config and the loaded stylesheets; the
// version comes from the published package.json.
import pkg from '../../../../package.json';
import { NAV } from '../layout/nav.config';

export const DS_VERSION: string = pkg.version;

const groupCount = (title: string): number =>
  NAV.find((group) => group.title === title)?.items.length ?? 0;

// Components are split across several semantic nav groups (Actions, Forms &
// inputs, …), so sum every group that isn't one of the fixed meta sections.
const META_GROUPS = new Set([
  'Start',
  'Foundations',
  'Patterns',
  'Practice',
  'Reference',
  'Changelog',
]);

export const COMPONENT_COUNT = NAV.filter(
  (group) => !META_GROUPS.has(group.title),
).reduce((total, group) => total + group.items.length, 0);
export const FOUNDATION_COUNT = groupCount('Foundations');
export const PATTERN_COUNT = groupCount('Patterns');

/**
 * Count the design tokens actually loaded on the page: unique custom properties
 * declared on `:root`, excluding component-internal `--_*` resolvers. Reads
 * document.styleSheets, so it is browser-only — call from afterNextRender.
 */
export function countDesignTokens(): number {
  const names = new Set<string>();

  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      continue; // cross-origin sheet — cssRules is not readable
    }

    for (const rule of Array.from(rules)) {
      if (!(rule instanceof CSSStyleRule)) {
        continue;
      }
      if (
        !rule.selectorText
          .split(',')
          .some((selector) => selector.trim() === ':root')
      ) {
        continue;
      }

      const { style } = rule;
      for (let index = 0; index < style.length; index++) {
        const property = style.item(index);
        if (property.startsWith('--') && !property.startsWith('--_')) {
          names.add(property);
        }
      }
    }
  }

  return names.size;
}
