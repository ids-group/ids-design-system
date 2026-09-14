import {
  Component,
  ElementRef,
  type OnDestroy,
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
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { IconComponent } from '@ids-group-ltd/ids-design-system/icons';
import { DsOverlayCloseRef } from '@ids-group-ltd/ids-design-system/overlay';
import { DsControlValueAccessor } from '@ids-group-ltd/ids-design-system/components';
import { FieldMessageComponent } from '@ids-group-ltd/ids-design-system/components/field-message';
import {
  resolveFieldMessage,
  trimmedText,
} from '@ids-group-ltd/ids-design-system/components';
import { nextControlId } from '@ids-group-ltd/ids-design-system/components';
import {
  clearOnDetach,
  closeOnOutsidePointer,
  closeOnScroll,
  disposeWithLeave,
  type DsOverlayCloseCause,
  focusIsInside,
  forwardOverlayTokens,
  dropdownOverlay,
  panelClassesOf,
  prepareOverlayEnter,
} from '@ids-group-ltd/ids-design-system/components';
import {
  type Hsv,
  hexToHsv,
  hsvToHex,
  normalizeHex,
} from './color-picker.utils';

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
  imports: [IconComponent, FieldMessageComponent],
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
    '[attr.data-field-state]': 'controlState()',
    '[class.open]': 'open()',
    '[class.disabled]': 'isDisabled()',
  },
})
export class ColorPickerComponent
  extends DsControlValueAccessor<string>
  implements DsOverlayCloseRef, OnDestroy
{
  private readonly overlay = inject(Overlay);
  private readonly vcr = inject(ViewContainerRef);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  /** Public panel tokens forwarded onto the portaled overlay pane on open so
   *  a consumer's `ds-color-picker { --ds-color-picker-panel-*: … }` reaches it. */
  private readonly panelTokens = [
    '--ds-color-picker-swatch',
    '--ds-color-picker-preview',
    '--ds-color-picker-panel-w',
    '--ds-color-picker-sv-h',
    '--ds-color-picker-hue-h',
    '--ds-color-picker-thumb',
  ];

  /** Selected colour as a hex string, two-way bound. */
  readonly value = model<string>('#2F54FF');
  /** Swatches shown in the panel — defaults to a built-in palette. */
  readonly presets = input<readonly string[]>(DEFAULT_PRESETS);
  /** Extra classes for the portaled panel, beside `ds-dropdown-panel`,
   *  `ds-overlay-pane` and this component's own `ds-color-picker-panel`. The panel
   *  is portaled out of the host, so a class on the pane is the only way a consumer
   *  stylesheet reaches ONE instance of it. */
  readonly panelClass = input<string | readonly string[]>([]);
  /** Disables the trigger and blocks all interaction. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Accessible name for the trigger button and panel. */
  readonly ariaLabel = input<string>('Choose colour');
  /** Confirmation text, shown when there is no error or warning — and it paints
   *  the field's success border. A string like `warning`: the text IS the state. */
  readonly success = input<string, string | null | undefined>('', {
    transform: trimmedText,
  });

  protected readonly trigger =
    viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  protected readonly panelTpl =
    viewChild.required<TemplateRef<unknown>>('panel');
  protected readonly open = signal(false);

  // Working HSV state while the panel is open — the saturation/value plane and
  // the hue slider both manipulate this; the hex `value` is derived from it.
  protected readonly hsv = signal<Hsv>(
    hexToHsv('#2F54FF') ?? { h: 0, s: 0, v: 0 },
  );

  private overlayRef: OverlayRef | null = null;
  private svDragging = false;
  private hueDragging = false;

  ngOnDestroy(): void {
    // Host torn down while open → close() never runs. Dispose the overlay so
    // its pane and event subscriptions don't leak.
    this.overlayRef?.dispose();
    this.overlayRef = null;
  }

  protected readonly uid = nextControlId('ds-color-picker');
  protected readonly hintId = computed(() =>
    this.message().text ? `${this.uid}-hint` : null,
  );
  private readonly fieldMessage = resolveFieldMessage({
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
  protected readonly controlState = this.fieldMessage.controlState;
  protected readonly invalidResolved = this.fieldMessage.invalid;

  protected readonly isDisabled = computed(
    () => this.disabled() || this.formDisabled(),
  );

  // Normalised hex for the trigger swatch + hex field.
  protected readonly displayHex = computed(
    () => normalizeHex(this.value()) ?? '#000000',
  );

  // Pure-hue fill behind the saturation/value plane.
  protected readonly hueColor = computed(() =>
    hsvToHex({ h: this.hsv().h, s: 100, v: 100 }),
  );

  protected readonly svThumb = computed(() => {
    const { s: saturation, v: value } = this.hsv();

    return { left: saturation, top: 100 - value };
  });

  protected readonly huePercent = computed(() => (this.hsv().h / 360) * 100);

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
    this.commitHex(hex);
    this.close();
  }

  protected isSelected(hex: string): boolean {
    return normalizeHex(hex) === this.displayHex();
  }

  protected onHexInput(event: Event): void {
    const parsed = hexToHsv((event.target as HTMLInputElement).value);
    if (parsed) {
      this.hsv.set(parsed);
      this.value.set(hsvToHex(parsed));
    }
  }

  protected onSvPointerDown(event: PointerEvent): void {
    const plane = event.currentTarget as HTMLElement;
    plane.setPointerCapture(event.pointerId);
    this.svDragging = true;
    this.updateSv(event, plane);
  }

  protected onSvPointerMove(event: PointerEvent): void {
    if (this.svDragging) {
      this.updateSv(event, event.currentTarget as HTMLElement);
    }
  }

  protected onSvPointerUp(event: PointerEvent): void {
    if (!this.svDragging) {
      return;
    }
    const plane = event.currentTarget as HTMLElement;
    if (plane.hasPointerCapture(event.pointerId)) {
      plane.releasePointerCapture(event.pointerId);
    }
    this.svDragging = false;
  }

  protected onSvKeydown(event: KeyboardEvent): void {
    const { s: saturation, v: value } = this.hsv();
    const step = event.shiftKey ? 10 : 1;
    let nextSaturation = saturation;
    let nextValue = value;
    switch (event.key) {
      case 'ArrowRight':
        nextSaturation = saturation + step;
        break;
      case 'ArrowLeft':
        nextSaturation = saturation - step;
        break;
      case 'ArrowUp':
        nextValue = value + step;
        break;
      case 'ArrowDown':
        nextValue = value - step;
        break;
      default:
        return;
    }
    event.preventDefault();
    this.setHsv({
      s: this.clampPct(nextSaturation),
      v: this.clampPct(nextValue),
    });
  }

  protected onHuePointerDown(event: PointerEvent): void {
    const track = event.currentTarget as HTMLElement;
    track.setPointerCapture(event.pointerId);
    this.hueDragging = true;
    this.updateHue(event, track);
  }

  protected onHuePointerMove(event: PointerEvent): void {
    if (this.hueDragging) {
      this.updateHue(event, event.currentTarget as HTMLElement);
    }
  }

  protected onHuePointerUp(event: PointerEvent): void {
    if (!this.hueDragging) {
      return;
    }
    const track = event.currentTarget as HTMLElement;
    if (track.hasPointerCapture(event.pointerId)) {
      track.releasePointerCapture(event.pointerId);
    }
    this.hueDragging = false;
  }

  protected onHueKeydown(event: KeyboardEvent): void {
    const step = event.shiftKey ? 10 : 1;
    let next = this.hsv().h;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        next += step;
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        next -= step;
        break;
      default:
        return;
    }
    event.preventDefault();
    this.setHsv({ h: (next + 360) % 360 });
  }

  private openPanel(): void {
    if (this.overlayRef) {
      return;
    }
    const parsed = hexToHsv(this.value());
    if (parsed) {
      this.hsv.set(parsed);
    }
    const { positionStrategy, config } = dropdownOverlay(
      this.overlay,
      this.host.nativeElement,
      ['ds-color-picker-panel', ...panelClassesOf(this.panelClass())],
    );
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
    // No backdrop catches a page scroll and CDK's scroll strategies miss a plain
    // overflow container, so close on any outside scroll ourselves.
    const removeScrollClose = closeOnScroll(this.overlayRef, () =>
      this.close('dismiss'),
    );
    clearOnDetach(this.overlayRef, {
      current: () => this.overlayRef,
      always: removeScrollClose,
      clear: () => {
        this.overlayRef = null;
        this.open.set(false);
      },
    });
    this.overlayRef.keydownEvents().subscribe((event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        this.close('dismiss');
      }
    });
    this.overlayRef.attach(new TemplatePortal(this.panelTpl(), this.vcr));
    this.open.set(true);
  }

  close(cause: DsOverlayCloseCause = 'select'): void {
    if (!this.overlayRef) {
      return;
    }
    const focusWasInPanel = focusIsInside(this.overlayRef);
    disposeWithLeave(this.overlayRef, cause);
    this.overlayRef = null;
    this.open.set(false);
    this.markTouched();
    if (focusWasInPanel) {
      this.trigger().nativeElement.focus({ preventScroll: true });
    }
  }

  private setHsv(partial: Partial<Hsv>): void {
    const next = { ...this.hsv(), ...partial };
    this.hsv.set(next);
    this.value.set(hsvToHex(next));
  }

  private commitHex(hex: string): void {
    const parsed = hexToHsv(hex);
    if (parsed) {
      this.hsv.set(parsed);
      this.value.set(hsvToHex(parsed));
    }
  }

  private updateSv(event: PointerEvent, plane: HTMLElement): void {
    const rect = plane.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      return;
    }
    const saturation = this.clampPct(
      ((event.clientX - rect.left) / rect.width) * 100,
    );
    const value = this.clampPct(
      100 - ((event.clientY - rect.top) / rect.height) * 100,
    );
    this.setHsv({ s: Math.round(saturation), v: Math.round(value) });
  }

  private updateHue(event: PointerEvent, track: HTMLElement): void {
    const rect = track.getBoundingClientRect();
    if (rect.width === 0) {
      return;
    }
    const ratio = Math.min(
      1,
      Math.max(0, (event.clientX - rect.left) / rect.width),
    );
    this.setHsv({ h: Math.round(ratio * 360) });
  }

  private clampPct(value: number): number {
    return Math.min(100, Math.max(0, value));
  }
}
