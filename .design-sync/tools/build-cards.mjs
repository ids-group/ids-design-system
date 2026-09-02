// Builds everything the Claude Design project holds per component, into .design-sync/upload/.
//
// The upload used to be driven by a /design-sync skill that is not installed on any account here
// and could not run in a pipeline anyway — a skill is instructions for a model, and CI runs a
// shell. So the artefacts are derived from the same sources the bundle is, and the publish step is
// left with nothing to invent.
//
//   node .design-sync/tools/build-cards.mjs      # after gen.mjs -> ng build -> build-bundle.mjs
//
// What it does NOT write is `_ds_sync.json`. That file is the skill's incremental-sync bookkeeping
// and its hash recipes are unknown (`keyRecipe: 7` names a version we cannot reproduce). A wrong
// value there is worse than a stale one: a hash that happens to match makes the next skill-driven
// sync SKIP a file that did change. `_ds_manifest.json` is not ours either — the app compiles it
// from the `@dsCard` markers in each card.
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const syncDir = resolve(here, '..');
const repo = resolve(syncDir, '..');
const elements = join(syncDir, 'elements');
const OUT = join(syncDir, 'upload');

const require_ = createRequire(join(syncDir, 'node_modules', 'package.json'));
const esbuild = require_('esbuild');

const config = JSON.parse(readFileSync(join(syncDir, 'config.json'), 'utf8'));
const viewports = JSON.parse(readFileSync(join(syncDir, 'viewports.json'), 'utf8'));
const surface = JSON.parse(readFileSync(join(elements, 'gen', 'surface.json'), 'utf8'));
const byName = new Map(surface.components.map((component) => [component.name, component]));

// `category: Forms & inputs` in a doc's front matter is `forms-inputs` on the remote, which is also
// the `@dsCard group`. Verified against all eight groups the live project already carries.
const groupOf = (category) =>
  category.toLowerCase().replace(/&/g, '').trim().replace(/\s+/g, '-');

function readDoc(name) {
  const raw = readFileSync(join(syncDir, 'docs', `${name}.md`), 'utf8').replace(/\r\n/g, '\n');
  const front = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  const category = front?.[1].match(/^category:\s*(.+)$/m)?.[1].trim();
  if (!category) throw new Error(`${name}.md has no \`category\` in its front matter.`);

  return { group: groupOf(category), body: raw.slice(front[0].length).trimStart() };
}

/** The card page, byte-compatible with what the project already serves. Only the five values below
 *  differ between two cards — everything else is fixed, so it lives here once. */
function cardHtml({ name, group, viewport, mode, primary }) {
  const marker = `<!-- @dsCard group="${group}"${viewport ? ` viewport="${viewport}"` : ''} -->`;

  return `${marker}
<!doctype html>
<html><head><meta charset="utf-8">
  <link rel="stylesheet" href="../../../styles.css">
  <link rel="stylesheet" href="../../../_ds_bundle.css">
  <style>
    body{margin:0;padding:24px;background:#fff}
    /* auto-fit (not auto-fill): empty tracks collapse, so a 1-2 story card
       fills the width instead of stranding stories in a half-width left
       column beside phantom empty columns */
    .ds-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:20px;align-items:start}
    .ds-grid.ds-col{grid-template-columns:1fr}
    .ds-cell{border:1px solid #e5e7eb;border-radius:8px;padding:12px;min-width:0;overflow:hidden;transform:translateZ(0)}
    .ds-cell>h4{margin:0 0 8px;font:600 12px system-ui;color:#6b7280;text-transform:uppercase;letter-spacing:.04em}
    .ds-single{transform:translateZ(0)}
  </style>
</head><body>
  <div class="ds-grid" id="g"></div>
  <script src="../../../_vendor/react.js"></script>
  <script src="../../../_vendor/react-dom.js"></script>
  <script src="../../../_ds_bundle.js"></script>
  <script src="../../../_preview/${name}.js"></script>
  <script>
    var h=React.createElement, g=document.getElementById('g');
    var E=[]; for (var k in (window.__dsPreview||{})) {
      if (typeof window.__dsPreview[k]==='function' && /^[A-Z]/.test(k)) E.push(k);
    }
    window.__dsCells=E.slice();
    var q=null; try{q=new URLSearchParams(location.search).get('story')}catch(e){}
    var MODE=${JSON.stringify(mode)};
    window.__dsMode=MODE;
    var PRIMARY=${JSON.stringify(primary)};
    if(MODE==='column'){
      g.className+=' ds-col';
      // primaryStory renders first — it's what shows above the product's fold.
      var cpi=PRIMARY?E.indexOf(PRIMARY):-1;
      if(cpi>0){E.splice(cpi,1);E.unshift(PRIMARY)}
    }
    function mount(id,key){try{ReactDOM.createRoot(document.getElementById(id)).render(h(window.__dsPreview[key]))}catch(e){document.getElementById(id).textContent='⚠ '+(e&&e.message||e)}}
    var pick=null;
    if(q){for(var j=0;j<E.length;j++){if(E[j]===q||E[j].toLowerCase()===q.toLowerCase()){pick=E[j];break}}}
    else if(MODE==='single'&&E.length){pick=E.indexOf(PRIMARY)>=0?PRIMARY:E[0]}
    if(q&&!pick){g.textContent='⚠ no export named '+q}
    else if(pick){
      var s=document.createElement('div'); s.className='ds-single'; s.id='r0';
      if(!q)document.body.style.padding='0';
      g.parentNode.replaceChild(s,g); mount('r0',pick);
    } else {
      for(var i=0;i<E.length;i++){
        var cell=document.createElement('section'); cell.className='ds-cell';
        cell.innerHTML='<h4>'+E[i]+'</h4><div id="r'+i+'"></div>'; g.appendChild(cell);
        mount('r'+i,E[i]);
      }
      if(E.length===0){g.textContent='⚠ no PascalCase exports in _preview/${name}.js'}
    }
  </script>
</body></html>
`;
}

/** Declarations for the agent. Richer than the deleted port's: the same per-prop docs plus the 55
 *  named slots, which no hand-written declaration ever carried. */
function declaration({ name, component, doc }) {
  const lines = [];
  for (const { name: propName, kind, type, doc: propDoc } of component.api) {
    const emitted = kind === 'output' ? `on${propName[0].toUpperCase()}${propName.slice(1)}` : propName;
    const emittedType = kind === 'output' ? `(value: ${type}) => void` : type;
    if (propDoc) lines.push(`  /** ${propDoc} */`);
    lines.push(`  ${emitted}?: ${emittedType};`);
    if (kind === 'model') {
      lines.push(`  on${propName[0].toUpperCase()}${propName.slice(1)}Change?: (value: ${type}) => void;`);
    }
  }
  for (const slot of component.slots) {
    lines.push(`  /** Content for the \`[${slot.attribute}]\` slot. */`);
    lines.push(`  ${slot.prop}?: React.ReactNode;`);
  }
  lines.push('  /** Element content. */');
  lines.push('  children?: React.ReactNode;');
  lines.push('  className?: string;');
  lines.push('  style?: React.CSSProperties;');

  return `import * as React from 'react';

/**
 * ${name} — the real ${component.className}, run by Angular behind \`<${component.tag}>\`.
${doc.split('\n')[0] ? ` * ${doc.split('\n')[0].replace(/\*\//g, '*\\/')}\n` : ''} */
export interface ${name}Props {
${lines.join('\n')}
}

export declare const ${name}: React.ComponentType<${name}Props>;
`;
}

// The declaration cannot import from the library, so `gen.mjs` hands over each type with its
// aliases already substituted. What survives here is anything made of literals and built-ins; a
// name that still refers to a library interface becomes `unknown`, which teaches an agent nothing
// but at least does not break the project's own typecheck with a dangling import.
const AMBIENT = new Set([
  'boolean', 'number', 'string', 'void', 'unknown', 'null', 'undefined', 'true', 'false',
  'readonly', 'Array', 'Record', 'Partial', 'Date', 'RegExp', 'File', 'FileList', 'Blob',
  'Event', 'MouseEvent', 'KeyboardEvent', 'PointerEvent', 'FocusEvent', 'InputEvent', 'DragEvent',
  'HTMLElement', 'Element', 'React', 'ReactNode',
]);

// 86 icon names is 881 characters on every icon prop. The union is kept long enough to show the
// naming convention and closed with `string & {}` so any name still type-checks — the same trade
// the deleted port made, and the reason it read as a usable declaration.
const ICON_NAMES_SHOWN = 15;

function declarationType(inlined) {
  const bare = inlined
    .replace(/'[^']*'/g, ' ')
    .match(/[A-Za-z_$][\w$]*/g) ?? [];
  if (bare.some((name) => !AMBIENT.has(name) && name !== 'keyof' && name !== 'typeof')) {
    return 'unknown';
  }
  const literals = inlined.match(/'[^']*'/g) ?? [];
  if (literals.length > ICON_NAMES_SHOWN + 5) {
    const shown = literals.slice(0, ICON_NAMES_SHOWN).join(' | ');
    const rest = literals.length - ICON_NAMES_SHOWN;
    return `${shown} | (string & {}) /* +${rest} more */${/\|\s*null\b/.test(inlined) ? ' | null' : ''}`;
  }

  return inlined;
}

async function buildPreview(name, outFile) {
  await esbuild.build({
    entryPoints: [join(syncDir, 'previews', `${name}.tsx`)],
    outfile: outFile,
    bundle: true,
    format: 'iife',
    globalName: '__dsPreview',
    platform: 'browser',
    target: 'es2019',
    jsx: 'transform',
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
    logLevel: 'silent',
    plugins: [
      {
        name: 'design-host-globals',
        setup(build) {
          // The host loads React and the bundle as classic scripts before the preview, so both are
          // globals by the time this file runs. Resolving them to `window.*` is what makes a
          // preview independent of how the bundle was built.
          build.onResolve({ filter: /^react$/ }, () => ({ path: 'react', namespace: 'host' }));
          build.onResolve({ filter: /^@ids-group-ltd\/ids-design-system$/ }, () => ({
            path: 'ds',
            namespace: 'host',
          }));
          build.onLoad({ filter: /.*/, namespace: 'host' }, (args) => ({
            contents:
              args.path === 'react'
                ? 'module.exports = window.React;'
                : 'module.exports = window.IdsDs;',
            loader: 'js',
          }));
        },
      },
    ],
  });
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(join(OUT, '_preview'), { recursive: true });

const previewNames = new Set(
  readdirSync(join(syncDir, 'previews'))
    .filter((file) => file.endsWith('.tsx'))
    .map((file) => file.replace(/\.tsx$/, '')),
);

const written = [];
const skipped = [];
for (const name of [...byName.keys()].sort()) {
  const component = byName.get(name);
  const { group, body } = readDoc(name);
  const override = config.overrides?.[name] ?? {};
  const dir = join(OUT, 'components', group, name);
  mkdirSync(dir, { recursive: true });

  writeFileSync(
    join(dir, `${name}.jsx`),
    `// Re-export of ${config.pkg} ${name}. Implementation is in the root _ds_bundle.js (window.IdsDs).\n`
    + `Object.assign(window, { ${name}: window.IdsDs.${name} });\n`,
  );
  writeFileSync(
    join(dir, `${name}.d.ts`),
    declaration({
      name,
      doc: body,
      component: {
        ...component,
        api: component.api.map((entry) => ({ ...entry, type: declarationType(entry.inlined) })),
      },
    }),
  );
  writeFileSync(join(dir, `${name}.prompt.md`), `# ${name}\n\n${body}`);

  if (previewNames.has(name)) {
    writeFileSync(
      join(dir, `${name}.html`),
      cardHtml({
        name,
        group,
        viewport: viewports.heights[name] ? `${viewports.width}x${viewports.heights[name]}` : null,
        mode: override.cardMode ?? 'grid',
        primary: override.primaryStory ?? '',
      }),
    );
    await buildPreview(name, join(OUT, '_preview', `${name}.js`));
    written.push(name);
  } else {
    // No preview means no card: the pane builds its index from the `@dsCard` marker, so writing the
    // page without a preview to mount would publish a card that renders a warning. The declaration
    // and the prompt still go out — an agent composing a parent needs them.
    skipped.push(name);
  }
}

cpSync(join(elements, 'dist', 'ds-bundle.js'), join(OUT, '_ds_bundle.js'));
cpSync(join(elements, 'dist', 'ds-bundle.css'), join(OUT, '_ds_bundle.css'));

console.log(
  `✓ ${written.length} card(s) + ${byName.size} declaration(s) into ${OUT.replace(repo, '.')}`
);
if (skipped.length) {
  console.log(`· ${skipped.length} without a preview, so no card: ${skipped.join(', ')}`);
}
