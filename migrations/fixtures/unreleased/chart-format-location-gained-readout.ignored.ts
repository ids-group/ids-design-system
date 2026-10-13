type Placement = 'tick' | 'tooltip';

const suffixes: Record<Placement, string> = { tick: '', tooltip: ' GBP' };

export function suffixFor(placement: Placement): string {
  return suffixes[placement];
}
