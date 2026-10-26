// Shared set-up for the browser checks: one local server, one browser, and the helpers that every test file uses.
import { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import { createServer } from '../scripts/serve.mjs';

export let browser, server, base;
export const root = new URL('../', import.meta.url);
export const read = path => readFile(new URL(path, root), 'utf8');
export const css = await read('gov2.css');
export const migration = await read('docs/migration-from-0.6.0.md');
export const reference = await read('COMPONENTS.md');
export const artifacts = process.env.GUIDE_ARTIFACT_DIR;

// Call once at the top of a test file: it starts the server and the browser before the tests and closes them after.
export function useBrowser() {
  before(async () => {
    server = createServer();
    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', resolve);
    });
    base = `http://127.0.0.1:${server.address().port}`;
    browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || undefined });
    console.log(`Browser: ${await browser.version()}; external requests blocked for reproducible fallback checks.`);
  });
  after(async () => {
    await browser?.close();
    if (server) await new Promise(resolve => server.close(resolve));
  });
}

export async function withPage(run, { path = '/docs/', ...options } = {}) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, ...options });
  await context.route('**/*', route => route.request().url().startsWith(base) ? route.continue() : route.abort());
  const page = await context.newPage();
  try {
    const response = await page.goto(base + path, { waitUntil: 'networkidle' });
    assert.equal(response.status(), 200, `Fixture unavailable: ${path}`);
    await run(page, context);
  } finally { await context.close(); }
}
export const fixture = run => withPage(run, { path: '/tests/contract.html' });
// A code block of docs/migration-from-0.6.0.md, marked with <!-- example: name -->. The tests run the documented text.
export function example(name) {
  const fence = '`'.repeat(3);
  const match = migration.match(new RegExp(`<!-- example: ${name} -->\\s*${fence}\\w+\\n([\\s\\S]*?)${fence}`));
  assert.ok(match, `docs/migration-from-0.6.0.md has no example "${name}"`);
  return match[1];
}
// Serves in-memory files (by path) on the test origin. Other local paths come from the repository.
export async function withSite(files, run, { entry = '/index.html', ...options } = {}) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, ...options });
  await context.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.origin !== base) return route.abort();
    if (!(url.pathname in files)) return route.continue();
    return route.fulfill({ contentType: url.pathname.endsWith('.css') ? 'text/css' : 'text/html', body: files[url.pathname] });
  });
  const page = await context.newPage();
  try {
    const response = await page.goto(base + entry, { waitUntil: 'networkidle' });
    assert.equal(response.status(), 200, `Page unavailable: ${entry}`);
    await run(page, context);
  } finally { await context.close(); }
}
export const standaloneSite = () => ({ '/index.html': example('standalone-page'), '/assets/gov2.css': css });
export const layeredSite = () => ({ '/index.html': example('layered-page'), '/assets/reset.css': example('reset-css'), '/assets/app.css': example('app-css'), '/assets/gov2.css': css });
export const styles = (page, selector) => page.locator(selector).evaluate(el => {
  const s = getComputedStyle(el), r = el.getBoundingClientRect();
  return { color: s.color, background: s.backgroundColor, border: s.borderColor, height: r.height, width: r.width,
    outline: s.outlineStyle, outlineWidth: s.outlineWidth, outlineColor: s.outlineColor,
    shadow: s.boxShadow, decoration: s.textDecorationThickness, focused: el.matches(':focus-visible'),
    opacity: s.opacity, cursor: s.cursor, paddingLeft: s.paddingLeft, fontSize: s.fontSize };
});
// Keyboard focus, then keyboard focus with the pointer over the control: both must show the gov2 focus treatment.
export async function assertFocusReadable(page, selector) {
  await keyboardFocus(page, selector);
  for (let state = 0; state < 2; state++) {
    if (state) await page.locator(selector).hover();
    const s = await styles(page, selector);
    assert.equal(s.background, 'rgb(255, 221, 0)', `${selector} loses the focus background${state ? ' on hover' : ''}`);
    assert.ok(contrast(s.color, s.background) >= 4.5, `${selector} focus text is unreadable${state ? ' on hover' : ''}`);
  }
}
export function contrast(a, b) {
  const luminance = value => {
    const channels = value.match(/[\d.]+/g).slice(0, 3).map(Number).map(v => {
      v /= 255;
      return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4;
    });
    return channels.reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
  };
  const [low, high] = [luminance(a), luminance(b)].sort((x, y) => x - y);
  return (high + .05) / (low + .05);
}
export async function keyboardFocus(page, selector) {
  await page.keyboard.press('Tab');
  await page.locator(selector).focus();
  assert.equal(await page.locator(selector).evaluate(el => el.matches(':focus-visible')), true);
}
