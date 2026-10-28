import { check, finish } from './probe-check.mjs';
import {
  findToastStack,
  toastGroupKey,
  toastRepeatPatch,
  withoutToastOccurrence,
} from '../../src/lib/components/toast/toast-group.ts';

const on = { groupDuplicates: true };
const saveFailed = { title: 'Save failed', body: 'The server did not answer.' };

check(
  'grouping is off without config',
  toastGroupKey(undefined, saveFailed, 'error'),
  undefined,
);
check(
  'grouping is off with a toast section that does not enable it',
  toastGroupKey({ maxVisible: 3 }, saveFailed, 'error'),
  undefined,
);
check(
  'the same variant, title and body share a key',
  toastGroupKey(on, saveFailed, 'error') ===
    toastGroupKey(on, { ...saveFailed }, 'error'),
  true,
);
check(
  'a different variant does not group',
  toastGroupKey(on, saveFailed, 'error') ===
    toastGroupKey(on, saveFailed, 'warning'),
  false,
);
check(
  'a different body does not group',
  toastGroupKey(on, saveFailed, 'error') ===
    toastGroupKey(on, { ...saveFailed, body: 'Try again.' }, 'error'),
  false,
);
check(
  'title and body cannot collide through a separator',
  toastGroupKey(on, { title: 'a. b', body: 'c' }, 'info') ===
    toastGroupKey(on, { title: 'a', body: 'b. c' }, 'info'),
  false,
);
check(
  'groupKey groups whatever the text',
  toastGroupKey(on, { body: 'Synced 3 files', groupKey: 'sync' }, 'success') ===
    toastGroupKey(on, { body: 'Synced 7 files', groupKey: 'sync' }, 'success'),
  true,
);
check(
  'a loading toast never groups',
  toastGroupKey(on, { body: 'Saving', groupKey: 'save' }, 'loading'),
  undefined,
);

const key = toastGroupKey(on, saveFailed, 'error');
const stack = {
  id: 4,
  ...saveFailed,
  variant: 'error',
  dismissible: true,
  durationMs: 5000,
  groupKey: key,
  occurrences: [{ id: 4, body: saveFailed.body, at: 1000 }],
};
const other = { ...stack, id: 9, groupKey: 'other', occurrences: [] };
const promised = { ...stack, id: 2, groupKey: undefined };

check(
  'a repeat finds the stack with its key',
  findToastStack([promised, other, stack], key)?.id,
  4,
);
check(
  'a toast without a key is never a stack',
  findToastStack([promised], key),
  undefined,
);

const repeat = toastRepeatPatch(stack, {
  id: 7,
  body: saveFailed.body,
  at: 2000,
});
check('a repeat increments the count', repeat.occurrences.length, 2);
check(
  'a repeat appends the newest occurrence last',
  repeat.occurrences.map((occurrence) => occurrence.id),
  [4, 7],
);
check(
  'a repeat re-sends durationMs, which restarts the countdown',
  repeat.durationMs,
  5000,
);

const grown = { ...stack, occurrences: repeat.occurrences };
check(
  'closing one occurrence decrements the count',
  withoutToastOccurrence(grown, 4)?.map((occurrence) => occurrence.id),
  [7],
);
check(
  'closing the last occurrence dismisses the toast',
  withoutToastOccurrence(stack, 4),
  null,
);

finish('toast-group');
