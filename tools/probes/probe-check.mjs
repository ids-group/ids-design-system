// JSON.stringify(NaN) is the string "null", byte for byte what JSON.stringify(null) returns, so a
// stringify comparison passes a NaN off as a null — the failure class these probes exist to catch.
// Compare structurally; never simplify this back to comparing two JSON strings.

let failureCount = 0;

const isPlainObject = (value) => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);

  return prototype === Object.prototype || prototype === null;
};

const sameValue = (actual, expected) => {
  if (typeof actual === 'number' && typeof expected === 'number') {
    if (Number.isNaN(actual) || Number.isNaN(expected)) {
      return Number.isNaN(actual) && Number.isNaN(expected);
    }

    return actual === expected;
  }

  return actual === expected;
};

const deepEquals = (actual, expected) => {
  if (Array.isArray(actual) || Array.isArray(expected)) {
    return (
      Array.isArray(actual) &&
      Array.isArray(expected) &&
      actual.length === expected.length &&
      actual.every((entry, index) => deepEquals(entry, expected[index]))
    );
  }

  if (isPlainObject(actual) || isPlainObject(expected)) {
    if (!isPlainObject(actual) || !isPlainObject(expected)) return false;
    const actualKeys = Object.keys(actual).sort();
    const expectedKeys = Object.keys(expected).sort();

    return (
      actualKeys.length === expectedKeys.length &&
      actualKeys.every((key, index) => key === expectedKeys[index]) &&
      actualKeys.every((key) => deepEquals(actual[key], expected[key]))
    );
  }

  return sameValue(actual, expected);
};

const describeValue = (value) => {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number') {
    return Object.is(value, -0) ? '-0' : String(value);
  }
  if (Array.isArray(value)) return `[${value.map(describeValue).join(', ')}]`;
  if (isPlainObject(value)) {
    const entries = Object.keys(value).map(
      (key) => `${key}: ${describeValue(value[key])}`,
    );

    return entries.length ? `{ ${entries.join(', ')} }` : '{}';
  }

  return String(value);
};

export const check = (name, actual, expected) => {
  if (deepEquals(actual, expected)) {
    console.log(`ok   ${name}`);

    return;
  }
  failureCount++;
  console.error(
    `FAIL ${name}\n  expected ${describeValue(expected)}\n  actual   ${describeValue(actual)}`,
  );
};

export const finish = (probeName) => {
  if (failureCount) {
    console.error(`\n${failureCount} failure(s)`);
    process.exit(1);
  }
  console.log(`\n${probeName}: all assertions passed`);
};
