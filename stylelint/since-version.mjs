// Shared by the ESLint and stylelint plugins: does an entry belong to a release after the one the
// consumer is upgrading from? An entry for the unreleased version has no number and always counts.
export const VERSION = /^\d+\.\d+\.\d+/;

const core = (version) => version.match(VERSION)?.[0].split('.').map(Number);

export function releasedAfter(since, from) {
  const released = core(since);
  const base = from === undefined ? undefined : core(from);
  if (!released || !base) return true;
  for (let index = 0; index < 3; index++) {
    if (released[index] !== base[index]) return released[index] > base[index];
  }

  return false;
}
