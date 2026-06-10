import test from 'node:test';
import assert from 'node:assert/strict';
import {
  transformHtml, inlineCssUrls, escapeForInlineScript, mimeFor,
} from './html-transform.mjs';

test('mimeFor maps known extensions', () => {
  assert.equal(mimeFor('a.woff2'), 'font/woff2');
  assert.equal(mimeFor('a.ico'), 'image/x-icon');
  assert.equal(mimeFor('a.unknown'), 'application/octet-stream');
});

test('escapeForInlineScript neutralizes closing tags', () => {
  assert.equal(escapeForInlineScript('a</script>b'), 'a<\\/script>b');
});

test('inlineCssUrls replaces media url() with data URIs and skips data:', () => {
  const css = `@font-face{src:url('media/f.woff2')} .x{background:url(data:image/x)}`;
  const out = inlineCssUrls(css, (ref) =>
    ref === 'media/f.woff2' ? { mime: 'font/woff2', base64: 'QUJD' } : null);
  assert.ok(out.includes('url("data:font/woff2;base64,QUJD")'));
  assert.ok(out.includes('url(data:image/x)')); // untouched
});

test('transformHtml inlines js + css + favicon, rewrites base, injects globals', () => {
  const html = [
    '<!doctype html><html><head>',
    '<base href="/">',
    '<link rel="icon" type="image/x-icon" href="favicon.ico">',
    '<link rel="modulepreload" href="chunk-1.js">',
    '<link rel="stylesheet" href="styles-AB.css">',
    '</head><body><app-root></app-root>',
    '<script src="polyfills-AB.js" type="module"></script>',
    '<script src="main-AB.js" type="module"></script>',
    '</body></html>',
  ].join('');
  const assets = new Map([
    ['styles-AB.css', { type: 'css', content: '.a{color:red}' }],
    ['polyfills-AB.js', { type: 'js', content: 'var p=1;' }],
    ['main-AB.js', { type: 'js', content: 'var m=1;' }],
  ]);
  const resolveBinary = (ref) =>
    ref === 'favicon.ico' ? { mime: 'image/x-icon', base64: 'SUNP' } : null;
  const out = transformHtml(html, { assets, resolveBinary });

  assert.ok(out.includes('<base href="./">'));
  assert.ok(!out.includes('modulepreload'));
  assert.ok(out.includes('<style>.a{color:red}</style>'));
  assert.ok(out.includes('<script type="module">var p=1;</script>'));
  assert.ok(out.includes('<script type="module">var m=1;</script>'));
  assert.ok(out.includes('href="data:image/x-icon;base64,SUNP"'));
  assert.ok(!out.includes('href="favicon.ico"'));
  // build provenance + current source both load as external siblings (not inline)
  assert.ok(out.includes('<script src="./ds-built.js"></script>'));
  assert.ok(out.includes('<script src="./ds-version.js"></script>'));
  assert.ok(!out.includes('window.__DS_BUILT__'));
});

test('transformHtml leaves favicon untouched when resolver finds nothing', () => {
  const html = '<head><link rel="icon" href="favicon.ico"></head>';
  const out = transformHtml(html, {
    assets: new Map(),
    built: { hash: 'h', commit: 'c', date: 'd' },
    resolveBinary: () => null,
  });
  assert.ok(out.includes('href="favicon.ico"'));
});
