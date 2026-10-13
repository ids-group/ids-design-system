import {
  Component,
  ElementRef,
  type OnDestroy,
  TemplateRef,
  contentChild,
  ViewContainerRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  output,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  clearOnDetach,
  closeOnOutsidePointer,
  closeOnScroll,
  disposeWithLeave,
  dropdownOverlay,
  type DsOverlayCloseCause,
  forwardOverlayTokens,
  panelClassesOf,
  prepareOverlayEnter,
} from '@ids-group-ltd/ids-design-system/components';
import { NgTemplateOutlet } from '@angular/common';
import { IconComponent } from '@ids-group-ltd/ids-design-system/icons';
import { LoadingOverlayComponent } from '@ids-group-ltd/ids-design-system/components/loading-overlay';
import { SkeletonComponent } from '@ids-group-ltd/ids-design-system/components/skeleton';
import { DsControlValueAccessor } from '@ids-group-ltd/ids-design-system/components';
import {
  describedByIds,
  groupInvalid,
  groupMessageId,
  inFieldGroup,
} from '@ids-group-ltd/ids-design-system/components/field-group';
import { DsStaticPreview } from '@ids-group-ltd/ids-design-system/components';
import {
  isSelectOptionGroup,
  type SelectItem,
  type SelectOption,
  type SelectOptionGroup,
  type SelectWidth,
} from './select.types';
import { DS_INTL, type DsSize } from '@ids-group-ltd/ids-design-system/core';
import {
  FieldMessageComponent,
  FieldStatusComponent,
} from '@ids-group-ltd/ids-design-system/components/field-message';
import { TooltipDirective } from '@ids-group-ltd/ids-design-system/components/tooltip';
import {
  resolveFieldMessage,
  trimmedText,
} from '@ids-group-ltd/ids-design-system/components';
import { nextControlId } from '@ids-group-ltd/ids-design-system/components';
import { resolveWithConfig } from '@ids-group-ltd/ids-design-system/core';
import { DsOptionTemplateDirective } from '@ids-group-ltd/ids-design-system/components';
import { DsPickerTriggerDirective } from '@ids-group-ltd/ids-design-system/components';
import { DsEmptyTemplateDirective } from '@ids-group-ltd/ids-design-system/components';
import { DsPanelHeaderTemplateDirective } from '@ids-group-ltd/ids-design-system/components';
import { DsPanelFooterTemplateDirective } from '@ids-group-ltd/ids-design-system/components';
import { DsGroupLabelTemplateDirective } from '@ids-group-ltd/ids-design-system/components';
import {
  firstEnabledIndex as firstEnabledOf,
  isListCursorKey,
  lastEnabledIndex as lastEnabledOf,
  nextEnabledIndex,
} from '@ids-group-ltd/ids-design-system/core';
import { scrollActiveOptionIntoView } from '@ids-group-ltd/ids-design-system/components';
import { createTypeAhead } from '@ids-group-ltd/ids-design-system/components';

@Component({
  selector: 'ds-select',
  standalone: true,
  imports: [
    LoadingOverlayComponent,
    SkeletonComponent,
    IconComponent,
    NgTemplateOutlet,
    FieldMessageComponent,
    FieldStatusComponent,
    TooltipDirective,
  ],
  host: {
    '[attr.data-field-state]': 'controlState()',
    '[class.in-group]': 'inGroup',
    '[class.content-width]': "width() === 'content'",
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
  protected readonly intl = inject(DS_INTL);
  protected readonly inGroup = inFieldGroup();

  private readonly vcr = inject(ViewContainerRef);
  private readonly host = inject(ElementRef<HTMLElement>);
  protected readonly preview = inject(DsStaticPreview);

  /** Selected option's value, two-way bound. */
  readonly value = model<string>('');
  /** Flat options or option groups rendered in the dropdown panel. */
  readonly options = input<readonly SelectItem[]>([]);
  private readonly panelTokens = [
    '--ds-dropdown-panel-bg-color',
    '--ds-dropdown-panel-min-width',
    '--ds-dropdown-panel-max-width',
    '--ds-option-selected-bg-color',
    '--ds-option-selected-label-color',
    '--ds-option-selected-bg-color-hover',
    '--ds-option-check-color',
  ];

  /** Trigger width: `fill` stretches to the container and pins the panel to it; `content` hugs the trigger and uses its width as the panel's floor. */
  readonly width = input<SelectWidth>('fill');
  /** Shown in the trigger when nothing is selected. */
  readonly placeholder = input<string>('');
  /** Trigger height; falls back to `DS_CONFIG.control.size`, then `'md'`. */
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
  /** Options are still being fetched and the list reports `aria-busy`: with no options it shows
   *  placeholder rows, with options it keeps them under an overlay until they are replaced. */
  readonly loading = input(false, { transform: booleanAttribute });

  protected readonly skeletonOptionWidths = ['70%', '50%', '85%'];

  /** The panel opened. */
  readonly opened = output<void>();
  /** The panel closed, for any reason - a pick, Escape, an outside click, a scroll. */
  readonly closed = output<void>();
  /** Scrolls the keyboard cursor's row into view. Set `false` only when driving the scroll position yourself. */
  readonly scrollActiveIntoView = input(true, { transform: booleanAttribute });
  /** Extra classes for the portaled panel, the only way to style one instance of it. */
  readonly panelClass = input<string | readonly string[]>([]);
  /** Prevents opening the dropdown while still allowing focus. */
  readonly readOnly = input(false, { transform: booleanAttribute });
  /** The contract spelling of `readOnly`: signal forms binds by NAME, so a `readonly()` rule reaches nothing without it. */
  readonly readonlyBinding = input(false, {
    // eslint-disable-next-line @angular-eslint/no-input-rename
    alias: 'readonly',
    transform: booleanAttribute,
  });
  protected readonly isReadOnly = computed(
    () => this.readOnly() || this.readonlyBinding(),
  );
  /** Confirmation text, shown when there is no error or warning; paints the success border. */
  readonly success = input<string, string | null | undefined>('', {
    transform: trimmedText,
  });
  /** Marks the field required - shows an asterisk and sets `aria-required`. */
  readonly required = input(false, { transform: booleanAttribute });
  /** Shows an "(optional)" marker next to the label (ignored when `required`). */
  readonly optional = input(false, { transform: booleanAttribute });
  /** Native `name` attribute forwarded to the trigger. */
  readonly name = input<string | null>(null);
  /** Accessible name when no visible `label` is provided. */
  readonly ariaLabel = input<string | null>(null);
  /** Shows an inline clear (×) button when a value is selected. */
  readonly clearable = input(false, { transform: booleanAttribute });

  protected readonly optionTemplate = contentChild(DsOptionTemplateDirective, {
    read: TemplateRef,
  });
  protected readonly pickerTrigger = contentChild(DsPickerTriggerDirective, {
    read: TemplateRef,
  });
  protected readonly panelHeaderTemplate = contentChild(
    DsPanelHeaderTemplateDirective,
    { read: TemplateRef },
  );
  protected readonly panelFooterTemplate = contentChild(
    DsPanelFooterTemplateDirective,
    { read: TemplateRef },
  );
  protected readonly groupLabelTemplate = contentChild(
    DsGroupLabelTemplateDirective,
    { read: TemplateRef },
  );
  protected readonly emptyTemplate = contentChild(DsEmptyTemplateDirective, {
    read: TemplateRef,
  });

  protected readonly uid = nextControlId('ds-select');
  protected readonly labelId = `${this.uid}-label`;
  protected readonly listboxId = `${this.uid}-listbox`;
  protected readonly hintId = computed(() =>
    this.message().text || this.changedShown() ? `${this.uid}-hint` : null,
  );
  private readonly fieldMessage = resolveFieldMessage({
    pending: this.pending,
    dirty: this.dirty,
    showDirty: this.showDirtyResolved,
    disabled: () => this.isDisabled(),
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
  protected readonly pendingShown = this.fieldMessage.pending;
  protected readonly changedShown = this.fieldMessage.changed;
  protected readonly controlState = this.fieldMessage.controlState;
  protected readonly groupMessage = groupMessageId();
  protected readonly describedByIds = describedByIds;
  protected readonly invalidResolved = groupInvalid(this.fieldMessage.invalid);
  protected optionId(flatIndex: number): string {
    return `${this.uid}-opt-${flatIndex}`;
  }
  /** Active option for `aria-activedescendant` (combobox keeps DOM focus). */
  protected readonly activeDescendant = computed(() => {
    const index = this.activeIndex();

    return this.open() && index >= 0 && !this.listInert()
      ? this.optionId(index)
      : null;
  });
  protected readonly listInert = computed(
    () => this.loading() && this.options().length > 0,
  );
  protected readonly resolvedAriaLabel = computed(() =>
    this.label() ? null : this.ariaLabel() || this.placeholder() || null,
  );

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

  // An entry's index IS `activeIndex`; group headers are not entries, so keyboard nav never lands on one.
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
    scrollActiveOptionIntoView(
      this.activeDescendant,
      this.scrollActiveIntoView,
      this.cursorFromKeyboard,
    );

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
    const triggerWidth = triggerElement.getBoundingClientRect().width;
    const { positionStrategy, config } = dropdownOverlay(
      this.overlay,
      triggerElement,
      ['ds-select-panel', ...panelClassesOf(this.panelClass())],
    );
    if (this.width() === 'content') {
      config.minWidth = triggerWidth;
    } else {
      config.width = triggerWidth;
    }
    this.overlayRef = this.overlay.create(config);
    prepareOverlayEnter(
      this.overlayRef,
      this.host.nativeElement,
      positionStrategy,
    );
    forwardOverlayTokens(
      this.overlayRef,
      this.host.nativeElement,
      this.panelTokens,
    );
    closeOnOutsidePointer(
      this.overlayRef,
      (target) => this.trigger().nativeElement.contains(target),
      () => this.close('dismiss'),
    );
    const removeScrollClose = closeOnScroll(this.overlayRef, () =>
      this.close('dismiss'),
    );
    clearOnDetach(this.overlayRef, {
      current: () => this.overlayRef,
      always: removeScrollClose,
      clear: () => {
        this.overlayRef = null;
        this.setOpen(false);
      },
    });
    const portal = new TemplatePortal(this.panelTpl(), this.vcr);
    this.overlayRef.attach(portal);
    this.setOpen(true);
  }

  protected close(cause: DsOverlayCloseCause = 'select'): void {
    disposeWithLeave(this.overlayRef, cause);
    this.overlayRef = null;
    this.setOpen(false);
    this.activeIndex.set(-1);
    this.markTouched();
  }

  ngOnDestroy(): void {
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
    this.clear();
    this.markTouched();
  }

  /** Empties the selection from outside. Does not move focus. */
  clear(): void {
    this.value.set('');
    if (this.open()) {
      this.close('dismiss');
    }
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
    this.cursorFromKeyboard.set(true);
    if (
      this.isDisabled() ||
      this.isReadOnly() ||
      this.preview.staticPreview()
    ) {
      return;
    }
    // A keydown bubbling from the nested clear <button> must reach its own activation (Enter/Space).
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

        return;
      }
      // A native <select> commits as you type without opening, so the value changes under the closed trigger.
      if (this.handleTypeAhead(key)) {
        event.preventDefault();
        this.pickActive();
      }

      return;
    }
    if (key === 'Tab') {
      // No preventDefault: the open panel would linger behind the moved focus.
      this.close();

      return;
    }
    if (key === 'Escape') {
      event.preventDefault();
      this.close('dismiss');

      return;
    }
    // The scrim makes the list inert, so its rows take no cursor or pick key until loading ends.
    if (this.listInert()) {
      if (isListCursorKey(key) || key.length === 1) {
        event.preventDefault();
      }

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
    if (key === 'PageDown') {
      event.preventDefault();
      this.moveActive(SelectComponent.pageStep);

      return;
    }
    if (key === 'PageUp') {
      event.preventDefault();
      this.moveActive(-SelectComponent.pageStep);

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

      return;
    }
    if (this.handleTypeAhead(key)) {
      event.preventDefault();
    }
  }

  private pickActive(): void {
    const entry = this.flatOptions()[this.activeIndex()];
    if (entry) {
      this.pick(entry.option, entry.groupDisabled);
    }
  }

  protected isActive(index: number): boolean {
    return this.activeIndex() === index;
  }

  private readonly typeAhead = createTypeAhead();

  private handleTypeAhead(key: string): boolean {
    const index = this.typeAhead.match(
      key,
      this.flatOptions().map((entry) => entry.option.label),
      this.activeIndex(),
    );
    if (index < 0) {
      return false;
    }
    this.activeIndex.set(index);

    return true;
  }

  protected readonly cursorFromKeyboard = signal(false);

  private cursorList() {
    const opts = this.flatOptions();

    return {
      length: opts.length,
      isEnabled: (index: number) =>
        !opts[index].option.disabled && !opts[index].groupDisabled,
    };
  }

  /** PageUp/PageDown step: the native `<select>` and APG listbox value, fixed so it does not depend on how the panel is clipped. */
  private static readonly pageStep = 10;

  private moveActive(delta: number): void {
    const next = nextEnabledIndex(this.cursorList(), this.activeIndex(), delta);
    if (next >= 0) {
      this.activeIndex.set(next);
    }
  }

  private setOpen(next: boolean): void {
    if (this.open() === next) {
      return;
    }
    this.open.set(next);
    (next ? this.opened : this.closed).emit();
  }

  private lastEnabledIndex(): number {
    return lastEnabledOf(this.cursorList());
  }

  private firstEnabledIndex(): number {
    return firstEnabledOf(this.cursorList());
  }
}
