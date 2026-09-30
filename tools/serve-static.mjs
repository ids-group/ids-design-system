// Serves a built directory over HTTP with no dependencies, for tools that need two builds side by side.
//
//   node tools/serve-static.mjs <root> <port>
//
// A path that is not a file on disk serves index.html, so client-side routes resolve.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const [rootArgument, port] = process.argv.slice(2);
if (!rootArgument || !port) {
  console.error('usage: node tools/serve-static.mjs <root> <port>');
  process.exit(2);
}

const root = path.resolve(rootArgument);

const TYPES = {
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.html': 'text/html',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};

http
  .createServer((request, response) => {
    let file = path.join(root, decodeURIComponent(request.url.split('?')[0]));
    if (!file.startsWith(root)) {
      response.writeHead(403).end();
      return;
    }
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory())
      file = path.join(root, 'index.html');
    response.writeHead(200, {
      'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream',
    });
    fs.createReadStream(file).pipe(response);
  })
  .listen(Number(port), () =>
    console.log(`serving ${root} on http://localhost:${port}`),
  );
