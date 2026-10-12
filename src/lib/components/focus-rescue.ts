import { DOCUMENT, Injector, afterNextRender, inject } from '@angular/core';

/**
 * Returns a function that, after the next render, focuses `target()` when focus has fallen to
 * `<body>` - its element was removed or disabled under it. Focus the app moved elsewhere is left alone.
 *
 * Must be called from an injection context.
 * @internal
 */
export function focusRescue(): (
  target: () => HTMLElement | null | undefined,
) => void {
  const injector = inject(Injector);
  const documentRef = inject(DOCUMENT);

  return (target) =>
    afterNextRender(
      () => {
        const active = documentRef.activeElement as HTMLElement | null;
        // A focused control that turns disabled still reads as active until the browser's focus fixup.
        const lost =
          !active ||
          active === documentRef.body ||
          !active.isConnected ||
          (active as HTMLButtonElement).disabled === true;
        if (lost) {
          target()?.focus();
        }
      },
      { injector },
    );
}
