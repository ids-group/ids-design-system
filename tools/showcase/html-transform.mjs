import { basename } from 'node:path';

const MIME = {
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf',
  '.otf': 'font/otf', '.eot': 'application/vnd.ms-fontobject',
  '.ico': 'image/x-icon', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

export function mimeFor(ref) {
  const dot = ref.lastIndexOf('.');
  const ext = dot >= 0 ? ref.slice(dot).toLowerCase() : '';
  return MIME[ext] ?? 'application/octet-stream';
}

// Prevent an embedded "</script>" from terminating the inline <script>.
// esbuild output only emits this sequence inside string/regex literals,
// where "<\/script>" is byte-identical to "</script>".
export function escapeForInlineScript(js) {
  return js.replace(/<\/script>/gi, '<\\/script>');
}

export function escapeForInlineStyle(css) {
  return css.replace(/<\/style>/gi, '<\\/style>');
}

// resolve(ref) -> { mime, base64 } | null
export function inlineCssUrls(css, resolve) {
  return css.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi, (match, _quote, ref) => {
    if (ref.startsWith('data:')) return match;
    const data = resolve(ref);
    if (!data) return match;
    return `url("data:${data.mime};base64,${data.base64}")`;
  });
}

// assets:        Map<filename, { type: 'js' | 'css', content: string }>
// resolveBinary: (ref) -> { mime, base64 } | null — for the favicon
// Build stamp (__DS_BUILD_STAMP__) loads as a sibling classic script — nothing
// is inlined into <head>. Staleness is checked at runtime in the browser.
export function transformHtml(html, { assets, resolveBinary = () => null, buildStampScript = 'build-stamp.js' }) {
  let out = html;

  // 1. relative base for file://
  out = out.replace(/<base\b[^>]*>/i, '<base href="./">');

  // 2. drop modulepreload hints (chunks are inlined)
  out = out.replace(/<link\b[^>]*\brel=["']modulepreload["'][^>]*>/gi, '');

  // 3. inline module scripts (attribute order varies)
  out = out.replace(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*><\/script>/gi, (match, src) => {
    const asset = assets.get(basename(src));
    if (!asset || asset.type !== 'js') return match;
    return `<script type="module">${escapeForInlineScript(asset.content)}</script>`;
  });

  // 4. inline stylesheets
  out = out.replace(/<link\b[^>]*\brel=["']stylesheet["'][^>]*>/gi, (match) => {
    const href = match.match(/href=["']([^"']+)["']/i);
    if (!href) return match;
    const asset = assets.get(basename(href[1]));
    if (!asset || asset.type !== 'css') return match;
    return `<style>${escapeForInlineStyle(asset.content)}</style>`;
  });

  // 5. inline the favicon as a data: URI (a file:// page can't fetch a sibling)
  out = out.replace(/(<link\b[^>]*\brel=["'](?:shortcut )?icon["'][^>]*\bhref=["'])([^"']+)(["'])/gi,
    (match, before, href, after) => {
      const data = resolveBinary(href);
      if (!data) return match;
      return `${before}data:${data.mime};base64,${data.base64}${after}`;
    });

  // 6. inject the build-stamp loader (__DS_BUILD_STAMP__) at the very top of
  //    <head>, external (no inline), so the global is set before anything else.
  const inject = `<script src="./${buildStampScript}"></script>`;
  out = out.replace(/<head\b[^>]*>/i, (head) => `${head}${inject}`);

  return out;
}
