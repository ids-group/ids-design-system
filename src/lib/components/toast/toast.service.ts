import { ComponentRef, DestroyRef, Injectable, inject } from '@angular/core';
import {
  Overlay,
  OverlayRef,
  GlobalPositionStrategy,
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import {
  DS_CONFIG,
  DS_INTL,
  DS_INTL_DEFAULTS,
  addDevWarningSink,
} from '@ids-group-ltd/ids-design-system/core';
import { ToastRegionComponent } from './toast-region.component';
import { DS_TOAST_POSITION_DEFAULT } from './toast.config';
import {
  TOAST_DEFAULT_DURATION_MS,
  toastGroupKey,
  toastRepeatPatch,
  toastUpdatePatch,
} from './toast-group';
import type {
  ToastEntry,
  ToastVariant,
  ToastOptions,
  ToastPromiseMessages,
  ToastRef,
  ToastUpdate,
} from './toast.types';

const SETTLED_SUCCESS_MS = 4000;
const SETTLED_ERROR_MS = 6000;

// Must outlast the loop that fires a burst.
const ANNOUNCE_COALESCE_MS = 120;
const DEV_WARNING_MS = 10000;

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly overlay = inject(Overlay);
  private readonly toastConfig = inject(DS_CONFIG).toast;
  private readonly announcer = inject(LiveAnnouncer);
  private readonly intl = inject(DS_INTL);
  private overlayRef: OverlayRef | null = null;
  private regionRef: ComponentRef<ToastRegionComponent> | null = null;
  private nextId = 1;
  // Keyed so a burst of repeats of one stack leaves only its latest count to speak.
  private readonly pendingAnnouncements = new Map<unknown, string>();
  private pendingAssertive = false;
  private announceTimer: number | undefined;
  private scrimWatcher: MutationObserver | null = null;

  constructor() {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      if (this.toastConfig?.mirrorDevWarnings ?? true) {
        // Deferred: a warning raised inside an effect or a render hook must not build the toast region there.
        const unregister = addDevWarningSink((message) =>
          setTimeout(() =>
            this.show({
              title: 'Dev warning',
              body: message,
              variant: 'warning',
              durationMs: DEV_WARNING_MS,
            }),
          ),
        );
        inject(DestroyRef).onDestroy(unregister);
      }
    }
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.announceTimer);
      this.scrimWatcher?.disconnect();
      this.overlayRef?.dispose();
      this.overlayRef = null;
      this.regionRef = null;
    });
  }

  show(opts: ToastOptions): ToastRef {
    this.ensureRegion();
    const id = this.nextId++;
    const variant = opts.variant ?? 'info';
    const groupKey = toastGroupKey(this.toastConfig, opts, variant);
    const occurrence = { id, body: opts.body, at: Date.now() };
    const stack =
      groupKey === undefined
        ? undefined
        : this.regionRef!.instance.stackFor(groupKey);
    if (stack) {
      const patch = toastRepeatPatch(stack, occurrence);
      this.regionRef!.instance.update(stack.id, patch);
      const repeated =
        this.intl().toast.repeated ?? DS_INTL_DEFAULTS.toast.repeated;
      const message = [stack.title, stack.body].filter(Boolean).join('. ');
      this.announce(
        variant,
        repeated(message, patch.occurrences.length),
        undefined,
        groupKey,
      );

      return this.refFor(stack.id);
    }
    // An `action` toast cannot expire: the region is the last child of `body`, so a
    // keyboard user cannot reach the button in time.
    const durationMs =
      variant === 'loading' || opts.action
        ? 0
        : (opts.durationMs ?? TOAST_DEFAULT_DURATION_MS);
    const entry: ToastEntry = {
      id,
      title: opts.title,
      body: opts.body,
      variant,
      // Nothing that cannot expire may also be unclosable, or it holds a slot for the page's life.
      dismissible: durationMs > 0 ? (opts.dismissible ?? true) : true,
      action: opts.action,
      durationMs,
      ...(groupKey === undefined
        ? {}
        : { groupKey, occurrences: [occurrence] }),
    };
    // The region runs the countdown: a toast queued behind `maxVisible` would expire unseen if started here.
    this.regionRef!.instance.add(entry);
    this.announce(variant, entry.body, entry.title, groupKey);

    return this.refFor(id);
  }

  private refFor(id: number): ToastRef {
    return {
      id,
      dismiss: () => this.regionRef?.instance.remove(id),
      update: (patch) => this.updateToast(id, patch),
    };
  }

  private updateToast(id: number, update: ToastUpdate): void {
    const region = this.regionRef?.instance;
    const current = region?.entryFor(id);
    const planned = toastUpdatePatch(current, update);
    if (!region || !current || !planned) {
      return;
    }
    region.update(id, planned.patch);
    if (planned.announce) {
      const next = { ...current, ...planned.patch };
      this.announce(next.variant, next.body, next.title);
    }
  }

  /** Shows a loading toast for the duration of `source`; resolution and rejection turn the
   *  same toast into a success/error variant with its own auto-dismiss delay.
   *
   *  Returns `source` itself, so the caller still owns rejection handling. */
  promise<T>(
    source: Promise<T>,
    messages: ToastPromiseMessages<T>,
  ): Promise<T> {
    const ref = this.show({
      body: messages.loading,
      variant: 'loading',
      durationMs: 0,
    });

    source.then(
      (value) => {
        const successBody =
          typeof messages.success === 'function'
            ? messages.success(value)
            : messages.success;
        ref.update({
          body: successBody,
          variant: 'success',
          durationMs: SETTLED_SUCCESS_MS,
        });
      },
      (reason: unknown) => {
        const errorBody =
          typeof messages.error === 'function'
            ? messages.error(reason)
            : messages.error;
        ref.update({
          body: errorBody,
          variant: 'error',
          durationMs: SETTLED_ERROR_MS,
        });
      },
    );

    return source;
  }

  /** The announcement must NOT ride the visual toast: `aria-live` on an element created
   *  together with its text announces nothing in NVDA or JAWS.
   *
   *  Serialising a burst does not work either: `announce()` clears the region and writes
   *  on a timeout, so the next message wipes the previous one. One region change carrying
   *  every message is the only shape that survives. */
  private announce(
    variant: ToastVariant,
    body: string,
    title?: string,
    key: unknown = Symbol(),
  ): void {
    const spoken = [title, body].filter(Boolean).join('. ');
    if (!spoken) {
      return;
    }
    this.pendingAnnouncements.set(key, spoken);
    if (variant === 'error' || variant === 'warning') {
      this.pendingAssertive = true;
    }
    clearTimeout(this.announceTimer);
    this.announceTimer = window.setTimeout(() => {
      const message = [...this.pendingAnnouncements.values()].join('. ');
      const politeness = this.pendingAssertive ? 'assertive' : 'polite';
      this.pendingAnnouncements.clear();
      this.pendingAssertive = false;
      this.announcer.announce(message, politeness);
    }, ANNOUNCE_COALESCE_MS);
  }

  dismissAll(): void {
    this.regionRef?.instance.clear();
  }

  private ensureRegion(): void {
    if (this.overlayRef) {
      return;
    }
    this.overlayRef = this.overlay.create({
      hasBackdrop: false,
      panelClass: 'ds-toast-panel',
      positionStrategy: this.buildPositionStrategy(),
    });
    this.regionRef = this.overlayRef.attach(
      new ComponentPortal(ToastRegionComponent),
    );
    // `>= 0`, not truthiness: 0 asks for an uncapped stack and must not read as "unset".
    const maxVisible = this.toastConfig?.maxVisible;
    if (typeof maxVisible === 'number' && maxVisible >= 0) {
      this.regionRef.setInput('maxVisible', maxVisible);
    }
    const showQueueCount = this.toastConfig?.showQueueCount;
    if (typeof showQueueCount === 'boolean') {
      this.regionRef.setInput('showQueueCount', showQueueCount);
    }
    this.keepAboveScrims();
  }

  /** Keeps the toast above a scrim opened AFTER it. `--layer-toast` cannot: CDK overlay hosts
   *  are `popover="manual"` and the top layer paints in show order, ignoring z-index.
   *  Scrimmed overlays only: `--layer-tooltip` sits above the toast. */
  private keepAboveScrims(): void {
    const host = this.overlayRef?.hostElement;
    const container = host?.parentElement;
    if (!host || !container || typeof host.showPopover !== 'function') {
      return;
    }
    this.scrimWatcher = new MutationObserver((records) => {
      const scrimAppeared = records.some((record) =>
        [...record.addedNodes].some(
          (node) =>
            node instanceof HTMLElement &&
            node !== host &&
            (node.classList.contains('cdk-overlay-backdrop') ||
              node.querySelector?.('.cdk-overlay-backdrop')),
        ),
      );
      if (!scrimAppeared || !host.isConnected) {
        return;
      }
      // The top layer has no "raise"; re-showing is the only lever.
      try {
        host.hidePopover();
        host.showPopover();
      } catch {
        // The host may not be showing, and hidePopover() throws when it is not.
      }
    });
    this.scrimWatcher.observe(container, { childList: true, subtree: true });
  }

  private buildPositionStrategy(): GlobalPositionStrategy {
    const config = {
      ...DS_TOAST_POSITION_DEFAULT,
      ...this.toastConfig?.position,
    };
    const strategy = this.overlay.position().global();
    if (config.verticalPosition === 'top') {
      strategy.top(config.offset);
    } else {
      strategy.bottom(config.offset);
    }
    if (config.horizontalPosition === 'left') {
      strategy.left(config.offset);
    } else if (config.horizontalPosition === 'right') {
      strategy.right(config.offset);
    } else {
      strategy.centerHorizontally();
    }

    return strategy;
  }
}
