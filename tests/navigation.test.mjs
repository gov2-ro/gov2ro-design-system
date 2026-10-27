// Brief 07: navigation and data components (issues #3 to #8): breadcrumbs, pagination, data table, summary list, skip link, focus fill on tabindex="-1", highlight token.
// Static checks read gov2.css and the documents. Browser checks use tests/contract.html (raw components, ?scheme=...), the guide and both example pages.
// The changelog entry is found by its first line, not by the "Unreleased" heading or a version number.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { useBrowser, read, css, reference, tokenBlocks, withPage, withSite, standaloneSite, styles, contrast, keyboardFocus, contrastReport, setScheme } from './helpers.mjs';

useBrowser();

const blocks = tokenBlocks();
const light = blocks.light, dark = { ...blocks.light, ...blocks.dark };
const guideHtml = (await read('docs/index.html')).replace(/&quot;/g, '"'), fixtureHtml = await read('tests/contract.html');
const classes = ['g2-breadcrumbs', 'g2-pagination', 'g2-table', 'g2-table-stacked', 'g2-table-wrap', 'g2-cell-num', 'g2-summary-list', 'g2-skip-link'];
const examplePaths = ['/docs/examples/directory.html', '/docs/examples/form.html'];
const classesOf = html => new Set([...html.matchAll(/\sclass="([^"]*)"/g)].flatMap(m => m[1].split(/\s+/)).filter(Boolean));
const fixturePath = scheme => `/tests/contract.html?scheme=${scheme}`;
const fx = (scheme, run, options = {}) => withPage(run, { path: fixturePath(scheme), ...options });
const channels = value => value.trim().split(/\s+/).map(Number);
const linear = v => { v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; };
const luminance = value => channels(value).map(linear).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
const ratio = (a, b) => { const [low, high] = [luminance(a), luminance(b)].sort((x, y) => x - y); return (high + .05) / (low + .05); };
const lab = value => {
  const [r, g, b] = channels(value).map(linear);
  const x = (.4124 * r + .3576 * g + .1805 * b) / .95047, y = .2126 * r + .7152 * g + .0722 * b, z = (.0193 * r + .1192 * g + .9505 * b) / 1.08883;
  const f = t => t > .008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
};
const deltaE = (a, b) => Math.hypot(...lab(a).map((v, i) => v - lab(b)[i]));
const rgbOf = token => `rgb(${channels(token).join(', ')})`;
const overflowFree = page => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);

// ---- Static: names, token, layers, documents (acceptance 1, 6, 7) ----
test('navigation: every new class and the token are in gov2.css, COMPONENTS.md, the guide and the raw fixture (acceptance 1)', () => {
  for (const name of classes) {
    assert.ok(css.includes(`.${name}`), `${name} is not in gov2.css`);
    assert.ok(reference.includes(`\`.${name}\``), `${name} is not in COMPONENTS.md`);
    assert.ok(classesOf(guideHtml).has(name), `${name} has no example in docs/index.html`);
    assert.ok(classesOf(fixtureHtml).has(name), `${name} has no raw fixture in tests/contract.html`);
  }
  assert.ok(reference.includes('`--g2-color-highlight-bg`') && reference.includes('`mark`'), 'COMPONENTS.md documents the token and the mark rule');
  assert.ok(guideHtml.includes('--g2-color-highlight-bg') && guideHtml.includes('&lt;mark&gt;'), 'the guide shows the token and mark');
  assert.ok(/<mark[ >]/.test(fixtureHtml), 'the fixture has a mark');
  for (const title of ['Skip link', 'Breadcrumbs', 'Pagination', 'Data table', 'Summary list', 'Highlight']) assert.match(reference, new RegExp(`^## ${title}$`, 'm'), `COMPONENTS.md has no section ${title}`);
  const missing = reference.slice(reference.indexOf('## Not in the DS yet'));
  assert.doesNotMatch(missing, /pagination|breadcrumbs|summary lists|skip link/i, 'the "Not in the DS yet" list no longer names the new pieces');
  assert.match(missing, /tabs/i, 'tabs stay on the list');
});

test('navigation: the highlight token has the decided light value and a dark value; no other token is added (acceptance 1)', () => {
  assert.equal(light['--g2-color-highlight-bg'], '255 247 191');
  assert.match(blocks.texts.light, /--g2-color-highlight-bg:[^;]*;\s*\/\*\s*#fff7bf/);
  assert.equal(blocks.dark['--g2-color-highlight-bg'], '92 77 0');
  assert.equal(blocks.dark['--g2-color-highlight-bg'], blocks.auto['--g2-color-highlight-bg'], 'the two dark blocks agree');
  assert.match(css.replace(/\/\*[\s\S]*?\*\//g, ''), /\nmark\{background:rgb\(var\(--g2-color-highlight-bg\)\);color:rgb\(var\(--g2-color-text\)\)\}/);
  assert.equal(Object.keys(light).filter(n => /highlight/.test(n)).length, 1);
});

test('navigation: the rules sit in the right layers (acceptance 5)', () => withSite(standaloneSite(), async page => {
  const layers = await page.evaluate(() => Object.fromEntries([...[...document.styleSheets].find(s => s.href?.endsWith('/assets/gov2.css')).cssRules]
    .filter(r => r.constructor.name === 'CSSLayerBlockRule').map(r => [r.name, [...r.cssRules].map(x => x.selectorText ?? x.conditionText).join('\n')])));
  for (const selector of ['.g2-skip-link', '.g2-breadcrumbs ol', '.g2-pagination', '.g2-table', '.g2-table-wrap', '.g2-summary-list']) assert.ok(layers['gov2.components'].includes(selector), `${selector} belongs in gov2.components`);
  assert.ok(layers['gov2.base'].includes('mark'), 'the mark rule is in gov2.base');
  assert.match(layers['gov2.states'], /tabindex="-1"/, 'the tabindex fix is in gov2.states');
  assert.ok(layers['gov2.states'].includes('.g2-table-wrap:focus-visible'));
  assert.doesNotMatch(layers['gov2.components'] + layers['gov2.base'], /focus-visible/, 'no focus rule outside gov2.states');
}));

test('navigation: examples.css no longer has the rules that the shared pieces replace, and both pages use the pieces (acceptance 6)', async () => {
  const local = await read('docs/examples/examples.css');
  assert.doesNotMatch(local, /ex-skip|ex-facts/);
  assert.doesNotMatch(guideHtml, /ex-skip|ex-facts|guide-skip/);
  assert.doesNotMatch(await read('docs/guide.css'), /guide-skip/);
  for (const path of examplePaths) {
    const html = await read(path.slice(1)), used = classesOf(html);
    assert.ok(used.has('g2-skip-link') && used.has('g2-breadcrumbs'), `${path} uses the skip link and breadcrumbs`);
    assert.match(html, /<main [^>]*id="continut"[^>]*tabindex="-1"/, `${path}: the skip target has tabindex="-1"`);
    assert.doesNotMatch(html, /ex-skip/);
  }
  assert.ok(classesOf(await read('docs/examples/directory.html')).has('g2-pagination'), 'the directory page has pagination');
  assert.match(await read('docs/examples/directory.html'), /<mark>/, 'the directory page highlights the search word');
  assert.ok(classesOf(await read('docs/examples/form.html')).has('g2-summary-list'), 'the form page uses the summary list');
});

test('navigation: every data table has a caption or an accessible name, and every header cell has scope (acceptance 2)', async () => {
  for (const [file, html] of [['guide', guideHtml], ['fixture', fixtureHtml], ...await Promise.all(examplePaths.map(async p => [p, await read(p.slice(1))]))]) {
    const decoded = html.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    for (const table of decoded.matchAll(/<table class="g2-table[^"]*"[^>]*>[\s\S]*?<\/table>/g)) {
      assert.match(table[0], /<caption>|aria-label|aria-labelledby/, `${file}: a g2-table has no caption or name`);
      for (const th of table[0].matchAll(/<th\b[^>]*>/g)) assert.match(th[0], /scope="(col|row)"/, `${file}: ${th[0]} has no scope`);
    }
  }
  for (const needle of ['<caption>', 'scope', 'tabindex="0"', 'role="region"', 'accessible name']) assert.ok(reference.includes(needle), `COMPONENTS.md does not say ${needle}`);
});

test('navigation: the changelog, backlog, migration document and testing document name brief 07, and the archive bytes are unchanged (acceptance 7)', async () => {
  const changelog = await read('CHANGELOG.md');
  const section = changelog.split(/^## /m).find(part => part.includes('Brief 07 (navigation and data components).'));
  assert.ok(section, 'the changelog has a section that starts with "Brief 07 (navigation and data components)."');
  assert.ok(/\*\*Added\*\*/.test(section) && /\*\*Changed\*\*/.test(section) && /\*\*Fixed\*\*/.test(section), 'Added, Changed and Fixed');
  assert.doesNotMatch(section, /\*\*Breaking\*\*/);
  for (const name of [...classes, '--g2-color-highlight-bg', 'tabindex="-1"']) assert.ok(section.includes(name), `the changelog does not list ${name}`);
  assert.match(await read('docs/BACKLOG.md'), /brief 07/i);
  assert.match(await read('docs/testing.md'), /navigation\.test\.mjs/);
  assert.match(await read('docs/migration-from-0.6.0.md'), /^## Changes after 0\.13\.0/m);
  const bytes = await readFile(new URL('../docs/archive/2026-10-26-bundled-guide.html', import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), '3cdbe56f9a4bec755eb6b03e7c44344b38d5e0009a48dc2e89b3116607451952');
});

// ---- Highlight (issue #8) ----
test('navigation: mark text meets 4.5:1 in both schemes and the highlight differs from the focus fill (acceptance 5)', () => {
  for (const [name, scheme] of [['light', light], ['dark', dark]]) {
    assert.ok(ratio(scheme['--g2-color-text'], scheme['--g2-color-highlight-bg']) >= 4.5, `${name}: text on highlight ${ratio(scheme['--g2-color-text'], scheme['--g2-color-highlight-bg']).toFixed(2)}:1`);
    assert.ok(deltaE(scheme['--g2-color-highlight-bg'], scheme['--g2-color-focus']) >= 40, `${name}: the highlight is close to the focus yellow`);
  }
  console.log(`Highlight: light ${ratio(light['--g2-color-text'], light['--g2-color-highlight-bg']).toFixed(2)}:1, dark ${ratio(dark['--g2-color-text'], dark['--g2-color-highlight-bg']).toFixed(2)}:1; dE to focus ${deltaE(light['--g2-color-highlight-bg'], light['--g2-color-focus']).toFixed(1)} and ${deltaE(dark['--g2-color-highlight-bg'], dark['--g2-color-focus']).toFixed(1)}`);
});
for (const scheme of ['light', 'dark']) {
  test(`navigation: ${scheme}: a rendered mark uses the token, keeps 4.5:1 and is not the focus fill; forced colours use the system mark colours (acceptance 5)`, async () => {
    const t = scheme === 'light' ? light : dark;
    await fx(scheme, async page => {
      const s = await styles(page, '#mark');
      assert.equal(s.background, rgbOf(t['--g2-color-highlight-bg']));
      assert.equal(s.color, rgbOf(t['--g2-color-text']));
      assert.ok(contrast(s.color, s.background) >= 4.5);
      assert.notEqual(s.background, 'rgb(255, 221, 0)');
    });
    await withPage(async page => {
      const f = await styles(page, '#mark');
      assert.notEqual(f.background, 'rgba(0, 0, 0, 0)', 'forced colours still mark the word');
      assert.notEqual(f.background, f.color);
    }, { path: fixturePath(scheme), forcedColors: 'active' });
  });
}

// ---- Breadcrumbs (issue #3) ----
for (const scheme of ['light', 'dark']) {
  test(`navigation: ${scheme}: breadcrumbs wrap a long current item, never truncate it, hide the separator from the accessibility tree and keep aria-current (acceptance 2, 5)`, () => fx(scheme, async page => {
    for (const width of [1280, 320]) {
      await page.setViewportSize({ width, height: 900 });
      const m = await page.locator('#crumb-current').evaluate(el => { const s = getComputedStyle(el), r = el.getBoundingClientRect();
        return { textOverflow: s.textOverflow, nowrap: s.whiteSpace === 'nowrap', lines: Math.round(r.height / parseFloat(s.lineHeight)), clipped: el.scrollWidth > el.clientWidth + 1, right: r.right, client: document.documentElement.clientWidth }; });
      assert.equal(m.textOverflow, 'clip'); assert.equal(m.nowrap, false); assert.equal(m.clipped, false);
      assert.ok(m.right <= m.client + .5, `the current item fits the ${width}px viewport`);
      if (width === 320) assert.ok(m.lines >= 3, `the long item wraps (${m.lines} lines)`);
      assert.equal(await overflowFree(page), true, `no page overflow at ${width}px`);
    }
    const snapshot = await page.locator('#crumbs').ariaSnapshot();
    assert.doesNotMatch(snapshot.replace(/^\s*- \/url:.*$/gm, ''), /\//, `the separator is announced: ${snapshot}`);
    assert.match(snapshot, /listitem/);
    assert.equal(await page.locator('#crumb-current').getAttribute('aria-current'), 'page');
    assert.equal(await page.locator('#crumb-current a').count(), 0, 'the current item is not a link');
    const sep = await page.locator('#crumbs li + li').first().evaluate(el => { const s = getComputedStyle(el, '::before'); return { content: s.content, color: s.color }; });
    assert.match(sep.content, /^"\/"( \/ "")?$/);
    assert.equal(sep.color, rgbOf((scheme === 'light' ? light : dark)['--g2-color-text-faint']), 'the separator has the faint text colour');
    const target = await page.locator('#crumb-home').evaluate(el => el.getBoundingClientRect().height);
    assert.ok(target >= 24, `breadcrumb link target ${target}px (WCAG 2.5.8 minimum 24px)`);
    await keyboardFocus(page, '#crumb-home');
    for (const hovered of [false, true]) {
      if (hovered) await page.locator('#crumb-home').hover();
      const s = await styles(page, '#crumb-home');
      assert.equal(s.background, 'rgb(255, 221, 0)'); assert.ok(contrast(s.color, s.background) >= 4.5);
    }
  }));
}

// ---- Pagination (issue #4) ----
for (const scheme of ['light', 'dark']) {
  test(`navigation: ${scheme}: pagination links are 44px targets, the current page is marked, hover plus focus stays readable (acceptance 2, 5)`, () => fx(scheme, async page => {
    for (const width of [1280, 320]) {
      await page.setViewportSize({ width, height: 900 });
      const sizes = await page.locator('#pagination a').evaluateAll(els => els.map(el => { const r = el.getBoundingClientRect(); return [r.width, r.height]; }));
      assert.equal(sizes.length, 5);
      for (const [w, h] of sizes) assert.ok(w >= 44 && h >= 44, `a pagination link is ${w}x${h}`);
      assert.equal(await overflowFree(page), true);
    }
    assert.equal(await page.locator('#pagination a[aria-current="page"]').count(), 1);
    assert.equal((await styles(page, '#page-current')).border, rgbOf((scheme === 'light' ? light : dark)['--g2-color-text']), 'the current page has a visible border');
    assert.equal((await styles(page, '#page-next')).border, 'rgba(0, 0, 0, 0)');
    assert.equal(await page.locator('#pagination a[aria-disabled], #pagination a:not([href])').count(), 0, 'no disabled link');
    for (const id of ['#page-prev', '#page-current', '#page-next']) {
      await keyboardFocus(page, id);
      for (const hovered of [false, true]) {
        if (hovered) await page.locator(id).hover();
        const s = await styles(page, id);
        assert.equal(s.background, 'rgb(255, 221, 0)', `${id} focus fill${hovered ? ' on hover' : ''}`); assert.ok(contrast(s.color, s.background) >= 4.5);
      }
    }
  }));
}
test('navigation: the directory example leaves out the absent previous link and marks page 1 (acceptance 2)', () => withPage(async page => {
  assert.equal(await page.locator('.g2-pagination a[rel=prev]').count(), 0);
  assert.equal(await page.locator('.g2-pagination a[rel=next]').count(), 1);
  assert.equal(await page.locator('.g2-pagination a[aria-current="page"]').getAttribute('aria-label'), 'Pagina 1');
}, { path: '/docs/examples/directory.html' }));
test('navigation: in forced colours the pagination marks the current page with the system selection colours (acceptance 5)', () => withPage(async page => {
  assert.notEqual((await styles(page, '#page-current')).background, (await styles(page, '#page-next')).background);
}, { path: fixturePath('light'), forcedColors: 'active' }));

// ---- Data table (issue #5) ----
for (const scheme of ['light', 'dark']) {
  test(`navigation: ${scheme}: table styles, numeric cells, header row and row rules (acceptance 2, 5)`, () => fx(scheme, async page => {
    const t = scheme === 'light' ? light : dark;
    const th = await styles(page, '#table thead th >> nth=0');
    assert.equal(th.background, rgbOf(t['--g2-color-surface-sunken'])); assert.equal(th.fontSize, '14px');
    assert.ok(contrast(th.color, th.background) >= 4.5);
    const num = await page.locator('#table tbody td').first().evaluate(el => { const s = getComputedStyle(el); return { align: s.textAlign, nums: s.fontVariantNumeric, rule: s.borderBottomColor, width: s.borderBottomWidth }; });
    assert.equal(num.align, 'right'); assert.match(num.nums, /tabular-nums/);
    assert.equal(num.rule, rgbOf(t['--g2-color-line'])); assert.equal(num.width, '1px');
    assert.equal(await page.locator('#table thead .g2-cell-num').evaluate(el => getComputedStyle(el).textAlign), 'right', 'the numeric header aligns with its cells');
    assert.equal(await page.locator('#table tbody th').first().evaluate(el => getComputedStyle(el).textAlign), 'left');
    assert.equal(await page.locator('#table').evaluate(el => getComputedStyle(el).display), 'table');
    assert.equal(await page.locator('#table caption').count(), 1);
    assert.equal(await page.locator('#table th:not([scope])').count(), 0);
  }));
}
test('navigation: with .g2-table-stacked, one row is a block under 45em, and the Chrome accessibility tree keeps the table semantics (acceptance 2)', () => fx('light', async (page, context) => {
  const cdp = await context.newCDPSession(page);
  await cdp.send('Accessibility.enable');
  const tree = async label => {
    const { nodes } = await cdp.send('Accessibility.getFullAXTree');
    const byId = new Map(nodes.map(n => [n.nodeId, n])), roles = [];
    const start = nodes.find(n => n.role?.value === 'table' && n.name?.value?.includes(label));
    assert.ok(start, `no table named "${label}" in the accessibility tree`);
    const walk = n => { if (!n) return; const role = n.role?.value; roles.push(['columnheader', 'rowheader', 'cell'].includes(role) ? `${role}:${n.name?.value}` : role); (n.childIds || []).forEach(c => walk(byId.get(c))); };
    walk(start);
    return roles.filter(r => /^(table|row|rowgroup|columnheader|rowheader|cell|caption)/.test(r));
  };
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 900 });
    const parts = await page.locator('#stacked').evaluate(el => [el, ...el.querySelectorAll('thead,tbody,tr,th,td')].map(x => getComputedStyle(x).display));
    if (width === 390) assert.ok(parts.every(d => d === 'block'), `at ${width}px every part is display:block: ${[...new Set(parts)]}`);
    else assert.ok(parts.includes('table') && !parts.includes('block'), 'above 45em the table is a table');
    for (const [id, label] of [['stacked', 'Instituții și posturi, stivuit'], ['stacked-roles', 'stivuit cu roluri']]) {
      const roles = await tree(label);
      console.log(`AX tree ${width}px #${id}: ${roles.join(' | ')}`);
      for (const role of ['table', 'rowgroup', 'row', 'columnheader:Instituție', 'columnheader:Posturi', 'rowheader:Casa de Pensii Bacău', 'cell']) assert.ok(roles.some(r => r.startsWith(role)), `${id} at ${width}px: no ${role}: ${roles.join(' | ')}`);
      if (width === 390) assert.ok(roles.some(r => r.startsWith('cell') && r.includes('Posturi')), 'the cell reads its label');
    }
    const snapshot = await page.locator('#stacked').ariaSnapshot();
    assert.match(snapshot, /table/); assert.match(snapshot, /columnheader "Instituție"/); assert.match(snapshot, /rowheader/);
    if (width === 390) {
      const head = await page.locator('#stacked thead').evaluate(el => { const r = el.getBoundingClientRect(); return [r.width, r.height]; });
      assert.ok(head[0] <= 1 && head[1] <= 1, 'the header row is visually hidden but present');
      const label = await page.locator('#stacked tbody td').first().evaluate(el => { const s = getComputedStyle(el, '::before'); return { content: s.content, display: s.display }; });
      assert.equal(label.content, '"Posturi"'); assert.equal(label.display, 'block');
      assert.equal(await page.locator('#stacked .g2-cell-num').first().evaluate(el => getComputedStyle(el).textAlign), 'left');
      assert.equal(await overflowFree(page), true);
    }
  }
}));
test('navigation: .g2-table-wrap scrolls a wide table inside the page, from the keyboard, with a visible focus that does not fill the region (acceptance 2, 5)', async () => {
  for (const scheme of ['light', 'dark']) await fx(scheme, async page => {
    await page.setViewportSize({ width: 390, height: 900 });
    const wrap = '#table-wrap';
    assert.equal(await page.locator(wrap).getAttribute('tabindex'), '0'); assert.equal(await page.locator(wrap).getAttribute('role'), 'region'); assert.ok((await page.locator(wrap).getAttribute('aria-label')).length > 3);
    await page.locator('#table').evaluate(el => { el.style.minWidth = '900px'; });
    const m = await page.locator(wrap).evaluate(el => ({ scroll: el.scrollWidth, client: el.clientWidth, overflowX: getComputedStyle(el).overflowX, page: document.documentElement.scrollWidth, view: document.documentElement.clientWidth }));
    assert.equal(m.overflowX, 'auto'); assert.ok(m.scroll > m.client, 'the wide table overflows its wrapper'); assert.ok(m.page <= m.view, 'the page itself does not scroll sideways');
    await keyboardFocus(page, wrap);
    const s = await page.locator(wrap).evaluate(el => { const c = getComputedStyle(el); return { bg: c.backgroundColor, outline: c.outlineStyle, outlineColor: c.outlineColor, shadow: c.boxShadow }; });
    assert.equal(s.bg, 'rgba(0, 0, 0, 0)', 'no yellow fill on the region'); assert.equal(s.outline, 'solid'); assert.equal(s.outlineColor, 'rgb(255, 221, 0)');
    assert.match(s.shadow, /inset/);
    await page.keyboard.press('ArrowRight');
    await page.waitForFunction(() => document.querySelector('#table-wrap').scrollLeft > 0, null, { timeout: 3000 }).catch(() => {});
    assert.ok(await page.locator(wrap).evaluate(el => el.scrollLeft) > 0, 'the arrow key scrolls the region');
    await page.locator(wrap).hover();
    assert.equal(await page.locator(wrap).evaluate(el => getComputedStyle(el).backgroundColor), 'rgba(0, 0, 0, 0)', 'hover plus focus keeps the region unfilled');
  });
});

// ---- Summary list (issue #6) ----
for (const scheme of ['light', 'dark']) {
  test(`navigation: ${scheme}: summary list rows keep dt/dd, stack when narrow, wrap a long value and have one rule between rows (acceptance 2, 5)`, () => fx(scheme, async page => {
    const t = scheme === 'light' ? light : dark;
    const geometry = () => page.locator('#summary > div').evaluateAll(rows => rows.map(r => { const dt = r.querySelector('dt').getBoundingClientRect(), dd = r.querySelector('dd').getBoundingClientRect(); return { dtTop: dt.top, dtBottom: dt.bottom, dtLeft: dt.left, ddTop: dd.top, ddLeft: dd.left, ddRight: dd.right }; }));
    await page.setViewportSize({ width: 1280, height: 900 });
    const wide = await geometry();
    for (const g of wide) { assert.ok(Math.abs(g.dtTop - g.ddTop) < 2, 'wide: label and value share a line'); assert.ok(g.ddLeft > g.dtLeft + 150); }
    assert.ok(wide.every(g => Math.abs(g.ddLeft - wide[0].ddLeft) < 1), 'the values align in a column');
    await page.setViewportSize({ width: 320, height: 900 });
    for (const g of await geometry()) { assert.ok(g.ddTop >= g.dtBottom - 1, 'narrow: the value is under the label'); assert.ok(g.ddRight <= 320, 'the value stays in the viewport'); }
    assert.equal(await overflowFree(page), true, 'a long value wraps instead of overflowing');
    assert.ok(await page.locator('#summary-long').evaluate(el => el.getBoundingClientRect().height > parseFloat(getComputedStyle(el).lineHeight) * 1.5), 'the long value breaks onto several lines');
    assert.equal((await page.locator('#summary > div').evaluateAll(rows => rows.map(r => getComputedStyle(r).borderTopWidth))).join(), '0px,1px,1px', 'one rule between rows, none above the first');
    const dt = await styles(page, '#summary dt >> nth=0');
    assert.equal(dt.fontSize, '14px'); assert.equal(dt.color, rgbOf(t['--g2-color-text-muted']));
    assert.equal(await page.locator('#summary > div > dt + dd').count(), 3);
  }));
}

// ---- Skip link and the tabindex="-1" fix (issue #7) ----
for (const scheme of ['light', 'dark']) {
  test(`navigation: ${scheme}: the skip link is the first focusable element, invisible until focused, then standard focus; Enter moves focus to main, which is not filled (acceptance 2, 4, 5)`, () => fx(scheme, async page => {
    const before = await page.locator('#skip').evaluate(el => { const r = el.getBoundingClientRect(); return { w: r.width, h: r.height, clip: getComputedStyle(el).clipPath }; });
    assert.ok(before.w <= 1 && before.h <= 1 && before.clip !== 'none', 'invisible before focus');
    assert.equal(await overflowFree(page), true);
    assert.equal(await page.evaluate(() => document.querySelector('a[href],button,input,select,textarea,[tabindex]:not([tabindex="-1"])').id), 'skip', 'it is the first focusable element in the source');
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'skip', 'the first Tab stop');
    for (const hovered of [false, true]) {
      if (hovered) await page.locator('#skip').hover();
      const s = await styles(page, '#skip');
      assert.equal(s.background, 'rgb(255, 221, 0)'); assert.ok(contrast(s.color, s.background) >= 4.5); assert.equal(s.focused, true);
      const r = await page.locator('#skip').boundingBox();
      assert.ok(r.x >= 0 && r.y >= 0 && r.width > 100 && r.height >= 40 && r.x + r.width <= 1280, 'visible inside the viewport');
    }
    await page.mouse.move(0, 0);
    await page.keyboard.press('Enter');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'content', 'focus moves to the main content');
    const main = await styles(page, '#content');
    assert.equal(main.background, 'rgba(0, 0, 0, 0)', 'main has no focus fill'); assert.equal(main.shadow, 'none'); assert.equal(main.outline, 'none');
    assert.equal(await page.evaluate(() => new URL(location.href).hash), '#content');
    await page.keyboard.press('Tab');
    assert.notEqual(await page.evaluate(() => document.activeElement.id), 'skip', 'the next Tab goes on in the main content');
  }));
}
test('navigation: the skip link fits a 320px viewport and shows an outline under forced colours (acceptance 3, 5)', async () => {
  await fx('light', async page => {
    await page.keyboard.press('Tab');
    const r = await page.locator('#skip').boundingBox();
    assert.ok(r.x + r.width <= 320 && r.x >= 0);
  }, { viewport: { width: 320, height: 700 } });
  await withPage(async page => {
    await page.keyboard.press('Tab');
    const s = await styles(page, '#skip');
    assert.equal(s.outline, 'solid'); assert.ok(parseFloat(s.outlineWidth) >= 3);
  }, { path: fixturePath('dark'), forcedColors: 'active' });
});
test('navigation: tabindex="-1" on a container gets no yellow fill, while a control or a roving widget keeps the focus treatment (issue #7)', () => fx('light', async page => {
  await page.evaluate(() => {
    document.body.insertAdjacentHTML('beforeend', '<div id="box" tabindex="-1">Box</div><section id="sec" tabindex="-1">Sec</section><button id="rove" type="button" tabindex="-1">Rove</button><div id="tab" role="tab" tabindex="-1">Tab</div><a id="lnk" href="#content" tabindex="-1">Link</a>');
  });
  await page.keyboard.press('Tab');
  for (const id of ['box', 'sec']) {
    await page.locator(`#${id}`).focus();
    const s = await styles(page, `#${id}`);
    assert.equal(s.background, 'rgba(0, 0, 0, 0)', `#${id} has no fill`); assert.equal(s.shadow, 'none');
  }
  for (const id of ['rove', 'tab', 'lnk']) {
    await page.locator(`#${id}`).focus();
    assert.equal((await styles(page, `#${id}`)).background, 'rgb(255, 221, 0)', `#${id} keeps the focus fill`);
  }
  await page.evaluate(() => { document.getElementById('content').focus(); });
  assert.equal((await styles(page, '#content')).background, 'rgba(0, 0, 0, 0)', 'a script focus on main shows no fill');
}));

// ---- Overflow and keyboard order on the guide and the example pages (acceptance 3, 4) ----
for (const path of ['/docs/', ...examplePaths]) {
  test(`navigation: ${path} has no horizontal page overflow at 320, 390, 768 and 1280px, and with 200% root text, in both schemes (acceptance 3)`, async () => {
    for (const scheme of ['light', 'dark']) for (const width of [320, 390, 768, 1280]) await withPage(async page => {
      await setScheme(page, scheme);
      await page.evaluate(() => document.querySelectorAll('details').forEach(d => { d.open = true; }));
      const m = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
      assert.ok(m.scroll <= m.client, `${path} ${scheme} ${width}px: ${m.scroll} > ${m.client}`);
      await page.addStyleTag({ content: 'html{font-size:200%}' });
      const z = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
      assert.ok(z.scroll <= z.client, `${path} ${scheme} ${width}px, 200% text: ${z.scroll} > ${z.client}`);
    }, { path, viewport: { width, height: 900 } });
  });
}
for (const path of examplePaths) {
  test(`navigation: ${path}: the keyboard starts with the skip link, then the header, then the breadcrumbs (acceptance 4)`, () => withPage(async page => {
    const seen = [];
    for (let i = 0; i < 7; i++) { await page.keyboard.press('Tab'); seen.push(await page.evaluate(() => document.activeElement.textContent.trim().replace(/\s+/g, ' '))); }
    assert.deepEqual(seen, ['Sari la conținut', 'exemplu.gov2.ro', ...await page.locator('.g2-nav a').allTextContents(), 'Acasă']);
    await page.locator('.g2-skip-link').focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'continut');
    assert.equal((await styles(page, '#continut')).background, 'rgba(0, 0, 0, 0)', 'the focused main has no fill');
  }, { path }));
}

// ---- Rendered contrast of the whole fixture and of the new guide section, both schemes (acceptance 5) ----
for (const scheme of ['light', 'dark']) {
  test(`navigation: ${scheme}: every rendered text pair in the fixture and in the new guide section meets the contrast (acceptance 5)`, async () => {
    await fx(scheme, async page => {
      const report = await contrastReport(page);
      console.log(`Navigation ${scheme} fixture: ${report.text} text nodes, lowest ${report.lowest.ratio.toFixed(2)}:1 ("${report.lowest.text}")`);
      assert.deepEqual(report.problems, []);
    });
    await withPage(async page => {
      await setScheme(page, scheme);
      await page.evaluate(() => { document.querySelectorAll('details').forEach(d => { d.open = true; }); document.querySelectorAll('main > section:not(#navigare)').forEach(s => { s.hidden = true; }); });
      const report = await contrastReport(page);
      console.log(`Navigation ${scheme} guide section: ${report.text} text nodes, lowest ${report.lowest.ratio.toFixed(2)}:1 ("${report.lowest.text}")`);
      assert.ok(report.text > 100);
      assert.deepEqual(report.problems, []);
    }, { path: '/docs/' });
  });
}
test('navigation: the guide previews the stacked table in a narrow frame, and the frame stacks (acceptance 2)', () => withPage(async page => {
  const frame = await (await page.locator('#preview-stacked').elementHandle()).contentFrame();
  await frame.waitForLoadState('networkidle');
  assert.ok(await frame.evaluate(() => innerWidth) <= 360, 'the frame is narrower than 45em');
  assert.equal(await frame.evaluate(() => getComputedStyle(document.querySelector('tbody tr')).display), 'block');
  assert.equal(await frame.evaluate(() => document.querySelector('table').getAttribute('role')), 'table', 'the documented markup carries explicit roles');
}, { path: '/docs/' }));
test('navigation: the guide demonstrations render and their copy buttons point at code blocks', () => withPage(async page => {
  for (const id of ['crumbs-demo', 'pagination-demo', 'summary-demo', 'table-demo', 'table-wrap-demo', 'mark-demo']) assert.equal(await page.locator(`#${id}`).count(), 1, id);
  for (const id of ['code-skip', 'code-crumbs', 'code-pagination', 'code-summary', 'code-table', 'code-table-stacked', 'code-mark']) {
    assert.equal(await page.locator(`button[data-copy="${id}"]`).count(), 1, id);
    assert.ok((await page.locator(`#${id}`).textContent()).length > 30);
  }
}, { path: '/docs/' }));
