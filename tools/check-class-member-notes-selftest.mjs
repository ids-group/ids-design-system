#!/usr/bin/env node
// Does the class-member-notes rule still FIRE, and does a complete note still PASS? Every case runs
// on synthetic trees and a synthetic manifest held in memory, so no real manifest or file is read
// or written and the cases do not move when the library does.
//
//   node tools/check-class-member-notes-selftest.mjs
import { boundaryChanges, checkManifest } from './check-class-member-notes.mjs';
import { classMembers } from './class-surface-diff.mjs';

// The head `class-surface-diff` records for a protected method, before and after: the retyped set
// this check reads to tell a phantom from a real change is built from those heads.
const methodHead = (...methods) =>
  methods.map((method) =>
    classMembers(
      `export class Probe {\n  protected ${method}\n    return;\n  }\n}\n`,
    )
      .get('Probe')
      .heads.get(/^\w+/.exec(method)[0]),
  );

const PACKAGE = '@ids-group-ltd/ids-design-system';

// A base in its own entry point, a component extending it, one component that never inherits, a
// class nobody can import, and (after only) a class that did not exist before.
const tree = ({ baseMembers, cardMembers, hiddenMembers, extraClass }) =>
  new Map([
    [
      'src/lib/ng-package.json',
      '{ "lib": { "entryFile": "./public-api.ts" } }',
    ],
    [
      'src/lib/public-api.ts',
      `export { DsBase } from '${PACKAGE}/components';\nexport * from '${PACKAGE}/components/field';\nexport { CardComponent${extraClass ? ', NewComponent' : ''} } from '${PACKAGE}/components/card';\n`,
    ],
    [
      'src/lib/components/ng-package.json',
      '{ "lib": { "entryFile": "./index.ts" } }',
    ],
    ['src/lib/components/index.ts', "export { DsBase } from './base';\n"],
    [
      'src/lib/components/base.ts',
      `export abstract class DsBase {\n${baseMembers.map((name) => `  readonly ${name} = input('');\n`).join('')}}\n`,
    ],
    [
      'src/lib/components/field/ng-package.json',
      '{ "lib": { "entryFile": "./index.ts" } }',
    ],
    [
      'src/lib/components/field/index.ts',
      "export * from './field.component';\n",
    ],
    [
      'src/lib/components/field/field.component.ts',
      "import { DsBase } from '../base';\n\nexport class FieldComponent\n  extends DsBase\n{\n  readonly value = input('');\n}\n",
    ],
    [
      'src/lib/components/card/index.ts',
      "export { CardComponent } from './card.component';\nexport { HiddenComponent } from './hidden.component';\n",
    ],
    [
      'src/lib/components/card/card.component.ts',
      `export class CardComponent {\n${cardMembers.map((name) => `  protected ${name}(): void {}\n`).join('')}}\n${extraClass ? 'export class NewComponent {\n  readonly fresh = input(0);\n}\n' : ''}`,
    ],
    [
      'src/lib/components/card/hidden.component.ts',
      `export class HiddenComponent {\n${hiddenMembers.map((name) => `  readonly ${name} = 1;\n`).join('')}}\n`,
    ],
  ]);

const before = tree({
  baseMembers: ['hint'],
  cardMembers: ['toggle', 'collapse'],
  hiddenMembers: ['a'],
  extraClass: false,
});
const after = tree({
  baseMembers: ['hint', 'success'],
  cardMembers: ['toggle', 'expand', 'flip', 'spin'],
  hiddenMembers: ['a', 'b'],
  extraClass: true,
});
const boundary = boundaryChanges(before, after);

const item = (note, detect) => ({
  id: 'exported-class-members-grew',
  kind: 'behavior',
  detect,
  note,
});
const DETECT_ALL = [
  'extends DsBase',
  'extends FieldComponent',
  'extends CardComponent',
];
const GOOD_NOTE =
  '`DsBase` and `FieldComponent` gained `success`. `CardComponent` gained 3 and lost `collapse`.';

const cases = [
  {
    name: 'a base member gained reaches the subclass, and only public pre-existing classes count',
    run: () =>
      JSON.stringify(
        boundary.changes.map(({ className, gained, lost }) => [
          className,
          gained,
          lost,
        ]),
      ),
    expect: JSON.stringify([
      ['CardComponent', ['expand', 'flip', 'spin'], ['collapse']],
      ['DsBase', ['success'], []],
      ['FieldComponent', ['success'], []],
    ]),
  },
  {
    name: 'a note naming every member, or the right count, passes',
    run: () =>
      checkManifest({ items: [item(GOOD_NOTE, DETECT_ALL)] }, boundary).length,
    expect: 0,
  },
  {
    name: 'a count shared by a list of classes passes, and a wrong one fires for each',
    run: () =>
      [1, 2].map(
        (count) =>
          checkManifest(
            {
              items: [
                item(
                  `\`DsBase\` and \`FieldComponent\` each gained ${count}. \`CardComponent\` gained 3 and lost 1.`,
                  DETECT_ALL,
                ),
              ],
            },
            boundary,
          ).length,
      ),
    expect: [0, 2],
  },
  {
    name: 'a class no behavior detect names fires',
    run: () =>
      checkManifest(
        {
          items: [item(GOOD_NOTE, ['extends DsBase', 'extends CardComponent'])],
        },
        boundary,
      ).map((hit) => `${hit.field} ${hit.className}`),
    expect: ['detect FieldComponent'],
  },
  {
    name: 'a detect on a non-behavior item does not count',
    run: () =>
      checkManifest(
        { items: [{ ...item(GOOD_NOTE, DETECT_ALL), kind: 'input-rename' }] },
        boundary,
      ).length,
    expect: 3,
  },
  {
    name: 'an unnamed gained member fires',
    run: () =>
      checkManifest(
        {
          items: [
            item(
              '`DsBase` and `FieldComponent` gained `success`. `CardComponent` gained `expand` and `flip`, and lost `collapse`.',
              DETECT_ALL,
            ),
          ],
        },
        boundary,
      ).map((hit) => hit.why),
    expect: ['CardComponent gained 3, the note names 2; unnamed: spin'],
  },
  {
    name: 'an unnamed lost member fires',
    run: () =>
      checkManifest(
        {
          items: [
            item(
              '`DsBase` and `FieldComponent` gained `success`. `CardComponent` gained 3.',
              DETECT_ALL,
            ),
          ],
        },
        boundary,
      ).map((hit) => hit.why),
    expect: ['CardComponent lost 1, the note names 0; unnamed: collapse'],
  },
  {
    name: 'a count that differs from the tree fires',
    run: () =>
      checkManifest(
        {
          items: [
            item(
              '`DsBase` and `FieldComponent` gained `success`. `CardComponent` gained four and lost `collapse`.',
              DETECT_ALL,
            ),
          ],
        },
        boundary,
      ).map((hit) => hit.why),
    expect: [
      'says CardComponent gained 4, the tree says 3: expand, flip, spin',
    ],
  },
  {
    name: 'a member the tree never moved, listed as gained, fires as a phantom',
    run: () =>
      checkManifest(
        {
          items: [
            item(
              `${GOOD_NOTE} \`FieldComponent\` also gained \`value\`.`,
              DETECT_ALL,
            ),
          ],
        },
        boundary,
      ).map((hit) => hit.why),
    expect: [
      'names member(s) that neither moved nor changed type on any class in this boundary: value',
    ],
  },
  {
    name: 'an unchanged member named for context outside a change sentence is no phantom',
    run: () =>
      checkManifest(
        {
          items: [item(`${GOOD_NOTE} Bind \`value\` as before.`, DETECT_ALL)],
        },
        boundary,
      ).length,
    expect: 0,
  },
  {
    name: 'a method signature rewrapped over several lines keeps its head',
    run: () =>
      methodHead(
        'onKey(event: KeyboardEvent, index: number): void {',
        'onKey(\n    event: KeyboardEvent,\n    index: number,\n  ): void {',
      ),
    expect: [
      'protected onKey(event: KeyboardEvent, index: number): void',
      'protected onKey(event: KeyboardEvent, index: number): void',
    ],
  },
  {
    name: 'a parameter type changed on a wrapped line changes the head',
    run: () =>
      methodHead(
        'onKey(\n    event: KeyboardEvent,\n    index: number,\n  ): void {',
        'onKey(\n    event: KeyboardEvent,\n    index: string,\n  ): void {',
      ),
    expect: [
      'protected onKey(event: KeyboardEvent, index: number): void',
      'protected onKey(event: KeyboardEvent, index: string): void',
    ],
  },
  {
    name: 'an object return type is part of the head, not the body',
    run: () =>
      methodHead(
        'size(): { width: number } {',
        'size(): { width: number; height: number } {',
      ),
    expect: [
      'protected size(): {width: number}',
      'protected size(): {width: number; height: number}',
    ],
  },
  {
    name: 'a decorated method split in two reads as lost and gained',
    run: () => {
      const memberNames = (body) =>
        [
          ...classMembers(`export class TipDirective {\n${body}}\n`).get(
            'TipDirective',
          ).names,
        ].sort();
      return [
        memberNames(
          "  @HostListener('mouseenter')\n  @HostListener('focusin')\n  protected onOpen(): void {\n    this.show();\n  }\n",
        ),
        memberNames(
          "  @HostListener('mouseenter')\n  protected onPointerEnter(): void {\n    this.show();\n  }\n\n  @HostListener('focusin', ['$event'])\n  protected onFocusIn(event: FocusEvent): void {\n    this.show();\n  }\n",
        ),
      ];
    },
    expect: [['onOpen'], ['onFocusIn', 'onPointerEnter']],
  },
];

let failed = 0;
for (const testCase of cases) {
  const actual = testCase.run();
  const ok = JSON.stringify(actual) === JSON.stringify(testCase.expect);
  if (!ok) failed++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${testCase.name}`);
  if (!ok)
    console.log(
      `       expected ${JSON.stringify(testCase.expect)}\n       got      ${JSON.stringify(actual)}`,
    );
}
if (failed) {
  console.error(`\n${failed} of ${cases.length} case(s) wrong.`);
  process.exit(1);
}
console.log(`\nevery case behaved: ${cases.length} ran.`);
