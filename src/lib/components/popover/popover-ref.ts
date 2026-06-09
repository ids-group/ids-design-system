/** Abstract handle to the containing popover, exposed via DI so projected
 *  content (e.g. ds-menu-item) can dismiss it without the popover depending on
 *  any specific child component. Inject with `{ optional: true }` — the content
 *  may also be used outside a popover. */
export abstract class PopoverRef {
  abstract close(): void;
}
