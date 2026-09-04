# Table - server-side filtering, and a filter of your own

Header filters default to filterMode="server": the table tracks columnFilters without filtering anything, so your request drives the rows; pass the real domain through columnFilterOptions. That is the right default because a paged table filtering locally would filter what the server already filtered, over a checklist offering only the values on THIS page. Declare filterMode="client" when the table holds every row and should filter them itself — there is a dev warning for the giveaway case, a filterable column on a table that binds no `total` and declares no mode. filterMode="none" drops the affordance entirely.

When the criterion is not a list of values — a date range, a numeric threshold, an async lookup — project the panel instead. The table keeps the header button, the popover and the active-filter styling; only the contents change. It cannot know whether YOUR criterion is set, so active is how the highlight is told.

Full API: `Table.d.ts`. How to use the component anywhere: `Table.prompt.md`.
