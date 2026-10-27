import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { useBrowser, base, read, css, migration, reference, artifacts, withPage, fixture, example, withSite,
  standaloneSite, layeredSite, styles, assertFocusReadable, contrast, keyboardFocus, tokenBlocks } from './helpers.mjs';

useBrowser();

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
  assert.equal(await page.locator('main section').count(), 17);
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
  assert.equal(await page.locator('main section').count(), 17);
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
for (const path of ['/tests/contract.html', '/tests/contract.html?reset=1', '/tests/contract.html?reset=unlayered']) {
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

// ---- Brief 01: the shared CSS contract (activation, names, layers, customization, migration) ----
// The light values are the public token list. The dark values (brief 05) redefine a subset of the same names: tests/scheme.test.mjs checks them.
const tokens = tokenBlocks().light;
const classes = [...new Set(css.match(/\.g2-[\w-]+/g))];
const statuses = ['neutral', 'info', 'progress', 'warning', 'success', 'danger'];
// Tokens added after 0.8.0: the type scale, the spacing scale and the gutter (brief 04), and four colour tokens for the dark scheme (brief 05).
const foundationTokens = ['--g2-font-size-heading-page', '--g2-font-size-heading-section', '--g2-font-size-heading-item', '--g2-font-size-body', '--g2-font-size-meta', '--g2-font-size-label',
  '--g2-line-height-heading', '--g2-line-height-body', '--g2-gutter', '--g2-space-1', '--g2-space-2', '--g2-space-3', '--g2-space-4', '--g2-space-5', '--g2-space-6', '--g2-space-7',
  '--g2-color-on-solid', '--g2-color-action-secondary-hover', '--g2-color-control-bg', '--g2-color-ro-blue-ring', '--g2-color-highlight-bg'];
// Files that describe the current API. History (changelog, activity, ADRs, briefs, migration) may name old identifiers.
const currentFiles = ['gov2.css', 'COMPONENTS.md', 'GUIDELINES.md', 'README.md', 'AGENTS.md', 'CLAUDE.md', 'patterns/README.md', 'docs/index.html', 'docs/guide.css', 'docs/guide.js',
  'docs/archive/index.html', 'docs/project-block.md', 'docs/connect-a-project.md', 'docs/testing.md', 'tests/contract.html',
  'docs/examples/directory.html', 'docs/examples/form.html', 'docs/examples/examples.css'];

test('contract: stylesheet has no activation gate, consumer reference or un-namespaced token, and every var() resolves', () => {
  assert.doesNotMatch(css, /data-skin/);
  assert.doesNotMatch(css, /posturi|check-skins|skin contract|skin file/i);
  const names = [...tokenBlocks().texts.light.matchAll(/(--[\w-]+)\s*:/g)].map(m => m[1]);
  assert.equal(names.length, Object.keys(tokens).length, 'a custom property is declared more than once in the light block');
  assert.equal([...css.matchAll(/(--[\w-]+)\s*:/g)].length, names.length + 2 * Object.keys(tokenBlocks().dark).length, 'a custom property is declared outside the light block and the two dark blocks');
  for (const name of [...css.matchAll(/(--[\w-]+)\s*:/g)].map(m => m[1])) assert.match(name, /^--g2-/, `${name} is not namespaced`);
  for (const name of Object.keys(tokenBlocks().dark)) assert.ok(tokens[name], `the dark block sets ${name}, which the light block does not define`);
  for (const use of css.matchAll(/var\((--[\w-]+)/g)) assert.ok(tokens[use[1]], `${use[1]} is not defined`);
});

test('contract: current files use no activation attribute, legacy token or legacy status value', async () => {
  for (const file of currentFiles) {
    const text = await read(file);
    assert.doesNotMatch(text, /data-skin/, `${file} names the activation attribute`);
    assert.doesNotMatch(text, /--(c|font|radius|border-ink|shadow-lift|shell)([^a-z0-9]|$)/m, `${file} names a legacy token`);
    assert.doesNotMatch(text, /data-tone=("|&quot;)?(warn|ok|bad)\b/, `${file} uses a legacy data-tone value`);
  }
});

test('contract: guide, archive page and fixtures resolve every var() against gov2.css', async () => {
  const files = ['docs/guide.css', 'docs/index.html', 'docs/archive/index.html', 'tests/contract.html', 'docs/examples/directory.html', 'docs/examples/form.html', 'docs/examples/examples.css'];
  const texts = await Promise.all(files.map(read));
  const local = new Set(texts.flatMap(text => [...text.matchAll(/(--[\w-]+)\s*:/g)].map(m => m[1])));
  texts.forEach((text, i) => {
    for (const use of text.matchAll(/var\((--[\w-]+)/g)) assert.ok(tokens[use[1]] || local.has(use[1]), `${files[i]}: ${use[1]} is not defined`);
  });
});

test('contract: the reference documents every public token and class, and no token or class that does not exist', () => {
  for (const name of Object.keys(tokens)) assert.ok(reference.includes(`\`${name}\``), `COMPONENTS.md does not document ${name}`);
  for (const name of classes) assert.ok(reference.includes(name), `COMPONENTS.md does not document ${name}`);
  for (const name of new Set(reference.match(/--g2-[\w-]+/g))) assert.ok(tokens[name], `COMPONENTS.md names ${name}, which gov2.css does not define`);
});

test('contract: the migration tables cover every 0.6.0 token with its exact value and every new token', () => {
  const rows = [...migration.matchAll(/^\| `(--[\w-]+)` \| (`--[\w-]+`|none) \| `([^`]+)` \|/gm)].map(m => ({ old: m[1], next: m[2] === 'none' ? null : m[2].slice(1, -1), value: m[3] }));
  assert.equal(rows.length, 62, 'the 0.6.0 stylesheet defined 62 tokens');
  assert.equal(new Set(rows.map(r => r.old)).size, 62);
  const retained = rows.filter(r => r.next);
  assert.equal(retained.length, 57, 'the 0.8.0 stylesheet defined 57 tokens');
  // Tokens added after 0.8.0 have no 0.6.0 name, so they have no row. COMPONENTS.md documents them.
  const added = Object.keys(tokens).filter(name => !retained.some(row => row.next === name)).sort();
  assert.deepEqual(added, [...foundationTokens].sort(), 'a token without a migration row must be a documented foundation token');
  for (const row of retained) assert.equal(tokens[row.next], row.value, `${row.old} -> ${row.next}: the value changed`);
  for (const row of rows) assert.equal(row.old in tokens, false, `${row.old} is still defined`);
  for (const row of rows.filter(r => !r.next)) assert.equal(row.next, null);
  assert.deepEqual(rows.filter(r => !r.next).map(r => r.old).sort(), ['--font-display', '--radius-lg', '--radius-md', '--radius-pill', '--shadow-lift']);
  for (const [oldName, newName] of [['--c-ink', '--g2-color-text'], ['--c-gov', '--g2-color-link'], ['--c-gov-bar', '--g2-color-header-bg'], ['--c-note-bg', '--g2-color-warning-bg'],
    ['--font-sans', '--g2-font-sans'], ['--shell', '--g2-container-max'], ['--c-ok-bg', '--g2-color-success-bg'], ['--c-alert-ink', '--g2-color-danger-ink']]) {
    assert.equal(rows.find(r => r.old === oldName)?.next, newName, `${oldName} must map to the accepted name ${newName}`);
  }
});

test('contract: the six status names agree in tokens, rules, reference, guide and fixture', async () => {
  const guide = await read('docs/index.html'), fixtureHtml = await read('tests/contract.html');
  for (const tone of statuses) {
    for (const part of ['bg', 'line', 'ink']) assert.ok(tokens[`--g2-color-${tone}-bg`] && tokens[`--g2-color-${tone}-${part}`], `missing --g2-color-${tone}-${part}`);
    if (tone !== 'neutral') {
      assert.ok(css.includes(`.g2-tag[data-tone=${tone}]{background:rgb(var(--g2-color-${tone}-bg));color:rgb(var(--g2-color-${tone}-ink))}`), `no tag rule for ${tone}`);
      assert.ok(reference.includes(`\`${tone}\``) && guide.includes(`data-tone="${tone}"`) && fixtureHtml.includes(`data-tone="${tone}"`), `${tone} is missing from the reference, guide or fixture`);
    }
  }
  assert.equal([...css.matchAll(/\.g2-tag\[data-tone=(\w+)\]/g)].length, 5);
  for (const old of ['note', 'ok', 'alert']) for (const part of ['bg', 'line', 'ink']) assert.equal(`--c-${old}-${part}` in tokens, false);
});

test('contract: each status renders its same-named tokens; the legacy values are not aliased', () => fixture(async page => {
  const result = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement);
    const rgb = name => `rgb(${root.getPropertyValue(name).trim().split(/\s+/).join(', ')})`;
    const tags = {};
    for (const tag of document.querySelectorAll('.g2-tag')) {
      const tone = tag.dataset.tone || 'neutral', s = getComputedStyle(tag);
      tags[tone] = { background: s.backgroundColor, color: s.color, expectedBackground: rgb(`--g2-color-${tone}-bg`), expectedColor: rgb(`--g2-color-${tone}-ink`) };
    }
    const legacy = {};
    for (const value of ['warn', 'ok', 'bad']) {
      const tag = Object.assign(document.createElement('strong'), { className: 'g2-tag' });
      tag.dataset.tone = value;
      document.body.append(tag);
      legacy[value] = getComputedStyle(tag).backgroundColor;
    }
    return { tags, legacy, neutral: rgb('--g2-color-neutral-bg') };
  });
  assert.deepEqual(Object.keys(result.tags).sort(), [...statuses].sort());
  for (const [tone, tag] of Object.entries(result.tags)) {
    assert.equal(tag.background, tag.expectedBackground, `${tone} background`);
    assert.equal(tag.color, tag.expectedColor, `${tone} text`);
  }
  for (const [value, background] of Object.entries(result.legacy)) assert.equal(background, result.neutral, `data-tone="${value}" must fall back to neutral`);
}));

// Whole-site activation.
test('contract: a minimal page gets the whole-site defaults from the stylesheet link alone', () => withSite(standaloneSite(), async page => {
  const state = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement), body = getComputedStyle(document.body), link = getComputedStyle(document.querySelector('a'));
    return { attributes: document.documentElement.getAttributeNames(), bodyChildren: [...document.body.children].map(el => el.tagName), links: document.querySelectorAll('link[rel=stylesheet]').length,
      text: root.getPropertyValue('--g2-color-text').trim(), container: root.getPropertyValue('--g2-container-max').trim(),
      font: body.fontFamily, size: body.fontSize, line: body.lineHeight, color: body.color, background: body.backgroundColor, margin: body.marginTop,
      link: link.color, decoration: link.textDecorationLine };
  });
  assert.deepEqual(state.attributes, ['lang']);
  assert.deepEqual(state.bodyChildren, ['MAIN']);
  assert.equal(state.links, 1);
  assert.equal(state.text, '11 12 12');
  assert.equal(state.container, '80rem');
  assert.match(state.font, /^Inter,/);
  assert.equal(state.size, '17px');
  assert.equal(state.line, '26.35px');
  assert.equal(state.color, 'rgb(11, 12, 12)');
  assert.equal(state.background, 'rgb(255, 255, 255)');
  assert.equal(state.margin, '0px');
  assert.equal(state.link, 'rgb(29, 79, 191)');
  assert.equal(state.decoration, 'underline');
  await assertFocusReadable(page, 'a');
  await assertFocusReadable(page, 'button.g2-btn');
  assert.equal((await styles(page, 'button.g2-btn')).height, 44);
}));

// The live guide opts in to the colour scheme with data-g2-scheme="auto" (brief 05). That is the only attribute besides lang; it is not an activation attribute.
for (const path of ['/tests/contract.html', '/docs/', '/docs/archive/']) {
  test(`contract: ${path} sets no activation attribute and still gets the defaults`, () => withPage(async page => {
    assert.deepEqual(await page.evaluate(() => document.documentElement.getAttributeNames()), path === '/docs/' ? ['lang', 'data-g2-scheme'] : ['lang']);
    if (path === '/docs/') assert.equal(await page.evaluate(() => document.documentElement.dataset.g2Scheme), 'auto');
    const state = await page.evaluate(() => ({ text: getComputedStyle(document.documentElement).getPropertyValue('--g2-color-text').trim(), font: getComputedStyle(document.body).fontFamily }));
    assert.equal(state.text, '11 12 12');
    assert.match(state.font, /^Inter,/);
  }, { path }));
}

// Layers.
test('contract: gov2.css declares the public layer order first and keeps every rule inside a layer', () => withSite(standaloneSite(), async page => {
  const sheet = await page.evaluate(() => {
    const rules = [...[...document.styleSheets].find(s => s.href?.endsWith('/assets/gov2.css')).cssRules];
    const kind = rule => rule.constructor.name;
    return { kinds: rules.map(kind), statements: rules.filter(r => kind(r) === 'CSSLayerStatementRule').map(r => [...r.nameList]),
      blocks: Object.fromEntries(rules.filter(r => kind(r) === 'CSSLayerBlockRule').map(r => [r.name, [...r.cssRules].map(x => x.selectorText ?? x.conditionText)])) };
  });
  assert.deepEqual(sheet.kinds.slice(0, 2), ['CSSLayerStatementRule', 'CSSLayerStatementRule']);
  assert.deepEqual(sheet.statements, [['reset', 'gov2', 'utilities', 'app'], ['gov2.tokens', 'gov2.base', 'gov2.components', 'gov2.states']]);
  assert.deepEqual(Object.keys(sheet.blocks), ['gov2.tokens', 'gov2.base', 'gov2.components', 'gov2.states']);
  assert.deepEqual(sheet.kinds.filter(kind => !['CSSLayerStatementRule', 'CSSLayerBlockRule', 'CSSImportRule'].includes(kind)), [], 'a rule sits outside every layer');
  // The tokens layer holds the light block, the dark block and the dark block for prefers-color-scheme (the media rule shows its condition).
  assert.deepEqual(sheet.blocks['gov2.tokens'], [':root', ':root[data-g2-scheme="dark"]', '(prefers-color-scheme: dark)']);
  const components = sheet.blocks['gov2.components'].join('\n'), states = sheet.blocks['gov2.states'].join('\n');
  assert.doesNotMatch(components, /focus-visible|:disabled|aria-pressed|field-error \.g2-input/);
  for (const state of [':focus-visible', ':disabled', 'aria-pressed', '.g2-field-error .g2-input']) assert.ok(states.includes(state), `${state} belongs in gov2.states`);
  assert.match(components, /:hover/, 'hover stays with the component defaults');
  assert.doesNotMatch(states, /:hover/);
}));

test('contract: reset < gov2 < utilities < app, whatever the specificity; unlayered rules outrank all of them', () => fixture(async page => {
  const padding = async () => (await styles(page, '#chip')).paddingLeft;
  await page.locator('#chip').evaluate(el => el.classList.add('probe'));
  assert.equal(await padding(), '10px', 'gov2 default');
  await page.addStyleTag({ content: '@layer reset{#chip{padding-left:1px}}' });
  assert.equal(await padding(), '10px', 'an id selector in reset still loses to a gov2 class rule');
  await page.addStyleTag({ content: '@layer utilities{.probe{padding-left:3px}}' });
  assert.equal(await padding(), '3px', 'utilities beat gov2');
  await page.addStyleTag({ content: '@layer app{.probe{padding-left:4px}}' });
  assert.equal(await padding(), '4px', 'app beats utilities');
  await page.addStyleTag({ content: '@layer utilities{#chip.probe{padding-left:9px}}' });
  assert.equal(await padding(), '4px', 'a more specific utilities rule still loses to app');
  await page.addStyleTag({ content: '.probe{padding-left:5px}' });
  assert.equal(await padding(), '5px', 'an unlayered rule beats every layer');
}));

test('contract: the documented layered page lets project rules in app win while gov2 focus stays visible', () => withSite(layeredSite(), async page => {
  const compact = 'button.btn-compact:not(.btn-promo)', link = 'a.btn-compact', promo = 'button.btn-promo';
  assert.deepEqual(await page.evaluate(() => document.documentElement.getAttributeNames()), ['lang']);
  assert.equal(await page.locator('p').first().evaluate(el => getComputedStyle(el).marginTop), '0px', 'the reset layer applies');
  assert.equal((await styles(page, 'a[href="/despre"]')).color, 'rgb(29, 79, 191)', 'gov2 base beats the reset link rule');
  // Page-width token override and a project container.
  assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--g2-container-max').trim()), '60rem');
  assert.equal((await styles(page, '.site-container')).width, 960);
  // Compact variant: project class next to the component class.
  for (const selector of [compact, link, promo]) {
    const s = await styles(page, selector);
    assert.equal(s.height, 36, `${selector} height`);
    assert.equal(s.fontSize, '15px', `${selector} font size`);
    assert.equal(s.paddingLeft, '12px', `${selector} padding`);
  }
  // Keyboard focus and hover plus focus after customization.
  for (const selector of [compact, link, promo]) await assertFocusReadable(page, selector);
  await keyboardFocus(page, '#q');
  const field = await styles(page, '#q');
  assert.equal(field.outline, 'solid');
  assert.equal(field.outlineColor, 'rgb(255, 221, 0)');
  // Recoloured variant: contrast at rest and on hover.
  await page.locator('body').click({ position: { x: 1, y: 1 } });
  await page.evaluate(() => document.activeElement.blur());
  await page.mouse.move(0, 0);
  const rest = await styles(page, promo);
  assert.equal(rest.background, 'rgb(122, 31, 92)');
  assert.ok(contrast(rest.color, rest.background) >= 4.5, 'recoloured button contrast');
  await page.locator(promo).hover();
  const hover = await styles(page, promo);
  assert.equal(hover.background, 'rgb(96, 24, 72)');
  assert.ok(contrast(hover.color, hover.background) >= 4.5, 'recoloured button hover contrast');
}));

test('contract: documented limits hold: late-layer colours beat gov2 focus, unlayered rules beat all layers', () => withSite(layeredSite(), async page => {
  const compact = 'button.btn-compact:not(.btn-promo)';
  await page.addStyleTag({ content: '@layer app{.btn-compact{background:rgb(1,2,3)}}' });
  await keyboardFocus(page, compact);
  assert.equal((await styles(page, compact)).background, 'rgb(1, 2, 3)', 'a project background in app replaces the gov2 focus background');
  await page.addStyleTag({ content: '@layer utilities{.btn-compact{color:rgb(4,5,6)}}' });
  assert.notEqual((await styles(page, compact)).color, 'rgb(11, 12, 12)', 'a utilities colour replaces the gov2 focus text colour unless app sets none');
  await page.addStyleTag({ content: 'a{color:rgb(7,8,9)}' });
  assert.equal((await styles(page, 'a.btn-compact')).color, 'rgb(7, 8, 9)', 'an unlayered rule beats every gov2 layer');
}));

test('contract: a layer created before the order declaration keeps its position', async () => {
  const page = head => ({ '/index.html': `<!doctype html><html lang="ro"><head><meta charset="utf-8"><title>x</title>${head}<link rel="stylesheet" href="/assets/gov2.css"><style>@layer utilities{.u-flush{padding-left:3px}}</style></head><body><a class="g2-chip u-flush" href="/x">Filtru</a></body></html>`, '/assets/gov2.css': css });
  await withSite(page('<style>@layer reset, gov2, utilities, app;</style>'), async p => assert.equal((await styles(p, '.g2-chip')).paddingLeft, '3px', 'order declared first: utilities beat gov2'));
  await withSite(page('<style>@layer utilities;</style>'), async p => assert.equal((await styles(p, '.g2-chip')).paddingLeft, '10px', 'utilities created first sit before gov2 and lose'));
});

test('contract: documented @import into layers keeps the public order', () => withSite({
  '/index.html': '<!doctype html><html lang="ro"><head><meta charset="utf-8"><title>x</title><link rel="stylesheet" href="/assets/project.css"></head><body><p><a href="/x">Link</a></p><button class="g2-btn" type="button">Caută</button></body></html>',
  '/assets/project.css': example('import-css'),
  '/assets/vendor-reset.css': 'a{color:inherit}p{margin:0}',
  '/assets/gov2.css': css,
  '/assets/app.css': '.g2-btn{padding-left:3px}',
}, async page => {
  assert.equal(await page.locator('p').evaluate(el => getComputedStyle(el).marginTop), '0px', 'unlayered reset imported into the reset layer applies');
  assert.equal((await styles(page, 'a')).color, 'rgb(29, 79, 191)', 'gov2 beats the reset');
  assert.equal((await styles(page, '.g2-btn')).paddingLeft, '3px', 'unlayered project CSS imported into app beats gov2');
  await assertFocusReadable(page, '.g2-btn');
}));

// Component states under the layered cascade.
test('contract: disabled controls keep their appearance, also under the pointer', () => fixture(async page => {
  for (const hovered of [false, true]) {
    if (hovered) await page.locator('#disabled').hover({ force: true });
    const s = await styles(page, '#disabled');
    assert.equal(s.opacity, '0.5');
    assert.equal(s.cursor, 'not-allowed');
  }
}));

test('contract: a selected chip keeps its border under keyboard focus and hover', () => fixture(async page => {
  await assertFocusReadable(page, '#chip-current');
  assert.equal((await styles(page, '#chip-current')).border, 'rgb(11, 12, 12)');
}));

test('contract: a field error shows at rest, on hover and with focus', () => fixture(async page => {
  assert.equal((await styles(page, '#invalid')).border, 'rgb(212, 53, 28)');
  assert.equal((await styles(page, '#email-error')).color, 'rgb(212, 53, 28)');
  await page.locator('#invalid').hover();
  assert.equal((await styles(page, '#invalid')).border, 'rgb(212, 53, 28)');
  await keyboardFocus(page, '#invalid');
  const s = await styles(page, '#invalid');
  assert.equal(s.border, 'rgb(212, 53, 28)');
  assert.equal(s.outlineColor, 'rgb(255, 221, 0)');
  assert.equal(s.background, 'rgb(255, 255, 255)');
}));

test('contract: the focused current navigation link shows the standard focus bars, not the current-page bar', () => fixture(async page => {
  assert.match((await styles(page, '#current')).shadow, /^rgb\(140, 198, 255\) 0px -4px 0px 0px inset$/, 'current-page bar at rest');
  await assertFocusReadable(page, '#current');
  assert.equal((await styles(page, '#current')).shadow, 'rgb(255, 221, 0) 0px -2px 0px 0px, rgb(11, 12, 12) 0px 4px 0px 0px');
  assert.equal((await styles(page, '#current')).decoration, 'auto', 'hover does not underline a focused navigation link');
}));

test('contract: guide controls under the app-layer guide styles keep the gov2 focus treatment', () => withPage(async page => {
  const details = page.locator('details').first();
  await details.locator('summary').click();
  const id = await details.locator('[data-copy]').getAttribute('data-copy');
  assert.equal((await styles(page, `[data-copy="${id}"]`)).background, 'rgb(255, 255, 255)', 'copy button at rest');
  await assertFocusReadable(page, `[data-copy="${id}"]`);
  await assertFocusReadable(page, '.guide-toc a[href="#culoare"]');
  await assertFocusReadable(page, '#primary-button');
}));

test('notice bar: the hidden attribute hides it, and its text fills the row up to the close button', () => withSite({
  '/index.html': `<!doctype html><html lang="ro"><head><meta charset="utf-8"><title>Anunț</title><link rel="stylesheet" href="/assets/gov2.css"></head><body>
<div class="g2-notice-bar" id="shown" role="region" aria-label="Anunț"><p>Site în test.</p><button type="button" aria-label="Închide anunțul">×</button></div>
<div class="g2-notice-bar" id="closed" role="region" aria-label="Anunț închis" hidden><p>Închis.</p><button type="button" aria-label="Închide">×</button></div>
</body></html>`, '/assets/gov2.css': css }, async page => {
  assert.equal(await page.locator('#closed').evaluate(el => getComputedStyle(el).display), 'none');
  const geometry = await page.locator('#shown').evaluate(bar => {
    const p = bar.querySelector('p'), b = bar.querySelector('button'), s = getComputedStyle(p);
    return { margin: s.marginTop + ' ' + s.marginBottom, gap: b.getBoundingClientRect().left - p.getBoundingClientRect().right,
      right: bar.getBoundingClientRect().right - b.getBoundingClientRect().right, padding: parseFloat(getComputedStyle(bar).paddingRight) };
  });
  assert.equal(geometry.margin, '0px 0px');
  assert.equal(geometry.gap, 10, 'the text grows up to the flex gap before the button');
  assert.equal(geometry.right, geometry.padding, 'the close button sits at the right edge');
}));
