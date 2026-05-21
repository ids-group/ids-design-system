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

  protected readonly query = signal('');
  protected readonly trigger = viewChild.required<ElementRef<HTMLElement>>('trigger');
  protected readonly panelTpl = viewChild.required<TemplateRef<unknown>>('panel');
  private overlayRef: OverlayRef | null = null;

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

  protected toggle(): void {
    if (this.overlayRef) {
      this.close();
      return;
    }
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
  }

  protected close(): void {
    this.overlayRef?.dispose();
    this.overlayRef = null;
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
