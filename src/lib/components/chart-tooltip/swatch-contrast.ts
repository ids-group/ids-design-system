// WCAG 1.4.11: a graphical object needs 3:1 against what it sits on to be seen.
const NON_TEXT_CONTRAST = 3;

let probe: CanvasRenderingContext2D | null = null;
const blendsByPair = new Map<string, boolean>();

// Painting the colour and reading the pixel back resolves any CSS colour syntax to sRGB -
// `oklch()`, `color-mix()` and named colours included - where parsing the string would not.
function srgbOf(color: string): readonly [number, number, number] {
  if (!probe) {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    probe = canvas.getContext('2d', { willReadFrequently: true });
  }
  if (!probe) {
    return [0, 0, 0];
  }
  probe.clearRect(0, 0, 1, 1);
  probe.fillStyle = color;
  probe.fillRect(0, 0, 1, 1);
  const [red, green, blue] = probe.getImageData(0, 0, 1, 1).data;

  return [red, green, blue];
}

function relativeLuminance([red, green, blue]: readonly [
  number,
  number,
  number,
]): number {
  const linear = (channel: number): number => {
    const value = channel / 255;

    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };

  return 0.2126 * linear(red) + 0.7152 * linear(green) + 0.0722 * linear(blue);
}

/** Whether a swatch of `color` sits on `ground` below the non-text contrast a graphical object
 *  needs, and so has to be ringed to be seen. Both are computed CSS colours. */
export function swatchBlendsInto(color: string, ground: string): boolean {
  const pair = `${color}|${ground}`;
  const known = blendsByPair.get(pair);
  if (known !== undefined) {
    return known;
  }
  const swatchLuminance = relativeLuminance(srgbOf(color));
  const groundLuminance = relativeLuminance(srgbOf(ground));
  const ratio =
    (Math.max(swatchLuminance, groundLuminance) + 0.05) /
    (Math.min(swatchLuminance, groundLuminance) + 0.05);
  const blends = ratio < NON_TEXT_CONTRAST;
  blendsByPair.set(pair, blends);

  return blends;
}
