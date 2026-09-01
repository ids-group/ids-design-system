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
    does: 'Reads every component AST and emits the custom-element registrations plus one typed React wrapper per component. 85 elements, 625 inputs and outputs. Nothing here is hand-maintained.',
  },
  {
    command: 'ng build ds-elements',
    does: 'Angular AOT and the Ivy linker — the slow step, and the one plain esbuild cannot do. Emits main.js and styles.css.',
  },
  {
    command: 'node .design-sync/elements/tools/build-bundle.mjs',
    does: 'Wraps it into dist/ds-bundle.js — one IIFE assigning every wrapper to window.IdsDs, React external — and emits the .d.ts tree the design agent reads.',
  },
  {
    command: 'bun run check:manual-surface',
    does: 'The gate over what generation cannot cover: doc and preview coverage for all 85 components, the conditional-projection watch-list, and the attribute directives.',
  },
];

const FILES: readonly FileRole[] = [
  {
    path: '.design-sync/config.json',
    role: 'input',
    what: 'Project id, the bundle entry, the CSS entry, the docs directory, and per-component card shape.',
  },
  {
    path: '.design-sync/docs/<Name>.md',
    role: 'input',
    what: 'One usage doc per component. Its frontmatter category is the group the card lands in.',
  },
  {
    path: '.design-sync/previews/<Name>.tsx',
    role: 'input',
    what: 'The authored stories. A component with no preview gets no card at all — which is why the gate covers them.',
  },
  {
    path: '.design-sync/elements/gen/**',
    role: 'generated',
    what: 'Registrations and wrappers. Regenerated every build; never edited.',
  },
  {
    path: '_ds_bundle.js · _preview/*.js · _vendor/react*.js',
    role: 'remote',
    what: 'What the publish step produces in the project. Their absence from this repo is by design, not drift.',
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
