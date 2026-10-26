import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../', import.meta.url)));
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.md': 'text/plain', '.txt': 'text/plain', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.json': 'application/json' };

export function createServer() {
  return http.createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      if (pathname.split('/').some(part => part.startsWith('.'))) {
        response.writeHead(404).end('Not found');
        return;
      }
      let path = resolve(root, `.${pathname}`);
      if (path !== root && !path.startsWith(root + sep)) {
        response.writeHead(404).end('Not found');
        return;
      }
      if ((await stat(path)).isDirectory()) path = resolve(path, 'index.html');
      const bytes = await readFile(path);
      response.writeHead(200, { 'Content-Type': `${types[extname(path)] || 'application/octet-stream'}; charset=utf-8`, 'Cache-Control': 'no-store' });
      response.end(bytes);
    } catch {
      response.writeHead(404).end('Not found');
    }
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const flag = process.argv.indexOf('--port');
  const port = flag === -1 ? 4173 : Number(process.argv[flag + 1]);
  const server = createServer();
  server.listen(port, '127.0.0.1', () => console.log(`Guide: http://127.0.0.1:${server.address().port}/docs/`));
}
