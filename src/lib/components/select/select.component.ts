import {
  Component,
  ElementRef,
  type OnDestroy,
  TemplateRef,
  ViewContainerRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  closeOnOutsidePointer,
  closeOnScroll,
  disposeWithLeave,
  dropdownOverlay,
  type DsOverlayCloseCause,
  prepareOverlayEnter,
} from '../overlay-motion';
import { NgTemplateOutlet } from '@angular/common';
import { IconComponent } from '../../icons/icon.component';
import { DsControlValueAccessor } from '../control-value-accessor';
import { inFieldGroup } from '../field-group/field-group.token';
import { DsStaticPreview } from '../static-preview.directive';
import {
  isSelectOptionGroup,
  type SelectItem,
  type SelectOption,
  type SelectOptionGroup,
} from './select.types';
import type { DsSize } from '../../core/size';
import { FieldMessageComponent } from '../field-message/field-message.component';
import { resolveFieldMessage, trimmedText } from '../field-errors';
import { nextControlId } from '../field-ids';
import { resolveWithConfig } from '../../core/config-defaults';

@Component({
  selector: 'ds-select',
  standalone: true,
  imports: [IconComponent, NgTemplateOutlet, FieldMessageComponent],
  host: {
    '[attr.data-field-state]': 'controlState()',
    '[class.in-group]': 'inGroup',
  },
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  hostDirectives: [{ directive: DsStaticPreview, inputs: ['staticPreview'] }],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
})
export class SelectComponent
  extends DsControlValueAccessor<string>
  implements OnDestroy
{
  private readonly overlay = inject(Overlay);
  /** Segment of a ds-field-group: the group owns the border, radius and focus
   *  ring, so .in-group strips this control back to its bare contents. */
  protected readonly inGroup = inFieldGroup();

  private readonly vcr = inject(ViewContainerRef);
  private readonly host = inject(ElementRef<HTMLElement>);
  protected readonly preview = inject(DsStaticPreview);

  /** Selected option's value, two-way bound. */
  readonly value = model<string>('');
  /** Flat options or option groups rendered in the dropdown panel. */
  readonly options = input<SelectItem[]>([]);
  /** Shown in the trigger when nothing is selected. */
  readonly placeholder = input<string>('');
  /** Trigger height — sm/md/lg.
   *  Unset falls back to `DS_CONFIG.control.size`, then `'md'`. */
  readonly size = input<DsSize | null>(null);
  readonly sizeResolved = resolveWithConfig(
    this.size,
    (config) => config.control?.size,
    'md' as DsSize,
  );
  /** Label shown above the trigger. */
  readonly label = input<string>('');
  /** Disables the trigger and blocks all interaction. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Prevents opening the dropdown while still allowing focus. */
  readonly readOnly = input(false, { transform: booleanAttribute });
  /**
   * The contract spelling of `readOnly`, a second input because signal forms binds
   * by NAME — a `readonly()` rule was reaching nothing before this existed.
   */
  readonly readonlyBinding = input(false, {
    // The alias IS the point: signal forms binds by name, and the contract
    // spells it `readonly` where the DS spells it `readOnly`.
    // eslint-disable-next-line @angular-eslint/no-input-rename
    alias: 'readonly',
    transform: booleanAttribute,
  });
  protected readonly isReadOnly = computed(
    () => this.readOnly() || this.readonlyBinding(),
  );
  /** Confirmation text, shown when there is no error or warning — and it paints
   *  the field's success border. A string like `warning`: the text IS the state. */
  readonly success = input<string, string | null | undefined>('', {
    transform: trimmedText,
  });
  /** Marks the field required — shows an asterisk and sets `aria-required`. */
  readonly required = input(false, { transform: booleanAttribute });
  /** Shows an "(optional)" marker next to the label (ignored when `required`). */
  readonly optional = input(false, { transform: booleanAttribute });
  /** Native `name` attribute forwarded to the trigger. */
  readonly name = input<string | null>(null);
  /** Accessible name when no visible `label` is provided. */
  readonly ariaLabel = input<string | null>(null);
  /** Shows an inline clear (×) button when a value is selected. */
  readonly clearable = input(false, { transform: booleanAttribute });

  protected readonly uid = nextControlId('ds-select');
  protected readonly labelId = `${this.uid}-label`;
  protected readonly listboxId = `${this.uid}-listbox`;
  protected readonly hintId = computed(() =>
    this.message().text ? `${this.uid}-hint` : null,
  );
  private readonly fieldMessage = resolveFieldMessage({
    hint: this.hint,
    warning: this.warning,
    error: this.error,
    errors: this.errors,
    invalid: this.invalid,
    success: this.success,
    touchedSelf: this.touchedSelf,
    touched: this.touched,
  });
  protected readonly message = this.fieldMessage.message;
  protected readonly controlState = this.fieldMessage.controlState;
  protected readonly invalidResolved = this.fieldMessage.invalid;
  protected optionId(flatIndex: number): string {
    return `${this.uid}-opt-${flatIndex}`;
  }
  /** Active option for `aria-activedescendant` (combobox keeps DOM focus). */
  protected readonly activeDescendant = computed(() => {
    const index = this.activeIndex();

    return this.open() && index >= 0 ? this.optionId(index) : null;
  });
  protected readonly resolvedAriaLabel = computed(() =>
    this.label() ? null : this.ariaLabel() || this.placeholder() || null,
  );

  /** Effective disabled — own `disabled` input OR the reactive-forms state. */
  protected readonly isDisabled = computed(
    () => this.disabled() || this.formDisabled(),
  );

  protected readonly trigger =
    viewChild.required<ElementRef<HTMLElement>>('trigger');
  protected readonly panelTpl =
    viewChild.required<TemplateRef<unknown>>('panel');
  protected readonly panelContentTpl =
    viewChild.required<TemplateRef<unknown>>('panelContent');
  protected readonly open = signal<boolean>(false);
  protected readonly activeIndex = signal<number>(-1);

  private overlayRef: OverlayRef | null = null;

  // Flattened list of selectable options paired with the parent-group `disabled`
  // state, so keyboard nav and selection ignore group-header labels and respect
  // group-level disable. Index of an entry here corresponds to `activeIndex`.
  protected readonly flatOptions = computed<
    { option: SelectOption; groupDisabled: boolean }[]
  >(() => {
    const out: { option: SelectOption; groupDisabled: boolean }[] = [];
    for (const item of this.options()) {
      if (isSelectOptionGroup(item)) {
        const groupDisabled = !!item.disabled;
        for (const opt of item.options) {
          out.push({ option: opt, groupDisabled });
        }
      } else {
        out.push({ option: item, groupDisabled: false });
      }
    }

    return out;
  });

  protected readonly selectedOption = computed<SelectOption | null>(() => {
    const current = this.value();
    const found = this.flatOptions().find(
      ({ option }) => option.value === current,
    );

    return found?.option ?? null;
  });

  protected readonly displayLabel = computed<string>(() => {
    return this.selectedOption()?.label ?? this.placeholder();
  });

  protected readonly hasValue = computed<boolean>(
    () => !!this.selectedOption(),
  );

  protected readonly triggerClasses = computed<string>(() => {
    const parts = ['dropdown'];
    if (this.sizeResolved() === 'sm') {
      parts.push('sm');
    }
    if (this.sizeResolved() === 'lg') {
      parts.push('lg');
    }
    if (this.isDisabled()) {
      parts.push('disabled');
    }
    if (this.isReadOnly()) {
      parts.push('readonly');
    }
    if (this.invalidResolved()) {
      parts.push('error');
    }
    if (this.open() || this.preview.staticPreview()) {
      parts.push('open');
    }

    return parts.join(' ');
  });

  constructor() {
    super();
    effect(() => {
      if (!this.open()) {
        return;
      }
      const index = this.flatOptions().findIndex(
        ({ option }) => option.value === this.value(),
      );
      this.activeIndex.set(index >= 0 ? index : this.firstEnabledIndex());
    });
  }

  protected isOptionGroup(item: SelectItem): item is SelectOptionGroup {
    return isSelectOptionGroup(item);
  }

  // Resolve the flat-index for a given option so click/hover/selection
  // map back to the same indices keyboard nav uses (no double bookkeeping).
  protected flatIndexOf(opt: SelectOption): number {
    return this.flatOptions().findIndex(({ option }) => option === opt);
  }

  protected toggle(): void {
    if (
      this.isDisabled() ||
      this.isReadOnly() ||
      this.preview.staticPreview()
    ) {
      return;
    }
    if (this.open()) {
      this.close();
    } else {
      this.openPanel();
    }
  }

  protected openPanel(): void {
    if (this.overlayRef) {
      return;
    }
    const triggerElement = this.trigger().nativeElement;
    const width = triggerElement.getBoundingClientRect().width;
    const { positionStrategy, config } = dropdownOverlay(
      this.overlay,
      triggerElement,
    );
    config.width = width;
    this.overlayRef = this.overlay.create(config);
    prepareOverlayEnter(
      this.overlayRef,
      this.host.nativeElement,
      positionStrategy,
    );
    closeOnOutsidePointer(
      this.overlayRef,
      (target) => this.host.nativeElement.contains(target),
      () => this.close('dismiss'),
    );
    // No backdrop catches a page scroll and CDK's scroll strategies miss a plain
    // overflow container, so close on any outside scroll ourselves.
    const removeScrollClose = closeOnScroll(this.overlayRef, () =>
      this.close('dismiss'),
    );
    this.overlayRef.detachments().subscribe(() => {
      removeScrollClose();
      this.overlayRef = null;
      this.open.set(false);
    });
    const portal = new TemplatePortal(this.panelTpl(), this.vcr);
    this.overlayRef.attach(portal);
    this.open.set(true);
  }

  protected close(cause: DsOverlayCloseCause = 'select'): void {
    disposeWithLeave(this.overlayRef, cause);
    this.overlayRef = null;
    this.open.set(false);
    this.activeIndex.set(-1);
    this.markTouched();
  }

  ngOnDestroy(): void {
    // Host torn down while open → close() never runs. Dispose the overlay so
    // its pane and event subscriptions don't leak.
    this.overlayRef?.dispose();
    this.overlayRef = null;
  }

  protected pick(option: SelectOption, groupDisabled = false): void {
    if (option.disabled || groupDisabled) {
      return;
    }
    this.value.set(option.value);
    this.close();
    this.trigger().nativeElement.focus();
  }

  protected clearValue(event: MouseEvent): void {
    event.stopPropagation();
    this.value.set('');
    this.markTouched();
  }

  protected isSelected(option: SelectOption): boolean {
    return option.value === this.value();
  }

  protected isOptionDisabled(
    option: SelectOption,
    groupDisabled = false,
  ): boolean {
    return !!option.disabled || groupDisabled;
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (
      this.isDisabled() ||
      this.isReadOnly() ||
      this.preview.staticPreview()
    ) {
      return;
    }
    // Only handle keys aimed at the trigger itself — a keydown bubbling up from
    // the nested clear <button> must reach its own activation (Enter/Space to
    // clear), not be hijacked here into reopening the panel.
    if (event.target !== event.currentTarget) {
      return;
    }
    const key = event.key;
    if (!this.open()) {
      if (
        key === 'ArrowDown' ||
        key === 'ArrowUp' ||
        key === 'Enter' ||
        key === ' '
      ) {
        event.preventDefault();
        this.openPanel();
      }

      return;
    }
    if (key === 'Tab') {
      // Close the panel but let Tab move focus naturally (no preventDefault),
      // else the open overlay panel lingers behind the moved focus.
      this.close();

      return;
    }
    if (key === 'Escape') {
      event.preventDefault();
      this.close('dismiss');

      return;
    }
    if (key === 'ArrowDown') {
      event.preventDefault();
      this.moveActive(1);

      return;
    }
    if (key === 'ArrowUp') {
      event.preventDefault();
      this.moveActive(-1);

      return;
    }
    if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      const index = this.activeIndex();
      const entry = this.flatOptions()[index];
      if (entry) {
        this.pick(entry.option, entry.groupDisabled);
      }

      return;
    }
    if (key === 'Home') {
      event.preventDefault();
      this.activeIndex.set(this.firstEnabledIndex());

      return;
    }
    if (key === 'End') {
      event.preventDefault();
      this.activeIndex.set(this.lastEnabledIndex());
    }
  }

  protected isActive(index: number): boolean {
    return this.activeIndex() === index;
  }

  private moveActive(delta: number): void {
    const opts = this.flatOptions();
    if (opts.length === 0) {
      return;
    }
    let next = this.activeIndex();
    // eslint-disable-next-line @typescript-eslint/prefer-for-of -- walks from activeIndex with modulo wraparound; `attempts` only bounds the walk, it isn't a sequential index
    for (let attempts = 0; attempts < opts.length; attempts++) {
      next = (next + delta + opts.length) % opts.length;
      const candidate = opts[next];
      if (candidate && !candidate.option.disabled && !candidate.groupDisabled) {
        this.activeIndex.set(next);

        return;
      }
    }
  }

  private firstEnabledIndex(): number {
    const opts = this.flatOptions();
    for (let i = 0; i < opts.length; i++) {
      const candidate = opts[i];
      if (candidate && !candidate.option.disabled && !candidate.groupDisabled) {
        return i;
      }
    }

    return -1;
  }

  private lastEnabledIndex(): number {
    const opts = this.flatOptions();
    for (let i = opts.length - 1; i >= 0; i--) {
      const candidate = opts[i];
      if (candidate && !candidate.option.disabled && !candidate.groupDisabled) {
        return i;
      }
    }

    return -1;
  }
}
