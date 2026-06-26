import {
  Component,
  DestroyRef,
  ElementRef,
  TemplateRef,
  ViewContainerRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  forwardRef,
  inject,
  input,
  model,
  numberAttribute,
  signal,
  viewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { IconComponent } from '../../icons/icon.component';
import { TagComponent } from '../tag/tag.component';
import { DsControlValueAccessor } from '../control-value-accessor';
import { disposeWithLeave } from '../overlay-motion';
import type { MultiSelectOption } from './multi-select.types';

let nextId = 0;

@Component({
  selector: 'ds-multi-select',
  standalone: true,
  imports: [IconComponent, TagComponent],
  templateUrl: './multi-select.component.html',
  styleUrl: './multi-select.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiSelectComponent),
      multi: true,
    },
  ],
})
export class MultiSelectComponent extends DsControlValueAccessor<string[]> {
  private readonly overlay = inject(Overlay);
  private readonly vcr = inject(ViewContainerRef);

  readonly value = model<string[]>([]);
  readonly options = input<readonly MultiSelectOption[]>([]);
  readonly placeholder = input<string>('Select…');
  readonly searchPlaceholder = input<string>('Filter…');
  // 0 / null shows every chip; a positive cap collapses the rest into "+N more".
  readonly maxVisibleChips = input<number | null>(null, {
    transform: (raw: unknown) => (raw == null ? null : numberAttribute(raw)),
  });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly ariaLabel = input<string | null>(null);
  // Show a "Select all" row that toggles every (filter-matching, enabled) option.
  readonly selectAll = input(false, { transform: booleanAttribute });

  protected readonly uid = `ds-multi-select-${++nextId}`;
  protected readonly listboxId = `${this.uid}-listbox`;
  protected optionId(index: number): string {
    return `${this.uid}-opt-${index}`;
  }

  protected readonly trigger =
    viewChild.required<ElementRef<HTMLElement>>('trigger');
  protected readonly searchInput =
    viewChild<ElementRef<HTMLInputElement>>('search');
  protected readonly panelTpl =
    viewChild.required<TemplateRef<unknown>>('panel');

  protected readonly open = signal(false);
  protected readonly filter = signal('');
  protected readonly activeIndex = signal(-1);

  private overlayRef: OverlayRef | null = null;
  private focusTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    super();
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.focusTimer ?? undefined);
      this.overlayRef?.dispose();
      this.overlayRef = null;
    });
  }

  protected readonly isDisabled = computed(
    () => this.disabled() || this.formDisabled(),
  );

  // Selected options in the source order, so chip order is stable.
  protected readonly selectedOptions = computed<MultiSelectOption[]>(() => {
    const selected = this.value();

    return this.options().filter((option) => selected.includes(option.value));
  });

  protected readonly visibleChips = computed<MultiSelectOption[]>(() => {
    const max = this.maxVisibleChips();
    const selected = this.selectedOptions();

    return max && max > 0 ? selected.slice(0, max) : selected;
  });

  protected readonly overflowCount = computed<number>(() => {
    const max = this.maxVisibleChips();

    return max && max > 0
      ? Math.max(0, this.selectedOptions().length - max)
      : 0;
  });

  protected readonly filteredOptions = computed<MultiSelectOption[]>(() => {
    const query = this.filter().trim().toLowerCase();
    const options = this.options();

    return query
      ? options.filter((option) => option.label.toLowerCase().includes(query))
      : options.slice();
  });

  protected readonly activeDescendant = computed(() => {
    const index = this.activeIndex();

    return this.open() && index >= 0 ? this.optionId(index) : null;
  });

  protected readonly resolvedAriaLabel = computed(
    () => this.ariaLabel() || this.placeholder(),
  );

  // Select-all reflects the currently filter-matching, enabled options.
  private enabledFiltered(): MultiSelectOption[] {
    return this.filteredOptions().filter((option) => !option.disabled);
  }

  protected readonly allFilteredSelected = computed<boolean>(() => {
    const enabled = this.enabledFiltered();
    const selected = this.value();

    return (
      enabled.length > 0 && enabled.every((o) => selected.includes(o.value))
    );
  });

  protected readonly someFilteredSelected = computed<boolean>(() => {
    const selected = this.value();

    return (
      this.enabledFiltered().some((o) => selected.includes(o.value)) &&
      !this.allFilteredSelected()
    );
  });

  protected toggleSelectAll(): void {
    const enabledValues = this.enabledFiltered().map((o) => o.value);
    if (this.allFilteredSelected()) {
      const remove = new Set(enabledValues);

      this.value.set(this.value().filter((value) => !remove.has(value)));
    } else {
      const next = new Set(this.value());
      enabledValues.forEach((value) => next.add(value));
      this.value.set([...next]);
    }
  }

  protected isSelected(value: string): boolean {
    return this.value().includes(value);
  }

  protected toggleValue(option: MultiSelectOption): void {
    if (option.disabled) {
      return;
    }
    const current = this.value();
    this.value.set(
      current.includes(option.value)
        ? current.filter((value) => value !== option.value)
        : [...current, option.value],
    );
  }

  protected removeValue(value: string): void {
    this.value.set(this.value().filter((entry) => entry !== value));
  }

  protected onFilter(event: Event): void {
    this.filter.set((event.target as HTMLInputElement).value);
    this.activeIndex.set(this.filteredOptions().length ? 0 : -1);
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (this.isDisabled()) {
      return;
    }
    if (
      event.key === 'ArrowDown' ||
      event.key === 'Enter' ||
      event.key === ' '
    ) {
      event.preventDefault();
      this.openPanel();
    }
  }

  protected onSearchKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.moveActive(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.moveActive(-1);
        break;
      case 'Enter': {
        event.preventDefault();
        const option = this.filteredOptions()[this.activeIndex()];
        if (option) {
          this.toggleValue(option);
        }
        break;
      }
      case 'Escape':
        event.preventDefault();
        this.close();
        break;
      case 'Backspace':
        if (!this.filter()) {
          const selected = this.selectedOptions();
          if (selected.length) {
            this.removeValue(selected[selected.length - 1].value);
          }
        }
        break;
      default:
        break;
    }
  }

  protected openPanel(): void {
    if (this.overlayRef || this.isDisabled()) {
      return;
    }
    const triggerElement = this.trigger().nativeElement;
    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(triggerElement)
      .withPositions([
        {
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top',
          offsetY: 4,
        },
        {
          originX: 'start',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'bottom',
          offsetY: -4,
        },
      ]);
    const cfg: OverlayConfig = {
      positionStrategy,
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      panelClass: ['ds-dropdown-panel', 'ds-overlay-pane'],
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      width: triggerElement.getBoundingClientRect().width,
    };
    this.overlayRef = this.overlay.create(cfg);
    this.overlayRef.backdropClick().subscribe(() => this.close());
    this.overlayRef.keydownEvents().subscribe((event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        this.close();
      }
    });
    this.overlayRef.attach(new TemplatePortal(this.panelTpl(), this.vcr));
    this.open.set(true);
    this.activeIndex.set(this.filteredOptions().length ? 0 : -1);
    this.focusTimer = setTimeout(() => {
      this.focusTimer = null;
      this.searchInput()?.nativeElement.focus();
    });
  }

  protected close(): void {
    if (!this.overlayRef) {
      return;
    }
    clearTimeout(this.focusTimer ?? undefined);
    this.focusTimer = null;
    disposeWithLeave(this.overlayRef);
    this.overlayRef = null;
    this.open.set(false);
    this.filter.set('');
    this.activeIndex.set(-1);
    this.markTouched();
    this.trigger().nativeElement.focus();
  }

  private moveActive(delta: number): void {
    const options = this.filteredOptions();
    const count = options.length;
    if (!count) {
      return;
    }
    let next = this.activeIndex();
    let remaining = count;
    while (remaining-- > 0) {
      next = (next + delta + count) % count;
      if (!options[next].disabled) {
        this.activeIndex.set(next);

        return;
      }
    }
  }
}
