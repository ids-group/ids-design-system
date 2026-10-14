# DS feedback: mm-ecm-platform, 0.15.1 -> 0.15.2 (plugin 1.14.0, 2026-10-14)

## manifest:0.15.2#table-component-subclass-member-names (nit, gap)

The 0.15.2 CHANGELOG Added entry says a TableComponent subclass declaring one of the new member names must rename it; migrations/0.15.2.json has no item for it.

Evidence: v0.15.2 table.component.ts:368 `layoutMode`, :764 `autoLayoutWidth`; absent at v0.15.1; `TableComponent` absent from migrations/0.15.2.json.

Proposal: add a behavior item (surface typescript, detect `extends TableComponent`).
