// Brief 05: the opt-in dark colour scheme (ADR 0009).
// Static checks read gov2.css, the guide and the reference. Browser checks use tests/contract.html (?scheme=...), the guide and the example pages.
// tests/baseline/gov2-0.11.0.css is a byte copy of `git show v0.11.0:gov2.css`: the release before the scheme. Acceptance 1 compares computed styles with it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import { useBrowser, browser, base, read, css, reference, artifacts, tokenBlocks, setScheme, contrastReport, contrast, keyboardFocus } from './helpers.mjs';

useBrowser();

const baseline = await read('tests/baseline/gov2-0.11.0.css');
const blocks = tokenBlocks();
const light = blocks.light, dark = { ...blocks.light, ...blocks.dark };
const guideHtml = await read('docs/index.html');
const noComments = text => text.replace(/\/\*[\s\S]*?\*\//g, '');
const pages = [{ name: 'guide', path: '/docs/' }, { name: 'directory', path: '/docs/examples/directory.html' }, { name: 'form', path: '/docs/examples/form.html' }];
const newTokens = { '--g2-color-on-solid': '255 255 255', '--g2-color-action-secondary-hover': '219 218 217', '--g2-color-control-bg': '255 255 255', '--g2-color-ro-blue-ring': '58 90 160' };
// Colour tokens that keep their light value in the dark scheme: the header group (the header is dark in both), focus, the tricolour and its ring.
const unchanged = ['--g2-color-header-bg', '--g2-color-on-header', '--g2-color-on-header-muted', '--g2-color-header-accent', '--g2-color-focus', '--g2-color-on-focus',
  '--g2-color-ro-blue', '--g2-color-ro-yellow', '--g2-color-ro-red', '--g2-color-ro-blue-ring'];

// ---- Colour arithmetic on RGB channel strings ("11 12 12") ----
const channels = value => value.trim().split(/\s+/).map(Number);
const linear = v => { v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; };
const luminance = value => channels(value).map(linear).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
const ratio = (a, b) => { const [low, high] = [luminance(a), luminance(b)].sort((x, y) => x - y); return (high + .05) / (low + .05); };
const hexOf = value => '#' + channels(value).map(v => v.toString(16).padStart(2, '0')).join('');
const lab = value => {
  const [r, g, b] = channels(value).map(linear);
  const x = (.4124 * r + .3576 * g + .1805 * b) / .95047, y = .2126 * r + .7152 * g + .0722 * b, z = (.0193 * r + .1192 * g + .9505 * b) / 1.08883;
  const f = t => t > .008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
};
const deltaE = (a, b) => Math.hypot(...lab(a).map((v, i) => v - lab(b)[i]));
const t = name => `--g2-color-${name}`;
const textPairs = [['text', 'page'], ['text', 'surface'], ['text', 'surface-sunken'], ['text', 'control-bg'], ['text', 'selected-bg'], ['text', 'neutral-bg'], ['text', 'action-secondary-hover'], ['text', 'highlight-bg'],
  ['text-muted', 'page'], ['text-muted', 'surface'], ['text-muted', 'surface-sunken'], ['text-muted', 'neutral-bg'], ['text-faint', 'page'], ['text-faint', 'surface'],
  ['link', 'page'], ['link', 'surface'], ['link', 'surface-sunken'], ['link', 'selected-bg'], ['link-visited', 'page'], ['link-visited', 'surface'], ['link-visited', 'surface-sunken'], ['link-visited', 'selected-bg'],
  ['on-link', 'link'], ['on-solid', 'action'], ['on-solid', 'action-hover'], ['on-solid', 'danger-solid'], ['on-solid', 'info-line'], ['danger-solid', 'page'], ['danger-solid', 'surface'], ['danger-solid', 'surface-sunken'],
  ['on-header', 'header-bg'], ['on-header-muted', 'header-bg'], ['header-accent', 'header-bg'], ['on-focus', 'focus']];
const graphicPairs = [['control-border', 'page'], ['control-border', 'surface'], ['control-border', 'surface-sunken'], ['text', 'surface-sunken'], ['danger-solid', 'page'], ['danger-solid', 'surface'],
  ['focus', 'page'], ['focus', 'surface'], ['focus', 'surface-sunken'], ['brand', 'page'], ['brand', 'surface-sunken'], ['action', 'page'], ['neutral-line', 'page']];
const statuses = ['neutral', 'info', 'progress', 'warning', 'success', 'danger'];

// ---- Static: names, values and the two dark blocks ----
test('scheme: the four new tokens have the decided names and their light values equal the old literals', () => {
  for (const [name, value] of Object.entries(newTokens)) assert.equal(light[name], value, name);
  assert.equal(hexOf(light['--g2-color-on-solid']), '#ffffff');
  assert.equal(hexOf(light['--g2-color-action-secondary-hover']), '#dbdad9');
  assert.equal(hexOf(light['--g2-color-control-bg']), '#ffffff');
  assert.equal(hexOf(light['--g2-color-ro-blue-ring']), '#3a5aa0');
  assert.equal(blocks.schemes.light, 'light');
  assert.equal(blocks.schemes.dark, 'dark');
  assert.equal(blocks.schemes.auto, 'dark');
  // Components read the new tokens in the rules that held the literals.
  const code = noComments(css);
  for (const rule of [/\.g2-nav a\{[^}]*color:rgb\(var\(--g2-color-on-header\)\)/, /\.g2-btn\{[^}]*color:rgb\(var\(--g2-color-on-solid\)\)/, /\.g2-btn\.g2-secondary:where\(:hover\)\{background:rgb\(var\(--g2-color-action-secondary-hover\)\)\}/,
    /\.g2-input\{[^}]*background:rgb\(var\(--g2-color-control-bg\)\)/, /\.g2-notice>\*:first-child\{[^}]*color:rgb\(var\(--g2-color-on-solid\)\)/, /\.g2-notice>\*:last-child\{[^}]*background:rgb\(var\(--g2-color-surface\)\)/,
    /\.g2-ro-dots::before\{[^}]*box-shadow:0 0 0 1px rgb\(var\(--g2-color-ro-blue-ring\)\)/, /:is\(input,textarea,select\):focus-visible\{background:rgb\(var\(--g2-color-control-bg\)\);color:rgb\(var\(--g2-color-text\)\)/]) {
    assert.match(code, rule, `a component rule does not read its token: ${rule}`);
  }
});

// A colour literal is a hex value, rgb()/rgba()/hsl() with numbers, or a colour name. Keywords such as transparent, currentcolor and the system colours are not literals.
const colourNames = 'aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen'.split(' ');
function colourLiterals(source) {
  const found = [];
  for (const [, property, value] of noComments(source).matchAll(/([a-z-]+)\s*:\s*([^;{}]+)(?=[;}])/g)) {
    if (property.startsWith('--')) continue;
    for (const hex of value.matchAll(/#[0-9a-f]{3,8}\b/gi)) found.push(`${property}: ${hex[0]}`);
    for (const fn of value.matchAll(/\b(rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(\s*(?!var\()[^)]*\)/gi)) found.push(`${property}: ${fn[0]}`);
    for (const word of value.replace(/var\([^)]*\)/g, '').matchAll(/[a-z]+/gi)) if (colourNames.includes(word[0].toLowerCase())) found.push(`${property}: ${word[0]}`);
  }
  return found;
}
// The part of gov2.css outside the token layer: base, components and states.
const componentCss = source => source.replace(/@layer gov2\.tokens\s*\{[\s\S]*?\n\}\n(?=\n\/\* ---- Base)/, '');

test('scheme: no component rule in gov2.css contains a colour literal (acceptance 9)', () => {
  const rules = componentCss(css);
  assert.ok(rules.length < css.length && rules.includes('.g2-btn{') && !rules.includes('--g2-color-page:'), 'the token layer is removed from the part that is checked');
  assert.deepEqual(colourLiterals(rules), []);
  // The detector finds each kind of literal, so a clean result means something.
  assert.deepEqual(colourLiterals('.a{color:#fff;background:rgb(1 2 3);border:1px solid red;box-shadow:0 0 0 1px rgba(0,0,0,.5)}'), ['color: #fff', 'background: rgb(1 2 3)', 'border: red', 'box-shadow: rgba(0,0,0,.5)']);
  assert.deepEqual(colourLiterals('.a{color:rgb(var(--g2-color-text));border:1px solid transparent;background:Highlight;color:currentcolor}'), []);
  assert.deepEqual(colourLiterals(baseline.replace(/@layer gov2\.tokens[\s\S]*?\n\}\n(?=\n\/\* ---- Base)/, '')).sort(), ['background: #dbdad9', 'background: #fff', 'background: #fff', 'background: #fff', 'box-shadow: #3a5aa0', 'color: #fff', 'color: #fff', 'color: #fff'].sort(),
    'the detector finds the eight literals that 0.11.0 had');
});

test('scheme: the two dark blocks are equal, set colour tokens that the light block defines, and leave the documented tokens alone (acceptance 2)', () => {
  assert.deepEqual(blocks.dark, blocks.auto, 'the dark block and the auto block set the same values');
  assert.equal(blocks.texts.dark.trim(), blocks.texts.auto.trim(), 'the two blocks are written the same');
  const names = Object.keys(blocks.dark);
  for (const name of names) { assert.ok(name in light, `${name} is not a light token`); assert.match(name, /^--g2-color-/, `${name} is not a colour token`); }
  assert.equal(new Set(names).size, names.length, 'a token is set twice in a dark block');
  const colourTokens = Object.keys(light).filter(name => name.startsWith('--g2-color-'));
  assert.deepEqual(colourTokens.filter(name => !(name in blocks.dark)).sort(), [...unchanged].sort(), 'the tokens that keep their light value are the documented ones');
  for (const name of unchanged.filter(n => n.startsWith('--g2-color-ro-'))) assert.ok(!(name in blocks.dark), `${name} must not change: the tricolour is the same in both schemes`);
  assert.ok(!Object.keys(blocks.dark).some(name => /^--g2-(font|space|line|border|radius|container|gutter)/.test(name)), 'the dark blocks set colours only');
  for (const name of Object.keys(blocks.dark).filter(n => n !== '--g2-color-surface')) assert.notEqual(blocks.dark[name], light[name], `${name} has the same value in both schemes: leave it out of the dark blocks`);
});

test('scheme: every colour token has its hex value in a trailing comment, in the light and in the dark blocks', () => {
  for (const [label, text] of [['light', blocks.texts.light], ['dark', blocks.texts.dark], ['auto', blocks.texts.auto]]) {
    const lines = [...text.matchAll(/^\s*(--g2-color-[\w-]+):\s*([^;]+);\s*\/\*\s*(#[0-9a-f]{6})\b/gm)];
    const expected = Object.keys(label === 'light' ? light : blocks.dark).filter(name => name.startsWith('--g2-color-'));
    assert.deepEqual(lines.map(m => m[1]), expected, `${label}: each colour token has a hex comment`);
    for (const [, name, value, hex] of lines) assert.equal(hexOf(value), hex, `${label} ${name}: the comment ${hex} does not match the channels ${value}`);
  }
});

test('scheme: the dark values meet the requirements of ADR 0009 (acceptance 4, 5, 6)', () => {
  for (const [fg, bg] of textPairs) assert.ok(ratio(dark[t(fg)], dark[t(bg)]) >= 4.5, `dark ${fg} on ${bg}: ${ratio(dark[t(fg)], dark[t(bg)]).toFixed(2)}:1`);
  for (const [fg, bg] of graphicPairs) assert.ok(ratio(dark[t(fg)], dark[t(bg)]) >= 3, `dark ${fg} against ${bg}: ${ratio(dark[t(fg)], dark[t(bg)]).toFixed(2)}:1`);
  for (const tone of statuses) {
    assert.ok(ratio(dark[t(`${tone}-ink`)], dark[t(`${tone}-bg`)]) >= 4.5, `${tone}: ink on bg`);
    assert.ok(ratio(dark[t(`${tone}-line`)], dark[t('page')]) >= 3, `${tone}: line on the page`);
  }
  // The same pairs in the light scheme still pass, so the check measures the dark values and not a loose threshold.
  for (const [fg, bg] of textPairs.filter(([f, b]) => !['text-faint', 'link-visited'].includes(f) || b === 'page')) if (!['on-solid'].includes(fg) || bg !== 'info-line') assert.ok(ratio(light[t(fg)], light[t(bg)]) > 1, `${fg}/${bg}`);
  // Visited links stay distinguishable: the dark pair differs at least as much as the light pair (CIE76), and also in luminance.
  assert.ok(deltaE(dark[t('link')], dark[t('link-visited')]) >= deltaE(light[t('link')], light[t('link-visited')]), 'the dark visited colour is as far from the link colour as the light one');
  assert.ok(ratio(dark[t('link')], dark[t('link-visited')]) >= 1.3, 'the dark link pair also differs in luminance');
  // Chart series keep their order of emphasis (contrast against the page), and the selection stays the strongest.
  const order = scheme => ['chart-selected', 'chart-2', 'chart-3', 'chart-1', 'chart-4'].map(n => ratio(scheme[t(n)], scheme[t('page')]));
  for (const scheme of [light, dark]) { const r = order(scheme); assert.deepEqual([...r].sort((a, b) => b - a), r, `the chart ramp keeps its order of emphasis: ${r.map(v => v.toFixed(2))}`); }
  // The header does not change, and the dark page has the header colour, so the brand band separates them.
  assert.equal(dark[t('header-bg')], light[t('header-bg')]);
  assert.equal(dark[t('page')], dark[t('header-bg')]);
  assert.ok(ratio(dark[t('brand')], dark[t('header-bg')]) >= 3, 'the brand band is visible against the header and the page');
});

// ---- Static: the guide, the reference and the other documents ----
const rowsOf = id => [...guideHtml.match(new RegExp(`<table[^>]*id="${id}"[\\s\\S]*?</table>`))[0].matchAll(/<tr data-[^>]*>[\s\S]*?<\/tr>/g)].map(m => m[0]);
const shown = text => Number(text.replace(',', '.').replace(':1', ''));
test('scheme: the guide tables are computed from the tokens, and each row meets its minimum (acceptance 4, 5, 6, 10)', () => {
  for (const [id, scheme] of [['scheme-text-pairs', dark], ['scheme-graphic-pairs', dark]]) {
    const rows = rowsOf(id);
    assert.ok(rows.length >= 8, `${id} has rows`);
    for (const row of rows) {
      const [, fg, bg, min] = row.match(/data-fg="([^"]+)" data-bg="([^"]+)" data-min="([\d.]+)"/);
      const cells = [...row.matchAll(/<td>([\s\S]*?)<\/td>/g)].map(m => m[1]);
      const found = ratio(scheme[fg], scheme[bg]);
      assert.equal(shown(cells[1]), Number(found.toFixed(2)), `${id}: ${fg} / ${bg} shows ${cells[1]}, the tokens give ${found.toFixed(2)}`);
      assert.ok(found >= Number(min), `${id}: ${fg} / ${bg} is below ${min}:1`);
    }
  }
  const tones = rowsOf('scheme-tones');
  assert.deepEqual(tones.map(row => row.match(/data-tone="(\w+)"/)[1]), statuses);
  for (const row of tones) {
    const tone = row.match(/data-tone="(\w+)"/)[1], cells = [...row.matchAll(/<td>([\s\S]*?)<\/td>/g)].map(m => m[1]);
    assert.equal(shown(cells[1]), Number(ratio(dark[t(`${tone}-ink`)], dark[t(`${tone}-bg`)]).toFixed(2)), `${tone} ink on bg`);
    assert.equal(shown(cells[2]), Number(ratio(dark[t(`${tone}-line`)], dark[t('page')]).toFixed(2)), `${tone} line on page`);
    assert.ok(shown(cells[1]) >= 4.5 && shown(cells[2]) >= 3);
  }
  const marks = rowsOf('scheme-tricolour');
  assert.equal(marks.length, 4);
  for (const row of marks) {
    const [, fg, bg] = row.match(/data-fg="([^"]+)" data-bg="([^"]+)"/), cells = [...row.matchAll(/<td>([\s\S]*?)<\/td>/g)].map(m => m[1]);
    assert.equal(shown(cells[1]), Number(ratio(dark[fg], dark[bg]).toFixed(2)), `${fg} on the dark page`);
    assert.equal(shown(cells[2]), Number(ratio(light[fg], light[bg]).toFixed(2)), `${fg} on the light page`);
  }
  // The guide names the attribute, its three values and the four new tokens with their light values; the preview documents differ only in the attribute.
  for (const needle of ['data-g2-scheme', 'data-g2-scheme="light"', 'data-g2-scheme="auto"', 'data-g2-scheme="dark"']) assert.ok(guideHtml.includes(needle), `the guide does not name ${needle}`);
  const newRows = [...guideHtml.match(/<table[^>]*id="scheme-new-tokens"[\s\S]*?<\/table>/)[0].matchAll(/<tr data-token="([^"]+)"><td><code>[^<]+<\/code><\/td><td>(#[0-9a-f]{6})<\/td>/g)].map(m => [m[1], m[2]]);
  assert.deepEqual(newRows, Object.keys(newTokens).map(name => [name, hexOf(newTokens[name])]), 'the guide table lists the four tokens with their light values');
  const srcdocs = [...guideHtml.matchAll(/<iframe class="guide-preview" id="preview-(light|dark)"[^>]* srcdoc="([^"]*)"/g)];
  assert.deepEqual(srcdocs.map(m => m[1]), ['light', 'dark']);
  assert.equal(srcdocs[0][2].replace('data-g2-scheme=&quot;light&quot;', 'X'), srcdocs[1][2].replace('data-g2-scheme=&quot;dark&quot;', 'X'), 'the two previews have the same markup');
  assert.ok(srcdocs[0][2].includes('data-g2-scheme=&quot;light&quot;') && srcdocs[1][2].includes('data-g2-scheme=&quot;dark&quot;'));
});

test('scheme: the reference documents the attribute, the four tokens and the behaviour; the other documents mention the attribute (acceptance 10)', async () => {
  for (const name of Object.keys(newTokens)) assert.ok(reference.includes(`\`${name}\``), `COMPONENTS.md does not document ${name}`);
  assert.match(reference, /^## Colour scheme$/m, 'COMPONENTS.md has a Colour scheme section');
  for (const needle of ['data-g2-scheme="light"', 'data-g2-scheme="auto"', 'data-g2-scheme="dark"', 'prefers-color-scheme', 'color-scheme', 'no toggle', 'gov2.tokens']) assert.ok(reference.includes(needle), `COMPONENTS.md does not say ${needle}`);
  assert.doesNotMatch(reference, /^- Dark mode\.$/m, 'COMPONENTS.md no longer lists the dark mode as missing');
  for (const file of ['GUIDELINES.md', 'README.md', 'docs/project-block.md']) assert.ok((await read(file)).includes('data-g2-scheme'), `${file} does not mention the attribute`);
  const changelog = await read('CHANGELOG.md');
  const unreleased = changelog.split(/^## /m).find(section => section.includes('Brief 05 (opt-in dark colour scheme)'));
  assert.ok(unreleased, 'the changelog has a section for brief 05');
  assert.ok(/\*\*Added\*\*/.test(unreleased) && /\*\*Changed\*\*/.test(unreleased), 'the brief 05 section has Added and Changed');
  assert.doesNotMatch(unreleased, /\*\*Breaking\*\*/, 'the dark scheme is not a breaking change');
  for (const name of Object.keys(newTokens)) assert.ok(unreleased.includes(name), `the changelog does not list ${name}`);
  assert.ok(css.split('\n').slice(0, 20).join('\n').includes('data-g2-scheme'), 'the header of gov2.css names the attribute');
  const released = changelog.match(/^## (\d+\.\d+\.\d+) /m)[1];
  assert.equal(css.match(/v(\d+\.\d+\.\d+)/)[1], released, 'the gov2.css header and the newest released CHANGELOG heading name the same version');
});

test('scheme: the baseline file is the release 0.11.0, byte for byte', () => {
  assert.equal(createHash('sha256').update(baseline).digest('hex'), 'a20b44171f0f557e1190fdbb530a84ad8409c145873205e5697a89e864e3b2c5');
  assert.match(baseline.split('\n')[0], /v0\.11\.0/);
});

// ---- Browser: acceptance 1, the computed styles do not change without an opt-in ----
// A fingerprint of every element: all longhand properties except color-scheme (the one property that is meant to change) and the custom properties (the new tokens are meant to appear).
// An element with .g2-ro-sweep (brief 06) is skipped: the 0.11.0 stylesheet has no rule for a class that did not exist, so its style differs by design.
// Its host, its siblings and every other element are still compared, and tests/sweep.test.mjs checks the sweep itself.
const fingerprint = (page, selector = 'html, html *') => page.evaluate(selector => {
  const hash = text => { let h = 2166136261; for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const out = [];
  for (const el of document.querySelectorAll(selector)) {
    if (el.closest('script,style') || el.closest('iframe') || el.matches('.g2-ro-sweep')) continue;
    const read = pseudo => { const s = getComputedStyle(el, pseudo); return [...s].filter(p => p !== 'color-scheme' && !p.startsWith('--')).map(p => `${p}:${s.getPropertyValue(p)}`).join(';'); };
    const label = `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/).join('.') : ''}`;
    const text = read(null) + (el.matches('.g2-ro-dots, .g2-ro-dots *') ? '|' + read('::before') + '|' + read('::after') : '');
    out.push([label, hash(text), text]);
  }
  return out;
}, selector);
const compareFingerprints = (a, b, label) => {
  assert.equal(a.length, b.length, `${label}: the number of elements differs`);
  const differences = [];
  a.forEach(([name, hash, text], i) => {
    if (hash === b[i][1]) return;
    const x = text.split(';'), y = b[i][2].split(';');
    differences.push(`${name}: ${x.filter(p => !y.includes(p)).slice(0, 4).join(' | ')} -> ${y.filter(p => !x.includes(p)).slice(0, 4).join(' | ')}`);
  });
  assert.deepEqual(differences.slice(0, 8), [], `${label}: ${differences.length} of ${a.length} elements differ`);
};
async function openWith(path, { stylesheet, scheme, ...options } = {}) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, ...options });
  await context.route('**/*', route => {
    const url = route.request().url();
    if (!url.startsWith(base)) return route.abort();
    if (stylesheet !== undefined && new URL(url).pathname === '/gov2.css') return route.fulfill({ contentType: 'text/css', body: stylesheet });
    return route.continue();
  });
  const page = await context.newPage();
  await page.goto(base + path, { waitUntil: 'networkidle' });
  if (scheme !== undefined) await setScheme(page, scheme);
  return { page, context };
}
// Keyboard focus and hover states of one element: a fingerprint of the element and its descendants for each state.
async function stateFingerprints(page, selector) {
  const result = {}, scope = `${selector}, ${selector} *`;
  await page.mouse.move(0, 0);
  result.rest = await fingerprint(page, scope);
  const { disabled, offscreen } = await page.locator(selector).evaluate(el => { const r = el.getBoundingClientRect(); return { disabled: !!el.disabled, offscreen: r.bottom + scrollY <= 0 || r.right + scrollX <= 0 }; });
  if (!offscreen) {
    await page.locator(selector).hover({ force: disabled });
    result.hover = await fingerprint(page, scope);
    await page.mouse.move(0, 0);
  }
  if (!disabled) {
    await keyboardFocus(page, selector);
    result.focus = await fingerprint(page, scope);
    if (!offscreen) {
      await page.locator(selector).hover();
      result['focus+hover'] = await fingerprint(page, scope);
      await page.mouse.move(0, 0);
    }
    await page.evaluate(() => document.activeElement.blur());
  }
  return result;
}
// One control for each distinct combination of tag, class, state and place. The same document gives the same marks.
const markRepresentatives = page => page.evaluate(() => {
  const seen = new Set();
  document.querySelectorAll('a[href], button, input, summary, textarea').forEach(el => {
    if (el.closest('iframe') || el.hidden || !el.getClientRects().length) return;
    const key = [el.tagName, el.className, el.getAttribute('aria-current'), el.getAttribute('aria-pressed'), el.getAttribute('aria-invalid'), el.disabled, el.type,
      el.closest('.g2-header, .g2-footer, .g2-notice, .g2-notice-bar, .g2-field-error, .guide-topbar, .guide-demo-dark')?.className].join('|');
    if (!seen.has(key)) { el.setAttribute('data-probe', String(seen.size)); seen.add(key); }
  });
  return [...seen].map((key, i) => `[data-probe="${i}"]`);
});
const fixtureStates = ['#wordmark', '#current', '#nav', '#plain', '#title', '#quiet', '#primary', '#link-button', '#secondary', '#danger', '#disabled', '#chip', '#chip-button', '#chip-current', '#chip-false', '#chip-empty',
  '#input', '#invalid', '#field-input', '#field-bad', '#field-disabled', '#inverse', '#notice-link', '#notice-bar button', '#footer-link'];
// Brief 07: the 0.11.0 stylesheet has no rule for the six new pieces or for <mark>, so they render differently by design (and change the height of their parents).
// Both documents lose them before the comparison; every other element, and the page around them, must still match.
// Brief 08: `select` joins them, because the 0.11.0 stylesheet has no rule for `.g2-input` on a select.
const newPieces = '.g2-skip-link, .g2-breadcrumbs, .g2-pagination, .g2-table-wrap, .g2-table, .g2-summary-list, mark, select';
async function collect(page, path) {
  await page.evaluate(selector => document.querySelectorAll(selector).forEach(el => el.remove()), newPieces);
  // The code blocks of the guide are closed by default: open them, so that their copy buttons are visible and checked.
  if (path === '/docs/') await page.evaluate(() => document.querySelectorAll('details').forEach(d => { d.open = true; }));
  const selectors = path === '/tests/contract.html' ? fixtureStates : await markRepresentatives(page);
  const states = {};
  const rest = await fingerprint(page);
  for (const selector of selectors) states[selector] = await stateFingerprints(page, selector);
  return { rest, states, selectors };
}

for (const path of ['/tests/contract.html', '/docs/examples/directory.html', '/docs/examples/form.html', '/docs/']) {
  test(`scheme: ${path} with no attribute, and with data-g2-scheme="light", computes exactly as in 0.11.0, at rest and in every control state (acceptance 1)`, async () => {
    const old = await openWith(path, { stylesheet: baseline, scheme: null });
    const before = await collect(old.page, path);
    await old.context.close();
    assert.ok(before.selectors.length >= (path === '/tests/contract.html' ? 25 : 6), `${path}: ${before.selectors.length} controls checked in rest, hover, focus and focus plus hover`);
    assert.ok(before.rest.length > 40);
    for (const [label, scheme] of [['no attribute', null], ['light', 'light']]) {
      const now = await openWith(path, { scheme });
      const after = await collect(now.page, path);
      await now.context.close();
      compareFingerprints(before.rest, after.rest, `${path}, ${label}: rest`);
      assert.deepEqual(after.selectors, before.selectors);
      for (const selector of before.selectors) for (const state of Object.keys(before.states[selector])) compareFingerprints(before.states[selector][state], after.states[selector][state], `${path}, ${label}: ${selector} ${state}`);
    }
  });
}

test('scheme: the fingerprint can tell the schemes apart, so acceptance 1 is a real comparison', async () => {
  const old = await openWith('/tests/contract.html', { stylesheet: baseline, scheme: null });
  const dark = await openWith('/tests/contract.html', { scheme: 'dark' });
  const a = await fingerprint(old.page), b = await fingerprint(dark.page);
  await old.context.close(); await dark.context.close();
  assert.ok(a.filter(([, hash], i) => hash !== b[i][1]).length > 30, 'the dark scheme changes the computed style of many elements');
});

// ---- Browser: acceptance 2, the attribute and the media query ----
const tokenValuesIn = page => page.evaluate(names => { const root = getComputedStyle(document.documentElement); return Object.fromEntries(names.map(n => [n, root.getPropertyValue(n).trim()])); }, Object.keys(light));
for (const [emulated, attribute, expected] of [['light', null, 'light'], ['dark', null, 'light'], ['light', 'light', 'light'], ['dark', 'light', 'light'], ['light', 'auto', 'light'], ['dark', 'auto', 'dark'],
  ['light', 'dark', 'dark'], ['dark', 'dark', 'dark'], ['dark', 'night', 'light'], ['dark', 'Dark', 'light'], ['dark', '', 'light']]) {
  test(`scheme: prefers-color-scheme ${emulated} with ${attribute === null ? 'no attribute' : `data-g2-scheme="${attribute}"`} renders the ${expected} scheme (acceptance 2, 3)`, async () => {
    const { page, context } = await openWith('/tests/contract.html', { scheme: attribute, colorScheme: emulated });
    const values = await tokenValuesIn(page);
    assert.deepEqual(values, expected === 'dark' ? dark : light, `every token has its ${expected} value`);
    const state = await page.evaluate(() => ({ colorScheme: getComputedStyle(document.documentElement).colorScheme, body: getComputedStyle(document.body).backgroundColor, media: matchMedia('(prefers-color-scheme: dark)').matches }));
    assert.equal(state.colorScheme, expected, 'color-scheme matches the active scheme');
    assert.equal(state.body, expected === 'dark' ? 'rgb(11, 12, 12)' : 'rgb(255, 255, 255)');
    assert.equal(state.media, emulated === 'dark');
    await context.close();
  });
}

test('scheme: the guide follows prefers-color-scheme, because it sets data-g2-scheme="auto"; the dark block applies inside the media query (acceptance 2)', async () => {
  for (const [emulated, expected] of [['light', 'rgb(255, 255, 255)'], ['dark', 'rgb(11, 12, 12)']]) {
    const { page, context } = await openWith('/docs/', { colorScheme: emulated });
    assert.equal(await page.evaluate(() => getComputedStyle(document.body).backgroundColor), expected, `the guide under ${emulated}`);
    await context.close();
  }
  const { page, context } = await openWith('/tests/contract.html');
  const where = await page.evaluate(() => {
    const layer = [...[...document.styleSheets].find(s => s.href?.endsWith('/gov2.css')).cssRules].find(r => r.constructor.name === 'CSSLayerBlockRule' && r.name === 'gov2.tokens');
    return [...layer.cssRules].map(r => [r.constructor.name, r.conditionText ?? r.selectorText, r.constructor.name === 'CSSMediaRule' ? [...r.cssRules].map(x => x.selectorText) : null]);
  });
  assert.deepEqual(where, [['CSSStyleRule', ':root', null], ['CSSStyleRule', ':root[data-g2-scheme="dark"]', null], ['CSSMediaRule', '(prefers-color-scheme: dark)', [':root[data-g2-scheme="auto"]']]]);
  await context.close();
});

// ---- Browser: acceptance 3, color-scheme and native controls ----
const nativeProbe = async (page, scheme) => {
  await setScheme(page, scheme);
  await page.evaluate(() => {
    const host = document.createElement('div');
    host.id = 'native';
    host.innerHTML = '<select id="n-select"><option>Unu</option></select><textarea id="n-textarea">text</textarea><input id="n-date" type="date"><div id="n-canvas" style="background:Canvas;color:CanvasText"></div><div id="n-field" style="background:Field;color:FieldText"></div><div id="n-button" style="background:ButtonFace;color:ButtonText"></div>';
    document.querySelector('main').prepend(host);
  });
  return page.evaluate(() => Object.fromEntries(['n-select', 'n-textarea', 'n-date', 'n-canvas', 'n-field', 'n-button'].map(id => { const s = getComputedStyle(document.getElementById(id)); return [id, [s.backgroundColor, s.color]]; })));
};
const rgbLuminance = value => luminance(value.match(/[\d.]+/g).slice(0, 3).join(' '));
test('scheme: a native select, textarea, date field and the system colours follow the active scheme (acceptance 3)', async () => {
  const results = {};
  for (const scheme of [null, 'light', 'dark']) {
    const { page, context } = await openWith('/tests/contract.html', { colorScheme: 'light' });
    results[scheme ?? 'none'] = await nativeProbe(page, scheme);
    await context.close();
  }
  console.log('Native controls measured by computed style (background, text), Chrome:', JSON.stringify(results));
  assert.deepEqual(results.none, results.light, 'no attribute computes like light');
  for (const id of ['n-select', 'n-textarea', 'n-date', 'n-canvas', 'n-field']) {
    assert.ok(rgbLuminance(results.light[id][0]) > .8, `${id}: light background`);
    assert.ok(rgbLuminance(results.dark[id][0]) < .1, `${id}: dark background ${results.dark[id][0]}`);
    assert.ok(rgbLuminance(results.dark[id][1]) > .8 && rgbLuminance(results.light[id][1]) < .1, `${id}: text`);
  }
  assert.notEqual(results.light['n-button'][0], results.dark['n-button'][0], 'ButtonFace changes with the scheme');
});

test('scheme: the scrollbar of a native scroll container follows the active scheme (acceptance 3)', async t => {
  // Playwright hides scrollbars in headless Chrome by default. This check starts its own browser with classic scrollbars and reads the pixels of the track and the thumb.
  const own = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || undefined, ignoreDefaultArgs: ['--hide-scrollbars'] });
  try {
    const reader = await own.newPage();
    const colours = async png => reader.evaluate(async data => {
      const img = new Image(); img.src = 'data:image/png;base64,' + data; await img.decode();
      const canvas = document.createElement('canvas'); canvas.width = img.width; canvas.height = img.height;
      const g = canvas.getContext('2d'); g.drawImage(img, 0, 0);
      const pixels = g.getImageData(0, 0, img.width, img.height).data, count = {};
      for (let i = 0; i < pixels.length; i += 4) { const key = `${pixels[i]} ${pixels[i + 1]} ${pixels[i + 2]}`; count[key] = (count[key] || 0) + 1; }
      return Object.entries(count).sort((a, b) => b[1] - a[1]).map(([key]) => key);
    }, png.toString('base64'));
    const measured = {};
    for (const scheme of [null, 'light', 'dark']) {
      const context = await own.newContext({ viewport: { width: 800, height: 600 }, colorScheme: 'light' });
      const page = await context.newPage();
      await page.goto(`${base}/tests/contract.html`, { waitUntil: 'networkidle' });
      await setScheme(page, scheme);
      await page.evaluate(() => { const box = document.createElement('div'); box.id = 'scroller'; box.style.cssText = 'width:200px;height:80px;overflow:scroll'; box.innerHTML = '<div style="width:400px;height:300px">x</div>'; document.querySelector('main').prepend(box); });
      const gutter = await page.evaluate(() => { const el = document.getElementById('scroller'); return el.offsetWidth - el.clientWidth; });
      // macOS draws overlay scrollbars (no gutter) when no mouse is attached. Then there is nothing to read: skip, and check by hand (docs/testing.md).
      if (gutter === 0) { await context.close(); t.skip('overlay scrollbars on this machine: no gutter to measure'); return; }
      const box = await page.locator('#scroller').boundingBox();
      measured[scheme ?? 'none'] = (await colours(await page.screenshot({ clip: { x: box.x + box.width - gutter, y: box.y, width: gutter, height: box.height - gutter } }))).slice(0, 2);
      await context.close();
    }
    console.log('Scrollbar colours (track, thumb) measured from pixels, Chrome:', JSON.stringify(measured));
    assert.deepEqual(measured.none, measured.light, 'no attribute draws the light scrollbar');
    assert.notDeepEqual(measured.dark, measured.light, 'the dark scheme draws another scrollbar');
    const track = value => channels(value[0])[0];
    assert.ok(track(measured.light) > 200 && track(measured.dark) < 80, `track ${measured.light[0]} against ${measured.dark[0]}`);
  } finally { await own.close(); }
});

// ---- Browser: acceptance 4, text contrast on every rendered surface in the dark scheme ----
const openAll = page => page.evaluate(() => document.querySelectorAll('details').forEach(d => { d.open = true; }));
const dark_pages = [{ name: 'fixture', path: '/tests/contract.html?scheme=dark' }, ...pages];
for (const { name, path } of dark_pages) {
  test(`scheme: ${name}: every rendered text pair and field boundary meets the contrast in the dark scheme (acceptance 4, 5)`, async () => {
    const { page, context } = await openWith(path, { scheme: name === 'fixture' ? undefined : 'dark' });
    await openAll(page);
    assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme), 'dark');
    const report = await contrastReport(page);
    console.log(`Dark ${name}: ${report.text} text nodes, ${report.boundaries} field boundaries, lowest ${report.lowest.ratio.toFixed(2)}:1 ("${report.lowest.text}")`);
    assert.ok(report.text > 30, `checked ${report.text} text nodes`);
    assert.deepEqual(report.problems, []);
    await context.close();
  });
}

test('scheme: the guide previews load the real stylesheet and render each scheme; the dark preview meets the contrast (acceptance 4, 10)', async () => {
  const { page, context } = await openWith('/docs/', { colorScheme: 'light' });
  const lightFrame = await (await page.locator('#preview-light').elementHandle()).contentFrame(), darkFrame = await (await page.locator('#preview-dark').elementHandle()).contentFrame();
  for (const [frame, scheme, background] of [[lightFrame, 'light', 'rgb(255, 255, 255)'], [darkFrame, 'dark', 'rgb(11, 12, 12)']]) {
    await frame.waitForLoadState('networkidle');
    assert.equal(await frame.evaluate(() => document.documentElement.dataset.g2Scheme), scheme);
    assert.equal(await frame.evaluate(() => getComputedStyle(document.body).backgroundColor), background);
    assert.deepEqual(await frame.evaluate(() => [...document.styleSheets].filter(s => s.href).map(s => new URL(s.href).pathname)), ['/gov2.css']);
    const report = await contrastReport(frame);
    assert.ok(report.text > 25, `the ${scheme} preview shows ${report.text} text nodes`);
    assert.deepEqual(report.problems, []);
  }
  for (const id of ['preview-light', 'preview-dark']) assert.ok((await page.locator(`#${id}`).getAttribute('title')).length > 10, `${id} has a title`);
  await context.close();
});

// ---- Browser: acceptance 5, 6, 7: boundaries, focus, tones and states, in both schemes ----
const probe = (page, selector, pseudo) => page.locator(selector).first().evaluate((el, pseudo) => {
  const s = getComputedStyle(el, pseudo || null);
  return { color: s.color, background: s.backgroundColor, border: s.borderTopColor, borderLeft: s.borderLeftColor, borderWidth: s.borderTopWidth, shadow: s.boxShadow, outline: s.outlineStyle, outlineColor: s.outlineColor,
    decoration: s.textDecorationThickness, opacity: s.opacity, cursor: s.cursor };
}, pseudo);
const behind = (page, selector) => page.locator(selector).first().evaluate(el => {
  for (let e = el.parentElement; e; e = e.parentElement) { const c = getComputedStyle(e).backgroundColor; if (!/rgba\(.*, 0\)/.test(c) && c !== 'transparent') return c; }
  return getComputedStyle(document.documentElement).backgroundColor;
});
for (const scheme of ['light', 'dark']) {
  test(`scheme: ${scheme}: control boundaries, the selected chip border, the error bar and the focus indicator meet 3:1 (acceptance 5)`, async () => {
    const { page, context } = await openWith('/tests/contract.html', { scheme });
    const page_ = await behind(page, '#input');
    for (const selector of ['#input', '#invalid', '#field-input']) assert.ok(contrast((await probe(page, selector)).border, await behind(page, selector)) >= 3, `${selector} border`);
    const chip = await probe(page, '#chip-current');
    assert.ok(contrast(chip.border, chip.background) >= 3 && contrast(chip.border, page_) >= 3, 'the selected chip border against its own background and against the page');
    assert.ok(contrast((await probe(page, '#invalid')).border, await behind(page, '#invalid')) >= 3, 'the error border');
    const bar = await probe(page, '.g2-field-error');
    assert.equal(bar.borderLeft, (await probe(page, '#invalid')).border, 'the bar and the border of an invalid field have one colour');
    assert.ok(contrast(bar.borderLeft, page_) >= 3, 'the error bar');
    assert.ok(contrast((await probe(page, '.g2-error-msg')).color, page_) >= 4.5, 'the error text');
    // The button edge: the fill against the page for the primary and the danger button, the lower edge for the secondary button.
    for (const selector of ['#primary', '#danger']) assert.ok(contrast((await probe(page, selector)).background, page_) >= 3 || scheme === 'light', `${selector} fill against the page`);
    await page.locator('#secondary').evaluate(el => el.setAttribute('data-edge', ''));
    assert.ok(contrast((await probe(page, '#secondary')).shadow.match(/rgb\([^)]*\)/)[0], page_) >= 3, 'the lower edge of the secondary button');
    for (const selector of ['#primary', '#secondary', '#danger', '#plain', '#title', '#quiet', '#chip', '#chip-current', '#nav', '#wordmark', '#input', '#invalid', '#notice-link', '#footer-link']) {
      await keyboardFocus(page, selector);
      const s = await probe(page, selector), around = await behind(page, selector);
      const yellow = s.outline !== 'none' && s.outlineColor !== 'rgba(0, 0, 0, 0)' ? s.outlineColor : s.background;
      assert.equal(yellow, 'rgb(255, 221, 0)', `${selector}: the focus indicator is the yellow`);
      const header = await page.locator(selector).evaluate(el => !!el.closest('.g2-header'));
      const surface = header ? 'rgb(11, 12, 12)' : around;
      // The indicator is the yellow fill or outline, and the bars of the box shadow (the dark bar below a focused link is invisible on a dark page, and the yellow carries it).
      const colours = [yellow, ...(s.shadow.match(/rgb\([^)]*\)/g) || [])];
      const best = Math.max(...colours.map(c => contrast(c, surface)));
      assert.ok(best >= 3, `${selector}: no focus indicator reaches 3:1 against ${surface} (best ${best.toFixed(2)}:1)`);
      if (scheme === 'dark') assert.ok(contrast(yellow, surface) >= 3, `${selector}: in the dark scheme the yellow itself reaches 3:1 against ${surface}`);
      assert.ok(contrast(s.color, s.background === 'rgba(0, 0, 0, 0)' ? around : s.background) >= 4.5, `${selector}: focus text`);
    }
    await context.close();
  });

  test(`scheme: ${scheme}: each status tone meets 4.5:1 for ink on its background and 3:1 for its line on the page, as rendered (acceptance 6)`, async () => {
    const { page, context } = await openWith('/tests/contract.html', { scheme });
    const tokens = await tokenValuesIn(page);
    const pageColour = `rgb(${tokens['--g2-color-page'].split(' ').join(', ')})`;
    for (const tone of statuses) {
      const tag = await probe(page, tone === 'neutral' ? '.g2-tag:not([data-tone])' : `.g2-tag[data-tone=${tone}]`);
      assert.ok(contrast(tag.color, tag.background) >= 4.5, `${tone} ink on bg: ${contrast(tag.color, tag.background).toFixed(2)}:1`);
      assert.equal(tag.background, `rgb(${tokens[t(`${tone}-bg`)].split(' ').join(', ')})`);
      assert.ok(contrast(`rgb(${tokens[t(`${tone}-line`)].split(' ').join(', ')})`, pageColour) >= 3, `${tone} line on the page`);
    }
    await context.close();
  });

  test(`scheme: ${scheme}: focus, hover plus focus, hover, disabled, selected and error states stay distinguishable (acceptance 7)`, async () => {
    const { page, context } = await openWith('/tests/contract.html', { scheme });
    const focusYellow = 'rgb(255, 221, 0)';
    // Buttons: hover differs from rest; focus and hover plus focus are the yellow with readable text; disabled is dimmed with the not-allowed cursor.
    for (const selector of ['#primary', '#secondary', '#chip', '#title', '#nav']) {
      await page.mouse.move(0, 0);
      const rest = await probe(page, selector);
      await page.locator(selector).hover();
      const hover = await probe(page, selector);
      assert.ok(hover.background !== rest.background || hover.decoration !== rest.decoration, `${selector}: hover looks different from rest`);
      await keyboardFocus(page, selector);
      assert.equal((await probe(page, selector)).background, focusYellow, `${selector}: focus`);
      await page.locator(selector).hover();
      const both = await probe(page, selector);
      assert.equal(both.background, focusYellow, `${selector}: hover plus focus keeps the focus colour`);
      assert.notEqual(both.background, hover.background);
      assert.ok(contrast(both.color, both.background) >= 4.5);
      await page.mouse.move(0, 0);
    }
    const enabled = await probe(page, '#primary'), disabled = await probe(page, '#disabled');
    assert.equal(disabled.opacity, '0.5'); assert.equal(disabled.cursor, 'not-allowed'); assert.equal(enabled.opacity, '1');
    // Chip: selected differs from the others by its border; the border stays under focus and hover.
    const plain = await probe(page, '#chip'), selected = await probe(page, '#chip-current');
    assert.notEqual(selected.border, plain.border);
    await keyboardFocus(page, '#chip-current'); await page.locator('#chip-current').hover();
    const selectedFocus = await probe(page, '#chip-current');
    assert.equal(selectedFocus.border, selected.border, 'the selected border stays under focus and hover');
    assert.equal(selectedFocus.background, focusYellow);
    await page.mouse.move(0, 0);
    // Fields: error differs from normal; disabled differs from enabled in background, border and text; focus adds the yellow outline; the error border stays under hover and focus.
    const normal = await probe(page, '#field-input'), error = await probe(page, '#field-bad'), locked = await probe(page, '#field-disabled');
    assert.notEqual(error.border, normal.border);
    for (const key of ['background', 'border', 'color']) assert.notEqual(locked[key], normal[key], `a disabled field differs from an enabled one: ${key}`);
    assert.equal(locked.cursor, 'not-allowed');
    assert.equal(normal.outline, 'none');
    await keyboardFocus(page, '#field-bad'); await page.locator('#field-bad').hover();
    const errorFocus = await probe(page, '#field-bad');
    assert.equal(errorFocus.outlineColor, focusYellow); assert.equal(errorFocus.outline, 'solid'); assert.equal(errorFocus.border, error.border, 'the error border stays under focus and hover');
    assert.ok(contrast(errorFocus.color, errorFocus.background) >= 4.5, 'the text of a focused field is readable');
    assert.equal(errorFocus.background, (await tokenValuesIn(page))['--g2-color-control-bg'].split(' ').reduce((acc, v, i, all) => i === all.length - 1 ? `rgb(${[...all.slice(0, -1).map(x => x), v].join(', ')})` : acc, ''), 'a focused field keeps the field background');
    await context.close();
  });
}

// ---- Browser: acceptance 8, forced colours ----
// Under forced colours, the browser paints system colours. Chrome picks the system palette from the used color-scheme, so the colour values differ
// (CanvasText is rgb(0, 0, 0) in the light scheme and rgb(255, 255, 255) in the dark scheme). Everything else must be the same.
const withoutColours = (list) => list.map(([name, , text]) => [name, text.split(';').filter(p => !/color|fill|stroke/.test(p.split(':')[0])).join(';')]);
test('scheme: with forced colours, the light and the dark scheme have the same structure and behaviour; only the system palette differs (acceptance 8)', async () => {
  const forced = async scheme => {
    const { page, context } = await openWith(`/tests/contract.html?scheme=${scheme}`, { forcedColors: 'active', colorScheme: 'light' });
    const rest = await fingerprint(page);
    const states = {};
    for (const selector of ['#primary', '#secondary', '#danger', '#chip-current', '#current', '#input', '#invalid', '#field-disabled', '#plain', '#wordmark']) states[selector] = await stateFingerprints(page, selector);
    const report = await contrastReport(page);
    const colour = selector => page.locator(selector).first().evaluate(el => { const s = getComputedStyle(el); return [s.backgroundColor, s.color, s.borderTopWidth, s.borderLeftWidth, s.outlineStyle, s.boxShadow]; });
    const behaviour = {};
    behaviour.current = (await colour('#current')).slice(0, 2).join() !== (await colour('#nav')).slice(0, 2).join();
    behaviour.selectedChip = (await colour('#chip-current')).slice(0, 2).join() !== (await colour('#chip')).slice(0, 2).join();
    behaviour.disabledField = (await colour('#field-disabled'))[1] !== (await colour('#field-input'))[1];
    behaviour.errorBar = (await colour('.g2-field-error'))[3];
    behaviour.shadowRemoved = (await colour('#primary'))[5];
    await keyboardFocus(page, '#primary');
    behaviour.focusOutline = (await colour('#primary'))[4];
    await keyboardFocus(page, '#input');
    behaviour.fieldOutline = (await colour('#input'))[4];
    const palette = await page.evaluate(() => { const s = getComputedStyle(document.body); const probe = document.createElement('i'); probe.style.cssText = 'color:CanvasText;background:Canvas'; document.body.append(probe); const p = getComputedStyle(probe); return [p.backgroundColor, p.color, s.backgroundColor, s.color]; });
    await context.close();
    return { rest, states, report, behaviour, palette };
  };
  const [a, b] = [await forced('light'), await forced('dark')];
  console.log('Forced colours, system palette (Canvas, CanvasText, body background, body text): light', JSON.stringify(a.palette), 'dark', JSON.stringify(b.palette));
  assert.deepEqual(withoutColours(a.rest), withoutColours(b.rest), 'forced colours: every non-colour property of every element is the same');
  for (const selector of Object.keys(a.states)) for (const state of Object.keys(a.states[selector])) assert.deepEqual(withoutColours(a.states[selector][state]), withoutColours(b.states[selector][state]), `forced colours: ${selector} ${state}`);
  assert.deepEqual(a.behaviour, b.behaviour, 'the same behaviours hold in both schemes');
  assert.deepEqual(a.behaviour, { current: true, selectedChip: true, disabledField: true, errorBar: '5px', shadowRemoved: 'none', focusOutline: 'solid', fieldOutline: 'solid' });
  for (const result of [a, b]) assert.deepEqual(result.report.problems, [], 'text stays readable under forced colours');
});

// ---- Browser: acceptance 9, every var() resolves in every scheme ----
test('scheme: every var() of gov2.css, the guide stylesheet and the example stylesheet resolves in the light, the dark and the auto scheme (acceptance 9)', async () => {
  const sources = [css, await read('docs/guide.css'), await read('docs/examples/examples.css')];
  const names = [...new Set(sources.flatMap(text => [...noComments(text).matchAll(/var\((--g2-[\w-]+)/g)].map(m => m[1])))];
  assert.ok(names.length > 40, `${names.length} tokens are read`);
  for (const [scheme, emulated] of [['light', 'light'], ['dark', 'light'], ['auto', 'dark'], [null, 'dark']]) {
    const { page, context } = await openWith('/tests/contract.html', { scheme, colorScheme: emulated });
    const values = await page.evaluate(names => { const root = getComputedStyle(document.documentElement); return names.filter(n => root.getPropertyValue(n).trim() === ''); }, names);
    assert.deepEqual(values, [], `${scheme}: tokens with no value`);
    await context.close();
  }
});

// ---- Browser: acceptance 11, layout and screenshots in both schemes ----
for (const { name, path } of pages) {
  for (const scheme of ['light', 'dark']) {
    for (const width of [1280, 320]) {
      test(`scheme: ${name} in the ${scheme} scheme at ${width}px has no horizontal overflow${artifacts ? ' and is saved as a screenshot' : ''} (acceptance 11)`, async () => {
        const { page, context } = await openWith(path, { scheme: null, viewport: { width, height: 900 } });
        await setScheme(page, scheme);
        const sizes = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, client: document.documentElement.clientWidth, height: document.documentElement.scrollHeight }));
        assert.ok(sizes.width <= sizes.client, `${name} ${scheme} ${width}px: scrollWidth ${sizes.width} is wider than ${sizes.client}`);
        if (artifacts) {
          // A tall page is saved in chunks of 3000px. A full-page capture of a very tall page can repeat content, so each chunk is checked against its size.
          await mkdir(artifacts, { recursive: true });
          for (let top = 0, n = 1; top < sizes.height; top += 3000, n++) {
            const height = Math.min(3000, sizes.height - top);
            const png = await page.screenshot({ fullPage: true, clip: { x: 0, y: top, width, height } });
            assert.equal(png.readUInt32BE(16), width, 'the capture has the width of the viewport');
            assert.equal(png.readUInt32BE(20), height, 'the capture has the height of its chunk');
            await writeFile(`${artifacts}/scheme-${name}-${scheme}-${width}-${String(n).padStart(2, '0')}.png`, png);
          }
          console.log(`Screenshots: ${name} ${scheme} ${width}px, scrollHeight ${sizes.height}px`);
        }
        await context.close();
      });
    }
  }
}
