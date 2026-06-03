import {
  Component,
  ElementRef,
  TemplateRef,
  ViewContainerRef,
  ViewEncapsulation,
  computed,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { IconComponent } from '../../icons/icon.component';
import { TagComponent } from '../tag/tag.component';
import type { ComboboxOption } from './combobox.types';

let nextId = 0;

@Component({
  selector: 'ds-combobox',
  standalone: true,
  imports: [IconComponent, TagComponent],
  templateUrl: './combobox.component.html',
  styleUrl: './combobox.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class ComboboxComponent<T = unknown> {
  private readonly overlay = inject(Overlay);
  private readonly vcr = inject(ViewContainerRef);

  readonly options = input<readonly ComboboxOption<T>[]>([]);
  readonly value = model<T | readonly T[] | null>(null);
  readonly multiple = input<boolean>(false);
  readonly placeholder = input<string>('Select…');
  /** Accessible name for the combobox input. */
  readonly ariaLabel = input<string | null>(null);

  protected readonly query = signal('');
  protected readonly isOpen = signal(false);
  protected readonly activeIndex = signal(-1);
  protected readonly trigger = viewChild.required<ElementRef<HTMLElement>>('trigger');
  protected readonly filterInput = viewChild.required<ElementRef<HTMLInputElement>>('filter');
  protected readonly panelTpl = viewChild.required<TemplateRef<unknown>>('panel');
  private overlayRef: OverlayRef | null = null;

  protected readonly uid = `ds-combobox-${++nextId}`;
  protected readonly listboxId = `${this.uid}-listbox`;
  protected optionId(index: number): string {
    return `${this.uid}-opt-${index}`;
  }
  protected readonly activeDescendant = computed(() => {
    const idx = this.activeIndex();
    return this.isOpen() && idx >= 0 ? this.optionId(idx) : null;
  });

  protected readonly filteredOptions = computed(() => {
    const trimmedQuery = this.query().toLowerCase().trim();
    const allOptions = this.options();
    if (!trimmedQuery) return allOptions;
    return allOptions.filter((option) => option.label.toLowerCase().includes(trimmedQuery));
  });

  protected readonly selectedTags = computed(() => {
    if (!this.multiple()) return [];
    const selectedValues = (this.value() as readonly T[] | null) ?? [];
    const selectedSet = new Set(selectedValues);
    return this.options().filter((option) => selectedSet.has(option.value));
  });

  protected readonly displayLabel = computed(() => {
    if (this.multiple()) return '';
    const currentValue = this.value() as T | null;
    if (currentValue === null) return '';
    return this.options().find((option) => option.value === currentValue)?.label ?? '';
  });

  protected readonly placeholderText = computed(() => {
    if (this.multiple()) return '';
    if (this.displayLabel()) return '';
    return this.placeholder();
  });

  protected isSelected(option: ComboboxOption<T>): boolean {
    if (this.multiple()) {
      const selectedValues = (this.value() as readonly T[] | null) ?? [];
      return selectedValues.includes(option.value);
    }
    return this.value() === option.value;
  }

  protected optionClass(option: ComboboxOption<T>): string {
    const parts = ['option'];
    if (this.multiple()) parts.push('check');
    void option;
    return parts.join(' ');
  }

  protected onTriggerClick(): void {
    this.filterInput().nativeElement.focus();
    if (!this.overlayRef) this.openPanel();
  }

  protected onKeydown(event: KeyboardEvent): void {
    const opts = this.filteredOptions();
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!this.overlayRef) { this.openPanel(); return; }
        this.activeIndex.set(opts.length ? (this.activeIndex() + 1) % opts.length : -1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!this.overlayRef) { this.openPanel(); return; }
        this.activeIndex.set(opts.length ? (this.activeIndex() - 1 + opts.length) % opts.length : -1);
        break;
      case 'Enter': {
        const opt = opts[this.activeIndex()];
        if (opt) { event.preventDefault(); this.onPick(opt); }
        break;
      }
      case 'Escape':
        if (this.overlayRef) { event.preventDefault(); this.close(); }
        break;
      case 'Backspace':
        if (this.multiple() && !this.query()) {
          const tags = this.selectedTags();
          const last = tags[tags.length - 1];
          if (last) this.remove(last.value);
        }
        break;
    }
  }

  protected toggle(): void {
    if (this.overlayRef) {
      this.close();
      return;
    }
    this.openPanel();
  }

  protected openPanel(): void {
    if (this.overlayRef) return;
    const triggerElement = this.trigger().nativeElement;
    const positionStrategy = this.overlay.position()
      .flexibleConnectedTo(triggerElement)
      .withPositions([
        { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
        { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
      ]);
    const overlayConfig: OverlayConfig = {
      positionStrategy,
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      width: triggerElement.getBoundingClientRect().width,
    };
    this.overlayRef = this.overlay.create(overlayConfig);
    this.overlayRef.backdropClick().subscribe(() => this.close());
    this.overlayRef.attach(new TemplatePortal(this.panelTpl(), this.vcr));
    this.isOpen.set(true);
    this.activeIndex.set(this.filteredOptions().length ? 0 : -1);
  }

  protected close(): void {
    this.overlayRef?.dispose();
    this.overlayRef = null;
    this.isOpen.set(false);
    this.activeIndex.set(-1);
  }

  protected onFilter(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  protected onPick(option: ComboboxOption<T>): void {
    if (this.multiple()) {
      const current = (this.value() as readonly T[] | null) ?? [];
      const next = current.includes(option.value)
        ? current.filter((existing) => existing !== option.value)
        : [...current, option.value];
      this.value.set(next);
    } else {
      this.value.set(option.value);
      this.close();
    }
  }

  protected remove(target: T): void {
    if (!this.multiple()) return;
    const current = (this.value() as readonly T[] | null) ?? [];
    this.value.set(current.filter((existing) => existing !== target));
  }
}
