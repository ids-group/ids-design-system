import {
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { devWarn } from '@ids-group-ltd/ids-design-system/core';
import { IconComponent } from '@ids-group-ltd/ids-design-system/icons';
import type { IconName } from '@ids-group-ltd/ids-design-system/core';
import type { ButtonColor, ButtonVariant, ButtonType } from './button.types';
import type { DsSize } from '@ids-group-ltd/ids-design-system/core';
import { inFieldGroup } from '@ids-group-ltd/ids-design-system/components/field-group';
import { resolveWithConfig } from '@ids-group-ltd/ids-design-system/core';
import { DsMessageBase } from '@ids-group-ltd/ids-design-system/components';
import {
  resolveFieldMessage,
  trimmedText,
  type DsFieldError,
} from '@ids-group-ltd/ids-design-system/components';
import { FieldMessageComponent } from '@ids-group-ltd/ids-design-system/components/field-message';
import { nextControlId } from '@ids-group-ltd/ids-design-system/components';

// `resolveFieldMessage` reads a form control's validation state; a button has
// none, so these stand in for the two sources a field feeds in from its control.
const NO_ERRORS = signal<readonly DsFieldError[]>([]).asReadonly();
const NEVER_INVALID = signal(false).asReadonly();

// color×variant pairs that RENDER but read poorly — surfaced as a dev-mode
// console.warn (two inputs can't be narrowed against each other at compile
// time). They are discouraged, not blocked: a brand may still opt in.
const DISCOURAGED_COMBOS = new Map<string, string>([
  [
    'neutral|solid',
    'a solid grey button reads as disabled — prefer tonal/ghost/outline',
  ],
  [
    'success|ghost',
    'low-emphasis success rarely warrants an action affordance — prefer solid/tonal',
  ],
  [
    'success|outline',
    'low-emphasis success rarely warrants an action affordance — prefer solid/tonal',
  ],
  [
    'warning|ghost',
    'yellow at low emphasis is too low-contrast to read — prefer solid/tonal',
  ],
  [
    'warning|outline',
    'yellow at low emphasis is too low-contrast to read — prefer solid/tonal',
  ],
]);

@Component({
  selector: 'ds-button',
  standalone: true,
  imports: [IconComponent, FieldMessageComponent],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    '[class.in-group]': 'inGroup',
    '[class.full-width]': 'fullWidth()',
    // Reflected so a consumer can target one axis from outside without knowing
    // the inner class names: `ds-button[data-variant="outline"] { … }`. The
    // c-*/v-* classes sit on the inner <button>, which is not reachable from a
    // host-scoped rule. Styling only — nothing reads these back.
    '[attr.data-variant]': 'variant()',
    '[attr.data-color]': 'color()',
    '[class.with-message]': 'hasMessageRow()',
  },
})
export class ButtonComponent extends DsMessageBase {
  /** Segment of a ds-field-group: the group owns the border, radius and focus
   *  ring, so .in-group strips this control back to its bare contents. */
  protected readonly inGroup = inFieldGroup();

  /** Brand/status hue family. */
  readonly color = input<ButtonColor>('primary');
  /** Fill pattern: solid | tonal | ghost | outline | text. All color×variant
      pairs render; some are UX-discouraged and emit a dev-mode
      warning naming the reason — they work, but read poorly. `text` is
      discouraged for ALL colours — prefer the global `.link` class; it stays for
      cases needing the ds-button API (loading/fullWidth/typed pressed). */
  readonly variant = input<ButtonVariant>('solid');
  /** Button height — sm/md/lg.
   *  Unset falls back to `DS_CONFIG.control.size`, then `'md'`. */
  readonly size = input<DsSize | null>(null);
  readonly sizeResolved = resolveWithConfig(
    this.size,
    (config) => config.control?.size,
    'md' as DsSize,
  );
  /** Native `<button>` `type`; defaults to `'button'` (not `'submit'`) so it never submits an ancestor form by accident. */
  readonly type = input<ButtonType>('button');
  /** Disables the button and blocks `pressed`. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Busy state — disables interaction and sets `aria-busy`. */
  readonly loading = input(false, { transform: booleanAttribute });
  /** Stretch the button to fill its container — the host becomes block-level
      and 100% wide (the inner control is already full-width). Use for mobile
      primary CTAs and full-bleed form submit buttons. */
  readonly fullWidth = input(false, { transform: booleanAttribute });
  /** Accessible name — forwarded to the inner <button> as aria-label. Use when
      the visible label is absent or non-descriptive. */
  readonly ariaLabel = input<string | null>(null);
  /** Leading icon, before the projected content. */
  readonly icon = input<IconName | null>(null);
  /** Trailing icon, after the projected content. */
  readonly trailingIcon = input<IconName | null>(null);
  /** ARIA `aria-haspopup`, forwarded to the inner <button> — set when this
   *  button triggers a menu/dialog/listbox overlay. */
  readonly ariaHasPopup = input<
    'true' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog' | null
  >(null);
  /** ARIA `aria-expanded`, forwarded to the inner <button> — bind to the
   *  overlay's open state on a trigger button. */
  readonly ariaExpanded = input<boolean | null>(null);
  /** ARIA `aria-controls`, forwarded to the inner <button> — the id of the panel
   *  this button opens, e.g. `ds-app-layout`'s `railId`. */
  readonly ariaControls = input<string | null>(null);
  /** Why the button is refused, shown as its second line. Read only while
   *  `disabled` — a greyed control that does not say why is a dead end.
   *
   *  Setting it also changes HOW the button is disabled: it takes `aria-disabled`
   *  instead of the native attribute, because a natively disabled button cannot be
   *  focused and the reason would never be announced. The click is swallowed in
   *  `onClick` instead. Leave it unset and nothing changes.
   *
   *  Length is deliberately not capped: the text wraps and the button grows. Same
   *  name and meaning as `TableRowAction.disabledReason`. */
  readonly disabledReason = input<string, string | null | undefined>('', {
    transform: trimmedText,
  });
  /** ARIA `aria-describedby` — point the button at a description the app renders
   *  itself, such as a `ds-field-message` under a form. Merged with the id of
   *  `disabledReason` when both are present. */
  readonly ariaDescribedBy = input<string | null>(null);
  /** Fires on click, unless `disabled` or `loading`. */
  readonly pressed = output<MouseEvent>();

  /** The inner native <button>, exposed so overlay triggers can position
   *  against and restore focus to the real focusable element — e.g.
   *  `(pressed)="pop.toggle(trigger.buttonRef().nativeElement)"`. */
  readonly buttonRef = viewChild.required<ElementRef<HTMLButtonElement>>('btn');

  protected readonly classes = computed(() => {
    const color = this.color();
    const variant = this.variant();
    const parts = [
      'button',
      color === 'primary' ? '' : `c-${color}`,
      variant === 'solid' ? '' : `v-${variant}`,
      this.sizeResolved(),
      this.loading() ? 'loading' : '',
    ];

    return parts.filter(Boolean).join(' ');
  });

  protected readonly softDisabled = computed(
    () => this.disabled() && this.disabledReason().length > 0,
  );

  private readonly uid = nextControlId('ds-button');
  protected readonly reasonId = `${this.uid}-reason`;
  protected readonly hintId = computed(() =>
    this.message().text ? `${this.uid}-hint` : null,
  );
  protected readonly describedBy = computed(() => {
    const ids = [
      this.softDisabled() ? this.reasonId : null,
      this.hintId(),
      this.ariaDescribedBy(),
    ].filter(Boolean);

    return ids.length ? ids.join(' ') : null;
  });

  protected readonly hasMessageRow = computed(
    () => this.message().text.length > 0 || this.reserveMessageResolved(),
  );

  private readonly fieldMessage = resolveFieldMessage({
    hint: this.hint,
    warning: this.warning,
    error: this.error,
    errors: NO_ERRORS,
    invalid: NEVER_INVALID,
  });
  protected readonly message = this.fieldMessage.message;

  constructor() {
    super();
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      devWarn(() => {
        const variant = this.variant();
        if (variant === 'text') {
          return '[ds-button] variant="text" is discouraged — prefer the global `.link` class for link-styled actions. It renders, but `.link` is the canonical link affordance.';
        }
        const reason = DISCOURAGED_COMBOS.get(`${this.color()}|${variant}`);

        return reason
          ? `[ds-button] color="${this.color()}" variant="${variant}" is a UX-discouraged combination — it renders, but ${reason}.`
          : null;
      });
    }
  }

  protected onClick(event: MouseEvent): void {
    // A soft-disabled button is only `aria-disabled`, so the browser still
    // dispatches the click — this is what stops it.
    if (this.disabled() || this.loading()) {
      return;
    }
    this.pressed.emit(event);
  }
}
