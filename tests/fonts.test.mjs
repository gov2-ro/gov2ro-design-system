// Brief 03: local fonts and file delivery. Static checks read the shipped files. Browser checks use the shared server, fixture and runner.
// Core-only mode loads gov2.css alone. Standard mode also loads fonts.css, which uses the files in fonts/.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, mkdtemp, rm, mkdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { useBrowser, browser, base, read, root, css, reference, migration, standaloneSite } from './helpers.mjs';
import { readWoff2, codePoints, axes, names, parseUnicodeRange, inRanges } from './woff2.mjs';

useBrowser();

const fontsCss = await read('fonts.css');
const fontsReadme = await read('fonts/README.md');
const rootReadme = await read('README.md');
const noComments = text => text.replace(/\/\*[\s\S]*?\*\//g, '');
const fileBytes = path => readFile(new URL(path, root));
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const romanian = 'ĂăÂâÎîȘșȚț';
const sampleWords = 'Ăă Ââ Îî Șș Țț';
const examples = ['/docs/examples/directory.html', '/docs/examples/form.html'];

// The font faces of fonts.css, as { family, style, weight, display, src, file, format, ranges }.
const faces = [...noComments(fontsCss).matchAll(/@font-face\{([^}]*)\}/g)].map(match => {
  const declarations = Object.fromEntries(match[1].split(';').filter(Boolean).map(d => [d.slice(0, d.indexOf(':')).trim(), d.slice(d.indexOf(':') + 1).trim()]));
  return { family: declarations['font-family'].replace(/"/g, ''), style: declarations['font-style'], weight: declarations['font-weight'], display: declarations['font-display'],
    src: declarations.src, file: declarations.src.match(/url\("([^"]+)"\)/)?.[1], format: declarations.src.match(/format\("([^"]+)"\)/)?.[1],
    ranges: parseUnicodeRange(declarations['unicode-range']) };
});
const shipped = (await readdir(new URL('fonts/', root))).filter(name => name.endsWith('.woff2')).sort();
const readmeRows = Object.fromEntries([...fontsReadme.matchAll(/^\| `([\w.-]+\.woff2)` \|[^|]*\|[^|]*\| ([\d,]+) \| `([0-9a-f]{64})` \|/gm)].map(m => [m[1], { bytes: Number(m[2].replace(/,/g, '')), sha: m[3] }]));

// Opens a page, records every request (including the ones the check aborts) and lets the check block local font files.
async function trace(path, run, { blockFonts = false, width = 1280, height = 900, ...options } = {}) {
  const context = await browser.newContext({ viewport: { width, height }, ...options });
  const requests = [], responses = new Map();
  context.on('request', request => requests.push({ url: request.url(), type: request.resourceType() }));
  context.on('response', response => responses.set(response.url(), response));
  await context.route('**/*', route => {
    const url = route.request().url();
    if (!url.startsWith(base) || (blockFonts && new URL(url).pathname.startsWith('/fonts/'))) return route.abort();
    return route.continue();
  });
  const page = await context.newPage();
  try {
    const response = await page.goto(base + path, { waitUntil: 'networkidle' });
    assert.equal(response.status(), 200, `Page unavailable: ${path}`);
    await page.evaluate(async () => { await document.fonts.ready; });
    const paths = type => requests.filter(r => r.type === type).map(r => r.url.startsWith(base) ? r.url.slice(base.length) : r.url);
    await run(page, context, { requests, responses, fonts: paths('font'), external: requests.filter(r => !r.url.startsWith(base)).map(r => r.url) });
  } finally { await context.close(); }
}
// The fonts that Chrome painted a node with: [{ familyName, isCustomFont, glyphCount }].
async function platformFonts(context, page, selector) {
  const cdp = await context.newCDPSession(page);
  await cdp.send('DOM.enable');
  await cdp.send('CSS.enable');
  const { root: document } = await cdp.send('DOM.getDocument');
  const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: document.nodeId, selector });
  return (await cdp.send('CSS.getPlatformFontsForNode', { nodeId })).fonts;
}
const glyphs = fonts => fonts.reduce((sum, font) => sum + font.glyphCount, 0);
const overflow = page => page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));

// ---- Static: core CSS and fonts.css ----
test('fonts: gov2.css makes no remote request and keeps the family tokens with system fallbacks (acceptance 1)', () => {
  const code = noComments(css);
  assert.doesNotMatch(code, /@import/, 'gov2.css must not import a stylesheet');
  assert.doesNotMatch(code, /https?:\/\/|\/\/[\w.-]+\.\w{2,}\//, 'gov2.css must not name a remote URL outside comments');
  assert.doesNotMatch(code, /@font-face/, 'font faces belong in fonts.css');
  assert.match(code, /--g2-font-sans:\s*"Inter", -apple-system, "Segoe UI", Arial, sans-serif;/);
  assert.match(code, /--g2-font-mono:\s*"Fragment Mono", ui-monospace, SFMono-Regular, monospace;/);
  assert.doesNotMatch(css, /fonts\.googleapis|fonts\.gstatic/);
});

test('fonts: fonts.css declares font faces only, with swap and relative URLs, and no layer, rule or token', () => {
  const code = noComments(fontsCss).trim();
  assert.equal(code.split('\n').length, faces.length, 'one @font-face rule on each line, and nothing else');
  assert.ok(code.split('\n').every(line => line.startsWith('@font-face{') && line.endsWith('}')));
  assert.doesNotMatch(code, /@layer|@import|--g2-|!important|[{;]\s*(color|font-size|margin)\s*:/, 'fonts.css must not set a layer, a token or a type rule');
  assert.deepEqual(faces.map(f => `${f.family} ${f.weight}`), ['Inter 100 900', 'Inter 100 900', 'Fragment Mono 400', 'Fragment Mono 400']);
  for (const face of faces) {
    assert.equal(face.display, 'swap', `${face.file}: font-display`);
    assert.equal(face.style, 'normal');
    assert.equal(face.format, 'woff2');
    assert.match(face.file, /^fonts\/[a-z0-9-]+\.woff2$/, `${face.file} must be a relative URL under fonts/`);
    assert.doesNotMatch(face.src, /url\("(\/|\.\.|[a-z]+:)/i);
  }
  assert.deepEqual(faces.map(f => f.file.slice(6)).sort(), shipped, 'every shipped font file is declared, and every declared file is shipped');
  assert.equal(css.includes('fonts.css'), true, 'the header of gov2.css points to fonts.css');
});

test('fonts: fonts/README.md records every shipped file with its exact size and SHA-256, and the licence notices travel with the files (acceptance 7)', async () => {
  assert.deepEqual(Object.keys(readmeRows).sort(), shipped, 'the README table lists exactly the shipped font files');
  for (const file of shipped) {
    const bytes = await fileBytes(`fonts/${file}`);
    assert.equal(readmeRows[file].bytes, bytes.length, `${file}: size`);
    assert.equal(readmeRows[file].sha, sha256(bytes), `${file}: SHA-256`);
    const font = readWoff2(bytes), version = names(font)[5];
    assert.ok(fontsReadme.includes(version), `fonts/README.md does not record the font version "${version}" of ${file}`);
  }
  for (const [file, holder] of [['LICENSE-inter.txt', 'The Inter Project Authors'], ['LICENSE-fragment-mono.txt', 'The Fragment-Mono Project Authors']]) {
    const text = await read(`fonts/${file}`);
    assert.match(text, /SIL OPEN FONT LICENSE Version 1\.1/);
    assert.ok(text.includes(holder), `${file} names ${holder}`);
    assert.ok(fontsReadme.includes(`](${file})`) || fontsReadme.includes(`\`${file}\``), `fonts/README.md does not document the path of ${file}`);
    assert.ok(fontsReadme.includes(sha256(Buffer.from(text))), `fonts/README.md does not record the SHA-256 of ${file}`);
  }
  for (const needle of ['@fontsource-variable/inter', '@fontsource/fragment-mono', '5.2.8', 'OFL-1.1', 'sha512-', 'npm pack']) assert.ok(fontsReadme.includes(needle), `fonts/README.md does not record ${needle}`);
});

test('fonts: the shipped files cover the Romanian letters, in the file that fonts.css chooses for each code point (acceptance 3)', async () => {
  for (const family of ['Inter', 'Fragment Mono']) {
    const own = faces.filter(f => f.family === family), cmaps = new Map();
    for (const face of own) cmaps.set(face, codePoints(readWoff2(await fileBytes(`fonts/${face.file.slice(6)}`))));
    // Where two ranges overlap, the browser uses the face that is declared last.
    const chosen = codePoint => own.filter(f => inRanges(f.ranges, codePoint)).at(-1);
    for (const letter of [...romanian, ...'ABCXYZabcxyz0123456789.,:;-']) {
      const codePoint = letter.codePointAt(0), face = chosen(codePoint);
      assert.ok(face, `${family}: no @font-face covers ${letter} (U+${codePoint.toString(16).toUpperCase()})`);
      assert.ok(cmaps.get(face).has(codePoint), `${family}: ${face.file} does not contain ${letter} (U+${codePoint.toString(16).toUpperCase()})`);
    }
  }
  // The comma-below letters are required. The cedilla forms (ş, ţ) are old encodings: Inter has them; the check records the Fragment Mono limit.
  const inter = new Set(), mono = new Set();
  for (const face of faces) for (const codePoint of codePoints(readWoff2(await fileBytes(`fonts/${face.file.slice(6)}`)))) (face.family === 'Inter' ? inter : mono).add(codePoint);
  for (const letter of 'ŞşŢţ') assert.ok(inter.has(letter.codePointAt(0)), `Inter has ${letter}`);
  assert.deepEqual([...'ŞşŢţ'].filter(l => !mono.has(l.codePointAt(0))), ['Ţ', 'ţ'], 'Fragment Mono lacks the cedilla t only; README documents it');
  assert.match(fontsReadme, /Ţ|U\+0162/, 'fonts/README.md documents the Fragment Mono gap');
});

test('fonts: Inter is a variable font that covers the used weights 400 to 700; Fragment Mono is the one used weight, 400', async () => {
  for (const face of faces.filter(f => f.family === 'Inter')) {
    const wght = axes(readWoff2(await fileBytes(`fonts/${face.file.slice(6)}`))).find(axis => axis.tag === 'wght');
    assert.ok(wght && wght.min <= 400 && wght.max >= 700, `${face.file} must have a wght axis from 400 to 700 or wider`);
    assert.equal(face.weight, `${wght.min} ${wght.max}`, `${face.file}: the declared range equals the axis range`);
  }
  for (const face of faces.filter(f => f.family === 'Fragment Mono')) assert.deepEqual(axes(readWoff2(await fileBytes(`fonts/${face.file.slice(6)}`))), []);
  // The weights the API uses: every font-weight in gov2.css must be inside the shipped ranges.
  const used = new Set([...noComments(css).matchAll(/font-weight:\s*(\d+)/g), ...noComments(css).matchAll(/font:\s*(\d{3})\s/g)].map(m => Number(m[1])));
  assert.deepEqual([...used].sort(), [500, 600, 700], 'gov2.css names these weights besides the normal 400; README must cover them');
});

test('fonts: the documentation says that fonts.css and fonts/ are the standard installation step, and that the removed import is a breaking change', async () => {
  const changelog = await read('CHANGELOG.md'), projectBlock = await read('docs/project-block.md'), guide = await read('docs/index.html');
  const unreleased = changelog.split(/^## /m).find(section => section.includes('Brief 03 (fonts and file delivery)'));
  assert.ok(unreleased, 'the changelog has a section for brief 03');
  assert.match(unreleased, /\*\*Breaking\*\*[\s\S]*Google Fonts[\s\S]*fonts\.css/, 'the changelog lists the removed import under Breaking, with the fix');
  // The migration document describes the old import on purpose ("0.8.0 to 0.9.1 still imports them"), so only the other patterns apply to it.
  const stale = /loads Inter and Fragment Mono from Google Fonts|încă importă|fonts\.css[^.\n]*\boptional\b|\boptional\b[^.\n]*fonts\.css|fonts\.css[^.\n]*opțional|opțional[^.\n]*fonts\.css/i;
  for (const [name, text] of [['README.md', rootReadme], ['COMPONENTS.md', reference], ['docs/index.html', guide], ['docs/project-block.md', projectBlock], ['docs/migration-from-0.6.0.md', migration]]) {
    assert.ok(text.includes('fonts.css'), `${name} does not mention fonts.css`);
    assert.doesNotMatch(text, stale, `${name} still describes the old import or calls the fonts optional`);
    if (name !== 'docs/migration-from-0.6.0.md') assert.doesNotMatch(text, /still imports/i, `${name} says that the stylesheet imports fonts`);
  }
  assert.ok(reference.includes('fonts/README.md'));
});

// ---- Browser: network, rendering, fallback ----
test('fonts: a core-only page makes no font request and no external request, and renders offline (acceptance 1)', () => trace('/tests/contract.html', async (page, context, { requests, fonts, external }) => {
  assert.deepEqual(fonts, [], 'no font request');
  assert.deepEqual(external, [], 'no external request');
  assert.deepEqual(requests.map(r => r.url.slice(base.length)).filter(url => !url.startsWith('/tests/contract.html')), ['/gov2.css'], 'the page requests its own document and gov2.css only');
  assert.equal(await page.evaluate(() => document.fonts.size), 0, 'no @font-face exists in core-only mode');
  assert.match(await page.evaluate(() => getComputedStyle(document.body).fontFamily), /^Inter, /);
  assert.ok((await page.locator('h1').boundingBox()).height > 0);
}));

test('fonts: the minimal page of the migration document (gov2.css alone) makes no font request either', async () => {
  // The minimal page of docs/migration-from-0.6.0.md links gov2.css and nothing else.
  const files = standaloneSite(), requests = [];
  const context = await browser.newContext();
  context.on('request', request => requests.push({ url: request.url(), type: request.resourceType() }));
  await context.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.origin !== base) return route.abort();
    if (!(url.pathname in files)) return route.continue();
    return route.fulfill({ contentType: url.pathname.endsWith('.css') ? 'text/css' : 'text/html', body: files[url.pathname] });
  });
  try {
    const page = await context.newPage();
    await page.goto(`${base}/index.html`, { waitUntil: 'networkidle' });
    assert.deepEqual(requests.filter(r => r.type === 'font' || !r.url.startsWith(base)), []);
  } finally { await context.close(); }
});

for (const path of ['/tests/contract.html?fonts=1', ...examples, '/docs/index.html']) {
  test(`fonts: ${path} requests only documented local font files, no external file (acceptance 2)`, () => trace(path, async (page, context, { fonts, external, responses }) => {
    assert.deepEqual(external, [], 'no external request');
    const names = fonts.map(url => url.split('/').pop());
    assert.ok(names.length > 0 && new Set(names).size === names.length, `each font file is requested once: ${names}`);
    for (const url of fonts) {
      assert.match(url, /^\/fonts\/[\w-]+\.woff2$/);
      assert.ok(shipped.includes(url.split('/').pop()), `${url} is not a documented font file`);
      assert.equal(responses.get(base + url).status(), 200);
      assert.ok(readmeRows[url.split('/').pop()], `${url} is not in fonts/README.md`);
    }
    // These pages have Romanian text and Fragment Mono text, so both Inter files and the Fragment Mono latin file are needed.
    for (const file of ['inter-latin-wght-normal.woff2', 'inter-latin-ext-wght-normal.woff2', 'fragment-mono-latin-400-normal.woff2']) assert.ok(names.includes(file), `${path} did not request ${file}`);
    const state = await page.evaluate(() => [...document.fonts].map(f => ({ family: f.family, status: f.status, display: f.display })));
    assert.equal(state.length, 4);
    assert.ok(state.every(f => f.display === 'swap'));
    assert.equal(state.filter(f => f.status === 'loaded').length, names.length, 'every requested file loaded');
    assert.ok(state.every(f => f.status === 'loaded' || f.status === 'unloaded'), 'no face failed');
    const bytes = await Promise.all(fonts.map(async url => (await responses.get(base + url).body()).length));
    for (const [i, url] of fonts.entries()) assert.equal(bytes[i], readmeRows[url.split('/').pop()].bytes, `${url}: size served equals the recorded size`);
  }));
}

test('fonts: Romanian samples render in Inter and Fragment Mono when the files are available (acceptance 3)', async t => {
  for (const [path, sans, mono] of [['/tests/contract.html?fonts=1', '#ro-sans', '#ro-mono'], ['/docs/index.html', '#ro-sample-sans', '#ro-sample-mono']]) {
    await trace(path, async (page, context) => {
      for (const [selector, family] of [[sans, 'Inter'], [mono, 'Fragment Mono']]) {
        const used = await platformFonts(context, page, selector), text = (await page.locator(selector).textContent());
        assert.ok(used.every(f => f.isCustomFont && f.familyName === family), `${path} ${selector} must render only in the shipped ${family}: ${JSON.stringify(used)}`);
        assert.equal(glyphs(used), [...text].length, `${path} ${selector}: every glyph, including ${sampleWords}, comes from ${family}`);
        assert.ok(text.includes(sampleWords));
      }
      t.diagnostic(`${path}: ${await platformFonts(context, page, sans).then(f => JSON.stringify(f))}`);
    });
  }
});

test('fonts: the variable Inter file renders the weights 400, 500, 600 and 700 as four distinct widths, not a synthetic bold', () => trace('/tests/contract.html?fonts=1', async page => {
  const widths = await page.evaluate(async sampleText => {
    const holder = document.createElement('div');
    holder.style.cssText = 'position:absolute;left:0;top:0;white-space:nowrap;font-family:var(--g2-font-sans);font-size:24px';
    holder.innerHTML = [400, 500, 600, 700].map(w => `<span style="font-weight:${w}">${sampleText}</span><br>`).join('');
    document.body.append(holder);
    await Promise.all([400, 500, 600, 700].map(w => document.fonts.load(`${w} 24px Inter`, sampleText)));
    return [...holder.querySelectorAll('span')].map(span => span.getBoundingClientRect().width);
  }, 'Instituții publice din România ' + sampleWords);
  assert.ok(widths[0] < widths[1] && widths[1] < widths[2] && widths[2] < widths[3], `widths grow with the weight: ${widths}`);
}));

test('fonts: with the font files blocked, the stack falls back; controls stay readable and nothing overflows (acceptance 4)', async t => {
  for (const [path, width] of [['/tests/contract.html?fonts=1', 1280], ['/tests/contract.html?fonts=1', 390], ['/tests/contract.html?fonts=1', 320], [examples[0], 320], [examples[1], 320], [examples[0], 1280]]) {
    await trace(path, async (page, context, { fonts }) => {
      assert.ok(fonts.length >= 3, 'the page requested its font files, and the check blocked them');
      const state = await page.evaluate(() => [...document.fonts].map(f => f.status));
      assert.ok(state.includes('error') && !state.includes('loaded'), `font faces failed: ${state}`);
      assert.deepEqual(await overflow(page).then(o => o.scroll <= o.client), true, `${path} at ${width}px overflows horizontally: ${JSON.stringify(await overflow(page))}`);
      const monoSelector = path.includes('contract') ? '#ro-mono' : '.g2-mono';
      const mono = await platformFonts(context, page, monoSelector);
      assert.ok(mono.every(f => !f.isCustomFont && f.familyName !== 'Fragment Mono'), `${monoSelector} falls back from Fragment Mono: ${JSON.stringify(mono)}`);
      assert.ok(glyphs(mono) > 0, 'the fallback renders the text');
      for (const selector of ['h1', '.g2-btn:not(:disabled)', 'input:not(:disabled)']) {
        const target = page.locator(selector).first(), box = await target.boundingBox();
        assert.ok(box && box.width > 0 && box.height >= 24 && box.x >= -1 && box.x + box.width <= width + 1, `${path} ${selector} is visible and inside the window at ${width}px: ${JSON.stringify(box)}`);
        const style = await target.evaluate(el => { const s = getComputedStyle(el); return { visibility: s.visibility, fontSize: parseFloat(s.fontSize) }; });
        assert.equal(style.visibility, 'visible');
        assert.ok(style.fontSize >= 14, `${selector} keeps a readable size`);
      }
      assert.ok((await page.locator('main').innerText()).trim().length > 100, 'text is present');
    }, { blockFonts: true, width });
  }
  t.diagnostic('blocked-font checks passed at 1280, 390 and 320px on the fixture and at 320 and 1280px on the example pages');
});

test('fonts: a machine without Inter falls back to the system stack: the stack of gov2.css without its first family renders in other fonts, with no overflow', async t => {
  const stack = css.match(/--g2-font-sans:\s*([^;]+);/)[1], fallback = stack.replace(/^"Inter",\s*/, '');
  assert.notEqual(fallback, stack);
  // Chrome falls back to an installed Inter when the web font is blocked, so a blocked-file check cannot prove the stack on a machine that has Inter.
  // Removing the first family from the stack is the same list the browser walks on a machine without Inter.
  const widths = {};
  for (const mode of ['inter', 'fallback']) {
    for (const [path, width] of [['/tests/contract.html?fonts=1', 1280], ['/tests/contract.html?fonts=1', 320], [examples[0], 320], [examples[1], 320], [examples[1], 1280]]) {
      await trace(path, async (page, context) => {
        if (mode === 'fallback') await page.addStyleTag({ content: `:root{--g2-font-sans:${fallback}}` });
        const used = await platformFonts(context, page, 'h1');
        if (mode === 'fallback') assert.ok(used.length > 0 && used.every(f => f.familyName !== 'Inter' && !f.isCustomFont), `h1 renders in the fallback: ${JSON.stringify(used)}`);
        else assert.ok(used.some(f => f.familyName === 'Inter'), 'baseline: h1 renders in Inter');
        const o = await overflow(page);
        assert.ok(o.scroll <= o.client, `${path} at ${width}px overflows with the ${mode} stack: ${JSON.stringify(o)}`);
        widths[`${mode} ${path} ${width}`] = await page.locator('h1').evaluate(el => { const r = document.createRange(); r.selectNodeContents(el); return Math.round(r.getBoundingClientRect().width * 10) / 10; });
        assert.ok(await page.locator('.g2-btn').first().isVisible());
      }, { width });
    }
  }
  t.diagnostic(`h1 text widths (px): ${JSON.stringify(widths)}`);
});

// ---- Subpath, CSP and installation ----
// The documented install set, read from README.md so that the procedure and the check cannot drift apart.
const installBlock = rootReadme.match(/<!-- install -->\s*```sh\n([\s\S]*?)```/)?.[1] || '';
const installCommands = installBlock.split('\n').filter(line => line.trim() && !line.trim().startsWith('#') && !/^[A-Z]+=/.test(line.trim()));
const installPaths = installCommands.join('\n').match(/archive "\$TAG" ([^|]+?) \|/)?.[1].split(/\s+/) || [];

// Serves the installed files below a URL prefix. Everything else is refused, so a missing file cannot be hidden by the repository server.
async function servedBelow(prefix, entry, html, run, { csp } = {}) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const requests = [], messages = [], files = new Map();
  context.on('request', request => requests.push({ url: new URL(request.url()).pathname, type: request.resourceType() }));
  for (const path of installPaths) {
    const names = path.includes('.') ? [path] : (await readdir(new URL(`${path}/`, root))).map(file => `${path}/${file}`);
    for (const name of names) files.set(name, await fileBytes(name));
  }
  await context.route('**/*', route => {
    const url = new URL(route.request().url()), headers = csp ? { 'content-security-policy': csp } : {};
    if (url.origin !== base) return route.abort();
    if (url.pathname === entry) return route.fulfill({ contentType: 'text/html', headers, body: html });
    const name = url.pathname.startsWith(prefix) ? url.pathname.slice(prefix.length) : null;
    if (files.has(name)) return route.fulfill({ contentType: name.endsWith('.css') ? 'text/css' : name.endsWith('.woff2') ? 'font/woff2' : 'text/plain', headers, body: files.get(name) });
    return route.fulfill({ status: 404, body: 'not found' });
  });
  const page = await context.newPage();
  page.on('console', message => messages.push(message.text()));
  try {
    await page.goto(base + entry, { waitUntil: 'networkidle' });
    await page.evaluate(async () => { await document.fonts.ready; });
    await run(page, context, { requests, messages });
  } finally { await context.close(); }
}
const pageWith = href => `<!doctype html><html lang="ro"><head><meta charset="utf-8"><title>Test</title><link rel="stylesheet" href="${href}gov2.css"><link rel="stylesheet" href="${href}fonts.css"></head>` +
  `<body><main><h1 class="g2-heading-page">Școală țară România</h1><p class="g2-mono">Ăă Ââ Îî Șș Țț</p></main></body></html>`;

test('fonts: the documented install set is gov2.css, fonts.css and fonts/, and nothing outside it is needed', () => {
  assert.deepEqual(installPaths, ['gov2.css', 'fonts.css', 'fonts'], 'the procedure in README.md copies the three paths');
  const referenced = new Set([...noComments(fontsCss).matchAll(/url\("([^"]+)"\)/g)].map(m => m[1].split('/')[0]));
  assert.deepEqual([...referenced], ['fonts'], 'fonts.css reads only the fonts/ folder');
});

// The page links the stylesheets with an absolute or a relative path. The font URLs inside fonts.css are relative to fonts.css in every case.
const deployments = [
  ['the site root', '/index.html', '/', '/'],
  ['a subpath, linked by an absolute path', '/projects/2026/example/index.html', '/projects/2026/example/assets/gov2/', '/projects/2026/example/assets/gov2/'],
  ['a subpath, linked by a relative path', '/a/b/c/page.html', 'd/ds-v0.0.0/', '/a/b/c/d/ds-v0.0.0/'],
  ['a subpath, linked by a path with ../', '/a/b/c/x/page.html', '../../vendor/gov2/', '/a/b/vendor/gov2/'],
];
for (const [name, entry, href, prefix] of deployments) {
  test(`fonts: relative font URLs work when the stylesheet is served from ${name} (acceptance 5)`, () => servedBelow(prefix, entry, pageWith(href), async (page, context, { requests }) => {
    const fonts = requests.filter(r => r.type === 'font').map(r => r.url);
    assert.ok(fonts.length >= 3, `the page requested its fonts: ${fonts}`);
    for (const url of fonts) assert.ok(url.startsWith(`${prefix}fonts/`) && shipped.includes(url.split('/').pop()), `${url} is below ${prefix}fonts/`);
    const state = await page.evaluate(() => [...document.fonts].map(f => f.status));
    assert.ok(state.includes('loaded') && !state.includes('error'), `fonts loaded: ${state}`);
    const used = await platformFonts(context, page, 'h1');
    assert.ok(used.every(f => f.isCustomFont && f.familyName === 'Inter'), `h1 uses the shipped Inter: ${JSON.stringify(used)}`);
  }));
}

test('fonts: the documented CSP, font-src \'self\', lets the fonts load; core alone needs no font-src', async () => {
  const prefix = '/assets/gov2/', entry = '/assets/index.html', violations = messages => messages.filter(m => /Content Security Policy/i.test(m));
  await servedBelow(prefix, entry, pageWith(prefix), async (page, context, { requests, messages }) => {
    assert.ok(requests.filter(r => r.type === 'font').length >= 3);
    assert.deepEqual(violations(messages), [], 'no CSP violation with style-src \'self\' and font-src \'self\'');
    assert.ok((await page.evaluate(() => [...document.fonts].map(f => f.status))).includes('loaded'));
  }, { csp: "default-src 'none'; style-src 'self'; font-src 'self'" });
  // Without font-src, default-src 'none' refuses the fonts. The requirement in the documentation is real, and the page stays readable.
  await servedBelow(prefix, entry, pageWith(prefix), async (page, context, { messages }) => {
    assert.ok(violations(messages).some(m => /font/i.test(m)), `the browser reports a font CSP violation: ${messages}`);
    assert.ok(!(await page.evaluate(() => [...document.fonts].map(f => f.status))).includes('loaded'));
    assert.ok((await page.locator('h1').boundingBox()).height > 0);
  }, { csp: "default-src 'none'; style-src 'self'" });
  // A core-only page needs no font-src.
  const coreOnly = `<!doctype html><html lang="ro"><head><meta charset="utf-8"><title>Test</title><link rel="stylesheet" href="${prefix}gov2.css"></head><body><h1>Școală țară</h1></body></html>`;
  await servedBelow(prefix, entry, coreOnly, async (page, context, { messages, requests }) => {
    assert.deepEqual(violations(messages), []);
    assert.deepEqual(requests.filter(r => r.type === 'font'), []);
  }, { csp: "default-src 'none'; style-src 'self'" });
});

test('fonts: the documented exact-tag procedure copies all required files from a tag (acceptance 6)', async t => {
  assert.ok(installCommands.length >= 2, 'the README has a runnable install block');
  const work = await mkdtemp(join(tmpdir(), 'gov2-install-'));
  try {
    const repo = join(work, 'ds'), project = join(work, 'project');
    await mkdir(repo); await mkdir(project);
    const git = (...args) => execFileSync('git', ['-c', 'user.name=test', '-c', 'user.email=test@example.invalid', '-c', 'commit.gpgsign=false', '-c', 'tag.gpgsign=false', '-C', repo, ...args], { encoding: 'utf8' });
    // A throwaway repository with the files of this working tree and a tag, so the check does not depend on the real tags or on the commit state.
    git('init', '-q');
    execFileSync('cp', ['-R', ...['gov2.css', 'fonts.css', 'fonts', 'README.md', 'COMPONENTS.md'].map(p => fileURLToPath(new URL(p, root))), repo]);
    git('add', '-A'); git('commit', '-q', '-m', 'snapshot'); git('tag', 'v0.0.0-check');
    execFileSync('sh', ['-c', installCommands.join('\n')], { cwd: project, env: { ...process.env, DS: repo, TAG: 'v0.0.0-check' }, encoding: 'utf8' });
    const copied = ['gov2.css', 'fonts.css', ...shipped.map(f => `fonts/${f}`), 'fonts/README.md', 'fonts/LICENSE-inter.txt', 'fonts/LICENSE-fragment-mono.txt'];
    for (const file of copied) {
      const target = await readFile(join(project, 'assets/gov2', file)).catch(() => null);
      assert.ok(target, `the procedure did not copy ${file}`);
      assert.equal(sha256(target), sha256(await fileBytes(file)), `${file} is copied unchanged`);
    }
    t.diagnostic(`copied ${copied.length} files from a tag: ${copied.join(', ')}`);
  } finally { await rm(work, { recursive: true, force: true }); }
});
