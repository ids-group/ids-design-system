import {
  Component,
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
  signal,
  viewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { IconComponent } from '../../icons/icon.component';
import { DsOverlayCloseRef } from '../../overlay/ds-overlay-close-ref';
import { DsControlValueAccessor } from '../control-value-accessor';
import { disposeWithLeave } from '../overlay-motion';

const DEFAULT_PRESETS: readonly string[] = [
  '#2F54FF',
  '#0EA5E9',
  '#16A34A',
  '#EAB308',
  '#F97316',
  '#EF4444',
  '#EC4899',
  '#8B5CF6',
  '#6B7280',
  '#111827',
  '#FFFFFF',
];

@Component({
  selector: 'ds-color-picker',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './color-picker.component.html',
  styleUrl: './color-picker.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ColorPickerComponent),
      multi: true,
    },
    {
      provide: DsOverlayCloseRef,
      useExisting: forwardRef(() => ColorPickerComponent),
    },
  ],
  host: {
    '[class.open]': 'open()',
    '[class.disabled]': 'isDisabled()',
  },
})
export class ColorPickerComponent
  extends DsControlValueAccessor<string>
  implements DsOverlayCloseRef
{
  private readonly overlay = inject(Overlay);
  private readonly vcr = inject(ViewContainerRef);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly value = model<string>('#2F54FF');
  readonly presets = input<readonly string[]>(DEFAULT_PRESETS);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly ariaLabel = input<string>('Choose colour');

  protected readonly trigger =
    viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  protected readonly panelTpl =
    viewChild.required<TemplateRef<unknown>>('panel');
  protected readonly open = signal(false);

  private overlayRef: OverlayRef | null = null;

  protected readonly isDisabled = computed(
    () => this.disabled() || this.formDisabled(),
  );

  // Six-digit hex for the native <input type="color">, which rejects shorthand.
  protected readonly sixDigitHex = computed(() =>
    this.toSixDigit(this.value()),
  );

  protected toggle(): void {
    if (this.isDisabled()) {
      return;
    }
    if (this.open()) {
      this.close();
    } else {
      this.openPanel();
    }
  }

  protected selectPreset(hex: string): void {
    this.value.set(hex);
    this.close();
  }

  protected isSelected(hex: string): boolean {
    return hex.toLowerCase() === this.value().toLowerCase();
  }

  protected onHexInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value.trim();
    const normalized = raw.startsWith('#') ? raw : `#${raw}`;
    if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(normalized)) {
      this.value.set(normalized);
    }
  }

  protected onNativeInput(event: Event): void {
    this.value.set((event.target as HTMLInputElement).value);
  }

  private openPanel(): void {
    if (this.overlayRef) {
      return;
    }
    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.host.nativeElement)
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
  }

  close(): void {
    if (!this.overlayRef) {
      return;
    }
    disposeWithLeave(this.overlayRef);
    this.overlayRef = null;
    this.open.set(false);
    this.markTouched();
    this.trigger().nativeElement.focus();
  }

  private toSixDigit(hex: string): string {
    const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
    if (!match) {
      return '#000000';
    }
    const body = match[1];
    if (body.length === 3) {
      return `#${body[0]}${body[0]}${body[1]}${body[1]}${body[2]}${body[2]}`;
    }

    return `#${body}`;
  }
}
