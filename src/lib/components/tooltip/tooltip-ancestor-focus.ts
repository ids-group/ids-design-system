const NATIVELY_FOCUSABLE = 'a[href], button, input, select, textarea, summary';
export const FOCUSABLE = `${NATIVELY_FOCUSABLE}, [tabindex]`;
const KEYBOARD_FOCUSABLE = `${NATIVELY_FOCUSABLE}, [tabindex]:not([tabindex^="-"])`;
const WIDGET_ROLES = [
  'button',
  'link',
  'tab',
  'option',
  'menuitem',
  'menuitemcheckbox',
  'menuitemradio',
  'row',
  'gridcell',
  'combobox',
  'checkbox',
  'radio',
  'switch',
  'treeitem',
]
  .map((role) => `[role="${role}"]`)
  .join(', ');
const INTERACTIVE = `${NATIVELY_FOCUSABLE}, tr:not([role]), ${WIDGET_ROLES}`;
// A widget role owns its focus (a listbox moves it by `aria-activedescendant`), and a hidden subtree must hold no tab stop.
const REACHED_OR_HIDDEN = `${NATIVELY_FOCUSABLE}, tr[tabindex]:not([role]), ${WIDGET_ROLES}, [aria-hidden="true"], [inert]`;

export interface AncestorFocusTrigger {
  readonly host: HTMLElement;
  isClipped(): boolean;
  openFor(ancestor: HTMLElement): void;
  close(): void;
}

const clippedHostsByAncestor = new WeakMap<
  HTMLElement,
  Set<AncestorFocusTrigger>
>();

function firstClippedHost(
  triggers: Set<AncestorFocusTrigger>,
): AncestorFocusTrigger | undefined {
  return [...triggers]
    .sort((a, b) =>
      a.host.compareDocumentPosition(b.host) & Node.DOCUMENT_POSITION_FOLLOWING
        ? -1
        : 1,
    )
    .find((trigger) => trigger.isClipped());
}

/**
 * A clipped host that is not focusable itself opens its tip when its focusable ancestor takes
 * keyboard focus. `:focus-visible` keeps a click from opening it. Only the first clipped host of
 * one ancestor opens. Returns the teardown, or null when the host needs no listening.
 */
export function watchFocusableAncestor(
  trigger: AncestorFocusTrigger,
): (() => void) | null {
  const host = trigger.host;
  if (host.matches(FOCUSABLE)) {
    return null;
  }
  const ancestor = host.parentElement?.closest<HTMLElement>(FOCUSABLE);
  if (!ancestor?.matches(INTERACTIVE)) {
    return null;
  }
  let triggers = clippedHostsByAncestor.get(ancestor);
  if (!triggers) {
    triggers = new Set();
    clippedHostsByAncestor.set(ancestor, triggers);
  }
  triggers.add(trigger);
  const open = (event: FocusEvent) => {
    if (
      event.target !== ancestor ||
      // Tested here, not at registration: a disabled trigger carries tabindex="-1" until enabled.
      !ancestor.matches(KEYBOARD_FOCUSABLE) ||
      !ancestor.matches(':focus-visible') ||
      firstClippedHost(triggers) !== trigger
    ) {
      return;
    }
    trigger.openFor(ancestor);
  };
  const close = () => trigger.close();
  ancestor.addEventListener('focusin', open);
  ancestor.addEventListener('focusout', close);
  ancestor.addEventListener('click', close);
  ancestor.addEventListener('keydown', close);

  return () => {
    triggers.delete(trigger);
    ancestor.removeEventListener('focusin', open);
    ancestor.removeEventListener('focusout', close);
    ancestor.removeEventListener('click', close);
    ancestor.removeEventListener('keydown', close);
  };
}

interface TabStopSync {
  isNeeded(): boolean;
  apply(needed: boolean): void;
}

const tabStopSyncs = new Map<Node, TabStopSync>();
let resizes: ResizeObserver | null = null;
let mutations: MutationObserver | null = null;
let resizedNextFrame: Set<Node> | null = null;

function syncOf(node: Node | null): TabStopSync | undefined {
  for (let current = node; current; current = current.parentElement) {
    const sync = tabStopSyncs.get(current);
    if (sync) {
      return sync;
    }
  }

  return undefined;
}

// Every isClipped() read forces layout once a tabindex write has dirtied it, so all reads go first.
function syncAll(targets: Node[]): void {
  const syncs = [...new Set(targets.map(syncOf))].filter(
    (sync): sync is TabStopSync => sync !== undefined,
  );
  const decided = syncs.map((sync) => [sync, sync.isNeeded()] as const);
  decided.forEach(([sync, needed]) => sync.apply(needed));
}

// A tabindex written inside the ResizeObserver callback makes Firefox report "ResizeObserver loop
// completed with undelivered notifications" for hosts under `content-visibility: auto`.
function syncResizedNextFrame(targets: Node[]): void {
  if (!resizedNextFrame) {
    resizedNextFrame = new Set();
    requestAnimationFrame(() => {
      const resized = [...(resizedNextFrame ?? [])];
      resizedNextFrame = null;
      syncAll(resized);
    });
  }
  targets.forEach((target) => resizedNextFrame?.add(target));
}

/**
 * A clipped host that no keyboard path reaches - not focusable, inside no control or widget role,
 * holding no focusable descendant - takes `tabindex="0"` while it is clipped, and loses it once its
 * text fits and it does not hold focus. A tabindex it did not write is never touched. One observer
 * pair serves every host. Returns the teardown, or null when the host is reached another way.
 */
export function tabStopWhileClipped(
  trigger: AncestorFocusTrigger,
): (() => void) | null {
  const host = trigger.host;
  if (host.matches(FOCUSABLE) || host.closest(REACHED_OR_HIDDEN)) {
    return null;
  }
  let written = false;
  const isNeeded = () =>
    trigger.isClipped() && !host.querySelector(KEYBOARD_FOCUSABLE);
  const apply = (needed: boolean) => {
    if (needed && !host.hasAttribute('tabindex')) {
      host.setAttribute('tabindex', '0');
      written = true;
    } else if (
      !needed &&
      written &&
      host.ownerDocument.activeElement !== host
    ) {
      written = false;
      if (host.getAttribute('tabindex') === '0') {
        host.removeAttribute('tabindex');
      }
    }
  };
  const sync = () => apply(isNeeded());
  resizes ??= new ResizeObserver((entries) =>
    syncResizedNextFrame(entries.map((entry) => entry.target)),
  );
  mutations ??= new MutationObserver((records) =>
    syncAll(records.map((record) => record.target)),
  );
  tabStopSyncs.set(host, { isNeeded, apply });
  resizes.observe(host);
  mutations.observe(host, {
    characterData: true,
    childList: true,
    subtree: true,
  });
  host.addEventListener('focusout', sync);

  return () => {
    tabStopSyncs.delete(host);
    resizes?.unobserve(host);
    host.removeEventListener('focusout', sync);
  };
}
