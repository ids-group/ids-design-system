// A clipped `dsTooltipWhenClipped` host that no keyboard path reaches takes `tabindex="0"` while it
// is clipped. Plain node has no DOM, so the elements below are stand-ins whose `matches` evaluates
// the real selector strings the module passes: a selector that stops matching fails here.
import { check, finish } from './probe-check.mjs';

const resizeCallbacks = [];
const observed = new Set();
const mutationCallbacks = [];
const frames = [];
globalThis.requestAnimationFrame = (callback) => frames.push(callback);
globalThis.ResizeObserver = class {
  constructor(callback) {
    resizeCallbacks.push(callback);
  }
  observe(element) {
    observed.add(element);
  }
  unobserve(element) {
    observed.delete(element);
  }
};
globalThis.MutationObserver = class {
  constructor(callback) {
    mutationCallbacks.push(callback);
  }
  observe() {}
};

const { tabStopWhileClipped } =
  await import('../../src/lib/components/tooltip/tooltip-ancestor-focus.ts');

const doc = { activeElement: null };

function matchesCompound(element, selector) {
  let index = 0;
  const tag = selector.match(/^[a-z]+/);
  if (tag) {
    if (element.tagName !== tag[0].toUpperCase()) {
      return false;
    }
    index = tag[0].length;
  }
  while (index < selector.length) {
    if (selector[index] === '[') {
      const end = selector.indexOf(']', index);
      const [, name, operator, expected] = selector
        .slice(index + 1, end)
        .match(/^([\w-]+)(?:(\^?=)"(.*)")?$/);
      const value = element.getAttribute(name);
      if (
        value === null ||
        (operator === '=' && value !== expected) ||
        (operator === '^=' && !value.startsWith(expected))
      ) {
        return false;
      }
      index = end + 1;
    } else if (selector.startsWith(':not(', index)) {
      let depth = 1;
      let end = index + 5;
      for (; depth > 0; end++) {
        depth += selector[end] === '(' ? 1 : selector[end] === ')' ? -1 : 0;
      }
      if (matchesCompound(element, selector.slice(index + 5, end - 1))) {
        return false;
      }
      index = end;
    } else {
      throw new Error(`unsupported selector: ${selector.slice(index)}`);
    }
  }

  return true;
}

class FakeElement {
  constructor(tag, attributes = {}, children = []) {
    this.tagName = tag.toUpperCase();
    this.attributes = new Map(Object.entries(attributes));
    this.children = [];
    this.parentElement = null;
    this.ownerDocument = doc;
    this.listeners = new Map();
    children.forEach((child) => this.append(child));
  }
  append(child) {
    child.parentElement = this;
    this.children.push(child);
  }
  hasAttribute(name) {
    return this.attributes.has(name);
  }
  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }
  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }
  removeAttribute(name) {
    this.attributes.delete(name);
  }
  matches(selector) {
    return selector
      .split(',')
      .some((part) => matchesCompound(this, part.trim()));
  }
  closest(selector) {
    for (let element = this; element; element = element.parentElement) {
      if (element.matches(selector)) {
        return element;
      }
    }

    return null;
  }
  querySelector(selector) {
    for (const child of this.children) {
      const found = child.matches(selector)
        ? child
        : child.querySelector(selector);
      if (found) {
        return found;
      }
    }

    return null;
  }
  addEventListener(type, listener) {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), listener]);
  }
  removeEventListener(type, listener) {
    this.listeners.set(
      type,
      (this.listeners.get(type) ?? []).filter((each) => each !== listener),
    );
  }
  dispatch(type) {
    (this.listeners.get(type) ?? []).forEach((listener) =>
      listener({ type, target: this }),
    );
  }
}

const el = (tag, attributes, children) =>
  new FakeElement(tag, attributes, children);
const observeResize = (element) =>
  resizeCallbacks.forEach((callback) => callback([{ target: element }]));
const nextFrame = () => frames.splice(0).forEach((callback) => callback(0));
const resize = (element) => {
  observeResize(element);
  nextFrame();
};
const mutateInside = (element) =>
  mutationCallbacks.forEach((callback) => callback([{ target: element }]));

// A host inside `parent`, clipped while `state.clipped` is true.
function setUp(hostAttributes = {}, wrap = (host) => el('div', {}, [host])) {
  const state = { clipped: true };
  const host = el('span', hostAttributes);
  wrap(host);
  const teardown = tabStopWhileClipped({
    host,
    isClipped: () => state.clipped,
    openFor: () => {},
    close: () => {},
  });

  return { state, host, teardown };
}

{
  const { host, teardown } = setUp();
  check('a reachable-by-nothing host registers', typeof teardown, 'function');
  check(
    'nothing is written before the first measure',
    host.getAttribute('tabindex'),
    null,
  );
  observeResize(host);
  check(
    'the observer callback writes nothing until the next frame',
    host.getAttribute('tabindex'),
    null,
  );
  nextFrame();
  check(
    'a clipped host in a clickable row becomes a tab stop',
    host.getAttribute('tabindex'),
    '0',
  );
  teardown();
}

{
  const { state, host, teardown } = setUp();
  state.clipped = false;
  resize(host);
  check(
    'a host whose text fits is skipped',
    host.getAttribute('tabindex'),
    null,
  );
  state.clipped = true;
  resize(host);
  check(
    'it becomes a tab stop once a resize clips it',
    host.getAttribute('tabindex'),
    '0',
  );
  state.clipped = false;
  resize(host);
  check(
    'a resize that fits the text again removes the tab stop',
    host.getAttribute('tabindex'),
    null,
  );
  state.clipped = true;
  mutateInside(host);
  check(
    'a text change that clips it adds the tab stop',
    host.getAttribute('tabindex'),
    '0',
  );
  state.clipped = false;
  const text = el('b');
  host.append(text);
  mutateInside(text);
  check(
    'a text change inside the host that fits removes it',
    host.getAttribute('tabindex'),
    null,
  );
  teardown();
}

{
  const { state, host, teardown } = setUp();
  resize(host);
  doc.activeElement = host;
  state.clipped = false;
  resize(host);
  check(
    'a focused host keeps its tab stop while focused',
    host.getAttribute('tabindex'),
    '0',
  );
  doc.activeElement = null;
  host.dispatch('focusout');
  check('it loses the tab stop on blur', host.getAttribute('tabindex'), null);
  teardown();
}

{
  const { state, host, teardown } = setUp();
  resize(host);
  host.setAttribute('tabindex', '-1');
  state.clipped = false;
  resize(host);
  check(
    'a tabindex rewritten by the consumer is left alone',
    host.getAttribute('tabindex'),
    '-1',
  );
  teardown();
}

{
  const { host, teardown } = setUp();
  teardown();
  check('teardown stops observing', observed.has(host), false);
  resize(host);
  check(
    'a measure after teardown writes nothing',
    host.getAttribute('tabindex'),
    null,
  );
}

for (const [name, attributes] of [
  ['tabindex="-1"', { tabindex: '-1' }],
  ['tabindex="0"', { tabindex: '0' }],
  ['role="option"', { role: 'option' }],
]) {
  const { host, teardown } = setUp(attributes);
  check(`a host with ${name} is not registered`, teardown, null);
  check(
    `a host with ${name} keeps its own tabindex`,
    host.getAttribute('tabindex'),
    attributes.tabindex ?? null,
  );
}

for (const [name, wrap] of [
  ['a link', (host) => el('a', { href: '/x' }, [host])],
  ['a button', (host) => el('button', {}, [el('span', {}, [host])])],
  [
    'a focusable row',
    (host) => el('tr', { tabindex: '0' }, [el('td', {}, [host])]),
  ],
  [
    'a role="button" row',
    (host) => el('div', { role: 'button', tabindex: '0' }, [host]),
  ],
  ['a listbox option', (host) => el('li', { role: 'option' }, [host])],
  [
    'an aria-hidden subtree',
    (host) => el('div', { 'aria-hidden': 'true' }, [host]),
  ],
  ['an inert subtree', (host) => el('div', { inert: '' }, [host])],
]) {
  const { teardown } = setUp({}, wrap);
  check(`a host inside ${name} is not registered`, teardown, null);
}

for (const [name, wrap] of [
  ['a plain table row', (host) => el('tr', {}, [el('td', {}, [host])])],
  [
    'a focusable tab panel',
    (host) => el('div', { role: 'tabpanel', tabindex: '0' }, [host]),
  ],
  [
    'a dialog surface with tabindex="-1"',
    (host) => el('div', { role: 'dialog', tabindex: '-1' }, [host]),
  ],
]) {
  const { host, teardown } = setUp({}, wrap);
  resize(host);
  check(
    `a clipped host inside ${name} becomes a tab stop`,
    host.getAttribute('tabindex'),
    '0',
  );
  teardown?.();
}

{
  const { host, teardown } = setUp();
  host.append(el('button'));
  resize(host);
  check(
    'a host with a focusable descendant gets no tab stop',
    host.getAttribute('tabindex'),
    null,
  );
  teardown();
}

{
  const order = [];
  const hosts = [0, 1, 2].map(() => {
    const host = el('span');
    el('div', {}, [host]);
    const setAttribute = host.setAttribute.bind(host);
    host.setAttribute = (name, value) => {
      order.push('write');
      setAttribute(name, value);
    };
    const teardown = tabStopWhileClipped({
      host,
      isClipped: () => (order.push('read'), true),
      openFor: () => {},
      close: () => {},
    });

    return { host, teardown };
  });
  resizeCallbacks.forEach((callback) =>
    callback(hosts.map(({ host }) => ({ target: host }))),
  );
  nextFrame();
  check(
    'one resize batch reads every host before writing any tabindex',
    order.join(' '),
    'read read read write write write',
  );
  hosts.forEach(({ teardown }) => teardown());
}

finish('tooltip-tab-stop');
