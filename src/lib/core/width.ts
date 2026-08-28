/**
 * How a control sizes itself and its overlay panel.
 *
 * `fill` stretches to the container and pins the panel to the trigger's width.
 * `content` hugs the trigger's own content and takes that width as the panel's
 * FLOOR, letting the panel grow to its options — without it a compact trigger
 * gives a panel too narrow to read.
 *
 * Shared for the same reason `DsOption` is: the three pickers had one copy of
 * this idea between them, and the other two silently lacked it. Each component
 * still exports its own name.
 */
export type DsControlWidth = 'fill' | 'content';
