import { check, finish } from './probe-check.mjs';
import {
  toastGroupKey,
  toastUpdatePatch,
} from '../../src/lib/components/toast/toast-group.ts';

const sending = {
  id: 3,
  body: 'Sending: 0 of 3',
  variant: 'loading',
  dismissible: true,
  durationMs: 0,
};

const progress = toastUpdatePatch(sending, { body: 'Sending: 1 of 3' });
check(
  'a body change replaces the body',
  progress?.patch.body,
  'Sending: 1 of 3',
);
check('a body change keeps the variant', progress?.patch.variant, 'loading');
check('a body change is not announced', progress?.announce, false);
check(
  'a body change leaves the countdown alone',
  'durationMs' in (progress?.patch ?? {}),
  false,
);

const success = toastUpdatePatch(sending, {
  body: 'Answers delivered',
  variant: 'success',
});
check('turning success is announced', success?.announce, true);
check('turning success sets the variant', success?.patch.variant, 'success');
check(
  'leaving loading without a duration counts down the show() default',
  success?.patch.durationMs,
  5000,
);
check(
  'a given duration wins',
  toastUpdatePatch(sending, { variant: 'error', durationMs: 6000 })?.patch
    .durationMs,
  6000,
);
check(
  'turning error is announced',
  toastUpdatePatch(sending, { variant: 'error' })?.announce,
  true,
);
check(
  'turning warning is not announced',
  toastUpdatePatch(sending, { variant: 'warning' })?.announce,
  false,
);

const saved = {
  ...sending,
  body: 'Saved',
  variant: 'success',
  durationMs: 4000,
};
check(
  're-sending success is not announced',
  toastUpdatePatch(saved, { variant: 'success', body: 'Saved again' })
    ?.announce,
  false,
);
check(
  'a toast that cannot expire stays dismissible',
  toastUpdatePatch(sending, { dismissible: false })?.patch.dismissible,
  true,
);
check(
  'a toast with an action never expires',
  toastUpdatePatch(
    { ...saved, action: { label: 'Undo', handler: () => {} } },
    { durationMs: 3000 },
  )?.patch.durationMs,
  0,
);
check(
  'an expiring toast can be made undismissible',
  toastUpdatePatch(saved, { dismissible: false })?.patch.dismissible,
  false,
);

check(
  'a dismissed toast is a no-op',
  toastUpdatePatch(undefined, { body: 'late' }),
  null,
);

const on = { groupDuplicates: true };
const failed = { body: 'Save failed', variant: 'error' };
const stack = {
  ...saved,
  ...failed,
  groupKey: toastGroupKey(on, failed, 'error'),
};
check(
  'a stack keyed by its text is re-keyed to its new text',
  toastUpdatePatch(stack, { body: 'Saved', variant: 'success' })?.patch
    .groupKey,
  toastGroupKey(on, { body: 'Saved' }, 'success'),
);
check(
  'a stack with its own groupKey keeps it',
  'groupKey' in
    (toastUpdatePatch({ ...stack, groupKey: 'save' }, { body: 'Saved' })
      ?.patch ?? {}),
  false,
);

finish('toast-update');
