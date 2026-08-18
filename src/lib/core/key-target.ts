const NON_TEXT_INPUT_TYPES = new Set([
  'button',
  'checkbox',
  'color',
  'file',
  'image',
  'radio',
  'range',
  'reset',
  'submit',
]);

/** True when the key landed on a control that consumes its own keystrokes, so a
 *  container listening on the way up must leave the event alone. */
export function isTextEntryTarget(event: Event): boolean {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  if (target.isContentEditable) {
    return true;
  }
  const tag = target.tagName.toLowerCase();
  if (tag === 'textarea' || tag === 'select') {
    return true;
  }

  return (
    tag === 'input' &&
    !NON_TEXT_INPUT_TYPES.has((target as HTMLInputElement).type.toLowerCase())
  );
}
