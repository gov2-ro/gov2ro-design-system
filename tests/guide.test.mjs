import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { chromium } from 'playwright';
import { createServer } from '../scripts/serve.mjs';

let browser, server, base;
const css = await readFile(new URL('../gov2.css', import.meta.url), 'utf8');
const artifacts = process.env.GUIDE_ARTIFACT_DIR;

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

async function withPage(run, { path = '/docs/', ...options } = {}) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, ...options });
  await context.route('**/*', route => route.request().url().startsWith(base) ? route.continue() : route.abort());
  const page = await context.newPage();
  try {
    const response = await page.goto(base + path, { waitUntil: 'networkidle' });
    assert.equal(response.status(), 200, `Fixture unavailable: ${path}`);
    await run(page, context);
  } finally { await context.close(); }
}
const fixture = run => withPage(run, { path: '/tests/contract.html' });
const styles = (page, selector) => page.locator(selector).evaluate(el => {
  const s = getComputedStyle(el), r = el.getBoundingClientRect();
  return { color: s.color, background: s.backgroundColor, border: s.borderColor, height: r.height,
    outline: s.outlineStyle, outlineWidth: s.outlineWidth, outlineColor: s.outlineColor,
    shadow: s.boxShadow, decoration: s.textDecorationThickness, focused: el.matches(':focus-visible') };
});
function contrast(a, b) {
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
async function keyboardFocus(page, selector) {
  await page.keyboard.press('Tab');
  await page.locator(selector).focus();
  assert.equal(await page.locator(selector).evaluate(el => el.matches(':focus-visible')), true);
}

// Documentation integrity and useful behaviour.
test('archive is linked and labels the preserved guide as historical', () => withPage(async page => {
  await page.getByRole('link', { name: 'Arhivă', exact: true }).click();
  assert.match(await page.title(), /Arhiva/);
  assert.match(await page.locator('main').textContent(), /Copie istorică, nemodificată/);
  assert.equal((await page.request.get(`${base}/docs/archive/README.md`)).status(), 200);
  const snapshot = await page.request.get(`${base}/docs/archive/2026-10-26-bundled-guide.html`);
  assert.equal(snapshot.status(), 200);
  const hash = createHash('sha256').update(await snapshot.body()).digest('hex');
  assert.equal(hash, '3cdbe56f9a4bec755eb6b03e7c44344b38d5e0009a48dc2e89b3116607451952');
  await page.getByRole('link', { name: 'Înapoi la ghidul viu' }).click();
  assert.equal(await page.locator('main section').count(), 14);
}));

test('archived original still renders its bundled reference content', () => withPage(async page => {
  await page.locator('h1').waitFor();
  assert.match(await page.locator('h1').textContent(), /Un singur aspect/);
}, { path: '/docs/archive/2026-10-26-bundled-guide.html' }));

test('guide has metadata, landmarks and a direct link to the distributed stylesheet', () => withPage(async page => {
  assert.equal(await page.locator('html').getAttribute('lang'), 'ro');
  assert.match(await page.title(), /gov2.*design/);
  assert.equal(await page.locator('h1').count(), 1);
  assert.equal(await page.locator('main').count(), 1);
  assert.equal(await page.locator('link[href="../gov2.css"]').count(), 1);
  assert.equal(await page.locator('script[src]').count(), 1);
  assert.equal(await page.locator('script[type="__bundler/manifest"]').count(), 0);
}));

test('every core component class has a rendered example', () => withPage(async page => {
  const classes = [...new Set(css.match(/\.g2-[\w-]+/g))];
  for (const name of classes) assert.ok(await page.locator(name).count(), `${name} has no example`);
}));

test('no duplicate IDs, broken fragment links, missing local links or missing labels', () => withPage(async page => {
  const problems = await page.evaluate(() => {
    const issues = [], seen = new Set();
    for (const el of document.querySelectorAll('[id]')) {
      if (seen.has(el.id)) issues.push(`duplicate id ${el.id}`);
      seen.add(el.id);
    }
    for (const a of document.querySelectorAll('a[href^="#"]')) {
      if (!document.getElementById(a.hash.slice(1))) issues.push(`missing fragment ${a.hash}`);
    }
    for (const input of document.querySelectorAll('input')) {
      if (!input.labels.length) issues.push(`unlabelled input ${input.id}`);
      for (const id of (input.getAttribute('aria-describedby') || '').split(' ').filter(Boolean)) {
        if (!document.getElementById(id)) issues.push(`missing description ${id}`);
      }
    }
    return issues;
  });
  assert.deepEqual(problems, []);
  const paths = await page.locator('a[href]').evaluateAll(els => [...new Set(els.map(a => a.href).filter(url => url.startsWith(location.origin) && !url.includes('#')))]);
  for (const path of paths) assert.equal((await page.request.get(path)).status(), 200, path);
}));

test('guide reads without JavaScript and code remains available in native details', () => withPage(async page => {
  assert.equal(await page.locator('main section').count(), 14);
  const details = page.locator('details').first();
  await details.locator('summary').click();
  assert.ok(await details.locator('pre').isVisible());
  assert.equal(await page.locator('.guide-copy:visible').count(), 0);
  assert.ok(await page.locator('#notice-example').isVisible());
  assert.ok(await page.locator('#chip-toggle').isDisabled());
}, { javaScriptEnabled: false }));

test('copy buttons copy the visible example text', () => withPage(async page => {
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { value: { writeText: async text => { window.copiedExample = text; } }, configurable: true }));
  const details = page.locator('details').first();
  await details.locator('summary').click();
  await details.locator('[data-copy]').click();
  assert.equal(await details.locator('[data-copy]').textContent(), 'Copiat');
  assert.equal(await page.evaluate(() => window.copiedExample), await details.locator('code').textContent());
  assert.equal(await page.locator('#copy-status').textContent(), 'Cod copiat.');
}));

test('clipboard denial exposes a manual-copy fallback', () => withPage(async page => {
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { value: { writeText: async () => { throw new Error('denied'); } }, configurable: true }));
  const details = page.locator('details').first();
  await details.locator('summary').click();
  await details.locator('[data-copy]').click();
  assert.equal(await details.locator('[data-copy]').textContent(), 'Cod selectat');
  assert.match(await page.locator('#copy-status').textContent(), /Ctrl\+C/);
  assert.equal(await page.evaluate(() => getSelection().toString()), await details.locator('code').textContent());
}));

test('chip toggle updates its accessible state and selected border', () => withPage(async page => {
  const chip = page.locator('#chip-toggle');
  await chip.click();
  assert.equal(await chip.getAttribute('aria-pressed'), 'true');
  assert.equal((await styles(page, '#chip-toggle')).border, 'rgb(11, 12, 12)');
  await chip.click();
  assert.equal(await chip.getAttribute('aria-pressed'), 'false');
  assert.equal((await styles(page, '#chip-toggle')).border, 'rgba(0, 0, 0, 0)');
}));

test('notice dismissal and restoration retain keyboard focus; reload resets the demo', () => withPage(async page => {
  await page.locator('[data-demo-dismiss]').click();
  assert.equal(await page.locator('#notice-example').isVisible(), false);
  assert.equal(await page.locator('[data-demo-restore]').evaluate(el => el === document.activeElement), true);
  await page.locator('[data-demo-restore]').click();
  assert.ok(await page.locator('#notice-example').isVisible());
  assert.equal(await page.locator('[data-demo-dismiss]').evaluate(el => el === document.activeElement), true);
  await page.reload({ waitUntil: 'networkidle' });
  assert.ok(await page.locator('#notice-example').isVisible());
}));

test('editing the stylesheet response immediately changes the guide example', () => withPage(async page => {
  const before = (await styles(page, '#primary-button')).background;
  await page.route('**/gov2.css', route => route.fulfill({ contentType: 'text/css', body: css + '\n.g2-btn{background:rgb(1,2,3)}' }));
  await page.reload({ waitUntil: 'networkidle' });
  assert.notEqual((await styles(page, '#primary-button')).background, before);
  assert.equal((await styles(page, '#primary-button')).background, 'rgb(1, 2, 3)');
}));

test('guide enhancements produce no browser exceptions', () => withPage(async page => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.reload({ waitUntil: 'networkidle' });
  await page.locator('#chip-toggle').click();
  await page.locator('[data-demo-dismiss]').click();
  assert.deepEqual(errors, []);
}));

for (const width of [1280, 768, 390, 320]) {
  test(`guide and expanded code reflow at ${width}px`, () => withPage(async page => {
    await page.setViewportSize({ width, height: 900 });
    await page.locator('details').evaluateAll(els => els.forEach(el => el.open = true));
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `page overflow at ${width}`);
    if (artifacts && [1280, 390, 320].includes(width)) {
      await mkdir(artifacts, { recursive: true });
      await page.locator('details').evaluateAll(els => els.forEach(el => el.open = false));
      await page.screenshot({ path: `${artifacts}/guide-${width}.png`, fullPage: true });
    }
  }));
}

test('text enlargement at 200% retains readable content without page overflow', () => withPage(async page => {
  await page.evaluate(() => { document.body.style.zoom = '2'; });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  assert.ok(await page.locator('h1').isVisible());
  assert.ok(await page.locator('#primary-button').isVisible());
}));

// Raw component fixtures have no guide CSS, so documentation cannot hide regressions.
for (const path of ['/tests/contract.html', '/tests/contract.html?reset=1']) {
  test(`consistent button/chip/input geometry: ${path}`, () => withPage(async page => {
    for (const selector of ['#primary', '#link-button']) assert.equal((await styles(page, selector)).height, 44);
    for (const selector of ['#chip', '#chip-button']) assert.equal((await styles(page, selector)).height, 36);
    assert.equal((await styles(page, '#input')).height, 40);
  }, { path }));
}

for (const selector of ['#wordmark', '#current', '#nav', '#plain', '#title', '#quiet', '#primary', '#secondary', '#danger', '#chip']) {
  test(`keyboard focus and hover plus focus are readable: ${selector}`, () => fixture(async page => {
    await keyboardFocus(page, selector);
    for (let state = 0; state < 2; state++) {
      if (state) await page.locator(selector).hover();
      const s = await styles(page, selector);
      assert.equal(s.background, 'rgb(255, 221, 0)');
      assert.ok(contrast(s.color, s.background) >= 4.5, `${selector} unreadable`);
    }
    if (selector === '#wordmark') {
      const s = await styles(page, '#wordmark em');
      assert.ok(contrast(s.color, 'rgb(255, 221, 0)') >= 4.5);
    }
  }));
}

test('form focus and error relationships survive rendered styling', () => fixture(async page => {
  await keyboardFocus(page, '#invalid');
  const s = await styles(page, '#invalid');
  assert.equal(s.outline, 'solid');
  assert.equal(s.outlineWidth, '3px');
  assert.equal(s.border, 'rgb(212, 53, 28)');
  assert.equal(await page.locator('#invalid').getAttribute('aria-describedby'), 'email-error');
  assert.equal(await page.locator('#invalid').getAttribute('aria-invalid'), 'true');
}));

test('false and empty current states stay unselected; true state selects', () => fixture(async page => {
  for (const selector of ['#chip', '#chip-false', '#chip-empty', '#chip-button']) assert.equal((await styles(page, selector)).border, 'rgba(0, 0, 0, 0)');
  assert.equal((await styles(page, '#chip-current')).border, 'rgb(11, 12, 12)');
}));

test('native disabled buttons cannot enter the keyboard tab sequence', () => fixture(async page => {
  await page.locator('#danger').focus();
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'chip');
  assert.ok(await page.locator('#disabled').isDisabled());
}));

test('hover feedback works in headless Chrome', () => fixture(async page => {
  await page.locator('#title').hover();
  assert.equal((await styles(page, '#title')).decoration, '3px');
  await page.locator('#primary').hover();
  assert.equal((await styles(page, '#primary')).background, 'rgb(0, 90, 48)');
}));

test('text and status foreground/background pairs meet ordinary-text contrast', () => fixture(async page => {
  const tags = page.locator('.g2-tag');
  for (let i = 0; i < await tags.count(); i++) {
    const s = await tags.nth(i).evaluate(el => ({ color: getComputedStyle(el).color, background: getComputedStyle(el).backgroundColor }));
    assert.ok(contrast(s.color, s.background) >= 4.5);
  }
  for (const selector of ['#plain', '#title', '#quiet']) assert.ok(contrast((await styles(page, selector)).color, 'rgb(255,255,255)') >= 4.5);
}));

test('forced colours preserve a keyboard focus outline', () => withPage(async page => {
  await keyboardFocus(page, '#primary');
  const s = await styles(page, '#primary');
  assert.notEqual(s.outline, 'none');
  assert.notEqual(s.outlineWidth, '0px');
  assert.notEqual(s.outlineColor, 'rgba(0, 0, 0, 0)');
}, { path: '/tests/contract.html', forcedColors: 'active' }));

test('reduced motion disables a project transition on a component', () => withPage(async page => {
  await page.addStyleTag({ content: '#primary{transition:transform 3s;animation:example 3s infinite}@keyframes example{to{transform:translateX(1px)}}' });
  const motion = await page.locator('#primary').evaluate(el => ({ transition: getComputedStyle(el).transitionDuration, animation: getComputedStyle(el).animationName }));
  assert.equal(motion.transition, '0s');
  assert.equal(motion.animation, 'none');
}, { path: '/tests/contract.html', reducedMotion: 'reduce' }));

test.todo('brief 01: whole-site activation without data-skin, after the accepted API migration');
test.todo('brief 01: reset/gov2/utilities/app layer precedence, after the accepted API migration');
