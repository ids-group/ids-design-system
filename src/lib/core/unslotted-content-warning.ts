import { afterRenderEffect, isDevMode } from '@angular/core';
import { reportDevWarning } from './dev-warning';

// Empty-valued attributes HTML itself defines, so they are never mistaken for a slot name.
const HTML_BOOLEAN_ATTRIBUTES = new Set([
  'hidden',
  'inert',
  'autofocus',
  'disabled',
  'readonly',
  'required',
  'checked',
  'selected',
  'multiple',
  'open',
  'novalidate',
  'formnovalidate',
  'itemscope',
  'contenteditable',
  'draggable',
  'spellcheck',
  'translate',
  'popover',
]);

function describe(node: Node): string {
  if (node instanceof Element) {
    const className = node.getAttribute('class');

    return `<${node.localName}${className ? ` class="${className}"` : ''}>`;
  }

  return `"${(node.textContent ?? '').trim().slice(0, 40)}"`;
}

function slotLikeAttribute(element: Element): string | undefined {
  return [...element.attributes].find(
    ({ name, value }) =>
      value === '' &&
      !name.startsWith('_ng') &&
      !name.startsWith('ng-') &&
      !HTML_BOOLEAN_ATTRIBUTES.has(name),
  )?.name;
}

/**
 * Warns when content reaches an overlay's default slot: it renders in the body, but it carries no
 * slot attribute, or one the overlay does not have. `container` is the element wrapping the
 * default `<ng-content />`; content that appears later (an `@if` resolving) is caught by a
 * MutationObserver. Reported through `reportDevWarning`, dev mode only; the caller wraps the call in the
 * `typeof ngDevMode` guard (see `devWarn`). Must be called from an injection context.
 * @internal
 */
export function warnUnslottedContent(
  tag: string,
  bodySlot: string,
  slots: readonly string[],
  container: () => HTMLElement | undefined,
): void {
  if (!isDevMode()) {
    return;
  }
  const check = (root: HTMLElement) => {
    const nodes = [...root.childNodes].filter(
      (node) =>
        node instanceof Element ||
        (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()),
    );
    const unnamed: Node[] = [];
    for (const node of nodes) {
      const attribute =
        node instanceof Element ? slotLikeAttribute(node) : undefined;
      if (attribute) {
        reportDevWarning(
          `[${tag}] Unknown slot [${attribute}] on <${(node as Element).localName}>: rendered into the body. Slots: ${slots.map((slot) => `[${slot}]`).join(', ')}.`,
        );
      } else {
        unnamed.push(node);
      }
    }
    if (unnamed.length) {
      reportDevWarning(
        `[${tag}] Content without a slot attribute is rendered into the body, but give it a slot (first node: ${describe(unnamed[0])}). Wrap it in <div ${bodySlot}>.`,
      );
    }
  };
  afterRenderEffect((onCleanup) => {
    const root = container();
    if (!root) {
      return;
    }
    check(root);
    const observer = new MutationObserver(() => check(root));
    observer.observe(root, {
      childList: true,
      characterData: true,
      subtree: true,
    });
    onCleanup(() => observer.disconnect());
  });
}
