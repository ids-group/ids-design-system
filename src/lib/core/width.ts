/**
 * How a control sizes itself and its overlay panel.
 *
 * `fill` stretches to the container and pins the panel to the trigger's width.
 * `content` hugs the trigger and takes that width as the panel's FLOOR, so the
 * panel still grows to its options — without it a short trigger gives a panel
 * too narrow to read.
 */
export type DsControlWidth = 'fill' | 'content';
