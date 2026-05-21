import {
  Component,
  ElementRef,
  TemplateRef,
  ViewContainerRef,
  ViewEncapsulation,
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
import { IconComponent } from '../../icons/icon.component';
import type { SelectOption, SelectSize } from './select.types';

@Component({
  selector: 'ds-select',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class SelectComponent {
  private readonly overlay = inject(Overlay);
  private readonly vcr = inject(ViewContainerRef);

  readonly value = model<string>('');
  readonly options = input<SelectOption[]>([]);
  readonly placeholder = input<string>('');
  readonly size = input<SelectSize>('md');
  readonly label = input<string>('');
  readonly disabled = input<boolean>(false);
  readonly invalid = input<boolean>(false);
  readonly required = input<boolean>(false);
  readonly optional = input<boolean>(false);
  readonly name = input<string | null>(null);

  protected readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  protected readonly panelTpl = viewChild.required<TemplateRef<unknown>>('panel');
  protected readonly open = signal<boolean>(false);
  protected readonly activeIndex = signal<number>(-1);

  private overlayRef: OverlayRef | null = null;

  protected readonly selectedOption = computed<SelectOption | null>(() => {
    const current = this.value();
    const found = this.options().find((o) => o.value === current);
    return found ?? null;
  });

  protected readonly displayLabel = computed<string>(() => {
    return this.selectedOption()?.label ?? this.placeholder();
  });

  protected readonly hasValue = computed<boolean>(() => !!this.selectedOption());

  protected readonly triggerClasses = computed<string>(() => {
    const parts = ['dropdown'];
    if (this.size() === 'sm') parts.push('sm');
    if (this.size() === 'lg') parts.push('lg');
    if (this.disabled()) parts.push('disabled');
    if (this.invalid()) parts.push('error');
    if (this.open()) parts.push('open');
    return parts.join(' ');
  });

  constructor() {
    effect(() => {
      if (!this.open()) return;
      const idx = this.options().findIndex((o) => o.value === this.value());
      this.activeIndex.set(idx >= 0 ? idx : this.firstEnabledIndex());
    });
  }

  protected toggle(): void {
    if (this.disabled()) return;
    if (this.open()) {
      this.close();
    } else {
      this.openPanel();
    }
  }

  protected openPanel(): void {
    if (this.overlayRef) return;
    const triggerEl = this.trigger().nativeElement;
    const width = triggerEl.getBoundingClientRect().width;
    const positionStrategy = this.overlay.position()
      .flexibleConnectedTo(triggerEl)
      .withPositions([
        { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
        { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
      ]);
    const cfg: OverlayConfig = {
      positionStrategy,
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      // Reuse the global panel skin defined in styles/_dropdown-overlay.scss
      // so the portaled panel actually renders styled — `:host ::ng-deep`
      // selectors can't reach a node outside the host's DOM tree.
      panelClass: 'ds-dropdown-panel',
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
    this.overlayRef?.dispose();
    this.overlayRef = null;
    this.open.set(false);
    this.activeIndex.set(-1);
  }

  protected pick(option: SelectOption): void {
    if (option.disabled) return;
    this.value.set(option.value);
    this.close();
    this.trigger().nativeElement.focus();
  }

  protected isSelected(option: SelectOption): boolean {
    return option.value === this.value();
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (this.disabled()) return;
    const key = event.key;
    if (!this.open()) {
      if (key === 'ArrowDown' || key === 'ArrowUp' || key === 'Enter' || key === ' ') {
        event.preventDefault();
        this.openPanel();
      }
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
      const idx = this.activeIndex();
      const opt = this.options()[idx];
      if (opt) this.pick(opt);
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
    const opts = this.options();
    if (opts.length === 0) return;
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
    const opts = this.options();
    for (let i = 0; i < opts.length; i++) {
      const candidate = opts[i];
      if (candidate && !candidate.disabled) return i;
    }
    return -1;
  }

  private lastEnabledIndex(): number {
    const opts = this.options();
    for (let i = opts.length - 1; i >= 0; i--) {
      const candidate = opts[i];
      if (candidate && !candidate.disabled) return i;
    }
    return -1;
  }
}
