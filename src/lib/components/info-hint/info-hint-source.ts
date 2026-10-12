const PRECEDENCE = ['content', 'projected', 'text'] as const;

export type InfoHintSource = (typeof PRECEDENCE)[number];

/** Every source the hint was given, highest precedence first; the first one is what the panel shows. */
export function givenInfoHintSources(
  given: Record<InfoHintSource, boolean>,
): InfoHintSource[] {
  return PRECEDENCE.filter((source) => given[source]);
}

const SOURCE_LABELS: Record<InfoHintSource, string> = {
  content: '[content]',
  projected: 'projected content',
  text: 'text',
};

export function infoHintSourceWarning(
  sources: readonly InfoHintSource[],
): string | null {
  if (sources.length === 0) {
    return 'ds-info-hint: no text, [content] or projected content is given, so the hint opens nothing.';
  }
  if (sources.length > 1) {
    const labels = sources.map((source) => SOURCE_LABELS[source]);

    return `ds-info-hint: ${labels.join(', ')} are all given; it shows ${labels[0]} and ignores the rest.`;
  }

  return null;
}
