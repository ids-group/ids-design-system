// The checks a set of measured card heights must pass, and the write into `viewports.json`.
// Both card tools measure: snapshot-cards on the way to freezing, measure-cards on its own.
import { readFileSync, writeFileSync } from 'node:fs';

// A card that renders nothing still has a height, so a run where the bundle was half-built came in
// at 144px for all 418 cards and passed on none of them being zero. The floor sits between that and
// the smallest card that does render its block, which is 281px now that the chapter's lede no
// longer rides every card.
const EMPTY_CARD = 200;

/** Exits non-zero on a card that sliced itself empty or rendered no block; otherwise writes the
 *  heights and returns whether the file changed. `blank` names the cards whose slice kept nothing. */
export function writeHeights(viewports, width, heights, blank) {
  // A card that sliced its own content away still renders a heading and a lede, so it is 371px, not
  // 144px, and no height threshold separates it from a small real card. The card counts what
  // survived its slice; zero means it published a title over an empty page. Four Menu cards did.
  if (blank.length) {
    console.error(
      `\n✗ ${blank.length} card(s) sliced away everything they were meant to show:`,
    );
    for (const name of blank) console.error(`    ${name}`);
    process.exit(1);
  }

  const missing = Object.entries(heights).filter(
    ([, value]) => value < EMPTY_CARD,
  );
  if (missing.length) {
    console.error(
      `\n✗ ${missing.length} card(s) rendered no block (under ${EMPTY_CARD}px):`,
    );
    for (const [name, value] of missing.slice(0, 12))
      console.error(`    ${value}px  ${name}`);
    if (missing.length > 12)
      console.error(`    … and ${missing.length - 12} more`);
    console.error(
      '\nA whole run at one small height means the bundle is stale: rebuild it with' +
        ' `bun run build:elements` before measuring.',
    );
    process.exit(1);
  }

  const previous = readFileSync(viewports, 'utf8');
  const sorted = Object.fromEntries(
    Object.entries(heights).sort(([a], [b]) => a.localeCompare(b)),
  );
  const next = `${JSON.stringify({ note: JSON.parse(previous).note, width, heights: sorted }, null, 2)}\n`;
  writeFileSync(viewports, next);
  console.error(
    `\n✓ ${Object.keys(sorted).length} card height(s) into viewports.json` +
      ` — tallest ${Math.max(...Object.values(sorted))}px, shortest ${Math.min(...Object.values(sorted))}px`,
  );

  return next !== previous;
}
