import type { DsConfig } from '@ids-group-ltd/ids-design-system/core';
import type {
  ToastEntry,
  ToastOccurrence,
  ToastOptions,
  ToastVariant,
} from './toast.types';

/** @internal */
export function toastGroupKey(
  config: DsConfig['toast'],
  options: ToastOptions,
  variant: ToastVariant,
): string | undefined {
  if (!config?.groupDuplicates || variant === 'loading') {
    return undefined;
  }

  return (
    options.groupKey ??
    JSON.stringify([variant, options.title ?? '', options.body])
  );
}

/** @internal */
export function findToastStack(
  entries: readonly ToastEntry[],
  key: string,
): ToastEntry | undefined {
  return entries.find((entry) => entry.groupKey === key);
}

// Re-sending `durationMs` is what restarts the countdown in `ToastRegionComponent.update`.
/** @internal */
export function toastRepeatPatch(
  stack: ToastEntry,
  occurrence: ToastOccurrence,
): { occurrences: readonly ToastOccurrence[]; durationMs: number } {
  return {
    occurrences: [...(stack.occurrences ?? []), occurrence],
    durationMs: stack.durationMs,
  };
}

/** `null` when the closed occurrence was the last: the whole toast goes. @internal */
export function withoutToastOccurrence(
  entry: ToastEntry,
  occurrenceId: number,
): readonly ToastOccurrence[] | null {
  const left = (entry.occurrences ?? []).filter(
    (occurrence) => occurrence.id !== occurrenceId,
  );

  return left.length ? left : null;
}
