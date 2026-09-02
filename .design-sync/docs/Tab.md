---
category: Navigation
---
Declarative tab definition (`ds-tab`) — only valid as a direct child of `Tabs`. Renders nothing itself: the parent reads its props to build the tab bar and shows its `children` as the active panel's content.

- `label` (required) is the button text; `icon` (leading, 14px) and `count` (numeric badge chip) are optional decorations.
- `disabled` excludes the tab from selection and keyboard navigation.
- `value` is the identifier emitted by the parent's `onTabClosed`; falls back to `label` when omitted.
- Don't wrap `Tab` elements — `Tabs` matches direct children by component type; anything else is ignored.
