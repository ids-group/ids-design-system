# Table - a cell that IS a link — the accessible way to say a row leads somewhere

A clickable row cannot be a link. It has no href, so it never appears in the tab order as a link, a screen reader announces a table row, and Ctrl/Cmd-click cannot open it in a new tab — and the hover tint above is invisible to a keyboard or touch user. Give the column a link function returning an Angular route target and the value renders as a real <a>: visible without hovering, tabbable, and Ctrl-clickable. Return null for a row that leads nowhere and that cell stays plain text, so a partly-reachable list needs no second column. External URLs go through a [cell] template instead — this takes route targets only, and the router is touched at all only once a column sets link.

It composes with rowInteractive: the link stops its own click from reaching the row, so clicking the name navigates once and the rest of the row still fires the row handler. That is the shape the accessibility literature lands on — Roselli’s "Don’t Turn a Table into an ARIA Grid Just for a Clickable Row" — with the row click left as an enhancement on top of a control that works without it.

Both together cost two tab stops per row — the row and the link — so on a long list drop rowInteractive once the link is there and keep one stop per row. Keep both only where the row click is genuinely worth the second stop.

Full API: `Table.d.ts`. How to use the component anywhere: `Table.prompt.md`.
