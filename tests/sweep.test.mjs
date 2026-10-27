// Brief 06: the tricolour title sweep, .g2-ro-sweep (ADR 0010).
// Static checks read gov2.css, the documents and the guide. Browser checks use tests/contract.html (two hosts: a .g2-wordmark link and a title heading, both in a .g2-header) and the guide.
// The band is measured from pixels: a test pauses the CSS animation at a known time, takes a screenshot of the title and counts the pixels of each tricolour colour.
// "Plain" means the same element with the class removed: a check compares the pixels of the sweep with the pixels of ordinary text.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { useBrowser, browser, base, read, css, reference, artifacts, tokenBlocks, contrast, keyboardFocus, styles, contrastReport } from './helpers.mjs';

useBrowser();

const guideHtml = await read('docs/index.html');
const guidelines = await read('GUIDELINES.md');
const code = css.replace(/\/\*[\s\S]*?\*\//g, '');
const blocks = tokenBlocks();
const light = blocks.light, dark = { ...blocks.light, ...blocks.dark };
const HOSTS = ['#sweep', '#sweep-title']; // the wordmark host and the title heading host of the fixture
const CYCLE = 7000, STEP = 100;
const MID = 3500; // the middle of the crossing, measured by the timing test (the band is over the glyphs from 200ms to 6800ms)

// ---- Colour arithmetic ----
const channels = value => value.trim().split(/\s+/).map(Number);
const linear = v => { v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; };
const luminance = ([r, g, b]) => [r, g, b].map(linear).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
const ratio = (a, b) => { const [low, high] = [luminance(a), luminance(b)].sort((x, y) => x - y); return (high + .05) / (low + .05); };
const rgbOf = key => key.split(',').map(Number);
const rounded = v => Number(v.toFixed(2));
const TRICOLOUR = { blue: channels(light['--g2-color-ro-blue']), yellow: channels(light['--g2-color-ro-yellow']), red: channels(light['--g2-color-ro-red']) };
const HEADER = channels(light['--g2-color-header-bg']);

// The text inside the braces of the block whose opening brace follows `from`.
function braced(text, from) {
  const open = text.indexOf('{', from);
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    if (text[i] === '{') depth++;
    if (text[i] === '}' && --depth === 0) return text.slice(open + 1, i);
  }
  throw new Error('unbalanced braces');
}

// ---- Static: gov2.css ----
test('sweep: gov2.css uses the decided names, adds no token, and keeps the transparent fill inside @supports (acceptance 6, 10)', () => {
  assert.match(code, /\.g2-ro-sweep\{/, 'the class');
  assert.match(code, /@keyframes g2-ro-sweep\{/, 'the keyframes');
  assert.doesNotMatch(code, /--g2-[\w-]*sweep/, 'the sweep adds no token');
  const at = code.indexOf('@supports');
  assert.match(code.slice(at, code.indexOf('{', at)), /background-clip:text/, 'the @supports condition tests background-clip: text');
  const supports = braced(code, at);
  assert.equal([...code.matchAll(/-webkit-text-fill-color:transparent/g)].length, 1, 'the transparent fill is written once');
  assert.ok(supports.includes('-webkit-text-fill-color:transparent'), 'the transparent fill is inside @supports');
  assert.ok(supports.includes('-webkit-background-clip:text') && supports.includes('background-clip:text'), 'both forms of the clip');
  for (const name of ['ro-blue', 'ro-yellow', 'ro-red']) assert.ok(supports.includes(`var(--g2-color-${name})`), `the band reads --g2-color-${name}`);
  assert.ok(supports.includes('currentColor'), 'the rest colour is currentColor');
  assert.ok(supports.includes('prefers-reduced-motion:no-preference'), 'the effect is for readers with no reduced-motion preference');
  // Forced colours and print restore plain text.
  const plain = code.match(/@media\(forced-colors:active\),print\{\.g2-ro-sweep\{([^}]*)\}\}/);
  assert.ok(plain, 'a rule for forced colours and print');
  assert.ok(plain[1].includes('background:none') && plain[1].includes('-webkit-text-fill-color:currentColor') && plain[1].includes('animation:none'));
  // The focus rule: the host link shows plain text.
  assert.match(code, /:focus-visible \.g2-ro-sweep\{background:none\}/);
  assert.match(code, /:focus-visible \.g2-ro-sweep,\.g2-ro-sweep:focus-visible\{-webkit-text-fill-color:currentColor\}/);
});

test('sweep: the civtech loop is 7s linear and infinite with two keyframes, and the static frame is the first frame (acceptance 3, ADR 0010 amendment)', () => {
  const [, cycle] = code.match(/animation:g2-ro-sweep ([\d.]+)s linear infinite/);
  assert.equal(Number(cycle), 7, `the cycle is ${cycle}s`);
  const frames = [...braced(code, code.indexOf('@keyframes g2-ro-sweep')).matchAll(/(from|to|[\d.]+%)\{background-position:([^}]+)\}/g)].map(m => [m[1] === 'from' ? 0 : m[1] === 'to' ? 100 : parseFloat(m[1]), m[2]]);
  assert.deepEqual(frames, [[0, '100% 0'], [100, '0 0']], 'two keyframes, with no rest in the cycle');
  const rule = code.match(/\.g2-ro-sweep\{background:linear-gradient[^}]*\}/)[0];
  assert.ok(rule.includes(`) ${frames[0][1]}/300% 100%`), 'the static background position is the first keyframe');
  assert.ok(rule.includes('linear-gradient(100deg,currentColor 0 34%,rgb(var(--g2-color-ro-blue)) 42%,rgb(var(--g2-color-ro-yellow)) 50%,rgb(var(--g2-color-ro-red)) 58%,currentColor 66% 100%)'), 'the civtech gradient');
});

// ---- Static: documents ----
test('sweep: every "never text" names the exception, in every document of the scope (acceptance 9)', async () => {
  const exact = 'never text, except `.g2-ro-sweep` (ADR 0010)';
  for (const file of ['CLAUDE.md', 'AGENTS.md', 'GUIDELINES.md', 'COMPONENTS.md']) assert.ok((await read(file)).includes(exact), `${file} does not say "${exact}"`);
  for (const file of ['gov2.css', 'COMPONENTS.md', 'GUIDELINES.md', 'CLAUDE.md', 'AGENTS.md']) {
    const text = await read(file);
    for (const m of text.matchAll(/never text/gi)) assert.match(text.slice(m.index, m.index + 60), /^never text, except `?\.g2-ro-sweep`? \(ADR 0010\)/i, `${file}: "never text" without the exception`);
    assert.doesNotMatch(text, /never use them for text/i, file);
  }
  const phrases = [...guideHtml.matchAll(/nu poartă text/g)];
  assert.ok(phrases.length >= 1);
  for (const m of phrases) assert.match(guideHtml.slice(m.index, m.index + 90), /^nu poartă text, cu excepția clasei <code>\.g2-ro-sweep<\/code> \(ADR 0010/, 'the guide names the exception');
});

test('sweep: COMPONENTS.md and GUIDELINES.md document the class, both deviations, the scope and the accessibility statement (acceptance 9, 10)', () => {
  assert.match(reference, /^### Title sweep$/m);
  assert.ok(reference.includes('<a class="g2-wordmark" href="/"><span class="g2-ro-sweep">Instituții publice</span></a>'), 'the decided markup');
  for (const needle of ['ADR 0010', 'It is opt-in', 'WCAG 2.2.2 Pause, Stop, Hide (level A)', 'WCAG 1.4.3 Contrast (Minimum) (level AA)', 'accessibility statement', 'prefers-reduced-motion: reduce',
    'title heading inside `.g2-header`', 'once for each page', 'forced colours', 'print', 'background-clip: text', 'keyboard focus', 'g2-ro-sweep 7s linear infinite', 'does not use `.g2-ro-sweep`', 'adds no token']) {
    assert.ok(reference.includes(needle), `COMPONENTS.md does not say "${needle}"`);
  }
  assert.match(guidelines, /^8\. If the project uses `\.g2-ro-sweep`, does its accessibility statement list both deviations \(WCAG 2\.2\.2 and 1\.4\.3\)/m, 'the review checklist asks the question');
  assert.ok(guidelines.includes('WCAG 2.2.2') && guidelines.includes('1.4.3') && guidelines.includes('must conform to WCAG AA does not use it'));
});

test('sweep: the guide demonstrates the class once, states both deviations in Romanian and gives the markup; its numbers equal the tokens (acceptance 9, 10)', () => {
  assert.equal([...guideHtml.matchAll(/<span class="g2-ro-sweep"/g)].length, 1, 'one live use on the page (the rule is one use for each page)');
  const section = guideHtml.slice(guideHtml.indexOf('<h3 id="titlu-banda">'), guideHtml.indexOf('id="notice-example"'));
  for (const needle of ['WCAG 2.2.2 Pauză, oprire, ascundere (nivel A)', 'WCAG 1.4.3 Contrast minim (nivel AA)', 'prefers-reduced-motion: reduce', 'Domeniul excepției', 'Declarația de accesibilitate',
    'Text propus', 'nu folosește <code>.g2-ro-sweep</code>', 'ADR 0010', 'id="code-sweep"', 'data-copy="code-sweep"', '7 secunde', 'o singură dată']) {
    assert.ok(section.includes(needle), `the guide does not say "${needle}"`);
  }
  assert.ok(section.includes('&lt;span class=&quot;g2-ro-sweep&quot;&gt;Instituții publice&lt;/span&gt;'), 'the guide gives the copyable markup');
  for (const [colour, on] of [['blue', HEADER], ['red', HEADER], ['yellow', HEADER], ['yellow', [255, 255, 255]]]) {
    const value = ratio(TRICOLOUR[colour], on).toFixed(2);
    assert.ok(section.includes(value.replace('.', ',') + ':1'), `the guide shows ${colour} on ${on.join(',')}: ${value}:1`);
    assert.ok(reference.includes(`${value}:1`), `COMPONENTS.md shows ${colour} on ${on.join(',')}: ${value}:1`);
  }
});

test('sweep: the changelog entry, the backlog and the testing document name brief 06 (acceptance 10)', async () => {
  const entry = (await read('CHANGELOG.md')).split(/^## /m).find(section => section.includes('Brief 06 (tricolour title sweep)'));
  assert.ok(entry, 'the changelog has a section for brief 06');
  assert.ok(/\*\*Added\*\*/.test(entry), 'the section has Added');
  assert.doesNotMatch(entry, /\*\*Breaking\*\*/, 'a new opt-in component is not a breaking change');
  for (const needle of ['.g2-ro-sweep', 'g2-ro-sweep', 'ADR 0010', '2.2.2', '1.4.3']) assert.ok(entry.includes(needle), `the changelog entry does not name ${needle}`);
  assert.ok((await read('docs/testing.md')).includes('sweep.test.mjs'), 'testing.md lists the test file');
  assert.match(await read('docs/BACKLOG.md'), /brief 06/i);
});

// ---- Browser helpers ----
// Opens a page in a new context. `stylesheet` replaces /gov2.css; the other options go to the context.
async function run(path, options, fn) {
  const { stylesheet, ...contextOptions } = options || {};
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, ...contextOptions });
  await context.route('**/*', route => {
    const url = route.request().url();
    if (!url.startsWith(base)) return route.abort();
    if (stylesheet !== undefined && new URL(url).pathname === '/gov2.css') return route.fulfill({ contentType: 'text/css', body: stylesheet });
    return route.continue();
  });
  const page = await context.newPage();
  try {
    await page.goto(base + path, { waitUntil: 'networkidle' });
    return await fn(page);
  } finally { await context.close(); }
}
const LARGE = '#sweep,#sweep-title,#surface-sweep{font-size:64px;line-height:1.2}'; // glyph interiors with pixels of one colour, so that the counts are exact
const sweepAnimations = page => page.evaluate(() => document.getAnimations().filter(a => a.animationName === 'g2-ro-sweep').length);
// Pause every sweep animation at `ms` and wait two frames, so that a screenshot shows that moment.
const freeze = (page, ms) => page.evaluate(async ms => {
  for (const a of document.getAnimations().filter(a => a.animationName === 'g2-ro-sweep')) { a.pause(); a.currentTime = ms; }
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
}, ms);
// The number of pixels of each colour in a PNG, read in the page with a canvas. The result has a hidden property `solid`: the same count for the solid pixels only
// (all four neighbours within 6 per channel, so the interior of the glyphs and not the antialiased edge, which has coloured fringes at 64px).
const decode = async (page, png) => {
  const [count, solid] = await page.evaluate(async data => {
    const img = new Image(); img.src = 'data:image/png;base64,' + data; await img.decode();
    const canvas = document.createElement('canvas'); canvas.width = img.width; canvas.height = img.height;
    const g = canvas.getContext('2d', { willReadFrequently: true }); g.drawImage(img, 0, 0);
    const px = g.getImageData(0, 0, img.width, img.height).data, w = img.width, h = img.height, all = {}, solid = {};
    const at = (x, y) => (y * w + x) * 4;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = at(x, y), key = `${px[i]},${px[i + 1]},${px[i + 2]}`;
      all[key] = (all[key] || 0) + 1;
      if (x > 0 && y > 0 && x < w - 1 && y < h - 1 && ![at(x - 1, y), at(x + 1, y), at(x, y - 1), at(x, y + 1)].some(j => Math.max(Math.abs(px[j] - px[i]), Math.abs(px[j + 1] - px[i + 1]), Math.abs(px[j + 2] - px[i + 2])) > 6)) solid[key] = (solid[key] || 0) + 1;
    }
    return [all, solid];
  }, png.toString('base64'));
  return Object.defineProperty(count, 'solid', { value: solid, enumerable: false });
};
// The area of an element with some room, after scrolling it to the middle. The clip is in viewport coordinates, so scroll only here.
const clipOf = (page, selector, pad = 10) => page.locator(selector).evaluate((el, pad) => {
  el.scrollIntoView({ block: 'center' });
  const r = el.getBoundingClientRect();
  return { x: Math.max(0, Math.floor(r.x - pad)), y: Math.max(0, Math.floor(r.y - pad)), width: Math.ceil(r.width + 2 * pad), height: Math.ceil(r.height + 2 * pad) };
}, pad);
const look = async (page, clip) => decode(page, await page.screenshot({ clip }));
const same = (a, b) => JSON.stringify(Object.entries(a).sort()) === JSON.stringify(Object.entries(b).sort());
// The number of pixels that differ between two pictures of the same area (half of the sum of the differences of the colour counts).
const distance = (a, b) => [...new Set([...Object.keys(a), ...Object.keys(b)])].reduce((sum, key) => sum + Math.abs((a[key] || 0) - (b[key] || 0)), 0) / 2;
// The band is blended into the host colour, so a band pixel is not an exact token colour. A pixel is "tinted" when its colour is far from every mix of two plain colours
// (the antialiased edge of plain text lies on such a line; the count reads only the solid pixels, because the edge can have coloured fringes). The plain colours are the neutral colours of the header and the page in both schemes, and any colours that the test adds.
const TINT = 12;
const distToLine = (p, a, b) => {
  const d = b.map((v, i) => v - a[i]), len2 = d.reduce((s, v) => s + v * v, 0);
  const u = len2 ? Math.max(0, Math.min(1, p.reduce((s, v, i) => s + (v - a[i]) * d[i], 0) / len2)) : 0;
  return Math.hypot(...p.map((v, i) => v - (a[i] + u * d[i])));
};
const NEUTRAL = [...new Set([light, dark].flatMap(t => ['--g2-color-header-bg', '--g2-color-on-header', '--g2-color-page', '--g2-color-text'].map(k => channels(t[k]).join(','))))].map(rgbOf);
// `ref` is the picture of ordinary text in the same area (the colours of its solid pixels are plain, for example the link colour of a neighbour), or a list of plain colours.
const tintedPixels = (solid, ref = []) => {
  const points = Array.isArray(ref) ? ref : Object.keys(ref.solid ?? ref).map(rgbOf);
  const lines = NEUTRAL.flatMap((a, i) => NEUTRAL.slice(i + 1).map(b => [a, b]));
  return Object.entries(solid).filter(([key]) => lines.every(([a, b]) => distToLine(rgbOf(key), a, b) > TINT) && points.every(point => Math.hypot(...rgbOf(key).map((v, i) => v - point[i])) > TINT));
};
const bandTotal = (hist, ref) => tintedPixels(hist.solid, ref).reduce((sum, [, n]) => sum + n, 0);
// The picture of ordinary text in an area: the same element with the class removed.
const plainOf = async (page, selector, clip) => { await withoutClass(page, selector); const plain = await look(page, clip); await withClass(page, selector); return plain; };
const surfaceOf = hist => rgbOf(Object.entries(hist).sort((a, b) => b[1] - a[1])[0][0]);
const withoutClass = (page, selector) => page.locator(selector).evaluate(el => el.classList.remove('g2-ro-sweep'));
const withClass = (page, selector) => page.locator(selector).evaluate(el => el.classList.add('g2-ro-sweep'));
const top3 = hist => Object.entries(hist).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, n]) => `${k}:${n}`).join(' ');

// ---- Acceptance 3: timing ----
test('sweep: the animation is a 7s linear loop with no rest, and the first and last frames show no band (acceptance 3, ADR 0010 amendment)', () => run('/tests/contract.html', {}, async page => {
  await page.addStyleTag({ content: LARGE });
  const timing = await page.evaluate(() => document.getAnimations().filter(a => a.animationName === 'g2-ro-sweep').map(a => { const t = a.effect.getComputedTiming(); return { id: a.effect.target.id, duration: t.duration, iterations: t.iterations, easing: t.easing, delay: t.delay, keyframes: a.effect.getKeyframes().map(k => k.backgroundPosition) }; }));
  assert.deepEqual(timing.map(t => t.id).sort(), ['sweep', 'sweep-title']);
  for (const t of timing) {
    assert.deepEqual([t.duration, t.iterations, t.easing, t.delay], [CYCLE, Infinity, 'linear', 0], `${t.id}: ${CYCLE}ms, linear, infinite, no delay`);
    assert.equal(t.keyframes.length, 2, `${t.id}: two keyframes`);
  }
  // Real time: the animation runs and is not paused.
  const time = () => page.evaluate(() => document.getAnimations().find(a => a.animationName === 'g2-ro-sweep').currentTime);
  const before = await time();
  await page.waitForTimeout(1000);
  const advanced = (await time()) - before;
  assert.ok(advanced > 900 && advanced < 1400, `the animation advanced ${advanced.toFixed(0)}ms in 1000ms of real time`);
  // Pixel sampling over one cycle for each host. The band is "over the glyphs" while tinted pixels are on screen.
  const results = {};
  for (const selector of HOSTS) {
    const clip = await clipOf(page, selector);
    const plain = await plainOf(page, selector, clip), rows = [];
    for (let t = 0; t <= CYCLE; t += STEP) { await freeze(page, t); const hist = await look(page, clip); rows.push({ t, total: bandTotal(hist, plain) }); }
    const on = rows.filter(r => r.total >= 5).map(r => r.t);
    assert.ok(on.length > 5, `${selector}: the band is visible in ${on.length} samples`);
    const crossing = on[on.length - 1] - on[0] + STEP;
    assert.ok(crossing < CYCLE, `${selector}: the band is over the glyphs from ${on[0]}ms to ${on[on.length - 1]}ms (${crossing}ms)`);
    assert.deepEqual(on, Array.from({ length: on.length }, (_, i) => on[0] + i * STEP), `${selector}: the band crosses once, with no gap`);
    assert.equal(rows.at(0).total, 0, 'no band at the start of the cycle');
    assert.equal(rows.at(-1).total, 0, 'no band at the end of the cycle: the next cycle starts as it ends');
    const mid = (on[0] + on[on.length - 1]) / 2, peak = rows.reduce((a, r) => r.total > a.total ? r : a);
    results[selector] = { firstMs: on[0], lastMs: on[on.length - 1], crossingMs: crossing, middleMs: mid, peakMs: peak.t, peakTintedPixels: peak.total, plainMs: CYCLE - crossing };
  }
  console.log(`Sweep timing, from pixels at ${STEP}ms steps over one ${CYCLE}ms cycle (tinted pixels over the glyphs):`, JSON.stringify(results));
}));

// ---- Acceptance 1: rest and the static frame ----
for (const [name, path, options] of [['light', '/tests/contract.html', {}], ['dark', '/tests/contract.html?scheme=dark', {}], ['auto, with the system in dark mode', '/tests/contract.html?scheme=auto', { colorScheme: 'dark' }]]) {
  test(`sweep: ${name} scheme: at rest and with the animation removed, every glyph has the colour of the host in the first frame (t=0), at the real size and at 64px (acceptance 1)`, () => run(path, options, async page => {
    const hostColour = channels(light['--g2-color-on-header']); // the header is dark, with white text, in both schemes
    const differences = {};
    for (const size of ['real', '64px']) {
      const style = size === '64px' ? await page.addStyleTag({ content: LARGE }) : null;
      for (const selector of HOSTS) {
        const clip = await clipOf(page, selector);
        const computed = await page.locator(selector).evaluate(el => { const s = getComputedStyle(el), r = el.getBoundingClientRect(); return { color: s.color, clip: s.backgroundClip, name: s.animationName, box: [r.width, r.height] }; });
        assert.equal(computed.name, 'g2-ro-sweep');
        assert.equal(computed.clip, 'text', 'the browser uses the technique');
        // The first frame of the cycle: the gradient is at 100% 0 and the band is outside the glyphs. There is no rest in the middle of the cycle.
        await freeze(page, 0);
        const rest = await look(page, clip);
        await withoutClass(page, selector);
        const plain = await look(page, clip);
        assert.deepEqual(await page.locator(selector).evaluate(el => { const r = el.getBoundingClientRect(); return [r.width, r.height]; }), computed.box, `${selector} ${size}: the class does not change the box`);
        // Every solid pixel is the host colour, and the picture equals ordinary text. At the real size the box of the span clips the faint antialiased edge of the last glyph: a few pixels (measured: 3 of about 7,400).
        assert.equal(rest[hostColour.join(',')], plain[hostColour.join(',')], `${selector} ${size}: the number of solid host-colour pixels`);
        const differing = distance(rest, plain);
        assert.ok(differing <= (size === 'real' ? 8 : 0), `${selector} ${size}: at rest ${differing} pixels differ from ordinary text (sweep ${top3(rest)}; plain ${top3(plain)})`);
        differences[`${selector} ${size}`] = differing;
        assert.equal(bandTotal(rest, plain), 0, `${selector} ${size}: no band in the first frame`);
        assert.ok(plain[hostColour.join(',')] > 50, `${selector} ${size}: glyph pixels have the host colour ${hostColour.join(',')}`);
        assert.equal(computed.color, `rgb(${hostColour.join(', ')})`);
        assert.ok(ratio(hostColour, HEADER) >= 4.5, `${selector}: the rest colour has ${ratio(hostColour, HEADER).toFixed(2)}:1 on the header`);
        // The static frame: the project removes the animation, the class stays.
        await withClass(page, selector);
        const removed = await page.addStyleTag({ content: '.g2-ro-sweep{animation:none!important}' });
        assert.equal(await sweepAnimations(page), 0);
        const frame = await look(page, clip);
        assert.deepEqual(frame, rest, `${selector} ${size}: the static frame is the picture at t=0`);
        assert.ok(distance(frame, plain) <= (size === 'real' ? 8 : 0), `${selector} ${size}: with the animation removed the pixels equal ordinary text`);
        assert.equal(bandTotal(frame, plain), 0, `${selector} ${size}: no band in the static frame`);
        assert.equal(await page.locator(selector).evaluate(el => getComputedStyle(el).backgroundClip), 'text', 'the static frame is the clipped gradient, not a fallback');
        await removed.evaluate(el => el.remove());
      }
      if (style) await style.evaluate(el => el.remove());
    }
    console.log(`Sweep rest, ${name}: glyph colour rgb(${hostColour.join(', ')}) on the header ${ratio(hostColour, HEADER).toFixed(2)}:1; pixels that differ from ordinary text: ${JSON.stringify(differences)}`);
  }));
}

// ---- Acceptance 3: the worst moment of the band ----
test('sweep: the contrast of the glyphs under the blended band, measured from pixels over a whole cycle, in both schemes, on the header and on the page (acceptance 3, ADR 0010)', async () => {
  const report = {};
  for (const [scheme, path, tokens] of [['light', '/tests/contract.html', light], ['dark', '/tests/contract.html?scheme=dark', dark]]) {
    await run(path, {}, async page => {
      await page.addStyleTag({ content: LARGE });
      await page.evaluate(() => {
        const p = document.createElement('p');
        p.style.cssText = 'margin:0 0 24px;padding:8px 16px';
        p.innerHTML = '<span class="g2-ro-sweep" id="surface-sweep">Instituții publice</span>';
        document.querySelector('main').prepend(p);
      });
      for (const [surfaceName, selector, restColour, surface] of [['header', '#sweep', channels(tokens['--g2-color-on-header']), HEADER], ['page', '#surface-sweep', channels(tokens['--g2-color-text']), channels(tokens['--g2-color-page'])]]) {
        const clip = await clipOf(page, selector, 12);
        const plainPoints = Object.keys((await plainOf(page, selector, clip)).solid).map(rgbOf);
        let lowest = { ratio: Infinity }, tintedSamples = 0;
        const below = new Set();
        for (let t = 0; t <= CYCLE; t += 50) {
          await freeze(page, t);
          const hist = (await look(page, clip)).solid;
          assert.deepEqual(surfaceOf(hist), surface, `${scheme} ${surfaceName}: the surface behind the glyphs`);
          const tinted = tintedPixels(hist, [surface, restColour, ...plainPoints]).filter(([, n]) => n >= 3); // a colour that many solid pixels share, so a single odd pixel does not count
          if (tinted.length) tintedSamples++;
          for (const [key] of tinted) {
            const r = ratio(rgbOf(key), surface);
            if (r < 4.5) below.add(t);
            if (r < lowest.ratio) lowest = { ratio: r, t, colour: key };
          }
        }
        const rest = ratio(restColour, surface);
        assert.ok(rest >= 4.5, `${scheme} ${surfaceName}: rest ${rest.toFixed(2)}:1`);
        assert.ok(tintedSamples > 20, `${scheme} ${surfaceName}: band-tinted glyph pixels in ${tintedSamples} samples`);
        // The lowest token colour on this surface is the floor that the blend should not go below by much.
        const floor = Math.min(...Object.values(TRICOLOUR).map(c => ratio(c, surface)));
        report[`${scheme} ${surfaceName}`] = { rest: rounded(rest), lowest: rounded(lowest.ratio), at: `${lowest.t}ms rgb(${lowest.colour})`, lowestTokenColour: rounded(floor), samplesBelow45: below.size };
        assert.ok(lowest.ratio < 4.5, `${scheme} ${surfaceName}: a band-tinted glyph pixel falls below 4.5:1 (lowest ${rounded(lowest.ratio)}:1)`);
        assert.ok(lowest.ratio >= floor - 0.15, `${scheme} ${surfaceName}: the blend (${rounded(lowest.ratio)}:1) is not much lower than the lowest token colour (${rounded(floor)}:1)`);
      }
    });
  }
  // The two deliberate deviations, measured: a glyph pixel falls below 4.5:1 on every surface that the ADR names.
  console.log('Sweep contrast from solid glyph pixels over one cycle at 50ms steps (rest = host colour; lowest = lowest contrast of a band-tinted pixel against the surface):', JSON.stringify(report));
});

// ---- Acceptance 2: reduced motion ----
test('sweep: with prefers-reduced-motion: reduce no band appears at any time, and the glyphs are ordinary text (acceptance 2)', async () => {
  for (const path of ['/tests/contract.html', '/tests/contract.html?scheme=dark']) {
    await run(path, { reducedMotion: 'reduce' }, async page => {
      await page.addStyleTag({ content: LARGE });
      assert.equal(await sweepAnimations(page), 0, 'no sweep animation runs');
      for (const selector of HOSTS) {
        const s = await page.locator(selector).evaluate(el => { const c = getComputedStyle(el); return { name: c.animationName, image: c.backgroundImage, fill: c.webkitTextFillColor, color: c.color, clip: c.backgroundClip }; });
        assert.deepEqual([s.name, s.image, s.clip], ['none', 'none', 'border-box'], `${selector}: no animation, no background`);
        assert.equal(s.fill, s.color, `${selector}: the text fill is the text colour`);
        const clip = await clipOf(page, selector);
        const shots = [];
        for (let i = 0; i < 4; i++) { shots.push(await look(page, clip)); await page.waitForTimeout(600); }
        await withoutClass(page, selector);
        const plain = await look(page, clip);
        await withClass(page, selector);
        shots.forEach((hist, i) => { assert.equal(bandTotal(hist, plain), 0, `${selector}: no band at ${i * 600}ms`); assert.ok(same(hist, plain), `${selector}: the pixels equal ordinary text at ${i * 600}ms`); });
      }
    });
  }
  // The control: with no preference, the same page runs both animations.
  await run('/tests/contract.html', { reducedMotion: 'no-preference' }, async page => assert.equal(await sweepAnimations(page), 2));
});

// ---- Acceptance 5: forced colours and print ----
test('sweep: forced colours and print show plain text (acceptance 5)', async () => {
  for (const [label, options, prepare] of [['forced colours, light', { forcedColors: 'active', colorScheme: 'light' }, null], ['forced colours, dark', { forcedColors: 'active', colorScheme: 'dark' }, null], ['print', {}, page => page.emulateMedia({ media: 'print' })]]) {
    await run('/tests/contract.html', options, async page => {
      if (prepare) await prepare(page);
      await page.addStyleTag({ content: LARGE });
      assert.equal(await sweepAnimations(page), 0, `${label}: no sweep animation runs`);
      for (const selector of HOSTS) {
        const s = await page.locator(selector).evaluate(el => { const c = getComputedStyle(el); return { name: c.animationName, image: c.backgroundImage }; });
        assert.deepEqual([s.name, s.image], ['none', 'none'], `${label} ${selector}`);
        const clip = await clipOf(page, selector);
        const shown = await look(page, clip);
        await withoutClass(page, selector);
        const plain = await look(page, clip);
        await withClass(page, selector);
        assert.ok(same(shown, plain), `${label} ${selector}: the pixels equal ordinary text (${top3(shown)} against ${top3(plain)})`);
        assert.equal(bandTotal(shown, plain), 0, `${label} ${selector}: no band`);
        assert.ok(Object.values(shown).sort((a, b) => b - a)[1] > 100, `${label} ${selector}: the glyphs are painted`);
      }
    });
  }
});

// ---- Acceptance 6: no background-clip: text support ----
test('sweep: without background-clip: text support, the text is plain (acceptance 6)', async () => {
  const start = css.indexOf('@supports((-webkit-background-clip:text)');
  assert.ok(start > 0, 'the @supports block is in the stylesheet');
  const header = css.slice(start, css.indexOf('{', start));
  const block = header + '{' + braced(css, start) + '}';
  const variants = [['the @supports block removed', css.replace(block, '')], ['a condition that is false', css.replace(header, '@supports(background-clip:no-such-value)')]];
  for (const [label, stylesheet] of variants) {
    assert.notEqual(stylesheet, css, label);
    await run('/tests/contract.html', { stylesheet }, async page => {
      await page.addStyleTag({ content: LARGE });
      assert.equal(await sweepAnimations(page), 0, `${label}: no sweep animation`);
      for (const selector of HOSTS) {
        const s = await page.locator(selector).evaluate(el => { const c = getComputedStyle(el); return { name: c.animationName, image: c.backgroundImage, fill: c.webkitTextFillColor, color: c.color }; });
        assert.deepEqual([s.name, s.image], ['none', 'none'], `${label} ${selector}`);
        assert.equal(s.fill, s.color, `${label} ${selector}: the text is painted`);
        const clip = await clipOf(page, selector);
        const shown = await look(page, clip);
        await withoutClass(page, selector);
        assert.ok(same(shown, await look(page, clip)), `${label} ${selector}: the pixels equal ordinary text`);
      }
    });
  }
  // The control: the real stylesheet makes the transparent fill, so a plain result above is not an accident of the page.
  await run('/tests/contract.html', {}, async page => assert.equal(await page.locator('#sweep').evaluate(el => getComputedStyle(el).webkitTextFillColor), 'rgba(0, 0, 0, 0)'));
});

// ---- Acceptance 4: keyboard focus ----
for (const [name, path] of [['light', '/tests/contract.html'], ['dark', '/tests/contract.html?scheme=dark']]) {
  test(`sweep: ${name} scheme: keyboard focus on the host link shows the focus colours and every glyph, also in the middle of the band (acceptance 4)`, () => run(path, {}, async page => {
    await page.addStyleTag({ content: LARGE });
    const clip = await clipOf(page, '#sweep-link');
    const reference = await plainOf(page, '#sweep', clip);
    await freeze(page, MID);
    assert.ok(bandTotal(await look(page, clip), reference) > 200, 'the band is over the glyphs in the middle of the crossing, before the focus');
    for (const hover of [false, true]) {
      await page.mouse.move(0, 0);
      await keyboardFocus(page, '#sweep-link');
      const area = await clipOf(page, '#sweep-link');
      if (hover) await page.locator('#sweep-link').hover();
      const link = await styles(page, '#sweep-link');
      assert.equal(link.background, 'rgb(255, 221, 0)', 'the focus background');
      assert.equal(link.color, 'rgb(11, 12, 12)', 'the focus text colour');
      assert.ok(contrast(link.color, link.background) >= 4.5, `focus text ${contrast(link.color, link.background).toFixed(2)}:1`);
      const span = await page.locator('#sweep').evaluate(el => { const s = getComputedStyle(el); return { fill: s.webkitTextFillColor, image: s.backgroundImage, color: s.color }; });
      assert.deepEqual(span, { fill: 'rgb(11, 12, 12)', image: 'none', color: 'rgb(11, 12, 12)' }, 'the span paints the text and has no band');
      await freeze(page, MID);
      const focused = await look(page, area);
      await withoutClass(page, '#sweep');
      const plain = await look(page, area);
      await withClass(page, '#sweep');
      assert.ok(same(focused, plain), `focus${hover ? ' and hover' : ''}: the pixels equal ordinary text on the focus colour (${top3(focused)} against ${top3(plain)})`);
      assert.equal(bandTotal(focused, plain), 0, 'no band while focused');
      assert.ok(focused['11,12,12'] > 500, `every glyph is ink on yellow (${focused['11,12,12']} ink pixels)`);
      if (!hover) console.log(`Sweep focus, ${name}: ${top3(focused)}; text ${contrast(link.color, link.background).toFixed(2)}:1 (ink on yellow)`);
    }
    // The band returns when the focus leaves, because the focus rule changes nothing else.
    await page.mouse.move(0, 0);
    await page.evaluate(() => document.activeElement.blur());
    await freeze(page, MID);
    assert.ok(bandTotal(await look(page, await clipOf(page, '#sweep-link')), reference) > 200, 'the band is back after blur');
  }));
}

test('sweep: a focusable element that carries the class also shows plain text on focus (acceptance 4)', () => run('/tests/contract.html', {}, async page => {
  await page.addStyleTag({ content: LARGE });
  await page.locator('#sweep-title').evaluate(el => el.setAttribute('tabindex', '0'));
  await keyboardFocus(page, '#sweep-title');
  const clip = await clipOf(page, '#sweep-title', 14);
  await freeze(page, MID);
  const s = await page.locator('#sweep-title').evaluate(el => { const c = getComputedStyle(el); return { fill: c.webkitTextFillColor, bg: c.backgroundColor, image: c.backgroundImage }; });
  assert.deepEqual(s, { fill: 'rgb(11, 12, 12)', bg: 'rgb(255, 221, 0)', image: 'none' }, 'the standard focus colours, with no band');
  const hist = await look(page, clip);
  assert.equal(bandTotal(hist, [[255, 221, 0]]), 0);
  assert.ok(hist['11,12,12'] > 500, 'ink glyphs on yellow');
}));

// ---- Acceptance 7: name and selection ----
test('sweep: the accessible name of the host link is unchanged and the text can be selected (acceptance 7)', () => run('/tests/contract.html', {}, async page => {
  const withSweep = await page.locator('#sweep-link').ariaSnapshot();
  await withoutClass(page, '#sweep');
  const plain = await page.locator('#sweep-link').ariaSnapshot();
  await withClass(page, '#sweep');
  assert.equal(withSweep, plain, 'the accessibility tree of the link is the same');
  assert.ok(withSweep.startsWith('- link "Instituții publice"'), withSweep);
  assert.equal(await page.getByRole('link', { name: 'Instituții publice', exact: true }).count(), 1);
  assert.equal(await page.getByRole('heading', { name: 'Titlul paginii', exact: true }).count(), 1, 'the name of the heading is the title text');
  assert.equal(await page.locator('#sweep').textContent(), 'Instituții publice');
  assert.equal(await page.locator('#sweep').evaluate(el => getComputedStyle(el).userSelect), 'auto');
  assert.equal(await page.locator('#sweep').evaluate(el => el.children.length), 0, 'the element contains only text');
  // A reader selects the title: the text is selected and stays visible.
  await page.addStyleTag({ content: LARGE });
  await page.locator('#sweep-title').selectText();
  assert.equal(await page.evaluate(() => getSelection().toString()), 'Titlul paginii');
  await freeze(page, 0);
  const clip = await clipOf(page, '#sweep-title', 0);
  const pair = hist => Object.entries(hist).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([k]) => rgbOf(k)); // the selection fill, then the glyph colour
  const [bg, glyph] = pair(await look(page, clip));
  await page.evaluate(() => getSelection().removeAllRanges());
  await withoutClass(page, '#sweep-title');
  await page.locator('#sweep-title').selectText();
  const [bgPlain, glyphPlain] = pair(await look(page, await clipOf(page, '#sweep-title', 0)));
  console.log(`Sweep, selected text (Chrome default selection colours): glyph rgb(${glyph}) on rgb(${bg}) ${ratio(glyph, bg).toFixed(2)}:1; ordinary text rgb(${glyphPlain}) on rgb(${bgPlain}) ${ratio(glyphPlain, bgPlain).toFixed(2)}:1`);
  assert.ok(ratio(glyph, bg) > 2, 'the selected glyphs are visible against the selection');
}));

// ---- Acceptance 8: the host link keeps its behaviour ----
test('sweep: hover, focus and hover plus focus of .g2-wordmark are the same with and without the sweep (acceptance 8)', () => run('/tests/contract.html', {}, async page => {
  const props = selector => page.locator(selector).evaluate(el => { const s = getComputedStyle(el); return { color: s.color, background: s.backgroundColor, outline: `${s.outlineStyle} ${s.outlineWidth} ${s.outlineColor}`, shadow: s.boxShadow, decoration: `${s.textDecorationLine} ${s.textDecorationThickness}`, cursor: s.cursor, font: `${s.fontSize} ${s.fontWeight} ${s.letterSpacing}`, display: s.display, focused: el.matches(':focus-visible') }; });
  // Moves the link into each state in turn and reads it. The plain wordmark of the fixture goes through the same states.
  const states = async selector => {
    const out = {};
    for (const [label, focus, hover] of [['rest', false, false], ['hover', false, true], ['focus', true, false], ['focus+hover', true, true]]) {
      await page.mouse.move(0, 0);
      await page.evaluate(() => document.activeElement?.blur());
      if (focus) await keyboardFocus(page, selector);
      if (hover) await page.locator(selector).hover();
      out[label] = await props(selector);
    }
    await page.mouse.move(0, 0);
    await page.evaluate(() => document.activeElement?.blur());
    return out;
  };
  const sweep = await states('#sweep-link');
  await withoutClass(page, '#sweep');
  const plain = await states('#sweep-link');
  await withClass(page, '#sweep');
  const reference = await states('#wordmark');
  assert.deepEqual(sweep, plain, 'the link with the sweep behaves as the same link without it, at rest, on hover, on focus and on both');
  assert.deepEqual(sweep, reference, 'the link with the sweep behaves as the plain wordmark of the fixture');
  assert.equal(sweep.focus.background, 'rgb(255, 221, 0)');
  assert.equal(sweep['focus+hover'].background, 'rgb(255, 221, 0)');
  assert.ok(sweep.focus.focused && sweep['focus+hover'].focused && !sweep.rest.focused);
  assert.ok(sweep.rest.decoration.startsWith('none'), 'the wordmark is not underlined');
  assert.equal(sweep.hover.decoration, sweep.rest.decoration, 'the wordmark has no hover treatment, as before');
}));

// ---- The layers ----
test('sweep: the component rule is in gov2.components and the focus rule in gov2.states (acceptance 10)', () => run('/tests/contract.html', {}, async page => {
  const found = await page.evaluate(() => {
    const sheet = [...document.styleSheets].find(s => s.href?.endsWith('/gov2.css'));
    const layer = name => [...sheet.cssRules].find(r => r.constructor.name === 'CSSLayerBlockRule' && r.name === name);
    const walk = rules => [...rules].flatMap(r => [r.constructor.name + ':' + (r.selectorText ?? r.conditionText ?? r.name ?? ''), ...(r.cssRules && r.constructor.name !== 'CSSKeyframesRule' ? walk(r.cssRules) : [])]);
    return { components: walk(layer('gov2.components').cssRules), states: walk(layer('gov2.states').cssRules), outside: [...sheet.cssRules].map(r => r.constructor.name).filter(k => !['CSSLayerStatementRule', 'CSSLayerBlockRule'].includes(k)) };
  });
  const components = found.components.join('\n');
  assert.match(components, /CSSSupportsRule:.*background-clip/);
  assert.match(components, /CSSMediaRule:\(prefers-reduced-motion: no-preference\)/);
  assert.match(components, /CSSKeyframesRule:g2-ro-sweep/);
  assert.match(components, /CSSMediaRule:\(forced-colors: active\), print/);
  assert.ok(components.includes('CSSStyleRule:.g2-ro-sweep'));
  assert.ok(found.states.some(rule => rule.includes('.g2-ro-sweep')), 'the focus rule is in gov2.states');
  assert.ok(!components.includes('focus-visible'), 'no focus rule in the components layer');
  assert.deepEqual(found.outside, [], 'every rule is inside a layer');
}));

// ---- Acceptance 10: the guide demonstration ----
for (const scheme of ['light', 'dark']) {
  test(`sweep: the guide demonstration runs in the ${scheme} scheme, keeps the contrast of the guide and takes focus (acceptance 1, 4, 10)`, () => run('/docs/', { colorScheme: scheme }, async page => {
    assert.equal(await page.locator('.g2-ro-sweep').count(), 1, 'one use on the page');
    assert.equal(await sweepAnimations(page), 1);
    await page.locator('details').evaluateAll(els => els.forEach(el => { el.open = true; }));
    assert.deepEqual((await contrastReport(page)).problems, [], 'every text node of the guide, with the demonstration, meets the contrast at rest');
    await keyboardFocus(page, '#sweep-demo-link');
    const link = await styles(page, '#sweep-demo-link');
    assert.equal(link.background, 'rgb(255, 221, 0)');
    assert.ok(contrast(link.color, link.background) >= 4.5);
    assert.equal(await page.locator('#sweep-demo').evaluate(el => getComputedStyle(el).webkitTextFillColor), 'rgb(11, 12, 12)');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  }));
}

// ---- Screenshots (set GUIDE_ARTIFACT_DIR): the fixture and the guide demonstration, at rest and in the middle of the band ----
if (artifacts) {
  for (const [name, path, selector] of [['fixture', '/tests/contract.html', '#sweep-header'], ['guide', '/docs/', '#sweep-demo-link']]) {
    for (const scheme of ['light', 'dark']) {
      for (const width of [1280, 320]) {
        test(`sweep: ${name} in the ${scheme} scheme at ${width}px is saved at rest and in the middle of the band, with the title inside the viewport`, () => run(path, { viewport: { width, height: 700 }, colorScheme: scheme }, async page => {
          if (name === 'fixture') await page.evaluate(scheme => document.documentElement.setAttribute('data-g2-scheme', scheme), scheme);
          await mkdir(artifacts, { recursive: true });
          for (const [moment, ms] of [['rest', 0], ['band', MID]]) {
            await freeze(page, ms);
            if (name === 'guide') await page.evaluate(() => document.querySelector('#titlu-banda').scrollIntoView({ block: 'start' }));
            else await page.locator(selector).evaluate(el => el.scrollIntoView({ block: 'center' }));
            const inside = await page.locator(selector).evaluate(el => { const r = el.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth + 0.5 && r.top >= 0 && r.bottom <= innerHeight; });
            assert.equal(inside, true, `${name} ${scheme} ${width}px: the title is inside the viewport`);
            await writeFile(`${artifacts}/sweep-${name}-${scheme}-${width}-${moment}.png`, await page.screenshot({ type: 'png' }));
          }
          console.log(`Screenshots: sweep ${name} ${scheme} ${width}px, rest and band`);
        }));
      }
    }
  }
}
