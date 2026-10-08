const NATIVELY_FOCUSABLE = 'a[href], button, input, select, textarea, summary';
export const FOCUSABLE = `${NATIVELY_FOCUSABLE}, [tabindex]`;
const KEYBOARD_FOCUSABLE = `${NATIVELY_FOCUSABLE}, [tabindex]:not([tabindex^="-"])`;
const INTERACTIVE = [
  NATIVELY_FOCUSABLE,
  'tr:not([role])',
  ...[
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
  ].map((role) => `[role="${role}"]`),
].join(', ');

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
export function listenToFocusableAncestor(
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
