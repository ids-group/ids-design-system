# IDS Design System

Angular component library, design tokens and themes for IDS Group products.

📖 **Live docs & component showcase:** https://ids-ds.proto.ids-group.co.uk/

- 45+ standalone components (buttons, forms, overlays, navigation, data display)
- Three-tier token architecture: palette → semantic theme → geometry/typography/motion tokens
- Bundled fonts (Mulish, JetBrains Mono) — no external font CDN required
- Built for Angular 21, zoneless-compatible, `sideEffects: false`

## Installation

```bash
npm install @ids-group-ltd/ids-design-system
```

Requires Angular `^21.2.0` (`@angular/core`, `common`, `forms`, `router`, `platform-browser`) and `@angular/cdk` as peer dependencies.

## Setup

### 1. Global styles

Add the package to your Sass include paths in `angular.json`:

```json
"architect": {
  "build": {
    "options": {
      "stylePreprocessorOptions": {
        "includePaths": ["node_modules/@ids-group-ltd/ids-design-system"]
      }
    }
  }
}
```

Then import the design system once at the top of your root `styles.scss`:

```scss
@use 'styles/ds';
```

This brings in the default palette, semantic theme, design tokens, fonts, reset and base typography.

**`'styles/ds'` resolves against every include path in order, so a file of your own at
`<an-earlier-path>/styles/ds.scss` wins and the package's never loads.** Nothing reports it: the
build succeeds, your own file's partials arrive, and whatever the package adds to its `ds.scss` in
any later version silently never reaches you. If you keep an aggregator of your own, name it
something else, or list the package partials by hand and revisit that list on every upgrade. To
check which one you got, grep the built CSS for a rule only ours ships:

```bash
grep -c ':where(:focus-visible)' dist/<app>/browser/styles-*.css   # 0 means ours never loaded
```

After an upgrade, `ng g @ids-group-ltd/ids-design-system:check-overrides` lists every `--ds-*`
your styles set that the installed version does not read, including one set from a template
binding (`[style.--ds-*]`) or from code (`setProperty('--ds-*', …)`), and every `ds-*` selector
naming a class its component does not render. Add `--strict` to fail a CI step on either. A class
inside a nested SCSS block on another line is not checked.

Advanced consumers can swap the palette/theme and keep the token layer — global side-effects (fonts, link styles, etc.) become opt-in:

```scss
@use 'themes/light/palette';
@use 'themes/light/theme';
@use 'styles/tokens';
@use 'styles/fonts';
```

### 2. Components

All components are standalone — import them directly:

```ts
import { Component } from '@angular/core';
import { ButtonComponent } from '@ids-group-ltd/ids-design-system';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent],
  template: `<ds-button variant="outline" icon="download">Export</ds-button>`,
})
export class ExampleComponent {}
```

**Inside a `@defer` block, import the deferred component from its own entry point**, which each
component page on the docs site shows beside its selector:

```ts
import { TableComponent } from '@ids-group-ltd/ids-design-system/components/table';
```

Imported from the package root, a component in a `@defer` block stays in the initial bundle and
nothing is deferred ([angular/angular#52554](https://github.com/angular/angular/issues/52554)). On a
page with an eager `ds-button` and a deferred `ds-table` and `ds-line-chart`, the initial bundle is
175 kB gzip with root imports and 110 kB with entry-point imports. Everywhere else, including a route
behind `loadComponent`, the package root costs nothing extra.

### 3. Stale token overrides (stylelint)

The package ships a stylelint plugin that reports every custom property this library has removed
or renamed, wherever your stylesheets declare it or read it through `var()`. The list is generated
from the published migration manifests, so after an upgrade an override of a renamed token is red in
your editor instead of silently doing nothing. Add it to `.stylelintrc.json` (written for stylelint 17):

```json
{
  "plugins": ["@ids-group-ltd/ids-design-system/stylelint"],
  "rules": { "ids-design-system/no-removed-tokens": true }
}
```

Each report names the replacement, the version and the manifest item
(`"--ds-card-pad" was renamed to "--ds-card-padding" in 0.13.4 (0.13.4#card-pad-is-card-padding)`).
`stylelint --fix` renames a token that has a single replacement; a removed token is reported and left
for you to resolve. Only stylesheets are read; the ESLint plugin below covers TypeScript and templates.

The list holds every release since 0.2.0. When you upgrade across known versions, ask for those releases
only: `"ids-design-system/no-removed-tokens": [true, { "from": "0.13.4", "to": "0.14.5" }]` reports what
changed after 0.13.4, up to and including 0.14.5, and stays quiet about the rest. Either bound can stand
alone; without `to` the unreleased version counts too.

### 4. Removed and renamed API (ESLint)

The package also ships an ESLint flat-config plugin with the same purpose for `.ts` files and
Angular templates. It catches what the compiler does not: a listener on a renamed output (it compiles
and never fires), a binding in a template built without `strictTemplates`, a token set from code, a
remapped attribute value, a subclass member that now overrides nothing. Templates are read by
`@angular-eslint/template-parser`, which an Angular ESLint setup already has; inline templates need
`angular.processInlineTemplates` on your `.ts` block, as `angular-eslint` configures it.

```js
// eslint.config.mjs
import idsDesignSystem from '@ids-group-ltd/ids-design-system/eslint';

export default [
  // ...your TypeScript and template blocks
  idsDesignSystem.configs.recommended,
];
```

`recommended` turns every rule on as an error for `**/*.ts` and `**/*.html`. To pick rules, register
the plugin as `plugins: { 'ids-design-system': idsDesignSystem }` and name them:

- `ids-design-system/no-removed-inputs` - a template binding (`[x]`, `[(x)]`, `x="..."`) to an input
  removed or renamed on that element; the same name on another element is not reported.
- `ids-design-system/no-removed-outputs` - a `(x)` listener on an output removed or renamed on that
  element.
- `ids-design-system/no-removed-values` - a static value a release remapped (`variant="secondary"` on
  `ds-button`), with the replacement attribute; a bound expression is not read.
- `ids-design-system/no-renamed-selectors` - a renamed element in a template, and in a TypeScript
  `selector:`, `querySelector`, `querySelectorAll`, `closest`, `matches` or `By.css` string.
- `ids-design-system/no-renamed-imports` - an import from this package of a removed or renamed
  symbol; `--fix` renames a pure rename and its uses in the file.
- `ids-design-system/no-removed-members` - a member of a class extending or implementing one of ours
  that was removed or renamed in the base.
- `ids-design-system/no-removed-tokens` - a removed or renamed custom property in a TypeScript string
  or a template attribute (`[style.--x]`, `style="..."`, `[ngStyle]`); `--fix` renames a pure rename.

Each report names the replacement, the version and the manifest item, like the stylelint rule.

`no-removed-tokens` lists every release since 0.2.0, the other rules every release since 0.4.0. When you upgrade across known versions, report only what
changed in them: `idsDesignSystem.configs.recommendedFrom('0.13.4', '0.14.5')` is `recommended` with
every rule set to `['error', { from: '0.13.4', to: '0.14.5' }]`, and a single rule takes the same options
(`'ids-design-system/no-removed-inputs': ['error', { from: '0.13.4', to: '0.14.5' }]`). `from` is
exclusive and `to` inclusive; either can stand alone, and without `to` the unreleased version counts too.

## License

MIT © IDS Group Ltd
