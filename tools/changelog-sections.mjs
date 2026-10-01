// Ranked by slot rather than by heading, so a release that spells its breaking half
// `Changed (breaking, visual)` still lands in the Breaking slot.
export const SECTION_SLOTS = [
  [/^breaking|\(breaking/i, 0],
  [/^added$/i, 1],
  [/^changed$/i, 2],
  [/^(removed|deprecated)$/i, 3],
  [/^fixed$/i, 4],
  [/^what you can now delete$/i, 5],
];

export const SECTION_ORDER =
  'Breaking → Added → Changed → Removed → Fixed → What you can now DELETE';

export const sectionSlot = (heading) =>
  SECTION_SLOTS.find(([pattern]) => pattern.test(heading))?.[1];
