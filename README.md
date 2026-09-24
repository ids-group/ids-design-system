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
your styles set that the installed version does not read, and every `ds-*` selector naming a
class its component does not render. Add `--strict` to fail a CI step on either. A class
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

## License

MIT © IDS Group Ltd
