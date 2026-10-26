// Brief 04: the page foundations (container, spacing, type roles, header/nav/footer, fields) and the two example pages.
// Raw component checks use tests/contract.html. Page checks use docs/examples/*.html, which load the real gov2.css.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { useBrowser, browser, base, read, css, reference, example, artifacts, withPage, withSite, fixture, standaloneSite, styles, contrast, keyboardFocus } from './helpers.mjs';

useBrowser();

const pages = [{ name: 'directory', path: '/docs/examples/directory.html' }, { name: 'form', path: '/docs/examples/form.html' }];
const widths = [320, 390, 768, 1280];
const newClasses = ['g2-container', 'g2-heading-page', 'g2-heading-section', 'g2-heading-item', 'g2-text-meta', 'g2-field', 'g2-label', 'g2-hint', 'g2-footer-in'];
const noComments = text => text.replace(/\/\*[\s\S]*?\*\//g, '');
const tokenValues = Object.fromEntries([...css.matchAll(/^\s*(--[\w-]+):\s*([^;]+);/gm)].map(m => [m[1], m[2].trim()]));
const classesOf = html => new Set([...html.matchAll(/\sclass="([^"]*)"/g)].flatMap(m => m[1].split(/\s+/)).filter(Boolean));

// Opens a page with external requests blocked, and records each blocked URL.
const first = selector => `${selector} >> nth=0`;
// With blockFonts, the local files under /fonts/ are aborted too (a fonts.css page then falls back), and listed as the fourth argument.
async function openPage(path, run, { width = 1280, height = 900, blockFonts = false, ...options } = {}) {
  const context = await browser.newContext({ viewport: { width, height }, ...options });
  const blocked = [], fontsBlocked = [];
  await context.route('**/*', route => {
    const url = route.request().url();
    if (blockFonts && url.startsWith(`${base}/fonts/`)) { fontsBlocked.push(url); return route.abort(); }
    if (url.startsWith(base)) return route.continue();
    blocked.push(url);
    return route.abort();
  });
  const page = await context.newPage();
  try {
    const response = await page.goto(base + path, { waitUntil: 'networkidle' });
    assert.equal(response.status(), 200, `Page unavailable: ${path}`);
    await run(page, context, blocked, fontsBlocked);
  } finally { await context.close(); }
}

// Accessibility API view of one element (Chrome DevTools Protocol): role, name, description and state properties.
async function accessibleNode(context, page, selector) {
  const cdp = await context.newCDPSession(page);
  await cdp.send('DOM.enable');
  await cdp.send('Accessibility.enable');
  const { root } = await cdp.send('DOM.getDocument');
  const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector });
  const { nodes } = await cdp.send('Accessibility.getPartialAXTree', { nodeId, fetchRelatives: false });
  const node = nodes[0];
  return { role: node.role?.value, name: node.name?.value, description: node.description?.value,
    props: Object.fromEntries((node.properties || []).map(p => [p.name, p.value?.value])) };
}

// A short label for an element, built the same way in the page and in the expectation.
const describeInPage = `el => (el.tagName.toLowerCase() + ':' + (el.getAttribute('aria-label') || el.labels?.[0]?.textContent || el.textContent).trim().replace(/\\s+/g, ' ').slice(0, 40))`;
const stop = (tag, text) => `${tag}:${text.slice(0, 40)}`;
async function tabSequence(page) {
  const expected = await page.evaluate(`[...document.querySelectorAll('a[href],button,input,select,textarea,[tabindex]')]
    .filter(el => !el.disabled && el.tabIndex >= 0 && el.getClientRects().length).map(${describeInPage})`);
  const actual = [], states = [];
  for (let i = 0; i < expected.length; i++) {
    await page.keyboard.press('Tab');
    const at = await page.evaluate(`(() => { const el = document.activeElement; return { label: (${describeInPage})(el), disabled: !!el.disabled, visible: el.matches(':focus-visible') }; })()`);
    actual.push(at.label);
    states.push(at);
  }
  return { expected, actual, states };
}

// Text contrast on the rendered surfaces: every visible text node, and the border of every enabled field.
const contrastReport = page => page.evaluate(() => {
  const parse = value => (value.match(/[\d.]+/g) || []).map(Number);
  const over = (top, bottom) => { const a = top[3] ?? 1; return [0, 1, 2].map(i => top[i] * a + bottom[i] * (1 - a)); };
  const surface = element => {
    const stack = [];
    for (let e = element; e; e = e.parentElement) {
      const c = parse(getComputedStyle(e).backgroundColor);
      if ((c[3] ?? 1) > 0) { stack.push(c); if ((c[3] ?? 1) >= 1) break; }
    }
    return stack.reverse().reduce((result, c) => over(c, result), [255, 255, 255]);
  };
  const luminance = ([r, g, b]) => [r, g, b].map(v => { v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
  const ratio = (a, b) => { const [low, high] = [luminance(a), luminance(b)].sort((x, y) => x - y); return (high + .05) / (low + .05); };
  const problems = [];
  let text = 0, boundaries = 0;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let node; (node = walker.nextNode());) {
    if (!node.textContent.trim()) continue;
    const element = node.parentElement;
    if (element.closest(':disabled') || !element.getClientRects().length || getComputedStyle(element).visibility === 'hidden') continue;
    const style = getComputedStyle(element), background = surface(element), color = over(parse(style.color), background);
    const large = parseFloat(style.fontSize) >= 24 || (parseFloat(style.fontSize) >= 18.66 && Number(style.fontWeight) >= 700);
    const found = ratio(color, background);
    text++;
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
  return { text, boundaries, problems };
});

// ---- Static checks: names, values, documentation and the example files ----
test('foundation: tokens have the decided names and values', () => {
  const expected = { '--g2-font-size-heading-page': '2rem', '--g2-font-size-heading-section': '1.5rem', '--g2-font-size-heading-item': '1.1875rem',
    '--g2-font-size-body': '1.0625rem', '--g2-font-size-meta': '.9375rem', '--g2-font-size-label': '.875rem', '--g2-line-height-heading': '1.25', '--g2-line-height-body': '1.55',
    '--g2-space-1': '.25rem', '--g2-space-2': '.5rem', '--g2-space-3': '.75rem', '--g2-space-4': '1rem', '--g2-space-5': '1.5rem', '--g2-space-6': '2rem', '--g2-space-7': '3rem',
    '--g2-container-max': '80rem', '--g2-gutter': 'clamp(1rem, 3vw, 2rem)' };
  for (const [name, value] of Object.entries(expected)) assert.equal(tokenValues[name], value, name);
  assert.ok(Number(tokenValues['--g2-line-height-heading']) >= 1.2 && Number(tokenValues['--g2-line-height-heading']) <= 1.3, 'heading line height stays within 1.2 to 1.3');
  for (const [name, value] of Object.entries(expected)) assert.doesNotMatch(value, /\d+px$/, `${name} is a relative unit`);
});

test('foundation: new core classes are in COMPONENTS.md, the live guide, the raw fixture and gov2.css (acceptance 10)', async () => {
  const guide = await read('docs/index.html'), raw = await read('tests/contract.html'), guidelines = await read('GUIDELINES.md');
  for (const name of newClasses) {
    assert.ok(css.includes(`.${name}`), `${name} is not in gov2.css`);
    assert.ok(reference.includes(`\`.${name}\``), `${name} is not in COMPONENTS.md`);
    assert.ok(classesOf(guide).has(name), `${name} has no example in docs/index.html`);
    assert.ok(classesOf(raw).has(name), `${name} has no raw fixture in tests/contract.html`);
  }
  for (const [file, text] of [['COMPONENTS.md', reference], ['GUIDELINES.md', guidelines]]) assert.doesNotMatch(text, /not an implemented scale|does not yet implement a complete type scale|Page container and grid \(/, `${file} still calls the foundation unimplemented`);
  assert.match(reference, /textarea.*outside this slice/s, 'COMPONENTS.md must say that textarea and select are outside this slice');
  for (const token of ['--g2-space-1', '--g2-space-7', '--g2-font-size-heading-page', '--g2-line-height-body', '--g2-gutter']) assert.ok(guide.includes(token), `the live guide does not show ${token}`);
});

test('foundation: the example pages use the documented shared API and identified local rules, with no consumer adapter (acceptance 1)', async () => {
  const local = noComments(await read('docs/examples/examples.css'));
  const defined = new Set([...local.matchAll(/\.(ex-[\w-]+)/g)].map(m => m[1]));
  const guide = await read('docs/index.html');
  const used = new Set();
  const publicClasses = new Set([...new Set(css.match(/\.g2-[\w-]+/g))].map(c => c.slice(1)));
  for (const { name, path } of pages) {
    const html = await read(path.slice(1));
    assert.match(html, /<link rel="stylesheet" href="\.\.\/\.\.\/gov2\.css">/, `${name} loads the real core stylesheet`);
    assert.match(html, /<link rel="stylesheet" href="examples\.css">/);
    assert.doesNotMatch(html, /<script|<style|\sstyle=|\sonclick=|data-skin|posturi\.gov|check-skins/i, `${name} has script, inline style or a consumer reference`);
    for (const cls of classesOf(html)) {
      if (cls.startsWith('g2-')) assert.ok(publicClasses.has(cls), `${name} uses ${cls}, which gov2.css does not define`);
      else { assert.ok(defined.has(cls), `${name} uses local class ${cls}, which examples.css does not define`); used.add(cls); }
    }
  }
  for (const cls of defined) { assert.ok(used.has(cls), `examples.css defines ${cls}, which no page uses`); assert.ok(guide.includes(`<code>${cls}</code>`), `the live guide does not describe ${cls}`); }
  // Local composition only: no .g2-* selector, no hidden overflow, no important, no colour literal, no unknown token.
  assert.doesNotMatch(local, /\.g2-/, 'examples.css must not select a .g2-* class');
  assert.doesNotMatch(local, /overflow(-x|-y)?\s*:\s*(hidden|clip|auto|scroll)/, 'examples.css must not hide overflow');
  assert.doesNotMatch(local, /!important|data-skin|posturi\.gov|check-skins/i);
  assert.doesNotMatch(local, /#[0-9a-f]{3,8}\b|rgba?\((?!var)/i, 'examples.css uses tokens, not colour literals');
  for (const use of local.matchAll(/var\((--[\w-]+)/g)) assert.ok(tokenValues[use[1]], `examples.css uses ${use[1]}, which gov2.css does not define`);
  assert.match(local.trim(), /^@layer app\s*\{[\s\S]*\}$/, 'every rule of examples.css is inside @layer app');
});

test('foundation: the guide links both examples and the local stylesheet; its recovery link moves focus', () => withPage(async page => {
  for (const href of ['examples/directory.html', 'examples/form.html', 'examples/examples.css']) assert.ok(await page.locator(`a[href="${href}"]`).count(), `the guide does not link ${href}`);
  assert.ok(await page.locator('#pagina').count());
  await page.locator('#recovery-link').click();
  assert.equal(await page.evaluate(() => document.activeElement.id), 'email');
  assert.equal((await styles(page, '#record-code')).background, 'rgb(243, 242, 241)', 'the disabled field shows the sunken surface');
  assert.equal(await page.locator('#record-code').isDisabled(), true);
}));

// ---- Raw component checks (tests/contract.html has no documentation CSS) ----
test('foundation: new rules sit in the right sublayers, and examples.css sits in the app layer', async () => {
  await withSite(standaloneSite(), async page => {
    const blocks = await page.evaluate(() => Object.fromEntries([...[...document.styleSheets].find(s => s.href?.endsWith('/assets/gov2.css')).cssRules]
      .filter(r => r.constructor.name === 'CSSLayerBlockRule').map(r => [r.name, [...r.cssRules].map(x => x.selectorText ?? x.conditionText).join('\n')])));
    for (const selector of ['.g2-container', '.g2-heading-page', '.g2-heading-section', '.g2-heading-item', '.g2-text-meta', '.g2-field', '.g2-label', '.g2-hint', '.g2-footer-in', '.g2-nav']) {
      assert.ok(blocks['gov2.components'].includes(selector), `${selector} belongs in gov2.components`);
    }
    assert.ok(blocks['gov2.states'].includes('.g2-input:disabled'), 'the disabled field belongs in gov2.states');
    assert.doesNotMatch(blocks['gov2.components'], /:disabled|focus-visible/);
    assert.doesNotMatch(blocks['gov2.states'], /:hover/);
  });
  await openPage(pages[0].path, async page => {
    const rules = await page.evaluate(() => [...[...document.styleSheets].find(s => s.href?.endsWith('/examples.css')).cssRules].map(r => [r.constructor.name, r.name]));
    assert.deepEqual(rules, [['CSSLayerBlockRule', 'app']]);
    const sheets = await page.evaluate(() => [...document.styleSheets].map(s => s.href.replace(location.origin, '')));
    assert.deepEqual(sheets, ['/gov2.css', '/fonts.css', '/docs/examples/examples.css'], 'the page links the core, the local fonts and its own layer');
  });
});

test('foundation: converted sizes equal the old px values at a 16px root; the new roles have the decided sizes', () => fixture(async page => {
  const sizes = await page.evaluate(() => {
    const size = selector => { const s = getComputedStyle(document.querySelector(selector)); return [s.fontSize, s.lineHeight, s.fontWeight]; };
    return { body: size('body'), linkTitle: size('#title'), input: size('#input'), button: size('#primary'), nav: size('#nav'), chip: size('#chip'), count: size('.g2-chip-count'), tag: size('.g2-tag'),
      page: size('#heading-page'), section: size('#heading-section'), item: size('#heading-item'), meta: size('#meta'), label: size('#field .g2-label'), hint: size('#field-hint') };
  });
  assert.deepEqual(sizes.body.slice(0, 2), ['17px', '26.35px']);
  assert.deepEqual(sizes.linkTitle.slice(0, 2), ['19px', '24.7px'], 'the title link keeps its 1.3 line height');
  assert.equal(sizes.input[0], '17px');
  assert.equal(sizes.button[0], '17px');
  assert.equal(sizes.nav[0], '15px');
  assert.equal(sizes.chip[0], '15px');
  assert.equal(sizes.count[0], '14px');
  assert.equal(sizes.tag[0], '14px');
  assert.deepEqual(sizes.page, ['32px', '40px', '700']);
  assert.deepEqual(sizes.section, ['24px', '30px', '700']);
  assert.deepEqual(sizes.item, ['19px', '23.75px', '700']);
  assert.equal(sizes.meta[0], '15px');
  assert.deepEqual([sizes.label[0], sizes.label[2]], ['14px', '600']);
  assert.equal(sizes.hint[0], '15px');
}));

for (const [width, gutter] of [[320, '16px'], [390, '16px'], [768, '23.04px'], [1280, '32px']]) {
  test(`foundation: the container fits a ${width}px viewport and its gutter is ${gutter}`, () => withPage(async page => {
    const box = await page.evaluate(() => {
      const el = document.querySelector('#container'), s = getComputedStyle(el), r = el.getBoundingClientRect();
      const header = document.querySelector('#header-in').getBoundingClientRect(), footer = document.querySelector('#footer-in').getBoundingClientRect();
      return { left: r.left, width: r.width, padding: s.paddingLeft, sizing: s.boxSizing, client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth,
        aligned: header.left === r.left && header.width === r.width && footer.left === r.left && footer.width === r.width };
    });
    assert.equal(box.sizing, 'border-box');
    assert.equal(box.padding, gutter);
    assert.ok(box.width <= box.client, 'the complete container, with its padding, fits the viewport');
    assert.ok(box.scroll <= box.client, 'no horizontal page overflow');
    assert.ok(box.aligned, 'the header content, the main content and the footer content share one box');
    if (width === 1280) assert.equal(box.width, 1280, 'the maximum width is 80rem');
  }, { path: '/tests/contract.html', viewport: { width, height: 900 } }));
}

test('foundation: a viewport wider than the maximum centres the container at 80rem', () => withPage(async page => {
  const box = await page.locator('#container').evaluate(el => { const r = el.getBoundingClientRect(); return [r.left, r.width]; });
  assert.deepEqual(box, [160, 1280]);
}, { path: '/tests/contract.html', viewport: { width: 1600, height: 900 } }));

test('foundation: field parts stack with the documented gap; the disabled field is not focusable and looks different', () => fixture(async page => {
  const parts = await page.evaluate(() => {
    const field = document.querySelector('#field'), kids = [...field.children].map(el => el.className.replace('g2-', ''));
    return { kids, gap: getComputedStyle(field).rowGap, margin: getComputedStyle(field).marginTop, inputWidth: document.querySelector('#field-input').getBoundingClientRect().width, fieldWidth: field.getBoundingClientRect().width };
  });
  assert.deepEqual(parts.kids, ['label', 'hint', 'input']);
  assert.equal(parts.gap, '4px');
  assert.equal(parts.margin, '0px', 'a field sets no outer margin');
  assert.equal(parts.inputWidth, parts.fieldWidth, 'the input fills its field');
  const enabled = await styles(page, '#field-input'), disabled = await styles(page, '#field-disabled');
  assert.equal(disabled.background, 'rgb(243, 242, 241)');
  assert.equal(disabled.cursor, 'not-allowed');
  assert.notEqual(disabled.background, enabled.background);
  assert.ok(contrast(disabled.color, disabled.background) >= 4.5, 'the locked value stays readable');
  assert.equal(await page.locator('#field-disabled').isDisabled(), true);
  await page.locator('#field-input').focus();
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'field-bad', 'Tab skips the disabled field');
  assert.equal((await styles(page, '#field-bad')).border, 'rgb(212, 53, 28)');
}));

test('foundation: a word wider than the line breaks in headings and fields instead of overflowing a narrow screen', () => withPage(async page => {
  const long = 'secretariatdirectiageneraladeasistentasocialasiprotectiacopilului';
  await page.evaluate(long => {
    for (const id of ['heading-page', 'heading-section', 'heading-item', 'field-hint', 'field-bad-error']) document.getElementById(id).textContent = long;
  }, long);
  const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert.ok(await overflow() <= 0, 'headings, hints and error messages break the long word');
  // Controls: without one family of rules, the same content overflows, so the check can fail.
  for (const rule of ['.g2-heading-page,.g2-heading-section,.g2-heading-item', '.g2-field']) {
    await page.addStyleTag({ content: `@layer app{${rule}{overflow-wrap:normal}}` });
    assert.ok(await overflow() > 0, `the control shows overflow when ${rule} breaks no word`);
    await page.addStyleTag({ content: `@layer app{${rule}{overflow-wrap:revert-layer}}` });
    assert.ok(await overflow() <= 0, 'the overflow is gone when the rule is lifted');
  }
}, { path: '/tests/contract.html', viewport: { width: 320, height: 900 } }));

test('foundation: the header wraps, keeps its content and gives each navigation link a 44px target', () => openPage(pages[0].path, async page => {
  for (const width of [1280, 320]) {
    await page.setViewportSize({ width, height: 900 });
    const nav = await page.evaluate(() => {
      const links = [...document.querySelectorAll('.g2-nav a')].map(a => { const r = a.getBoundingClientRect(); return { top: Math.round(r.top), height: r.height, right: r.right, clip: a.scrollWidth > a.clientWidth }; });
      return { links, headerHeight: document.querySelector('.g2-header-in').getBoundingClientRect().height, client: document.documentElement.clientWidth };
    });
    assert.equal(nav.links.length, 4, 'navigation stays available: every link is present');
    assert.ok(nav.links.every(l => l.height >= 44 && !l.clip && l.right <= nav.client), `navigation links at ${width}px`);
    if (width === 1280) assert.equal(nav.headerHeight, 52, 'the header keeps its 52px height when it does not wrap');
    else assert.ok(nav.headerHeight > 52 && new Set(nav.links.map(l => l.top)).size > 1, 'the header wraps onto more rows instead of clipping');
  }
  await keyboardFocus(page, '.g2-nav a[aria-current]');
  assert.equal((await styles(page, '.g2-nav a[aria-current]')).background, 'rgb(255, 221, 0)');
}));

// ---- The example pages: structure, reflow, enlargement ----
for (const { name, path } of pages) {
  test(`example ${name}: language, title, landmarks, headings, IDs, labels and links are sound`, () => openPage(path, async page => {
    const report = await page.evaluate(() => {
      const issues = [], ids = new Set();
      for (const el of document.querySelectorAll('[id]')) { if (ids.has(el.id)) issues.push(`duplicate id ${el.id}`); ids.add(el.id); }
      for (const a of document.querySelectorAll('a[href^="#"]')) if (a.hash.length > 1 && !document.getElementById(a.hash.slice(1))) issues.push(`missing fragment ${a.hash}`);
      for (const input of document.querySelectorAll('input')) {
        if (!input.labels.length) issues.push(`unlabelled input ${input.id}`);
        for (const id of (input.getAttribute('aria-describedby') || '').split(' ').filter(Boolean)) if (!document.getElementById(id)) issues.push(`missing description ${id}`);
      }
      for (const el of document.querySelectorAll('[aria-labelledby]')) for (const id of el.getAttribute('aria-labelledby').split(' ')) if (!document.getElementById(id)) issues.push(`missing label ${id}`);
      const levels = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(h => Number(h.tagName[1]));
      if (levels[0] !== 1 || levels.filter(l => l === 1).length !== 1) issues.push('exactly one h1, first');
      levels.forEach((l, i) => { if (i && l > levels[i - 1] + 1) issues.push(`heading level jumps to h${l}`); });
      for (const [selector, count] of [['header.g2-header', 1], ['main', 1], ['footer.g2-footer', 1], ['nav[aria-label]', 2]]) if (document.querySelectorAll(selector).length < count) issues.push(`missing ${selector}`);
      const current = document.querySelectorAll('.g2-nav a[aria-current="page"]').length;
      if (current !== 1) issues.push(`${current} current navigation links`);
      if (document.querySelector('[autofocus]')) issues.push('autofocus');
      return { issues, lang: document.documentElement.lang, title: document.title, viewport: !!document.querySelector('meta[name=viewport]'), scripts: document.scripts.length, activeIsBody: document.activeElement === document.body, scrollY };
    });
    assert.deepEqual(report.issues, []);
    assert.equal(report.lang, 'ro');
    assert.ok(report.title.length > 10 && report.viewport);
    assert.equal(report.scripts, 0, 'the example needs no script');
    assert.ok(report.activeIsBody && report.scrollY === 0, 'nothing takes focus or scrolls on load');
    const links = await page.locator('a[href]').evaluateAll(els => els.map(a => a.href).filter(href => !href.startsWith('mailto:')));
    for (const link of new Set(links)) {
      const url = new URL(link);
      assert.equal(url.origin, new URL(page.url()).origin, `${link} leaves the fixture`);
      const response = await page.request.get(url.origin + url.pathname);
      assert.equal(response.status(), 200, link);
      if (url.hash.length > 1 && url.pathname !== new URL(page.url()).pathname) assert.ok((await response.text()).includes(`id="${url.hash.slice(1)}"`), `${link}: the target id does not exist`);
    }
  }));

  test(`example ${name}: content reflows at 320, 390, 768 and 1280px with every control present and no horizontal overflow (acceptance 2)`, () => openPage(path, async page => {
    let inventory;
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      const state = await page.evaluate(() => {
        const client = document.documentElement.clientWidth;
        const outside = [...document.querySelectorAll('body *')].filter(el => !el.classList.contains('ex-skip') && el.getClientRects().length && el.getBoundingClientRect().right > client + .5 && el.getBoundingClientRect().width > 0)
          .map(el => `${el.tagName.toLowerCase()}.${el.className} ends at ${Math.round(el.getBoundingClientRect().right)}`);
        const hidden = [...document.querySelectorAll('header *, main *, footer *')].filter(el => !/^(INPUT|BUTTON|SELECT|TEXTAREA)$/.test(el.tagName) && /hidden|clip/.test(getComputedStyle(el).overflowX + getComputedStyle(el).overflowY)).map(el => el.className);
        const controls = [...document.querySelectorAll('a[href],button,input')].map(el => ({ label: (el.getAttribute('aria-label') || el.labels?.[0]?.textContent || el.textContent).trim().replace(/\s+/g, ' ').slice(0, 40), box: el.getBoundingClientRect().width > 0 && el.getBoundingClientRect().height > 0 }));
        const clipped = [...document.querySelectorAll('h1,h2,h3,.g2-label,.g2-hint,.g2-error-msg,.g2-btn,.g2-chip,.g2-nav a,.g2-tag')].filter(el => getComputedStyle(el).display !== 'inline' && (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1)).map(el => el.className + ' ' + el.textContent.trim().slice(0, 20));
        return { scroll: document.documentElement.scrollWidth, client, outside, hidden, controls, clipped };
      });
      assert.ok(state.scroll <= state.client, `horizontal overflow at ${width}px: scrollWidth ${state.scroll} > ${state.client}`);
      assert.deepEqual(state.outside, [], `elements beyond the viewport at ${width}px`);
      assert.deepEqual(state.hidden, [], 'no element hides overflow');
      assert.deepEqual(state.clipped, [], `clipped text or controls at ${width}px`);
      assert.ok(state.controls.every(c => c.box), `a control has no box at ${width}px`);
      const labels = state.controls.map(c => c.label);
      inventory ??= labels;
      assert.deepEqual(labels, inventory, `controls changed at ${width}px`);
      if (artifacts && [1280, 390, 320].includes(width)) {
        await mkdir(artifacts, { recursive: true });
        await page.screenshot({ path: `${artifacts}/example-${name}-${width}.png`, fullPage: true });
      }
    }
    assert.ok(inventory.length >= (name === 'directory' ? 25 : 14), 'the page keeps its controls');
  }));

  for (const scenario of [{ label: 'a 640px viewport (browser zoom 200% of a 1280px window)', width: 640 }, { label: 'root text 200% at 1280px', width: 1280, root: '200%' },
    { label: 'root text 200% at 640px', width: 640, root: '200%' }, { label: 'root text 150% at 320px', width: 320, root: '150%' }, { label: 'root text 200% at 320px', width: 320, root: '200%' },
    { label: 'CSS zoom 2 at 1280px', width: 1280, zoom: '2' }]) {
    test(`example ${name}: headings, controls and recovery stay readable and operable with ${scenario.label} (acceptance 3)`, () => openPage(path, async page => {
      if (scenario.root) await page.addStyleTag({ content: `html{font-size:${scenario.root}}` });
      if (scenario.zoom) await page.evaluate(zoom => { document.body.style.zoom = zoom; }, scenario.zoom);
      const state = await page.evaluate(() => {
        const client = document.documentElement.clientWidth;
        const clipped = [...document.querySelectorAll('h1,h2,h3,.g2-label,.g2-hint,.g2-error-msg,.g2-btn,.g2-nav a,.g2-chip')].filter(el => el.getClientRects().length && getComputedStyle(el).display !== 'inline' && (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1)).map(el => el.className);
        const outside = [...document.querySelectorAll('body *')].filter(el => !el.classList.contains('ex-skip') && el.getClientRects().length && el.getBoundingClientRect().right > client + .5).map(el => el.tagName.toLowerCase() + '.' + el.className);
        return { scroll: document.documentElement.scrollWidth, client, clipped, outside, h1: parseFloat(getComputedStyle(document.querySelector('h1')).fontSize) };
      });
      assert.ok(state.scroll <= state.client, `horizontal overflow: ${state.scroll} > ${state.client}`);
      assert.deepEqual(state.clipped, []);
      if (!scenario.zoom) assert.deepEqual(state.outside, []);
      if (scenario.root) assert.equal(state.h1, 32 * Number.parseInt(scenario.root) / 100, 'the page title follows the root text size');
      await page.locator('h1').scrollIntoViewIfNeeded();
      assert.ok(await page.locator('h1').isVisible());
      for (const link of await page.locator('.g2-nav a').all()) assert.ok(await link.isVisible());
      if (name === 'form') {
        await page.locator('a[href="#email"]').click();
        assert.equal(await page.evaluate(() => document.activeElement.id), 'email', 'the recovery link still moves focus');
        await page.locator('#email').fill('nume@institutie.ro');
        await page.locator('button[type=submit]').click({ trial: true });
        await page.locator('a.g2-btn.g2-secondary').click({ trial: true });
      } else {
        await page.locator('#q').fill('Bacău');
        await page.locator('button[type=submit]').click({ trial: true });
        await page.locator('a.g2-link-title').first().click({ trial: true });
      }
    }, { width: scenario.width }));
  }
}

test('foundation: raising the root text size scales the new type and spacing roles without clipping (acceptance 4)', async () => {
  for (const root of [16, 20, 32]) {
    await withPage(async page => {
      await page.evaluate(px => { document.documentElement.style.fontSize = px + 'px'; }, root);
      const m = await page.evaluate(() => {
        const get = (selector, property) => parseFloat(getComputedStyle(document.querySelector(selector))[property]);
        const clipped = ['#heading-page', '#heading-section', '#heading-item', '#primary', '#input', '#nav', '#field .g2-label', '#field-hint', '#chip'].filter(selector => {
          const el = document.querySelector(selector);
          return getComputedStyle(el).display !== 'inline' && (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1);
        });
        return { page: get('#heading-page', 'fontSize'), section: get('#heading-section', 'fontSize'), item: get('#heading-item', 'fontSize'), body: get('body', 'fontSize'), meta: get('#meta', 'fontSize'),
          label: get('#field .g2-label', 'fontSize'), hint: get('#field-hint', 'fontSize'), title: get('#title', 'fontSize'), button: get('#primary', 'fontSize'), input: get('#input', 'fontSize'),
          nav: get('#nav', 'fontSize'), chip: get('#chip', 'fontSize'), tag: get('.g2-tag', 'fontSize'), gap: get('#field', 'rowGap'), navPad: get('#nav', 'paddingLeft'), footerPad: get('#footer-in', 'paddingTop'),
          navColumn: get('.g2-nav', 'columnGap'), headerPad: get('#header-in', 'paddingTop'), clipped, overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth };
      });
      const k = root / 16;
      const expected = { page: 32, section: 24, item: 19, body: 17, meta: 15, label: 14, hint: 15, title: 19, button: 17, input: 17, nav: 15, chip: 15, tag: 14, gap: 4, navPad: 12, footerPad: 24, navColumn: 4, headerPad: 4 };
      for (const [role, px] of Object.entries(expected)) assert.equal(m[role], px * k, `${role} at a ${root}px root`);
      assert.deepEqual(m.clipped, [], `clipped at a ${root}px root`);
      assert.ok(m.overflow <= 0, `page overflow at a ${root}px root`);
    }, { path: '/tests/contract.html' });
  }
  await withPage(async page => {
    for (const [root, gutter] of [[16, 16], [20, 20], [32, 32]]) {
      await page.evaluate(px => { document.documentElement.style.fontSize = px + 'px'; }, root);
      assert.equal(await page.locator('#container').evaluate(el => parseFloat(getComputedStyle(el).paddingLeft)), gutter, `the gutter at a ${root}px root and a 320px viewport is 1rem`);
    }
  }, { path: '/tests/contract.html', viewport: { width: 320, height: 900 } });
});

// ---- Keyboard, recovery and accessibility APIs ----
for (const { name, path } of pages) {
  test(`example ${name}: the keyboard reaches the skip link, header, current link, content and footer in source order; disabled controls are skipped (acceptance 5)`, () => openPage(path, async page => {
    assert.ok((await page.locator('.ex-skip').boundingBox()).y + (await page.locator('.ex-skip').boundingBox()).height <= 0, 'the skip link is off screen until focused');
    const { expected, actual, states } = await tabSequence(page);
    assert.deepEqual(actual, expected, 'the tab sequence follows the source order');
    assert.ok(states.every(s => s.visible && !s.disabled), 'each stop shows keyboard focus and none is disabled');
    assert.deepEqual(actual.slice(0, 2), ['a:Sari la conținut', 'a:exemplu.gov2.ro']);
    assert.deepEqual(actual.slice(2, 6), ['a:Căutare instituții', 'a:Propune o corecție', 'a:Ghidul de design', 'a:Sursa datelor și limitele lor']);
    assert.ok(actual.length >= 14);
    if (name === 'form') {
      const wanted = [stop('a', 'Adresa de e-mail: scrieți o adresă completă, de exemplu nume@institutie.ro.'), stop('a', 'Data documentului: scrieți data în formatul zz.ll.aaaa, de exemplu 17.10.2026.'),
        stop('input', 'Numele dumneavoastră complet'), stop('input', 'Instituția dumneavoastră (opțional)'), stop('input', 'Adresa de e-mail'), stop('input', 'Data documentului care conține eroarea'),
        stop('button', 'Trimite propunerea'), stop('a', 'Înapoi la rezultate')];
      assert.deepEqual(actual.filter(x => wanted.includes(x)), wanted, 'summary links, fields and actions come in this order');
      assert.ok(!actual.some(x => /Cod înregistrare|Descarcă confirmarea/.test(x)), 'the disabled field and the disabled button are not tab stops');
      assert.ok(await page.locator('#cod').isDisabled() && await page.locator('button:has-text("Descarcă confirmarea")').isDisabled());
    }
  }));
}

test('example form: a recovery link moves keyboard focus to its field, and the path continues to the actions (acceptance 5, 6)', () => openPage(pages[1].path, async (page, context) => {
  assert.equal(await page.evaluate(() => document.activeElement === document.body && !document.querySelector('[autofocus]')), true, 'no initial focus');
  await page.locator('a[href="#email"]').click();
  const reached = await page.evaluate(() => { const el = document.activeElement, label = document.querySelector('label[for=email]').getBoundingClientRect(); return { id: el.id, focusVisible: el.matches(':focus-visible'), labelInView: label.top >= 0 && label.bottom <= innerHeight, inputInView: el.getBoundingClientRect().bottom <= innerHeight }; });
  assert.equal(reached.id, 'email');
  assert.ok(reached.focusVisible, 'the field shows keyboard focus');
  assert.ok(reached.labelInView && reached.inputInView, 'the label and the field are both visible after the jump');
  // Keyboard only: Enter on the second link, then Tab to the actions.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.locator('a[href="#data-document"]').focus();
  await page.keyboard.press('Enter');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'data-document');
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => document.activeElement.textContent.trim()), 'Trimite propunerea');
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => document.activeElement.textContent.trim()), 'Înapoi la rezultate', 'the disabled button is skipped after the secondary action');
  await page.keyboard.press('Tab');
  assert.match(await page.evaluate(() => document.activeElement.textContent.trim()), /Ghidul de design/, 'focus leaves the form for the footer');
  // Accessibility APIs: name, description (hint and error), invalid and disabled state.
  const email = await accessibleNode(context, page, '#email');
  assert.equal(email.role, 'textbox');
  assert.equal(email.name, 'Adresa de e-mail');
  assert.match(email.description, /Pe această adresă primiți confirmarea\./);
  assert.match(email.description, /Eroare: scrieți o adresă de e-mail completă/);
  assert.equal(String(email.props.invalid), 'true');
  const date = await accessibleNode(context, page, '#data-document');
  assert.equal(date.name, 'Data documentului care conține eroarea');
  assert.match(date.description, /17\.10\.2026/);
  assert.match(date.description, /formatul zz\.ll\.aaaa/);
  assert.equal(String(date.props.invalid), 'true');
  const code = await accessibleNode(context, page, '#cod');
  assert.equal(code.name, 'Cod înregistrare');
  assert.match(code.description, /Nu se poate modifica/);
  assert.equal(code.props.disabled, true);
  const name = await accessibleNode(context, page, '#nume');
  assert.match(name.description, /Îl folosim numai pentru a vă răspunde/);
  assert.notEqual(String(name.props.invalid), 'true');
  assert.equal(await page.getByRole('textbox', { name: 'Adresa de e-mail' }).count(), 1);
  assert.equal(await page.getByRole('link', { name: /^Adresa de e-mail: scrieți/ }).count(), 1);
  const tokens = await page.evaluate(() => Object.fromEntries([...document.querySelectorAll('input')].map(i => [i.id, i.autocomplete])));
  assert.deepEqual(tokens, { cod: '', nume: 'name', institutie: 'organization', email: 'email', 'data-document': 'off' });
}));

for (const [width, height] of [[1280, 400], [390, 500], [320, 500]]) {
  test(`example form: after a recovery jump at ${width}x${height}px, the label and the field are both in the window`, () => openPage(pages[1].path, async page => {
    for (const id of ['email', 'data-document']) {
      await page.locator(`a[href="#${id}"]`).click();
      const view = await page.evaluate(id => ({ active: document.activeElement.id, label: document.querySelector(`label[for=${id}]`).getBoundingClientRect().top, bottom: document.getElementById(id).getBoundingClientRect().bottom, height: innerHeight }), id);
      assert.equal(view.active, id);
      assert.ok(view.label >= 0, `the label of ${id} is ${Math.round(-view.label)}px above the window`);
      assert.ok(view.bottom <= view.height, `the field ${id} is below the window`);
      await page.evaluate(() => window.scrollTo(0, 0));
    }
  }, { width, height }));
}

test('example directory: the search field has a label, a hint and an accessible name; chips show the current filter', () => openPage(pages[0].path, async (page, context) => {
  const search = await accessibleNode(context, page, '#q');
  assert.equal(search.role, 'searchbox');
  assert.equal(search.name, 'Instituție, cod sau localitate');
  assert.match(search.description, /Casa Județeană de Pensii/);
  assert.equal(await page.locator('.g2-chip[aria-current="true"]').count(), 1);
  assert.equal((await styles(page, '.g2-chip[aria-current="true"]')).border, 'rgb(11, 12, 12)');
  assert.equal((await styles(page, first('.g2-chip:not([aria-current])'))).border, 'rgba(0, 0, 0, 0)');
  assert.equal(await page.locator('li.ex-result').count(), 5);
  for (const title of await page.locator('li.ex-result h3 a.g2-link-title').all()) assert.ok((await title.textContent()).trim().length > 20, 'each result has an understandable title link');
  assert.match(await page.locator('main').textContent(), /Date demonstrative/);
  assert.match(await page.locator('main').textContent(), /Nicio instituție pentru/);
  assert.equal(await page.locator('[data-tone]').count(), 5, 'status tags name their state in text');
}));

// ---- Contrast ----
for (const { name, path } of pages) {
  test(`example ${name}: text, field boundaries and keyboard focus meet the applicable contrast on the rendered surfaces (acceptance 7)`, () => openPage(path, async page => {
    const report = await contrastReport(page);
    assert.ok(report.text > 60 && report.boundaries >= 1, `checked ${report.text} text nodes and ${report.boundaries} field boundaries`);
    assert.deepEqual(report.problems, []);
    const targets = name === 'form' ? ['.ex-skip', '.g2-wordmark', '.g2-nav a[aria-current]', '.ex-summary a', '#nume', '#email', 'button[type=submit]', 'a.g2-btn.g2-secondary', '.g2-footer a']
      : ['.ex-skip', '.g2-wordmark', '.g2-nav a[aria-current]', '#q', 'button[type=submit]', '.g2-chip[aria-current]', 'a.g2-link-title', 'a.g2-link-quiet', '.g2-footer a'];
    for (const selector of targets) {
      await keyboardFocus(page, first(selector));
      const focus = await page.locator(selector).first().evaluate(el => {
        const parse = value => (value.match(/[\d.]+/g) || []).map(Number);
        const luminance = ([r, g, b]) => [r, g, b].map(v => { v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
        const ratio = (a, b) => { const [low, high] = [luminance(a), luminance(b)].sort((x, y) => x - y); return (high + .05) / (low + .05); };
        let behind = [255, 255, 255];
        for (let e = el.parentElement; e; e = e.parentElement) { const c = parse(getComputedStyle(e).backgroundColor); if ((c[3] ?? 1) >= 1) { behind = c; break; } }
        const s = getComputedStyle(el);
        const indicators = [...s.boxShadow.matchAll(/rgba?\([^)]*\)/g)].map(m => parse(m[0]));
        if (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0) indicators.push(parse(s.outlineColor));
        const own = parse(s.backgroundColor);
        return { textRatio: ratio(parse(s.color), (own[3] ?? 1) > 0 ? own : behind), indicator: Math.max(...indicators.filter(c => (c[3] ?? 1) > 0).map(c => ratio(c, behind)), (own[3] ?? 1) > 0 ? ratio(own, behind) : 0) };
      });
      assert.ok(focus.textRatio >= 4.5, `${selector}: focused text ${focus.textRatio.toFixed(2)}:1`);
      assert.ok(focus.indicator >= 3, `${selector}: no focus indicator reaches 3:1 against the surface (best ${focus.indicator.toFixed(2)}:1)`);
    }
  }));
}

// ---- Hover plus focus, current selection, forced colours ----
test('example directory: hover plus focus and the current selection stay understandable (acceptance 8)', () => openPage(pages[0].path, async page => {
  for (const selector of ['.g2-nav a[aria-current]', '.g2-nav a:not([aria-current])', '.g2-chip[aria-current]', '.g2-chip:not([aria-current])', 'a.g2-link-title', 'a.g2-link-quiet', 'button[type=submit]', '.g2-footer a']) {
    await keyboardFocus(page, first(selector));
    for (const hovered of [false, true]) {
      if (hovered) await page.locator(selector).first().hover();
      const s = await styles(page, first(selector));
      assert.equal(s.background, 'rgb(255, 221, 0)', `${selector} loses the focus background${hovered ? ' on hover' : ''}`);
      assert.ok(contrast(s.color, s.background) >= 4.5, `${selector} focus text${hovered ? ' on hover' : ''}`);
    }
  }
  await keyboardFocus(page, '#q');
  await page.locator('#q').hover();
  const field = await styles(page, '#q');
  assert.equal(field.outline, 'solid');
  assert.equal(field.outlineColor, 'rgb(255, 221, 0)');
  assert.match(field.shadow, /rgb\(11, 12, 12\) 0px 0px 0px 2px inset/);
  await page.mouse.move(0, 0);
  await page.evaluate(() => document.activeElement.blur());
  assert.match((await styles(page, '.g2-nav a[aria-current]')).shadow, /^rgb\(140, 198, 255\) 0px -4px 0px 0px inset$/, 'the current page link has its bar');
  assert.equal((await styles(page, first('.g2-nav a:not([aria-current])'))).shadow, 'none');
  assert.equal(await page.locator('.g2-nav a[aria-current]').getAttribute('aria-current'), 'page');
  assert.notEqual((await styles(page, '.g2-chip[aria-current]')).border, (await styles(page, first('.g2-chip:not([aria-current])'))).border, 'the selected chip is marked by its border');
}));

test('example form: hover plus focus on fields and actions, with the error bar kept', () => openPage(pages[1].path, async page => {
  for (const selector of ['#email', '#data-document', '#nume']) {
    await keyboardFocus(page, first(selector));
    await page.locator(selector).hover();
    const s = await styles(page, first(selector));
    assert.equal(s.outlineColor, 'rgb(255, 221, 0)');
    assert.equal(s.outline, 'solid');
    if (selector !== '#nume') assert.equal(s.border, 'rgb(212, 53, 28)', `${selector} keeps its error border`);
  }
  for (const selector of ['button[type=submit]', 'a.g2-btn.g2-secondary', '.ex-summary a']) {
    await keyboardFocus(page, first(selector));
    await page.locator(selector).first().hover();
    assert.equal((await styles(page, first(selector))).background, 'rgb(255, 221, 0)', selector);
  }
}));

for (const { name, path } of pages) {
  test(`example ${name}: with forced colours, text stays readable, selection and focus stay visible (acceptance 8)`, () => openPage(path, async page => {
    const report = await contrastReport(page);
    assert.deepEqual(report.problems, []);
    const color = selector => page.locator(selector).first().evaluate(el => { const s = getComputedStyle(el); return [s.backgroundColor, s.color, s.borderTopWidth, s.borderLeftWidth, s.outlineStyle]; });
    const current = await color('.g2-nav a[aria-current]'), other = await color('.g2-nav a:not([aria-current])');
    assert.notDeepEqual(current.slice(0, 2), other.slice(0, 2), 'the current page link differs from the other links without a box-shadow');
    await keyboardFocus(page, first('.g2-nav a:not([aria-current])'));
    assert.equal((await color('.g2-nav a:not([aria-current])'))[4], 'solid', 'a focused link keeps its outline');
    if (name === 'directory') {
      const selected = await color('.g2-chip[aria-current]'), plain = await color('.g2-chip:not([aria-current])');
      assert.notDeepEqual(selected.slice(0, 2), plain.slice(0, 2), 'the selected chip differs from the other chips');
      await keyboardFocus(page, '#q');
      assert.equal((await color('#q'))[4], 'solid');
    } else {
      const disabled = await color('#cod'), enabled = await color('#nume');
      assert.notEqual(disabled[1], enabled[1], 'the disabled field differs from an enabled field');
      assert.equal((await color('.g2-field-error'))[3], '5px', 'the error bar stays');
      assert.equal((await color('.ex-summary'))[2], '5px', 'the summary frame stays');
      await keyboardFocus(page, '#email');
      assert.equal((await color('#email'))[4], 'solid');
    }
  }, { forcedColors: 'active' }));
}

// ---- No script, no web fonts ----
for (const { name, path } of pages) {
  test(`example ${name}: stays readable with JavaScript disabled and the font files blocked; navigation does not need a script (acceptance 9)`, () => openPage(path, async (page, context, blocked, fontsBlocked) => {
    assert.deepEqual(blocked, [], 'the page makes no external request');
    assert.ok(fontsBlocked.length > 0, 'the page requested its local font files, and the check blocked them');
    assert.ok(fontsBlocked.every(url => /\/fonts\/[\w-]+\.woff2$/.test(url)), `only the documented font files are blocked: ${fontsBlocked}`);
    const cdp = await context.newCDPSession(page);
    await cdp.send('DOM.enable');
    await cdp.send('CSS.enable');
    const { root } = await cdp.send('DOM.getDocument');
    for (const selector of ['h1', '.g2-nav a', 'main p']) {
      const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector });
      const { fonts } = await cdp.send('CSS.getPlatformFontsForNode', { nodeId });
      assert.ok(fonts.length > 0 && fonts.every(font => !font.isCustomFont), `${selector} renders with an installed font, not a web font`);
      // Inter may be installed on the machine that runs the check, so this proves only that no web font is in use. tests/fonts.test.mjs
      // proves the fallback stack itself, with the first family removed.
    }
    for (const link of await page.locator('.g2-nav a').all()) {
      assert.ok(await link.isVisible());
      const box = await link.boundingBox();
      assert.ok(box.width > 0 && box.height >= 44 && box.x + box.width <= 1280);
    }
    assert.equal(await page.locator('.g2-nav a').count(), 4);
    assert.equal(await page.locator('script').count(), 0);
    await page.addScriptTag({ content: 'document.documentElement.dataset.script = "ran"' }).catch(() => {});
    assert.equal(await page.evaluate(() => document.documentElement.dataset.script), undefined, 'the context runs no page script');
    assert.ok((await page.locator('main').textContent()).trim().length > 1000, 'the main text is present');
    assert.ok(await page.locator('h1').isVisible());
    assert.equal(await page.locator('.g2-nav a[aria-current="page"]').count(), 1);
    // The text uses Romanian diacritics and still renders (no missing-glyph box check is possible here; the text is present).
    assert.match(await page.locator('h1').textContent(), /[ăâîșț]/);
    if (name === 'form') {
      await page.locator('a[href="#email"]').click();
      assert.equal(await page.evaluate(() => document.activeElement.id), 'email', 'recovery needs no script');
    } else {
      await page.locator('a[href="form.html"]').first().click();
      assert.match(page.url(), /form\.html$/, 'a result title link navigates without a script');
    }
  }, { javaScriptEnabled: false, blockFonts: true }));
}

// ---- Customization under the accepted layer order ----
test('foundation: the documented width and density customization works in the app layer and keeps accessible behaviour (acceptance 11)', async () => {
  const custom = example('foundation-css');
  await openPage(pages[0].path, async page => {
    await page.addStyleTag({ content: custom });
    const m = await page.evaluate(() => { const main = document.querySelector('main'), s = getComputedStyle(main); return { width: main.getBoundingClientRect().width, padding: s.paddingLeft, max: getComputedStyle(document.documentElement).getPropertyValue('--g2-container-max').trim(),
      gap: getComputedStyle(document.querySelector('.g2-field')).rowGap, input: document.querySelector('#q').getBoundingClientRect().height }; });
    assert.equal(m.max, '60rem');
    assert.equal(m.width, 960, 'the container follows the overridden token');
    assert.equal(m.padding, '16px', 'the gutter follows the overridden token');
    assert.equal(m.gap, '8px', 'a project rule in app beats the gov2 field gap');
    assert.equal(m.input, 48, 'a project rule in app beats the gov2 control height');
    await keyboardFocus(page, '#q');
    const field = await styles(page, '#q');
    assert.equal(field.outlineColor, 'rgb(255, 221, 0)', 'the field keeps its focus outline after customization');
    for (const selector of ['button[type=submit]', '.g2-nav a', '.g2-chip', 'a.g2-link-title']) {
      await keyboardFocus(page, first(selector));
      await page.locator(selector).first().hover();
      const s = await styles(page, first(selector));
      assert.equal(s.background, 'rgb(255, 221, 0)', `${selector} keeps the focus treatment`);
      assert.ok(contrast(s.color, s.background) >= 4.5);
    }
    assert.equal(await page.locator('#q').getAttribute('aria-describedby'), 'q-hint', 'names and relationships are untouched');
    await page.setViewportSize({ width: 320, height: 900 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), 'no overflow at 320px after customization');
  });
  await openPage(pages[1].path, async page => {
    await page.addStyleTag({ content: custom });
    await page.locator('a[href="#email"]').click();
    assert.equal(await page.evaluate(() => document.activeElement.id), 'email', 'recovery still works after customization');
    assert.equal((await styles(page, '#email')).border, 'rgb(212, 53, 28)', 'the error border stays after customization');
  });
});
