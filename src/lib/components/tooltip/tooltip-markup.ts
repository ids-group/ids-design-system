export interface TooltipSegment {
  text: string;
  bold: boolean;
}

const TOKEN = /(\\\*\\\*|\*\*)/;
const ESCAPED = '\\*\\*';
const BOLD = '**';

/** Splits tip text on `**` into plain and bold runs. `\*\*` is a literal `**`; an unpaired `**` is literal too. */
export function parseTooltipMarkup(text: string): TooltipSegment[] {
  const tokens = text.split(TOKEN);
  const markerCount = tokens.filter((token) => token === BOLD).length;
  const pairedMarkers = markerCount - (markerCount % 2);
  const segments: TooltipSegment[] = [];
  let bold = false;
  let seen = 0;
  for (const token of tokens) {
    let piece = token;
    if (token === ESCAPED) {
      piece = BOLD;
    } else if (token === BOLD && seen++ < pairedMarkers) {
      bold = !bold;
      continue;
    }
    if (!piece) {
      continue;
    }
    const last = segments[segments.length - 1];
    if (last?.bold === bold) {
      last.text += piece;
    } else {
      segments.push({ text: piece, bold });
    }
  }

  return segments;
}

export function escapeTooltipMarkup(text: string): string {
  return text.replaceAll(BOLD, ESCAPED);
}

export function plainTooltipText(text: string): string {
  return parseTooltipMarkup(text)
    .map((segment) => segment.text)
    .join('');
}
