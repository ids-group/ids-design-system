/** Where a roving tabindex lands after `key`, or `null` when the key does not traverse.
 *
 *  The ends wrap, as they do in `ds-radio-group`: a chart's marks are a closed set, and Home and
 *  End are the direct way to either extreme.
 *
 *  @internal */
export function nextRovingIndex(
  key: string,
  current: number,
  count: number,
): number | null {
  if (!Number.isFinite(count) || count <= 0) {
    return null;
  }
  switch (key) {
    case 'ArrowRight':
    case 'ArrowDown':
      return (current + 1) % count;
    case 'ArrowLeft':
    case 'ArrowUp':
      return (current - 1 + count) % count;
    case 'Home':
      return 0;
    case 'End':
      return count - 1;
    default:
      return null;
  }
}

/** The mark `index` within `scope`. `within` narrows the search for a chart whose marks repeat the
 *  same index once per series.
 *
 *  @internal */
export function markAt(
  scope: Element | null,
  index: number,
  within = '',
): Element | null {
  return scope?.querySelector(`${within}[data-mark-index="${index}"]`) ?? null;
}

/** Moves DOM focus to the mark `index` within `scope`, which is what makes the roving tabindex a
 *  traversal rather than a state change nobody can see.
 *
 *  @internal */
export function focusMark(
  scope: Element | null,
  index: number,
  within = '',
): void {
  const target = markAt(scope, index, within);
  if (target instanceof HTMLElement || target instanceof SVGElement) {
    target.focus();
  }
}
