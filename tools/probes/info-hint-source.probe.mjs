import {
  givenInfoHintSources,
  infoHintSourceWarning,
} from '../../src/lib/components/info-hint/info-hint-source.ts';
import { check, finish } from './probe-check.mjs';

const none = { content: false, projected: false, text: false };

check('text alone', givenInfoHintSources({ ...none, text: true }), ['text']);
check('projection alone', givenInfoHintSources({ ...none, projected: true }), [
  'projected',
]);
check('[content] alone', givenInfoHintSources({ ...none, content: true }), [
  'content',
]);
check(
  '[content] wins over projection and text',
  givenInfoHintSources({ content: true, projected: true, text: true }),
  ['content', 'projected', 'text'],
);
check(
  'projection wins over text',
  givenInfoHintSources({ ...none, projected: true, text: true })[0],
  'projected',
);

check('one source raises nothing', infoHintSourceWarning(['text']), null);
check(
  'no source warns',
  infoHintSourceWarning([]),
  'ds-info-hint: no text, [content] or projected content is given, so the hint opens nothing.',
);
check(
  'two sources warn and name the winner',
  infoHintSourceWarning(['projected', 'text']),
  'ds-info-hint: projected content, text are all given; it shows projected content and ignores the rest.',
);

finish('info-hint-source');
