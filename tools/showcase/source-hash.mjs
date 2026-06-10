import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { join, relative, extname, sep, posix } from 'node:path';

const BINARY_EXT = new Set([
  '.woff', '.woff2', '.ttf', '.otf', '.eot',
  '.png', '.jpg', '.jpeg', '.gif', '.ico', '.webp',
]);

async function listFiles(dir, out = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) await listFiles(full, out);
    else if (entry.isFile()) out.push(full);
  }
  return out;
}

function hashFile(file, buffer) {
  const hash = createHash('sha256');
  if (BINARY_EXT.has(extname(file).toLowerCase())) {
    hash.update(buffer);
  } else {
    // EOL-normalize text so the hash is identical across autocrlf checkouts.
    const normalized = buffer.toString('utf8').replace(/\r\n?/g, '\n');
    hash.update(normalized, 'utf8');
  }
  return hash.digest('hex');
}

export async function computeContentHash(roots, baseDir = process.cwd()) {
  const entries = [];
  for (const root of roots) {
    const files = await listFiles(join(baseDir, root));
    for (const file of files) {
      const rel = relative(baseDir, file).split(sep).join(posix.sep);
      entries.push(`${rel}\0${hashFile(file, await readFile(file))}`);
    }
  }
  entries.sort();
  return createHash('sha256').update(entries.join('\n'), 'utf8').digest('hex');
}
