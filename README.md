# IDS Design System

Angular component library, design tokens and themes for IDS Group products.

- 45+ standalone components (buttons, forms, overlays, navigation, data display)
- Three-tier token architecture: palette → semantic theme → geometry/typography/motion tokens
- Bundled fonts (Mulish, JetBrains Mono) — no external font CDN required
- Built for Angular 21, zoneless-compatible, `sideEffects: false`

## Installation

```bash
npm install @ids-group-ltd/ds
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
        "includePaths": ["node_modules/@ids-group-ltd/ds"]
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

Advanced consumers can swap the palette/theme and keep the token layer — global side-effects (fonts, link styles, etc.) become opt-in:

```scss
@use 'themes/default/palette';
@use 'themes/default/theme';
@use 'styles/tokens';
@use 'styles/fonts';
```

### 2. Components

All components are standalone — import them directly:

```ts
import { Component } from '@angular/core';
import { ButtonComponent } from '@ids-group-ltd/ds';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent],
  template: `<ds-button variant="outline" icon="download">Export</ds-button>`,
})
export class ExampleComponent {}
```

## Development

This repo contains the library (`src/`) and a documentation app (`ds-docs/`).

```bash
npm run build        # build the library into dist/ds
npm start            # serve the docs app
npm run build:docs   # build the docs app
```

## Publishing

Build first, then publish the `dist/ds` artifact (never the repo root):

```bash
npm run build
npm publish dist/ds
```

## License

UNLICENSED — proprietary to IDS Group Ltd.
