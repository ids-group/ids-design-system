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
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IconComponent } from '@ids-group-ltd/ids-design-system/icons';
import type { IconName } from '@ids-group-ltd/ids-design-system/core';
import { dsDestination } from '@ids-group-ltd/ids-design-system/components';
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

// Discouraged, not blocked — two inputs cannot be narrowed against each other at compile time,
// so the pair is warned about in dev and still renders.
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
  imports: [
    IconComponent,
    FieldMessageComponent,
    NgTemplateOutlet,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    '[class.in-group]': 'inGroup',
    '[class.full-width]': 'fullWidth()',
    // Reflected so a consumer can target one axis without the inner class names, which sit on
    // the inner <button> and are unreachable from a host rule. Styling only.
    '[attr.data-variant]': 'variant()',
    '[attr.data-color]': 'color()',
    '[class.with-message]': 'hasMessageRow()',
  },
})
export class ButtonComponent extends DsMessageBase {
  // As a group segment the group owns the border, radius and ring, so `.in-group` strips this
  // control back to its bare contents.
  protected readonly inGroup = inFieldGroup();

  /** Brand/status hue family. */
  readonly color = input<ButtonColor>('primary');
  /** Fill pattern. Every color×variant pair renders; the discouraged ones dev-warn with the
   *  reason. `text` is discouraged for every colour — prefer the global `.link` class, and keep
   *  this one only where the ds-button API is needed. */
  readonly variant = input<ButtonVariant>('solid');
  /** Button height — sm/md/lg.
   *  Unset falls back to `DS_CONFIG.control.size`, then `'md'`. */
  readonly size = input<DsSize | null>(null);
  readonly sizeResolved = resolveWithConfig(
    this.size,
    (config) => config.control?.size,
    'md' as DsSize,
  );
  /** `RouterLink` target. Set it and the button renders an `<a [routerLink]>` with
   *  `routerLinkActive`: middle-click, open-in-new-tab and the announced "link" role depend on the
   *  element, not on the look. */
  readonly routerLink = input<string | readonly unknown[] | null>(null);
  /** Plain `href` target, used when `routerLink` is not set — an external address or a download.
   *  Renders an `<a href>`; same reasoning as `routerLink`. */
  readonly href = input<string>('');
  /** Native `type`, defaulting to `'button'` so it never submits an ancestor form by accident.
   *  Button-only: ignored on a link, with a dev warning. */
  readonly type = input<ButtonType>('button');
  /** Disables the button and blocks `pressed`. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Busy state — disables interaction and sets `aria-busy`. Button-only: a navigation cannot be
   *  in flight before it starts, so on an anchor it is ignored with a dev-mode warning. */
  readonly loading = input(false, { transform: booleanAttribute });
  /** Stretch to fill the container: the host becomes block-level and 100% wide. */
  readonly fullWidth = input(false, { transform: booleanAttribute });
  /** Accessible name, forwarded as `aria-label`. For an icon-only or non-descriptive label. */
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
  /** Why the button is refused, shown as its second line and read only while `disabled`. Setting
   *  it also changes HOW the button is disabled — `aria-disabled` instead of the native attribute,
   *  because a natively disabled button cannot be focused and the reason would never be announced,
   *  so the click is swallowed in `onClick` instead. Uncapped: the text wraps and the button grows.
   *  Same name and meaning as `TableRowAction.disabledReason`. */
  readonly disabledReason = input<string, string | null | undefined>('', {
    transform: trimmedText,
  });
  /** ARIA `aria-describedby` — point the button at a description the app renders
   *  itself, such as a `ds-field-message` under a form. Merged with the id of
   *  `disabledReason` when both are present. */
  readonly ariaDescribedBy = input<string | null>(null);
  /** Fires on click, unless `disabled` or `loading`. */
  readonly pressed = output<MouseEvent>();

  /** The inner control, for an overlay trigger to position against and restore focus to. Typed
   *  `HTMLElement`, not `HTMLButtonElement`: the element follows the destination. */
  readonly controlRef = viewChild.required<ElementRef<HTMLElement>>('btn');

  protected readonly destination = dsDestination(this.routerLink, this.href);

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
        if (this.destination() !== 'button') {
          if (this.loading()) {
            return '[ds-button] `loading` is ignored on a link-button — a navigation cannot be in flight before it starts. Remove it, or drop the destination and emit `(pressed)` instead.';
          }
          if (this.type() !== 'button') {
            return `[ds-button] type="${this.type()}" is ignored on a link-button — an anchor has no form to submit. Drop the destination to submit a form.`;
          }
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
      // `aria-disabled` is a label, not a behaviour, so a disabled `<a href>` would still
      // navigate. The routerLink branch binds `null` instead.
      if (this.destination() === 'href') {
        event.preventDefault();
      }

      return;
    }
    this.pressed.emit(event);
  }
}
