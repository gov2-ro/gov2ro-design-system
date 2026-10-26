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
// The custom properties of gov2.css by scheme. The light values are the first :root block; the dark values are written twice
// (:root[data-g2-scheme=dark], and :root[data-g2-scheme=auto] inside a prefers-color-scheme media query). Each entry maps a token to its channels.
export function tokenBlocks(source = css) {
  const block = selector => {
    const found = source.match(new RegExp(`(?:^|\\n)${selector}\\s*\\{([^}]*)\\}`));
    if (!found) throw new Error(`gov2.css has no ${selector} block`);
    return found[1];
  };
  const parse = text => Object.fromEntries([...text.matchAll(/^\s*(--[\w-]+):\s*([^;]+);/gm)].map(m => [m[1], m[2].trim()]));
  const scheme = text => text.match(/^\s*color-scheme:\s*(\w+);/m)?.[1];
  const light = block(':root'), dark = block(':root\\[data-g2-scheme=dark\\]'), auto = block(':root\\[data-g2-scheme=auto\\]');
  return { light: parse(light), dark: parse(dark), auto: parse(auto), schemes: { light: scheme(light), dark: scheme(dark), auto: scheme(auto) }, texts: { light, dark, auto } };
}
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
// Sets the colour scheme the way a project does: the attribute on the root element (null removes it).
export const setScheme = (page, value) => page.evaluate(v => (v === null ? document.documentElement.removeAttribute('data-g2-scheme') : document.documentElement.setAttribute('data-g2-scheme', v)), value);
// Text contrast on the rendered surfaces: every visible text node, and the border and value of every enabled field.
// `lowest` is the smallest ratio found, with its text. The surface under a text node is the stack of translucent and opaque backgrounds above it.
export const contrastReport = page => page.evaluate(() => {
  const parse = value => (value.match(/[\d.]+/g) || []).map(Number);
  const over = (top, bottom) => { const a = top[3] ?? 1; return [0, 1, 2].map(i => top[i] * a + bottom[i] * (1 - a)); };
  // With no opaque background in the chain, the canvas shows: white in the light scheme, rgb(18, 18, 18) in the dark scheme.
  const canvas = getComputedStyle(document.documentElement).colorScheme === 'dark' ? [18, 18, 18] : [255, 255, 255];
  const surface = element => {
    const stack = [];
    for (let e = element; e; e = e.parentElement) {
      const c = parse(getComputedStyle(e).backgroundColor);
      if ((c[3] ?? 1) > 0) { stack.push(c); if ((c[3] ?? 1) >= 1) break; }
    }
    return stack.reverse().reduce((result, c) => over(c, result), canvas);
  };
  const luminance = ([r, g, b]) => [r, g, b].map(v => { v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
  const ratio = (a, b) => { const [low, high] = [luminance(a), luminance(b)].sort((x, y) => x - y); return (high + .05) / (low + .05); };
  const problems = [];
  let text = 0, boundaries = 0, lowest = { ratio: Infinity, text: '' };
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let node; (node = walker.nextNode());) {
    if (!node.textContent.trim()) continue;
    const element = node.parentElement;
    if (element.closest(':disabled') || !element.getClientRects().length || getComputedStyle(element).visibility === 'hidden') continue;
    const style = getComputedStyle(element), background = surface(element), color = over(parse(style.color), background);
    const large = parseFloat(style.fontSize) >= 24 || (parseFloat(style.fontSize) >= 18.66 && Number(style.fontWeight) >= 700);
    const found = ratio(color, background);
    text++;
    if (found < lowest.ratio) lowest = { ratio: found, text: node.textContent.trim().slice(0, 30) };
    if (found < (large ? 3 : 4.5)) problems.push(`text "${node.textContent.trim().slice(0, 30)}" ${found.toFixed(2)}:1`);
  }
  for (const input of document.querySelectorAll('input:not(:disabled)')) {
    const style = getComputedStyle(input), background = surface(input.parentElement);
    boundaries++;
    const border = ratio(over(parse(style.borderTopColor), background), background);
    if (border < 3) problems.push(`#${input.id} border ${border.toFixed(2)}:1`);
    const value = ratio(over(parse(style.color), surface(input)), surface(input));
    if (value < 4.5) problems.push(`#${input.id} value ${value.toFixed(2)}:1`);
  }
  return { text, boundaries, problems, lowest };
});
