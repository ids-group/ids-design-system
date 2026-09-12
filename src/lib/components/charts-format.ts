const numberFormatters = new Map<string, Intl.NumberFormat>();

function numberFormatter(locale: string | undefined): Intl.NumberFormat {
  const key = locale ?? 'default';
  let formatter = numberFormatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale);
    numberFormatters.set(key, formatter);
  }

  return formatter;
}

export function formatValue(value: number, locale?: string): string {
  if (!Number.isFinite(value)) {
    return '—';
  }

  return numberFormatter(locale).format(value);
}

export function formatPercent(value: number, total: number): string {
  if (!total || !Number.isFinite(value) || !Number.isFinite(total)) {
    return '—';
  }

  return `${((value / total) * 100).toFixed(1)}%`;
}

/** Whole percentages that sum to exactly 100. Rounding each share on its own
 *  gives 33/33/33 for three equal parts, and a legend that visibly loses 1%. */
export function largestRemainder(values: readonly number[]): number[] {
  const total = values.reduce((sum, value) => sum + value, 0);
  if (!total) {
    return values.map(() => 0);
  }
  const exact = values.map((value) => (value / total) * 100);
  const floors = exact.map(Math.floor);
  let remaining = 100 - floors.reduce((sum, value) => sum + value, 0);
  const order = exact
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction);
  const result = [...floors];
  for (const { index } of order) {
    if (remaining <= 0) {
      break;
    }
    result[index]++;
    remaining--;
  }

  return result;
}

export function formatTick(value: number, step: number): string {
  if (!Number.isFinite(value)) {
    return '';
  }
  if (Math.abs(value) < 1000) {
    return String(value);
  }
  const thousands = value / 1000;

  return step % 1000 === 0 ? `${thousands}K` : `${thousands.toFixed(1)}K`;
}
