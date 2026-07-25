import * as React from 'react';
import { cx, host, nextControlId } from '../lib/util';
import { Icon } from '../lib/Icon';
import { FieldMessage, type FieldMessageState } from '../lib/FieldMessage';

// ---------------------------------------------------------------------------
// Colour utilities — ported verbatim from the DS's color-picker.utils.ts.
// Hue 0–360, saturation/value 0–100; hex is the public value.
// ---------------------------------------------------------------------------

interface Hsv {
  h: number;
  s: number;
  v: number;
}

function normalizeHex(hex: string): string | null {
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) {
    return null;
  }
  const body = match[1];
  const full =
    body.length === 3
      ? `${body[0]}${body[0]}${body[1]}${body[1]}${body[2]}${body[2]}`
      : body;
  return `#${full.toLowerCase()}`;
}

function hexToHsv(hex: string): Hsv | null {
  const normalized = normalizeHex(hex);
  if (!normalized) {
    return null;
  }
  const red = parseInt(normalized.slice(1, 3), 16) / 255;
  const green = parseInt(normalized.slice(3, 5), 16) / 255;
  const blue = parseInt(normalized.slice(5, 7), 16) / 255;

  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;

  let hue = 0;
  if (delta !== 0) {
    if (max === red) {
      hue = ((green - blue) / delta) % 6;
    } else if (max === green) {
      hue = (blue - red) / delta + 2;
    } else {
      hue = (red - green) / delta + 4;
    }
    hue = Math.round(hue * 60);
    if (hue < 0) {
      hue += 360;
    }
  }
  const saturation = max === 0 ? 0 : delta / max;

  return {
    h: hue,
    s: Math.round(saturation * 100),
    v: Math.round(max * 100),
  };
}

function hsvToHex({ h, s, v }: Hsv): string {
  const saturation = s / 100;
  const value = v / 100;
  const chroma = value * saturation;
  const second = chroma * (1 - Math.abs(((h / 60) % 2) - 1));
  const matchLightness = value - chroma;

  let red = 0;
  let green = 0;
  let blue = 0;
  if (h < 60) {
    red = chroma;
    green = second;
  } else if (h < 120) {
    red = second;
    green = chroma;
  } else if (h < 180) {
    green = chroma;
    blue = second;
  } else if (h < 240) {
    green = second;
    blue = chroma;
  } else if (h < 300) {
    red = second;
    blue = chroma;
  } else {
    red = chroma;
    blue = second;
  }

  const toHex = (channel: number): string =>
    Math.round((channel + matchLightness) * 255)
      .toString(16)
      .padStart(2, '0');

  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
}

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

export interface ColorPickerProps {
  /** Selected colour as a hex string. Controlled when `onValueChange` is
   *  provided; otherwise internal state seeded from this value. Default '#2F54FF'. */
  value?: string;
  /** Emits the new hex value on every change (drag, hex typing, preset pick). */
  onValueChange?: (value: string) => void;
  /** Swatches shown in the panel — defaults to a built-in palette. */
  presets?: readonly string[];
  /** Disables the trigger and blocks all interaction. */
  disabled?: boolean;
  /** Accessible name for the trigger button and panel. */
  ariaLabel?: string;
  /** Applies error styling and marks the trigger `aria-invalid`. */
  invalid?: boolean;
  /** Helper text shown below the trigger. */
  hint?: string;
  /** Panel open state. Controlled when `onOpenChange` is provided; otherwise
   *  the component manages its own state seeded from this value. The open
   *  panel renders INLINE inside the host (no portal). */
  open?: boolean;
  /** Emits the new open state when the panel opens or closes. */
  onOpenChange?: (open: boolean) => void;
}

/** Swatch trigger + Photoshop-style panel (saturation/value plane, hue slider,
 *  hex field, preset swatches) — port of `ds-color-picker`. The panel is a CDK
 *  overlay in Angular; this binding renders it inline inside the host — use
 *  the `open` prop to show it statically. The plane/hue gradients are pure
 *  CSS, so the open panel renders fully without scripts. */
export function ColorPicker({
  value,
  onValueChange,
  presets = DEFAULT_PRESETS,
  disabled = false,
  ariaLabel = 'Choose colour',
  invalid = false,
  hint = '',
  open,
  onOpenChange,
}: ColorPickerProps) {
  const [uid] = React.useState(() => nextControlId('ds-color-picker'));
  const hintId = hint ? `${uid}-hint` : undefined;
  const messageState: FieldMessageState = invalid ? 'error' : 'default';

  const [ownValue, setOwnValue] = React.useState(value ?? '#2F54FF');
  const val = onValueChange ? (value ?? '#2F54FF') : ownValue;
  const setVal = (v: string) => {
    if (!onValueChange) setOwnValue(v);
    onValueChange?.(v);
  };

  const [ownOpen, setOwnOpen] = React.useState(open ?? false);
  const isOpen = onOpenChange ? (open ?? false) : ownOpen;
  const setOpen = (next: boolean) => {
    if (!onOpenChange) setOwnOpen(next);
    onOpenChange?.(next);
  };

  // Working HSV state while the panel is open — the saturation/value plane and
  // the hue slider both manipulate this; the hex `value` is derived from it.
  const [hsv, setHsvState] = React.useState<Hsv>(
    () => hexToHsv(value ?? '#2F54FF') ?? { h: 0, s: 0, v: 0 },
  );
  const svDragging = React.useRef(false);
  const hueDragging = React.useRef(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  // Free-typed hex draft; null → show the normalised value.
  const [hexDraft, setHexDraft] = React.useState<string | null>(null);

  // Normalised hex for the trigger swatch + hex field.
  const displayHex = normalizeHex(val) ?? '#000000';
  // Pure-hue fill behind the saturation/value plane.
  const hueColor = hsvToHex({ h: hsv.h, s: 100, v: 100 });
  const svThumb = { left: hsv.s, top: 100 - hsv.v };
  const huePercent = (hsv.h / 360) * 100;

  const openPanel = (): void => {
    const parsed = hexToHsv(val);
    if (parsed) setHsvState(parsed);
    setOpen(true);
  };

  const close = (): void => {
    setOpen(false);
    setHexDraft(null);
  };

  const toggle = (): void => {
    if (disabled) return;
    if (isOpen) close();
    else openPanel();
  };

  const setHsv = (partial: Partial<Hsv>): void => {
    const next = { ...hsv, ...partial };
    setHsvState(next);
    setVal(hsvToHex(next));
  };

  const commitHex = (hex: string): void => {
    const parsed = hexToHsv(hex);
    if (parsed) {
      setHsvState(parsed);
      setVal(hsvToHex(parsed));
    }
  };

  const selectPreset = (hex: string): void => {
    commitHex(hex);
    close();
  };

  const isSelected = (hex: string): boolean => normalizeHex(hex) === displayHex;

  const onHexInput = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const text = event.target.value;
    setHexDraft(text);
    const parsed = hexToHsv(text);
    if (parsed) {
      setHsvState(parsed);
      setVal(hsvToHex(parsed));
    }
  };

  const clampPct = (v: number): number => Math.min(100, Math.max(0, v));

  // --- Saturation / value plane ---
  const updateSv = (event: React.PointerEvent, plane: HTMLElement): void => {
    const rect = plane.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const saturation = clampPct(((event.clientX - rect.left) / rect.width) * 100);
    const value = clampPct(100 - ((event.clientY - rect.top) / rect.height) * 100);
    setHsv({ s: Math.round(saturation), v: Math.round(value) });
  };

  const onSvPointerDown = (event: React.PointerEvent): void => {
    const plane = event.currentTarget as HTMLElement;
    plane.setPointerCapture(event.pointerId);
    svDragging.current = true;
    updateSv(event, plane);
  };

  const onSvPointerMove = (event: React.PointerEvent): void => {
    if (svDragging.current) updateSv(event, event.currentTarget as HTMLElement);
  };

  const onSvPointerUp = (event: React.PointerEvent): void => {
    if (!svDragging.current) return;
    const plane = event.currentTarget as HTMLElement;
    if (plane.hasPointerCapture(event.pointerId)) {
      plane.releasePointerCapture(event.pointerId);
    }
    svDragging.current = false;
  };

  const onSvKeydown = (event: React.KeyboardEvent): void => {
    const { s: saturation, v: value } = hsv;
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
    setHsv({ s: clampPct(nextSaturation), v: clampPct(nextValue) });
  };

  // --- Hue slider ---
  const updateHue = (event: React.PointerEvent, track: HTMLElement): void => {
    const rect = track.getBoundingClientRect();
    if (rect.width === 0) return;
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    setHsv({ h: Math.round(ratio * 360) });
  };

  const onHuePointerDown = (event: React.PointerEvent): void => {
    const track = event.currentTarget as HTMLElement;
    track.setPointerCapture(event.pointerId);
    hueDragging.current = true;
    updateHue(event, track);
  };

  const onHuePointerMove = (event: React.PointerEvent): void => {
    if (hueDragging.current) updateHue(event, event.currentTarget as HTMLElement);
  };

  const onHuePointerUp = (event: React.PointerEvent): void => {
    if (!hueDragging.current) return;
    const track = event.currentTarget as HTMLElement;
    if (track.hasPointerCapture(event.pointerId)) {
      track.releasePointerCapture(event.pointerId);
    }
    hueDragging.current = false;
  };

  const onHueKeydown = (event: React.KeyboardEvent): void => {
    const step = event.shiftKey ? 10 : 1;
    let next = hsv.h;
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
    setHsv({ h: (next + 360) % 360 });
  };

  const onPanelKeydown = (event: React.KeyboardEvent): void => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      triggerRef.current?.focus({ preventScroll: true });
    }
  };

  return host(
    'ds-color-picker',
    {
      // Angular host bindings: [class.open] / [class.disabled] / [class.invalid].
      class: cx(isOpen && 'open', disabled && 'disabled', invalid && 'invalid') || undefined,
    },
    <button
      ref={triggerRef}
      type="button"
      className="trigger"
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      aria-label={ariaLabel}
      aria-invalid={invalid ? 'true' : undefined}
      aria-describedby={hintId}
      disabled={disabled}
      onClick={toggle}
    >
      <span className="swatch" style={{ backgroundColor: displayHex }}></span>
      <span className="hex">{displayHex}</span>
      <Icon className="chevron" name="chevronDown" size={16} />
    </button>,
    <FieldMessage text={hint} state={messageState} messageId={hintId} />,
    // Inline panel — Angular portals this into a CDK overlay pane; the
    // `.panel` class carries the full panel skin, so in-flow rendering inside
    // the host needs no extra wrapper.
    isOpen && (
      <div className="panel" role="dialog" aria-label={ariaLabel} onKeyDown={onPanelKeydown}>
        <div
          className="sv-plane"
          tabIndex={0}
          aria-label="Saturation and brightness — use arrow keys to adjust"
          style={{ backgroundColor: hueColor }}
          onPointerDown={onSvPointerDown}
          onPointerMove={onSvPointerMove}
          onPointerUp={onSvPointerUp}
          onPointerCancel={onSvPointerUp}
          onKeyDown={onSvKeydown}
        >
          <span
            className="sv-thumb"
            style={{ left: `${svThumb.left}%`, top: `${svThumb.top}%` }}
          ></span>
        </div>

        <div
          className="hue-track"
          role="slider"
          tabIndex={0}
          aria-label="Hue"
          aria-valuemin={0}
          aria-valuemax={360}
          aria-valuenow={hsv.h}
          onPointerDown={onHuePointerDown}
          onPointerMove={onHuePointerMove}
          onPointerUp={onHuePointerUp}
          onPointerCancel={onHuePointerUp}
          onKeyDown={onHueKeydown}
        >
          <span className="hue-thumb" style={{ left: `${huePercent}%` }}></span>
        </div>

        <div className="fields">
          <span className="preview" style={{ backgroundColor: displayHex }}></span>

          <input
            type="text"
            className="hex-input"
            spellCheck={false}
            autoComplete="off"
            aria-label="Hex colour value"
            value={hexDraft ?? displayHex}
            onChange={onHexInput}
            onBlur={() => setHexDraft(null)}
          />
        </div>

        <div className="presets" role="group" aria-label="Preset colours">
          {presets.map((preset) => (
            <button
              key={preset}
              type="button"
              className={cx('preset', isSelected(preset) && 'selected')}
              style={{ backgroundColor: preset }}
              aria-label={preset}
              aria-pressed={isSelected(preset)}
              onClick={() => selectPreset(preset)}
            ></button>
          ))}
        </div>
      </div>
    ),
  );
}
