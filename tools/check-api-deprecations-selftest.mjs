#!/usr/bin/env node
// Do the shipped ESLint rules still fire, and stay quiet where they must? Runs every rule of
// `eslint/index.mjs` through ESLint's RuleTester on inline TypeScript and templates, parsed by
// typescript-eslint and @angular-eslint/template-parser as a consumer's config parses them. Each
// rule has a case that reports, with the autofix where it has one, and cases that must not: the
// same attribute or member on another element or class, a live name that extends a listed one, a
// dynamic value. The entries are real ones from the generated lists. Nothing is written.
//
//   node tools/check-api-deprecations-selftest.mjs
import { RuleTester } from 'eslint';
import typescriptParser from '@typescript-eslint/parser';
import templateParser from '@angular-eslint/template-parser';
import plugin from '../eslint/index.mjs';

const typescript = new RuleTester({
  languageOptions: { parser: typescriptParser },
});
const template = new RuleTester({
  languageOptions: { parser: templateParser },
});
const html = (code, errors) => ({
  code,
  filename: 'view.html',
  ...(errors ? { errors } : {}),
});

const failures = [];
let cases = 0;
const run = (tester, name, tests) => {
  cases += tests.valid.length + tests.invalid.length;
  try {
    tester.run(name, plugin.rules[name], tests);
  } catch (error) {
    failures.push(`${name}: ${error.message.split('\n')[0]}`);
  }
};

run(template, 'no-removed-inputs', {
  valid: [
    html('<ds-table [sortDirection]="direction"></ds-table>'),
    html('<ds-other [sortDir]="direction" sortDir="asc"></ds-other>'),
    html(
      '<ds-table [attr.sortDir]="direction" [class.single]="on"></ds-table>',
    ),
  ],
  invalid: [
    html('<ds-table\n  [sortDir]="direction">\n</ds-table>', [
      {
        message:
          /"ds-table\[sortDir\]" was renamed or replaced in 0\.13\.4: use sortDirection/,
        line: 2,
      },
    ]),
    html('<ds-table sortDir="asc" [(sortDir)]="direction"></ds-table>', 2),
    html('<ds-modal danger></ds-modal>', [{ message: /use error/ }]),
    html('<ds-modal error></ds-modal>', [
      { message: /0.10.0#modal-error-boolean-to-status/ },
    ]),
    html('<div dsChartTooltipPreferBelow></div>', [
      { message: /was removed in 0\.14\.1/ },
    ]),
    html('<div dsTooltipWhenClipped dsTooltipTextSelector=".label"></div>', [
      { message: /dsTooltipTextSelector.* was removed in/ },
    ]),
  ],
});

run(template, 'no-removed-inputs', {
  valid: [
    {
      ...html('<ds-table [sortDir]="direction"></ds-table>'),
      options: [{ from: '0.13.4' }],
    },
    {
      ...html('<ds-table [sortDir]="direction"></ds-table>'),
      options: [{ to: '0.13.3' }],
    },
  ],
  invalid: [
    {
      ...html('<ds-table [sortDir]="direction"></ds-table>', [
        { message: /renamed or replaced in 0\.13\.4/ },
      ]),
      options: [{ from: '0.13.3' }],
    },
    {
      ...html('<ds-table [sortDir]="direction"></ds-table>', [
        { message: /renamed or replaced in 0\.13\.4/ },
      ]),
      options: [{ from: '0.13.3', to: '0.13.4' }],
    },
  ],
});

run(template, 'no-removed-outputs', {
  valid: [
    html('<ds-table (rowClicked)="open($event)"></ds-table>'),
    html('<tr (rowClick)="open($event)"></tr>'),
  ],
  invalid: [
    html('<ds-table\n  class="x"\n  (rowClick)="open($event)">\n</ds-table>', [
      {
        message:
          /"ds-table\(rowClick\)" was renamed or replaced in 0\.11\.3: use rowClicked/,
        line: 3,
      },
    ]),
    html('<ds-table [(sortDir)]="direction"></ds-table>', [
      { message: /sortDirectionChange/ },
    ]),
  ],
});

run(template, 'no-removed-values', {
  valid: [
    html('<ds-button variant="tonal"></ds-button>'),
    html('<ds-button variant="outline"></ds-button>'),
    html('<ds-badge variant="secondary"></ds-badge>'),
    html('<ds-button [variant]="kind"></ds-button>'),
  ],
  invalid: [
    html('<ds-button\n  variant="secondary">\n</ds-button>', [
      {
        message:
          /variant="secondary" on ds-button was remapped in 0\.4\.0: write variant="tonal"/,
        line: 2,
      },
    ]),
    html(`<ds-button [variant]="'primary'"></ds-button>`, [
      { message: /is the default since 0\.4\.0/ },
    ]),
  ],
});

run(template, 'no-renamed-selectors', {
  valid: [
    html(
      '<ds-pie-chart></ds-pie-chart><ds-donut-chart-legend></ds-donut-chart-legend>',
    ),
  ],
  invalid: [
    html('<ds-donut-chart></ds-donut-chart>', [
      { message: /use ds-pie-chart/ },
    ]),
  ],
});

run(typescript, 'no-renamed-selectors', {
  valid: [
    `host.querySelector('ds-pie-chart');`,
    `const label = 'ds-progress';`,
    `@Component({ selector: 'app-progress' }) class Progress {}`,
  ],
  invalid: [
    {
      code: `host.querySelectorAll('.card ds-progress');`,
      errors: [{ message: /use ds-bar/ }],
    },
    { code: 'fixture.debugElement.query(By.css(`ds-meter`));', errors: 1 },
  ],
});

run(typescript, 'no-renamed-imports', {
  valid: [
    `import { SelectOption } from '@ids-group-ltd/ids-design-system';`,
    `import { DropdownOption } from './local-dropdown';`,
  ],
  invalid: [
    {
      code: `import { DropdownOption } from '@ids-group-ltd/ids-design-system/components/select';\nconst options: DropdownOption[] = [];`,
      output: `import { SelectOption } from '@ids-group-ltd/ids-design-system/components/select';\nconst options: SelectOption[] = [];`,
      errors: [
        {
          message:
            /"DropdownOption" was renamed or replaced in 0\.5\.0: use SelectOption/,
        },
      ],
    },
    {
      code: `import { SelectSize as Size } from '@ids-group-ltd/ids-design-system';`,
      output: `import { DsSize as Size } from '@ids-group-ltd/ids-design-system';`,
      errors: 1,
    },
    {
      code: `import { DS_TOAST_CONFIG } from '@ids-group-ltd/ids-design-system';`,
      output: null,
      errors: [{ message: /use provideDsConfig/ }],
    },
  ],
});

run(typescript, 'no-removed-members', {
  valid: [
    `class Mine extends TableComponent { sortDirection = 'asc'; }`,
    `class Mine extends OtherTable { sortDir = 'asc'; }`,
  ],
  invalid: [
    {
      code: `class Mine extends TableComponent { override sortDir = 'asc'; }`,
      errors: [
        {
          message:
            /"TableComponent\.sortDir" was renamed or replaced in 0\.13\.4: use sortDirection/,
        },
      ],
    },
    {
      code: `class Mine extends ButtonComponent { get buttonRef() { return null; } }`,
      errors: 1,
    },
  ],
});

run(typescript, 'no-removed-tokens', {
  valid: [
    `element.style.setProperty('--ds-card-padding', '4px');`,
    `element.style.setProperty('--my-card-pad', '4px');`,
  ],
  invalid: [
    {
      code: `element.style.setProperty('--ds-card-pad', '4px');`,
      output: `element.style.setProperty('--ds-card-padding', '4px');`,
      errors: [
        {
          message:
            /"--ds-card-pad" was renamed to "--ds-card-padding" in 0\.13\.4/,
        },
      ],
    },
    {
      code: 'const css = `opacity: var(--opacity-muted)`;',
      output: null,
      errors: 1,
    },
  ],
});

run(template, 'no-removed-tokens', {
  valid: [
    html(
      '<div [style.--ds-card-padding]="gap" style="--ds-toast-border-color: red"></div>',
    ),
  ],
  invalid: [
    {
      ...html('<div [style.--ds-card-pad]="gap"></div>', 1),
      output: '<div [style.--ds-card-padding]="gap"></div>',
    },
    html(
      `<div style="--opacity-muted: 1" [ngStyle]="{ '--opacity-muted': x }"></div>`,
      2,
    ),
  ],
});

if (failures.length) {
  console.error(
    `api-deprecations:selftest: ${failures.length} failure(s)\n  ${failures.join('\n  ')}`,
  );
  process.exitCode = 1;
} else console.log(`api-deprecations:selftest: OK - ${cases} case(s).`);
