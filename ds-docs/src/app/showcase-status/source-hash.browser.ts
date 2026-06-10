// Browser mirror of tools/showcase/source-hash.mjs — MUST stay byte-identical
// in algorithm so the in-page hash equals the build-time hash baked into
// build-stamp.js. Runs entirely client-side (WebCrypto), no server/Node.
//
// Input: the FileList from an <input type="file" webkitdirectory> where the
// user picked the repo ROOT. Each file's webkitRelativePath is
// "<pickedFolder>/src/lib/…" — we strip the first segment to get the repo-
// relative path and keep only the hashed roots.

const HASH_ROOTS = ['src/lib/', 'ds-docs/src/'];
const BINARY_EXT = new Set([
  'woff', 'woff2', 'ttf', 'otf', 'eot',
  'png', 'jpg', 'jpeg', 'gif', 'ico', 'webp',
]);

function toHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function sha256Hex(bytes: Uint8Array): Promise<string> {
  // Copy into a standalone ArrayBuffer so the type is a plain BufferSource
  // (avoids the ArrayBufferLike/SharedArrayBuffer lib-dom typing mismatch).
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return toHex(await crypto.subtle.digest('SHA-256', buffer));
}

function extOf(path: string): string {
  const dot = path.lastIndexOf('.');
  return dot >= 0 ? path.slice(dot + 1).toLowerCase() : '';
}

// repo-relative path: drop the picked-folder segment ("repo/src/lib/x" -> "src/lib/x")
function repoRelative(webkitRelativePath: string): string {
  const slash = webkitRelativePath.indexOf('/');
  return slash >= 0 ? webkitRelativePath.slice(slash + 1) : webkitRelativePath;
}

export interface SourceHashResult {
  srcHash: string;
  fileCount: number;
}

export async function computeContentHashFromFiles(files: File[]): Promise<SourceHashResult> {
  const targets = files
    .map((file) => ({ file, rel: repoRelative(file.webkitRelativePath) }))
    .filter(({ rel }) => HASH_ROOTS.some((root) => rel.startsWith(root)));

  const entries: string[] = [];
  for (const { file, rel } of targets) {
    const raw = new Uint8Array(await file.arrayBuffer());
    let bytes: Uint8Array;
    if (BINARY_EXT.has(extOf(rel))) {
      bytes = raw;
    } else {
      const normalized = new TextDecoder('utf-8').decode(raw).replace(/\r\n?/g, '\n');
      bytes = new TextEncoder().encode(normalized);
    }
    entries.push(`${rel}\0${await sha256Hex(bytes)}`);
  }

  entries.sort();
  const srcHash = await sha256Hex(new TextEncoder().encode(entries.join('\n')));
  return { srcHash, fileCount: targets.length };
}
