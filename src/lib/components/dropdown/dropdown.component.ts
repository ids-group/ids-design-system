import {
  Component,
  ElementRef,
  TemplateRef,
  ViewContainerRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { disposeWithLeave } from '../overlay-motion';
import { NgTemplateOutlet } from '@angular/common';
import { IconComponent } from '../../icons/icon.component';
import { DsStaticPreview } from '../static-preview.directive';
import type {
  DropdownOption,
  DropdownOptionGroup,
  DropdownSize,
} from './dropdown.types';

let nextId = 0;

@Component({
  selector: 'ds-dropdown',
  standalone: true,
  imports: [IconComponent, NgTemplateOutlet],
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  hostDirectives: [{ directive: DsStaticPreview, inputs: ['staticPreview'] }],
})
export class DropdownComponent {
  private readonly overlay = inject(Overlay);
  private readonly vcr = inject(ViewContainerRef);
  protected readonly preview = inject(DsStaticPreview);

  readonly value = model<string>('');
  readonly options = input<DropdownOption[]>([]);
  readonly optionGroups = input<DropdownOptionGroup[]>([]);
  readonly placeholder = input<string>('Select…');
  readonly size = input<DropdownSize>('md');
  readonly label = input<string>('');
  readonly disabled = input<boolean>(false);
  readonly readOnly = input<boolean>(false);
  readonly error = input<boolean>(false);
  readonly name = input<string | null>(null);
  readonly clearable = input(false, { transform: booleanAttribute });
  /** Accessible name when no visible `label` is provided. */
  readonly ariaLabel = input<string | null>(null);

  protected readonly uid = `ds-dropdown-${++nextId}`;
  protected readonly labelId = `${this.uid}-label`;
  protected readonly listboxId = `${this.uid}-listbox`;
  protected optionId(index: number): string {
    return `${this.uid}-opt-${index}`;
  }
  protected readonly resolvedAriaLabel = computed(() =>
    this.label() ? null : this.ariaLabel() || this.placeholder() || null,
  );

  protected readonly trigger =
    viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  protected readonly panelTpl =
    viewChild.required<TemplateRef<unknown>>('panel');
  protected readonly panelContentTpl =
    viewChild.required<TemplateRef<unknown>>('panelContent');
  protected readonly open = signal<boolean>(false);
  protected readonly activeIndex = signal<number>(-1);

  private overlayRef: OverlayRef | null = null;

  /** Flat list of options derived from optionGroups when non-empty. */
  protected readonly flatOptions = computed<DropdownOption[]>(() => {
    const groups = this.optionGroups();
    if (groups.length > 0) {
      return groups.flatMap((group) => group.options);
    }

    return this.options();
  });

  protected readonly selectedOption = computed<DropdownOption | null>(() => {
    const current = this.value();

    return (
      this.flatOptions().find((option) => option.value === current) ?? null
    );
  });

  protected readonly displayLabel = computed<string>(() => {
    return this.selectedOption()?.label ?? this.placeholder();
  });

  protected readonly hasValue = computed<boolean>(
    () => !!this.selectedOption(),
  );

  protected readonly activeDescendant = computed(() => {
    const index = this.activeIndex();

    return this.open() && index >= 0 ? this.optionId(index) : null;
  });

  protected readonly wrapperClasses = computed<string>(() => {
    const parts = ['dropdown'];
    if (this.size() === 'sm') {
      parts.push('sm');
    }
    if (this.size() === 'lg') {
      parts.push('lg');
    }
    if (this.disabled()) {
      parts.push('disabled');
    }
    if (this.readOnly()) {
      parts.push('readonly');
    }
    if (this.error()) {
      parts.push('error');
    }
    if (this.open() || this.preview.staticPreview()) {
      parts.push('open');
    }

    return parts.join(' ');
  });

  /** Flat index for a given option within the flat options list. */
  protected flatIndexOf(option: DropdownOption): number {
    return this.flatOptions().findIndex((opt) => opt === option);
  }

  constructor() {
    effect(() => {
      if (!this.open()) {
        return;
      }
      const index = this.flatOptions().findIndex(
        (option) => option.value === this.value(),
      );
      this.activeIndex.set(index >= 0 ? index : this.firstEnabledIndex());
    });
  }

  protected toggle(): void {
    if (this.disabled() || this.readOnly() || this.preview.staticPreview()) {
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
      // Global panel class — the portaled pane lives outside :host, so
      // styles live in styles/_dropdown-overlay.scss keyed off this class.
      panelClass: ['ds-dropdown-panel', 'ds-overlay-pane'],
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      width,
    };
    this.overlayRef = this.overlay.create(cfg);
    this.overlayRef.backdropClick().subscribe(() => this.close());
    const portal = new TemplatePortal(this.panelTpl(), this.vcr);
    this.overlayRef.attach(portal);
    this.open.set(true);
  }

  protected close(): void {
    disposeWithLeave(this.overlayRef);
    this.overlayRef = null;
    this.open.set(false);
    this.activeIndex.set(-1);
  }

  protected pick(option: DropdownOption): void {
    if (option.disabled) {
      return;
    }
    this.value.set(option.value);
    this.close();
    this.trigger().nativeElement.focus();
  }

  protected clearValue(event: MouseEvent): void {
    event.stopPropagation();
    this.value.set('');
  }

  protected isSelected(option: DropdownOption): boolean {
    return option.value === this.value();
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (this.disabled() || this.readOnly() || this.preview.staticPreview()) {
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
      // else the overlay + transparent backdrop leak behind the moved focus.
      this.close();

      return;
    }
    if (key === 'Escape') {
      event.preventDefault();
      this.close();

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
      const opt = this.flatOptions()[index];
      if (opt) {
        this.pick(opt);
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
    for (let attempts = 0; attempts < opts.length; attempts++) {
      next = (next + delta + opts.length) % opts.length;
      const candidate = opts[next];
      if (candidate && !candidate.disabled) {
        this.activeIndex.set(next);

        return;
      }
    }
  }

  private firstEnabledIndex(): number {
    const opts = this.flatOptions();
    for (let index = 0; index < opts.length; index++) {
      const candidate = opts[index];
      if (candidate && !candidate.disabled) {
        return index;
      }
    }

    return -1;
  }

  private lastEnabledIndex(): number {
    const opts = this.flatOptions();
    for (let index = opts.length - 1; index >= 0; index--) {
      const candidate = opts[index];
      if (candidate && !candidate.disabled) {
        return index;
      }
    }

    return -1;
  }
}
