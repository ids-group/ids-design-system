import type { DsConfig } from '@ids-group-ltd/ids-design-system/core';
import type {
  ToastEntry,
  ToastOccurrence,
  ToastOptions,
  ToastUpdate,
  ToastVariant,
} from './toast.types';

/** @internal */
export const TOAST_DEFAULT_DURATION_MS = 5000;

function toastTextKey(
  variant: ToastVariant,
  title: string | undefined,
  body: string,
): string {
  return JSON.stringify([variant, title ?? '', body]);
}

/** @internal */
export function toastGroupKey(
  config: DsConfig['toast'],
  options: ToastOptions,
  variant: ToastVariant,
): string | undefined {
  if (!config?.groupDuplicates || variant === 'loading') {
    return undefined;
  }

  return options.groupKey ?? toastTextKey(variant, options.title, options.body);
}

/** @internal */
export type ToastEntryPatch = Partial<
  Pick<
    ToastEntry,
    'title' | 'body' | 'variant' | 'dismissible' | 'durationMs' | 'groupKey'
  >
>;

/** `null` when the region no longer holds the toast. @internal */
export function toastUpdatePatch(
  current: ToastEntry | undefined,
  update: ToastUpdate,
): { patch: ToastEntryPatch; announce: boolean } | null {
  if (!current) {
    return null;
  }
  const variant = update.variant ?? current.variant;
  const title = update.title ?? current.title;
  const body = update.body ?? current.body;
  const neverExpires = variant === 'loading' || current.action !== undefined;
  const leavesLoading = current.variant === 'loading' && variant !== 'loading';
  const durationMs = neverExpires
    ? 0
    : (update.durationMs ??
      (leavesLoading ? TOAST_DEFAULT_DURATION_MS : current.durationMs));
  // Re-sending `durationMs` restarts the countdown, so a text-only change leaves it out.
  const restartsCountdown =
    update.durationMs !== undefined || durationMs !== current.durationMs;
  // A key derived from the old text would fold a later repeat of that text into this toast.
  const keyFollowsText =
    current.groupKey !== undefined &&
    current.groupKey ===
      toastTextKey(current.variant, current.title, current.body);
  const patch: ToastEntryPatch = {
    title,
    body,
    variant,
    dismissible:
      durationMs > 0 ? (update.dismissible ?? current.dismissible) : true,
    ...(restartsCountdown ? { durationMs } : {}),
    ...(keyFollowsText
      ? {
          groupKey:
            variant === 'loading'
              ? undefined
              : toastTextKey(variant, title, body),
        }
      : {}),
  };

  return {
    patch,
    announce:
      variant !== current.variant &&
      (variant === 'success' || variant === 'error'),
  };
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
