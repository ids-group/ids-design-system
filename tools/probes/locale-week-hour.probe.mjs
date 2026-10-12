import { check, finish } from './probe-check.mjs';
import { localeFirstDayOfWeek } from '../../src/lib/components/date-picker/date.util.ts';
import { localeTimeFormat } from '../../src/lib/components/time-picker/time.util.ts';

check('en-US starts the week on Sunday', localeFirstDayOfWeek('en-US'), 0);
check('en-GB starts the week on Monday', localeFirstDayOfWeek('en-GB'), 1);
check('de-DE starts the week on Monday', localeFirstDayOfWeek('de-DE'), 1);
check('ar-EG starts the week on Saturday', localeFirstDayOfWeek('ar-EG'), 6);
check(
  'a -u-fw- extension wins over the region',
  localeFirstDayOfWeek('en-GB-u-fw-sun'),
  0,
);

check('en-US reads 12 hours', localeTimeFormat('en-US'), '12h');
check('en-GB reads 24 hours', localeTimeFormat('en-GB'), '24h');
check('de-DE reads 24 hours', localeTimeFormat('de-DE'), '24h');
check(
  'a -u-hc- extension wins over the region',
  localeTimeFormat('en-US-u-hc-h23'),
  '24h',
);

finish('locale-week-hour');
