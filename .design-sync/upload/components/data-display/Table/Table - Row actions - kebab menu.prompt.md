# Table - row actions · kebab menu

[rowActions] adds a trailing kebab column; (rowActionSelected) reports action, row. Menu clicks never fire (rowClicked).

Per row, disabled greys an item (Delete on completed records) and disabledReason says why on its second line. hidden leaves out an action that does not apply (Relaunch shows only on completed rows); a row whose items are all hidden gets no kebab.

A hand-built action column with no visible header needs screenReaderLabel.

Row clicked: · Action:

Full API: `Table.d.ts`. How to use the component anywhere: `Table.prompt.md`.
