import { Component, ViewEncapsulation } from '@angular/core';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

interface Step {
  readonly command: string;
  readonly does: string;
}

interface FileRole {
  readonly path: string;
  readonly role: 'input' | 'generated' | 'remote';
  readonly what: string;
}

const CHAIN: readonly Step[] = [
  {
    command: 'bun install --frozen-lockfile',
    does: 'Repo dependencies. bun, not npm — npm ci fails under alpine/musl on the @emnapi optional deps.',
  },
  {
    command: 'node .design-sync/tools/bootstrap.mjs',
    does: 'esbuild, sass and react 18.3.1 with @types/react 19 into .ds-sync, plus the junction the tools resolve through. Runtime 18 with types 19 is deliberate: inert never landed in the 18.3.x types.',
  },
  {
    command: 'node .design-sync/elements/tools/gen.mjs',
    does: 'Reads every component AST and emits the custom-element registrations plus one typed React wrapper per component. Nothing here is hand-maintained.',
  },
  {
    command: 'CI=true npx ng build ds-elements',
    does: 'Angular AOT and the Ivy linker — the slow step, and the one plain esbuild cannot do. Emits main.js and styles.css.',
  },
  {
    command: 'node .design-sync/elements/tools/build-bundle.mjs',
    does: 'Wraps it into dist/ds-bundle.js — one IIFE assigning every wrapper to window.IdsDs, taking React from the global the host supplies — plus dist/ds-bundle.css, the upload copy of the stylesheet with its font URLs pointed at the fonts the project already carries. It also type-checks the generated wrappers.',
  },
  {
    command: 'node tools/check.mjs manual-surface',
    does: 'The gate over what generation cannot cover: doc coverage for every component, the conditional-projection watch-list, and the attribute directives.',
  },
];

const FILES: readonly FileRole[] = [
  {
    path: '.design-sync/config.json',
    role: 'input',
    what: 'Project id, the bundle entry, the CSS entry, the docs directory, and the ds-docs section that documents each component.',
  },
  {
    path: '.design-sync/docs/<Name>.md',
    role: 'input',
    what: 'One usage doc per component, published as its <Name>.prompt.md.',
  },
  {
    path: 'ds-docs/src/app/sections/**/*.section.html',
    role: 'input',
    what: 'A block marked data-claude-design becomes a card; see .design-sync/CARDS.md.',
  },
  {
    path: '.design-sync/elements/gen/**',
    role: 'generated',
    what: 'Registrations and wrappers. Regenerated every build; never edited.',
  },
  {
    path: '_ds_bundle.js · _ds_bundle.css · _vendor/react*.js · components/** · guides/**',
    role: 'generated',
    what: 'What build-cards writes into .design-sync/upload/, committed so a release carries exactly what a publish sends.',
  },
  {
    path: '_ds_sync.json',
    role: 'remote',
    what: 'The incremental bookkeeping — style hash, per-component render and source hashes — that lets a re-sync touch only what changed.',
  },
];

@Component({
  selector: 'practice-claude-design',
  standalone: true,
  imports: [DocsSectionComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './claude-design.section.html',
  styleUrl: './claude-design.section.scss',
})
export class ClaudeDesignSection {
  protected readonly chain = CHAIN;
  protected readonly files = FILES;
}
