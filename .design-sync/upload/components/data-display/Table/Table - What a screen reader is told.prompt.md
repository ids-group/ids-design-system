# Table - what a screen reader is told

Sorting and paging are read off the header and the pager by everyone else; the table now says them out loud too. One role="status" region carries "Sorted by Owner, ascending" and "Showing 1–25 of 240", with loading taking precedence while it lasts — announcing a new sort order over rows that are still being replaced describes a state the reader cannot inspect. Both strings are inputs (sortAnnouncement, rangeAnnouncement) taking the facts and returning the sentence, so translation and word order stay yours; return an empty string to stay silent. The first render is silent regardless — aria-live="polite" announces changes, not initial content.

Full API: `Table.d.ts`. How to use the component anywhere: `Table.prompt.md`.
