/** Hue 0–360, saturation/value 0–100 — the model the Photoshop-style picker
 *  manipulates. Hex is the public value; these convert between the two. */
export interface Hsv {
  h: number;
  s: number;
  v: number;
}

export function normalizeHex(hex: string): string | null {
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

export function hexToHsv(hex: string): Hsv | null {
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

export function hsvToHex({ h, s, v }: Hsv): string {
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
