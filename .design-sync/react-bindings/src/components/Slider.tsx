import * as React from 'react';
import { cx, host, nextControlId } from '../lib/util';
import { FieldMessage, type FieldMessageState } from '../lib/FieldMessage';

export type SliderValue = number | readonly [number, number];

export interface SliderProps {
  /** Current value, or `[low, high]` when `range`. Controlled when
   *  `onValueChange` is provided; otherwise the component manages its own
   *  state seeded from this value. */
  value?: SliderValue;
  /** Emits the new value while dragging or nudging with the keyboard. */
  onValueChange?: (value: SliderValue) => void;
  /** Minimum selectable value. */
  min?: number;
  /** Maximum selectable value. */
  max?: number;
  /** Increment applied when dragging (snap) or nudging with arrow keys. */
  step?: number;
  /** Two-thumb range mode — `value` becomes a `[low, high]` tuple. */
  range?: boolean;
  /** Disables the slider and blocks all interaction. */
  disabled?: boolean;
  /** Accessible name for the thumb(s) — suffixed "minimum"/"maximum" in `range` mode. */
  ariaLabel?: string;
  /** Applies error styling. */
  invalid?: boolean;
  /** Helper text shown below the slider. */
  hint?: string;
}

/** Horizontal value slider — port of `ds-slider`. Single thumb by default,
 *  two thumbs with `range`. The filled track segment is positioned with
 *  inline left/width percentages computed from value/min/max (same logic as
 *  the Angular component's `fill()` style bindings). */
export function Slider({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  range = false,
  disabled = false,
  ariaLabel,
  invalid = false,
  hint = '',
}: SliderProps) {
  const [uid] = React.useState(() => nextControlId('ds-slider'));
  const hintId = hint ? `${uid}-hint` : undefined;
  const messageState: FieldMessageState = invalid ? 'error' : 'default';

  const defaultValue: SliderValue = range ? [min, min] : 0;
  const [ownValue, setOwnValue] = React.useState<SliderValue>(value ?? defaultValue);
  const val = onValueChange ? (value ?? defaultValue) : ownValue;
  const setVal = (v: SliderValue) => {
    if (!onValueChange) setOwnValue(v);
    onValueChange?.(v);
  };

  const trackRef = React.useRef<HTMLDivElement>(null);
  const dragging = React.useRef(-1);

  const thumbValues: number[] = range
    ? [...(val as readonly [number, number])]
    : [val as number];

  const percent = (v: number): number =>
    max === min ? 0 : ((v - min) / (max - min)) * 100;

  // Filled segment: 0→value for single, low→high for range.
  const fill = range
    ? {
        left: percent(thumbValues[0]),
        width: percent(thumbValues[1]) - percent(thumbValues[0]),
      }
    : { left: 0, width: percent(thumbValues[0]) };

  const thumbMin = (index: number): number =>
    range && index === 1 ? thumbValues[0] : min;
  const thumbMax = (index: number): number =>
    range && index === 0 ? thumbValues[1] : max;

  const snap = (raw: number): number => {
    const s = step || 1;
    const snapped = Math.round((raw - min) / s) * s + min;
    return Math.min(max, Math.max(min, snapped));
  };

  const setThumb = (index: number, next: number) => {
    if (range) {
      const [low, high] = thumbValues;
      setVal(index === 0 ? [Math.min(next, high), high] : [low, Math.max(next, low)]);
    } else {
      setVal(next);
    }
  };

  const valueFromClientX = (clientX: number): number => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return min;
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    return min + ratio * (max - min);
  };

  const nearestThumb = (clientX: number): number => {
    if (!range) return 0;
    const v = valueFromClientX(clientX);
    const [low, high] = thumbValues;
    return Math.abs(v - low) <= Math.abs(v - high) ? 0 : 1;
  };

  const onTrackPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    const track = trackRef.current;
    if (!track) return;
    track.setPointerCapture(event.pointerId);
    dragging.current = nearestThumb(event.clientX);
    setThumb(dragging.current, snap(valueFromClientX(event.clientX)));
    track.querySelectorAll<HTMLElement>('.thumb')[dragging.current]?.focus();
  };

  const onTrackPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragging.current < 0) return;
    setThumb(dragging.current, snap(valueFromClientX(event.clientX)));
  };

  // Bound to both pointerup and pointercancel — touch interventions (scroll
  // takeover, stylus lift) fire pointercancel, and without it the drag state
  // would leak and keep moving the thumb with no pointer down.
  const onTrackPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragging.current < 0) return;
    const track = trackRef.current;
    if (track?.hasPointerCapture(event.pointerId)) {
      track.releasePointerCapture(event.pointerId);
    }
    dragging.current = -1;
  };

  const thumbAriaLabel = (index: number): string | undefined => {
    if (!range) return ariaLabel;
    if (index === 0) return ariaLabel ? `${ariaLabel} minimum` : 'Minimum';
    return ariaLabel ? `${ariaLabel} maximum` : 'Maximum';
  };

  const onThumbKeydown = (event: React.KeyboardEvent<HTMLSpanElement>, index: number) => {
    if (disabled) return;
    const s = step || 1;
    let delta = 0;
    let absolute: number | null = null;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        delta = s;
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        delta = -s;
        break;
      case 'PageUp':
        delta = s * 10;
        break;
      case 'PageDown':
        delta = -s * 10;
        break;
      case 'Home':
        absolute = thumbMin(index);
        break;
      case 'End':
        absolute = thumbMax(index);
        break;
      default:
        return;
    }
    event.preventDefault();
    const current = thumbValues[index];
    setThumb(index, absolute ?? snap(current + delta));
  };

  return host(
    'ds-slider',
    {
      class:
        cx(range && 'range', disabled && 'disabled', invalid && 'invalid') || undefined,
    },
    <div
      ref={trackRef}
      className="track"
      onPointerDown={onTrackPointerDown}
      onPointerMove={onTrackPointerMove}
      onPointerUp={onTrackPointerUp}
      onPointerCancel={onTrackPointerUp}
    >
      <span
        className="fill"
        style={{ left: `${fill.left}%`, width: `${fill.width}%` }}
      />
      {thumbValues.map((thumbValue, i) => (
        <span
          key={i}
          className="thumb"
          role="slider"
          tabIndex={disabled ? -1 : 0}
          style={{ left: `${percent(thumbValue)}%` }}
          aria-valuemin={thumbMin(i)}
          aria-valuemax={thumbMax(i)}
          aria-valuenow={thumbValue}
          aria-orientation="horizontal"
          aria-label={thumbAriaLabel(i)}
          aria-disabled={disabled ? 'true' : undefined}
          aria-invalid={invalid ? 'true' : undefined}
          aria-describedby={hintId}
          onKeyDown={(e) => onThumbKeydown(e, i)}
        />
      ))}
    </div>,
    <FieldMessage text={hint} state={messageState} messageId={hintId} />,
  );
}
