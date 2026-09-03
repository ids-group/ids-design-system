# Theming & dark mode - app-level defaults — provideDsConfig

Tokens answer “what does it look like”. This answers the other repetition: an input whose value an app writes identically on every element. One consumer binds [stickyScrollbar]="true" on all 35 of its tables and size="sm" on 146 buttons — not a per-element decision, a house default restated 146 times, and every new element is one forgotten binding away from looking wrong.

Precedence is input → config → built-in, so a screen that differs still binds the attribute and wins. Nothing changes for an app that provides nothing: every built-in default is what it always was. Provide it at the app root, on a Route, or on a component — the config resolves through the injector chain and a nested call MERGES with the one above it, section by section.

control.size is not the same axis as [data-density]. The density tier rewrites hit targets and padding in CSS for a route; this picks which of the three declared sizes a control renders at. An app can use both.
