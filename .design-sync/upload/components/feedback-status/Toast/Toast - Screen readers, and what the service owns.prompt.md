# Toast - screen readers, and what the service owns

Announcements do not ride the toast element. A live region has to exist before its text arrives, and a toast is created with its message already in it — which announces nothing in NVDA or JAWS. So ToastService speaks through the CDK LiveAnnouncer: errors and warnings assertively, the rest politely, and a burst is read as one announcement.

Two consequences. A <ds-toast> you place yourself carries no role or aria-live and is silent to a reader — it is a specimen, not an event, so route anything that should be announced through the service. And the stack stays above a modal, drawer or confirm opened after it: --layer-toast cannot do that on its own, because overlays live in the browser's top layer where z-index does not apply.

Full API: `Toast.d.ts`. How to use the component anywhere: `Toast.prompt.md`.
