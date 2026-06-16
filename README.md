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
import { ButtonComponent } from '@ids-group-ltd/ids-design-system';

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

## Releasing

Releases follow [SemVer](https://semver.org): `fix` → patch, new backwards-compatible
features → minor, breaking changes (API or visual) → major. A new Angular major
always means a new package major. See `CHANGELOG.md` for history.

Before releasing, add your notes to the `## Unreleased` section of `CHANGELOG.md`
on `main`. Then release one of two ways.

### Option A — one-click in Bitbucket (recommended)

In the Bitbucket UI: **Pipelines → Run pipeline → branch `main` →** pick
`release-patch`, `release-minor`, `release-major`, or `release-beta`. CI bumps the
version, stamps the CHANGELOG, commits, and pushes `main` + a `vX.Y.Z` tag — no
local tooling needed. That tag push then triggers the `Publish to npm` pipeline,
which builds and publishes (so you'll see two runs: the release, then the publish).
`## Unreleased` must be filled first; preflight fails the pipeline early otherwise.

### Option B — locally

With a clean, in-sync `main`:

```bash
npm run release:patch   # 0.1.0 -> 0.1.1  bugfixes
npm run release:minor   # 0.1.0 -> 0.2.0  new components/inputs/tokens
npm run release:major   # 0.x   -> 1.0.0  breaking changes
npm run release:beta    # 0.2.0 -> 0.2.1-beta.0  pre-release

git push origin main --follow-tags   # the tag push triggers CI publish
```

Each `release:*` runs preflight checks first (must be on a clean, in-sync `main`
with a non-empty `## Unreleased` CHANGELOG section), bumps the version, stamps the
CHANGELOG (`## Unreleased` → `## x.y.z — date`, opening a fresh Unreleased), and
creates a `release: x.y.z` commit plus a `vX.Y.Z` git tag locally — it does **not**
publish. The tag push to Bitbucket runs `bitbucket-pipelines.yml`, which builds
`dist/ds` and publishes it through `infrastructure/scripts/publish.sh`. That script
refuses to publish if the tag does not match the built version or if the version is
already on npm.

Bypass preflight in emergencies with `SKIP_PREFLIGHT=1 npm run release:patch`.

CI auth uses two Secured repository variables: `NPM_TOKEN` (npm granular access
token, read+write on `@ids-group-ltd`, "Bypass 2FA" enabled) for publishing, and —
for the one-click pipelines only — `RELEASE_TOKEN`, a Bitbucket Repository Access
Token with `repository:write` used to push the bump commit and tag back to `main`.

Manual publish (fallback, requires an authenticated npm session):

```bash
npm run publish:manual
```

Pre-releases: `npm run release:beta` bumps to `x.y.z-beta.N`; the matching tag
publishes under the `next` dist-tag (never `latest`).

## License

[MIT](LICENSE) © IDS Group Ltd
