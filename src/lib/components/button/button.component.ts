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
import type {
  IsActiveMatchOptions,
  Params,
  QueryParamsHandling,
} from '@angular/router';
import { IconComponent } from '@ids-group-ltd/ids-design-system/icons';
import type { IconName } from '@ids-group-ltd/ids-design-system/core';
import {
  dsAriaCurrent,
  dsDestination,
} from '@ids-group-ltd/ids-design-system/components';
import type {
  DsAriaCurrent,
  DsLinkModifiers,
  DsRouterLink,
} from '@ids-group-ltd/ids-design-system/components';
import type {
  ButtonAlign,
  ButtonColor,
  ButtonVariant,
  ButtonType,
} from './button.types';
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

// A button has no form control; these stand in for the validation sources `resolveFieldMessage` reads.
const NO_ERRORS = signal<readonly DsFieldError[]>([]).asReadonly();
const NEVER_INVALID = signal(false).asReadonly();

// Router-only modifiers; a tuple so the warning can name the one that was set.
const ROUTER_ONLY = [
  ['fragment'],
  ['queryParams'],
  ['queryParamsHandling'],
] as const;

// Warned in dev, still rendered: two inputs cannot be narrowed against each other at compile time.
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
    // Styling hooks: the inner <button> classes are unreachable from a host rule.
    '[attr.data-variant]': 'variant()',
    '[attr.data-color]': 'color()',
    '[class.with-message]': 'hasMessageRow()',
    '[class.align-between]': "align() === 'between'",
  },
})
export class ButtonComponent extends DsMessageBase {
  // `DS_CONFIG.field.reserveMessage` must not give a button an empty message line; `[reserveMessage]` still works.
  protected override readonly reserveFollowsFieldDefault = false;

  protected readonly inGroup = inFieldGroup();

  /** Brand/status hue family. */
  readonly color = input<ButtonColor>('primary');
  /** Fill pattern. Every color×variant pair renders; the discouraged ones dev-warn with the
   *  reason. Prefer the global `.link` class over `text` unless the ds-button API is needed. */
  readonly variant = input<ButtonVariant>('solid');
  /** Where the contents sit once the button is wider than them (`fullWidth`, a stretching grid
   *  cell). `'between'` pushes the label and a trailing icon to opposite edges. */
  readonly align = input<ButtonAlign>('center');
  /** Unset falls back to `DS_CONFIG.control.size`, then `'md'`. */
  readonly size = input<DsSize | null>(null);
  readonly sizeResolved = resolveWithConfig(
    this.size,
    (config) => config.control?.size,
    'md' as DsSize,
  );
  /** `RouterLink` target. Set it and the button renders an `<a [routerLink]>` with
   *  `routerLinkActive`, so middle-click, open-in-new-tab and the "link" role work.
   *  Accepts a `UrlTree` as well as a path or command array. */
  readonly routerLink = input<DsRouterLink>(null);
  /** Plain `href` target, used when `routerLink` is not set (external address, download).
   *  Renders an `<a href>`. */
  readonly href = input<string>('');
  /** Hash to append to a `routerLink` destination. routerLink-only: on an `href` put it in the
   *  URL; on a plain button it is ignored with a dev warning. */
  readonly fragment = input<string | undefined>(undefined);
  /** Query parameters for a `routerLink` destination. routerLink-only. */
  readonly queryParams = input<Params | null | undefined>(undefined);
  /** How the destination's query merges with the current one. routerLink-only. */
  readonly queryParamsHandling = input<QueryParamsHandling | null | undefined>(
    undefined,
  );
  /** Browsing context for the link (`'_blank'`, ...). Ignored with a dev warning on a plain button. */
  readonly target = input<string | undefined>(undefined);
  /** `rel` for the link; pair with `target="_blank"` (`noopener` blocks `window.opener` access). */
  readonly rel = input<string | undefined>(undefined);
  /** How `routerLinkActive` decides the `active` class; prefix by default. It also bounds the
   *  announcement: with `{ exact: true }` a prefix match announces nothing rather than `true`.
   *  Pass `ariaCurrent` alongside to keep one. */
  readonly routerLinkActiveOptions = input<
    { exact: boolean } | IsActiveMatchOptions
  >({ exact: false });
  /** Overrides what the link announces. Unset, an exact match announces `page` and a prefix match
   *  `true`; `null` announces nothing; use `step` or `location` when the link is not a page. */
  readonly ariaCurrent = input<DsAriaCurrent | null | undefined>(undefined);
  /** Native `type`; defaults to `'button'` so it never submits an ancestor form. Button-only:
   *  ignored on a link, with a dev warning. */
  readonly type = input<ButtonType>('button');
  /** Disables the button and blocks `pressed`. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Busy state: blocks `pressed` and sets `aria-busy` and `aria-disabled`, keeping the button
   *  focusable so focus stays on it while the work runs. Button-only; ignored on an anchor with a
   *  dev warning. */
  readonly loading = input(false, { transform: booleanAttribute });
  /** Fills the container: the host becomes block-level and 100% wide. */
  readonly fullWidth = input(false, { transform: booleanAttribute });
  /** Accessible name, forwarded as `aria-label`. For an icon-only or non-descriptive label. */
  readonly ariaLabel = input<string | null>(null);
  /** Icon before the projected content. */
  readonly icon = input<IconName | null>(null);
  /** Icon after the projected content. */
  readonly trailingIcon = input<IconName | null>(null);
  /** `aria-haspopup` on the inner <button>; set when this button triggers an overlay. */
  readonly ariaHasPopup = input<
    'true' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog' | null
  >(null);
  /** `aria-expanded` on the inner <button>; bind to the overlay's open state. */
  readonly ariaExpanded = input<boolean | null>(null);
  /** `aria-controls` on the inner <button>: the id of the panel this button opens. */
  readonly ariaControls = input<string | null>(null);
  /** Why the button is refused, shown as its second line and read only while `disabled`. Setting
   *  it uses `aria-disabled` instead of the native attribute (a native disabled button cannot be
   *  focused, so the reason would go unannounced) and swallows the click; a link-button keeps its
   *  Tab stop the same way. Uncapped: the text wraps. */
  readonly disabledReason = input<string, string | null | undefined>('', {
    transform: trimmedText,
  });
  /** `aria-describedby` pointing at a description the app renders itself. Merged with the id
   *  of `disabledReason` when both are present. */
  readonly ariaDescribedBy = input<string | null>(null);
  /** Fires on click unless `disabled` or `loading`. */
  readonly pressed = output<MouseEvent>();

  /** The inner control, for an overlay to position against and restore focus to. */
  readonly controlRef = viewChild.required<ElementRef<HTMLElement>>('btn');

  protected readonly destination = dsDestination(this.routerLink, this.href);
  protected readonly linkModifiers = computed<DsLinkModifiers>(() => ({
    fragment: this.fragment(),
    queryParams: this.queryParams(),
    queryParamsHandling: this.queryParamsHandling(),
  }));
  protected readonly ariaCurrentResolved = dsAriaCurrent(
    this.routerLink,
    this.linkModifiers,
    this.ariaCurrent,
  );

  protected readonly classes = computed(() => {
    const color = this.color();
    const variant = this.variant();
    const parts = [
      'button',
      color === 'primary' ? '' : `color-${color}`,
      variant === 'solid' ? '' : `variant-${variant}`,
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
        const destination = this.destination();
        if (destination !== 'button') {
          if (this.loading()) {
            return '[ds-button] `loading` is ignored on a link-button — a navigation cannot be in flight before it starts. Remove it, or drop the destination and emit `(pressed)` instead.';
          }
          if (this.type() !== 'button') {
            return `[ds-button] type="${this.type()}" is ignored on a link-button — an anchor has no form to submit. Drop the destination to submit a form.`;
          }
        }
        if (destination !== 'routerLink') {
          const routed = ROUTER_ONLY.find(
            ([name]) => this[name]() !== undefined,
          );
          if (routed) {
            return `[ds-button] \`${routed[0]}\` only applies to a \`routerLink\` destination${destination === 'href' ? ' — put it in the `href` URL instead' : ''}.`;
          }
        }
        if (destination === 'button' && (this.target() || this.rel())) {
          return '[ds-button] `target` and `rel` need a destination — set `routerLink` or `href`, or drop them.';
        }
        const reason = DISCOURAGED_COMBOS.get(`${this.color()}|${variant}`);

        return reason
          ? `[ds-button] color="${this.color()}" variant="${variant}" is a UX-discouraged combination — it renders, but ${reason}.`
          : null;
      });
    }
  }

  protected onClick(event: MouseEvent): void {
    // A soft-disabled or loading button is only `aria-disabled`, so the browser still dispatches the
    // click; preventDefault stops an `<a href>` navigating and a `type="submit"` submitting its form.
    if (this.disabled() || this.loading()) {
      event.preventDefault();

      return;
    }
    this.pressed.emit(event);
  }
}
