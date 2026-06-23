# Handoff: ds-button subtext slot (two-line button)

Status: implemented in the pinkmoon prototype's local ds copy
(`pinkmoon-platform/prototype/libs/design-system`, commit 2f2d81b8), needs
porting here. Origin: Field app, Truck Plan page - the disabled "Mark Truck
as Completed" button must explain why it is locked (spec 6.4 / 7.2) without
adding an extra row to the bottom bar.

Mockups and the implementation comparison (7 variants tried/considered, the
slot-wrapper variant below won) live in the pinkmoon repo:
`pinkmoon-platform/prototype/docs/presentations/truck-completed-helper.html`,
`…/truck-completed-helper-compact.html`,
`…/button-subtext-implementations.html`.

## API

Content projection with a `[dsButtonSubtext]` marker attribute. The marker is
a plain attribute - no directive, no input, no imports for the consumer:

```html
<ds-button
  variant="secondary"
  size="lg"
  [disabled]="locked()"
>
  Mark Truck as Completed
  @if (locked()) {
    <span dsButtonSubtext>
      All kits must be Ready to Use before marking the truck as Completed
    </span>
  }
</ds-button>
```

No subtext element = feature off, zero impact on existing buttons.

## Implementation - the slot-wrapper trick

Zero TypeScript, zero `::ng-deep`, zero global partials. The button wraps the
named slot in its OWN span: the wrapper is a component-template element, so
plain scoped CSS reaches it, and typography set on it inherits into the
projected content - the foreign span never needs styling or marking.

`button.component.html`

```html
<ng-content></ng-content>
<!-- whitespace-free inside: a stray text node breaks :empty -->
<span class="subtext-slot"><ng-content select="[dsButtonSubtext]"></ng-content></span>
```

`button.component.scss` - inside `.button`, placed AFTER the size tiers so
auto height wins the same-specificity cascade against their fixed heights:

```scss
.subtext-slot:empty {
  display: none;
}

&:has(.subtext-slot:not(:empty)) {
  flex-direction: column;
  gap: var(--s-1);
  height: auto;
  min-height: var(--hit-cozy);
  padding-block: var(--s-2);
  white-space: normal;

  &.lg {
    height: auto;
    min-height: var(--field-h-lg);
  }
}

.subtext-slot {
  font: var(--fw-medium) var(--fs-xs) / var(--lh-base) var(--font-sans);
  letter-spacing: normal;
  text-align: center;
}

&[disabled] .subtext-slot {
  color: var(--text-secondary);
}
```

## Design decisions

- The size's fixed height becomes `min-height`, so the hit area never shrinks
  and the button only grows as much as the second line needs (~12px at lg).
- `white-space: normal` only in two-line mode - long helper texts wrap on
  narrow screens instead of overflowing.
- `[disabled] .subtext-slot` is forced to `--text-secondary`: the main use
  case is explaining a locked action, and the washed-out `--text-disabled`
  label color fails readability for a full sentence.
- `:empty` ignores comment nodes, so the anchor left by a consumer's `@if`
  does not break detection.
- `:has()` references the button's own wrapper, staying inside encapsulation
  (compiled: `.button[_ngcontent-%COMP%]:has(.subtext-slot:not(:empty))`).
- Rejected along the way (see the comparison presentation): `subtext` string
  input (no markup possible), marker directive + contentChild (consumer
  import burden), `:has(::ng-deep ...)` in component styles (ng-deep
  everywhere), global partial (styles split across files), host class
  (condition duplicated), template-ref detection (no CSS hook on the span).

## Known limitations

- Column layout stacks ALL projected content vertically: an icon + label +
  subtext button puts the icon above the label. Fine for text-only buttons;
  if icon+subtext is ever needed, wrap icon and label in a row span first.
- Only `lg` got an explicit min-height override; other size tiers fall back
  to `min-height: var(--hit-cozy)`. Add per-size overrides when needed.
- Single-level `@if` around the subtext projects into the named slot
  correctly; NESTED `@if` has known slotting bugs (angular#55194, #59330) -
  wrap with `<ng-container ngProjectAs="[dsButtonSubtext]">` in that case.
- No story added in the prototype copy - add a `dsButtonSubtext` story when
  porting.
