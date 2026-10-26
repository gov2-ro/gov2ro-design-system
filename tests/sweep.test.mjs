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
const CYCLE = 9000, STEP = 100;

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

test('sweep: the cycle is 9s or more, the sweep lasts 3s or less, and the static frame is the first frame (acceptance 3)', () => {
  const [, cycle] = code.match(/animation:g2-ro-sweep ([\d.]+)s linear infinite/);
  assert.ok(Number(cycle) >= 9, `the cycle is ${cycle}s`);
  const frames = [...braced(code, code.indexOf('@keyframes g2-ro-sweep')).matchAll(/(from|to|[\d.]+%)\{background-position:([^}]+)\}/g)].map(m => [m[1] === 'from' ? 0 : m[1] === 'to' ? 100 : parseFloat(m[1]), m[2]]);
  assert.deepEqual(frames.map(f => f[0]), [0, 33.33, 100]);
  assert.equal(frames[1][1], frames[2][1], 'the sweep ends at the last position; the rest of the cycle holds it');
  const sweepEnd = frames[1][0] / 100 * Number(cycle);
  assert.ok(sweepEnd <= 3, `the sweep keyframes last ${sweepEnd.toFixed(2)}s`);
  assert.ok(code.match(/\.g2-ro-sweep\{background:linear-gradient[^}]*\}/)[0].includes(`) ${frames[0][1]}/300% 100%`), 'the static background position is the first keyframe');
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
    'title heading inside `.g2-header`', 'once for each page', 'forced colours', 'print', 'background-clip: text', 'keyboard focus', 'g2-ro-sweep 9s linear infinite', 'does not use `.g2-ro-sweep`', 'adds no token']) {
    assert.ok(reference.includes(needle), `COMPONENTS.md does not say "${needle}"`);
  }
  assert.match(guidelines, /^8\. If the project uses `\.g2-ro-sweep`, does its accessibility statement list both deviations \(WCAG 2\.2\.2 and 1\.4\.3\)/m, 'the review checklist asks the question');
  assert.ok(guidelines.includes('WCAG 2.2.2') && guidelines.includes('1.4.3') && guidelines.includes('must conform to WCAG AA does not use it'));
});

test('sweep: the guide demonstrates the class once, states both deviations in Romanian and gives the markup; its numbers equal the tokens (acceptance 9, 10)', () => {
  assert.equal([...guideHtml.matchAll(/<span class="g2-ro-sweep"/g)].length, 1, 'one live use on the page (the rule is one use for each page)');
  const section = guideHtml.slice(guideHtml.indexOf('<h3 id="titlu-banda">'), guideHtml.indexOf('id="notice-example"'));
  for (const needle of ['WCAG 2.2.2 Pauză, oprire, ascundere (nivel A)', 'WCAG 1.4.3 Contrast minim (nivel AA)', 'prefers-reduced-motion: reduce', 'Domeniul excepției', 'Declarația de accesibilitate',
    'Text propus', 'nu folosește <code>.g2-ro-sweep</code>', 'ADR 0010', 'id="code-sweep"', 'data-copy="code-sweep"', '9 secunde', '3 secunde', 'o singură dată']) {
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
// The number of pixels of each colour in a PNG, read in the page with a canvas.
const decode = (page, png) => page.evaluate(async data => {
  const img = new Image(); img.src = 'data:image/png;base64,' + data; await img.decode();
  const canvas = document.createElement('canvas'); canvas.width = img.width; canvas.height = img.height;
  const g = canvas.getContext('2d', { willReadFrequently: true }); g.drawImage(img, 0, 0);
  const pixels = g.getImageData(0, 0, img.width, img.height).data, count = {};
  for (let i = 0; i < pixels.length; i += 4) { const key = `${pixels[i]},${pixels[i + 1]},${pixels[i + 2]}`; count[key] = (count[key] || 0) + 1; }
  return count;
}, png.toString('base64'));
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
const near = (key, target) => rgbOf(key).every((v, i) => Math.abs(v - target[i]) <= 2);
const bandPixels = hist => Object.fromEntries(Object.entries(TRICOLOUR).map(([name, rgb]) => [name, Object.entries(hist).filter(([key]) => near(key, rgb)).reduce((sum, [, n]) => sum + n, 0)]));
const bandTotal = hist => Object.values(bandPixels(hist)).reduce((a, b) => a + b, 0);
// The most common colour near a tricolour colour: the colour that the glyphs really have.
const painted = (hist, colour) => rgbOf(Object.entries(hist).filter(([key]) => near(key, TRICOLOUR[colour])).sort((a, b) => b[1] - a[1])[0][0]);
const surfaceOf = hist => rgbOf(Object.entries(hist).sort((a, b) => b[1] - a[1])[0][0]);
const withoutClass = (page, selector) => page.locator(selector).evaluate(el => el.classList.remove('g2-ro-sweep'));
const withClass = (page, selector) => page.locator(selector).evaluate(el => el.classList.add('g2-ro-sweep'));
const top3 = hist => Object.entries(hist).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, n]) => `${k}:${n}`).join(' ');

// ---- Acceptance 3: timing ----
test('sweep: the animation is a 9s linear loop, and the band is over the glyphs for 3s or less (acceptance 3)', () => run('/tests/contract.html', {}, async page => {
  await page.addStyleTag({ content: LARGE });
  const timing = await page.evaluate(() => document.getAnimations().filter(a => a.animationName === 'g2-ro-sweep').map(a => { const t = a.effect.getComputedTiming(); return { id: a.effect.target.id, duration: t.duration, iterations: t.iterations, easing: t.easing, delay: t.delay }; }));
  assert.deepEqual(timing.map(t => t.id).sort(), ['sweep', 'sweep-title']);
  for (const t of timing) assert.deepEqual([t.duration, t.iterations, t.easing, t.delay], [CYCLE, Infinity, 'linear', 0], `${t.id}: ${CYCLE}ms, linear, infinite, no delay`);
  // Real time: the animation runs and is not paused.
  const time = () => page.evaluate(() => document.getAnimations().find(a => a.animationName === 'g2-ro-sweep').currentTime);
  const before = await time();
  await page.waitForTimeout(1000);
  const advanced = (await time()) - before;
  assert.ok(advanced > 900 && advanced < 1400, `the animation advanced ${advanced.toFixed(0)}ms in 1000ms of real time`);
  // Pixel sampling over one cycle for each host. The band is "over the glyphs" while tricolour pixels are on screen.
  const results = {};
  for (const selector of HOSTS) {
    const clip = await clipOf(page, selector);
    const rows = [];
    for (let t = 0; t <= CYCLE; t += STEP) { await freeze(page, t); const hist = await look(page, clip); rows.push({ t, ...bandPixels(hist), total: bandTotal(hist) }); }
    const on = rows.filter(r => r.total >= 5).map(r => r.t);
    assert.ok(on.length > 5, `${selector}: the band is visible in ${on.length} samples`);
    const crossing = on[on.length - 1] - on[0] + STEP;
    assert.ok(crossing <= 3000, `${selector}: the band is over the glyphs from ${on[0]}ms to ${on[on.length - 1]}ms (${crossing}ms)`);
    assert.ok(CYCLE - crossing >= 6000, `${selector}: the title rests for ${CYCLE - crossing}ms`);
    assert.deepEqual(on, Array.from({ length: on.length }, (_, i) => on[0] + i * STEP), `${selector}: the band crosses once, with no gap`);
    assert.equal(rows.at(0).total, 0, 'no band at the start of the cycle');
    assert.equal(rows.at(-1).total, 0, 'no band at the end of the cycle: the next cycle starts at rest');
    assert.ok(rows.some(r => r.blue > 20 && r.yellow > 20 && r.red > 20), `${selector}: the three colours show together`);
    results[selector] = { firstMs: on[0], lastMs: on[on.length - 1], crossingMs: crossing, restMs: CYCLE - crossing };
  }
  console.log(`Sweep timing, from pixels at ${STEP}ms steps over one ${CYCLE}ms cycle (band over the glyphs, then rest):`, JSON.stringify(results));
}));

// ---- Acceptance 1: rest and the static frame ----
for (const [name, path, options] of [['light', '/tests/contract.html', {}], ['dark', '/tests/contract.html?scheme=dark', {}], ['auto, with the system in dark mode', '/tests/contract.html?scheme=auto', { colorScheme: 'dark' }]]) {
  test(`sweep: ${name} scheme: at rest and with the animation removed, every glyph has the colour of the host, at the real size and at 64px (acceptance 1)`, () => run(path, options, async page => {
    const hostColour = channels(light['--g2-color-on-header']); // the header is dark, with white text, in both schemes
    const differences = {};
    for (const size of ['real', '64px']) {
      const style = size === '64px' ? await page.addStyleTag({ content: LARGE }) : null;
      for (const selector of HOSTS) {
        const clip = await clipOf(page, selector);
        const computed = await page.locator(selector).evaluate(el => { const s = getComputedStyle(el), r = el.getBoundingClientRect(); return { color: s.color, clip: s.backgroundClip, name: s.animationName, box: [r.width, r.height] }; });
        assert.equal(computed.name, 'g2-ro-sweep');
        assert.equal(computed.clip, 'text', 'the browser uses the technique');
        // Rest: the cycle is at 6s, long after the band left.
        await freeze(page, 6000);
        const rest = await look(page, clip);
        await withoutClass(page, selector);
        const plain = await look(page, clip);
        assert.deepEqual(await page.locator(selector).evaluate(el => { const r = el.getBoundingClientRect(); return [r.width, r.height]; }), computed.box, `${selector} ${size}: the class does not change the box`);
        // Every solid pixel is the host colour, and the picture equals ordinary text. At the real size the box of the span clips the faint antialiased edge of the last glyph: a few pixels (measured: 3 of about 7,400).
        assert.equal(rest[hostColour.join(',')], plain[hostColour.join(',')], `${selector} ${size}: the number of solid host-colour pixels`);
        const differing = distance(rest, plain);
        assert.ok(differing <= (size === 'real' ? 8 : 0), `${selector} ${size}: at rest ${differing} pixels differ from ordinary text (sweep ${top3(rest)}; plain ${top3(plain)})`);
        differences[`${selector} ${size}`] = differing;
        assert.equal(bandTotal(rest), 0, `${selector} ${size}: no band at rest`);
        assert.ok(plain[hostColour.join(',')] > 50, `${selector} ${size}: glyph pixels have the host colour ${hostColour.join(',')}`);
        assert.equal(computed.color, `rgb(${hostColour.join(', ')})`);
        assert.ok(ratio(hostColour, HEADER) >= 4.5, `${selector}: the rest colour has ${ratio(hostColour, HEADER).toFixed(2)}:1 on the header`);
        // The static frame: the project removes the animation, the class stays.
        await withClass(page, selector);
        const removed = await page.addStyleTag({ content: '.g2-ro-sweep{animation:none!important}' });
        assert.equal(await sweepAnimations(page), 0);
        const frame = await look(page, clip);
        assert.deepEqual(frame, rest, `${selector} ${size}: the static frame is the picture at rest`);
        assert.ok(distance(frame, plain) <= (size === 'real' ? 8 : 0), `${selector} ${size}: with the animation removed the pixels equal ordinary text`);
        assert.equal(bandTotal(frame), 0, `${selector} ${size}: no band in the static frame`);
        assert.equal(await page.locator(selector).evaluate(el => getComputedStyle(el).backgroundClip), 'text', 'the static frame is the clipped gradient, not a fallback');
        await removed.evaluate(el => el.remove());
      }
      if (style) await style.evaluate(el => el.remove());
    }
    console.log(`Sweep rest, ${name}: glyph colour rgb(${hostColour.join(', ')}) on the header ${ratio(hostColour, HEADER).toFixed(2)}:1; pixels that differ from ordinary text: ${JSON.stringify(differences)}`);
  }));
}

// ---- Acceptance 3: the worst moment of the band ----
test('sweep: the contrast of each band colour, measured from pixels over the sweep, in both schemes, on the header and on the page (acceptance 3, ADR 0010)', async () => {
  const documented = { blue: 1.54, yellow: 13.31, red: 3.48 }; // ADR 0010, on the header
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
        const lowest = {};
        let worst = { ratio: Infinity };
        let seen = null;
        for (let t = 0; t <= 3000; t += 100) {
          await freeze(page, t);
          const hist = await look(page, clip);
          seen = surfaceOf(hist);
          for (const [colour, n] of Object.entries(bandPixels(hist))) {
            if (n < 20) continue;
            const r = ratio(painted(hist, colour), seen);
            lowest[colour] = Math.min(lowest[colour] ?? Infinity, r);
            if (r < worst.ratio) worst = { ratio: r, t, colour };
          }
        }
        assert.deepEqual(seen, surface, `${scheme} ${surfaceName}: the surface behind the glyphs`);
        assert.deepEqual(Object.keys(lowest).sort(), ['blue', 'red', 'yellow'], `${scheme} ${surfaceName}: all three colours were measured`);
        const rest = ratio(restColour, surface);
        assert.ok(rest >= 4.5, `${scheme} ${surfaceName}: rest ${rest.toFixed(2)}:1`);
        report[`${scheme} ${surfaceName}`] = { rest: rounded(rest), blue: rounded(lowest.blue), yellow: rounded(lowest.yellow), red: rounded(lowest.red), worst: `${worst.colour} at ${worst.t}ms, ${rounded(worst.ratio)}:1` };
        for (const colour of Object.keys(TRICOLOUR)) assert.equal(rounded(lowest[colour]), rounded(ratio(TRICOLOUR[colour], surface)), `${scheme} ${surfaceName}: the painted ${colour} is the token colour`);
        if (surfaceName === 'header') for (const colour of Object.keys(documented)) assert.equal(rounded(lowest[colour]), documented[colour], `ADR 0010: ${colour} on the header`);
        if (scheme === 'light' && surfaceName === 'page') assert.equal(rounded(lowest.yellow), 1.47, 'ADR 0010: yellow on white');
      }
    });
  }
  // The two deliberate deviations, measured: a band colour falls below 4.5:1 on every surface that the ADR names.
  assert.ok(report['light header'].blue < 4.5 && report['light page'].yellow < 4.5 && report['dark header'].blue < 4.5 && report['dark page'].blue < 4.5);
  console.log('Sweep contrast from pixels (rest = glyph colour at rest; then the contrast of each band colour; worst = the lowest, with the time):', JSON.stringify(report));
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
        shots.forEach((hist, i) => { assert.equal(bandTotal(hist), 0, `${selector}: no band at ${i * 600}ms`); assert.ok(same(hist, plain), `${selector}: the pixels equal ordinary text at ${i * 600}ms`); });
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
        assert.equal(bandTotal(shown), 0, `${label} ${selector}: no band`);
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
    await freeze(page, 1500);
    assert.ok(bandTotal(await look(page, clip)) > 200, 'the band is over the glyphs at 1500ms, before the focus');
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
      await freeze(page, 1500);
      const focused = await look(page, area);
      await withoutClass(page, '#sweep');
      const plain = await look(page, area);
      await withClass(page, '#sweep');
      assert.ok(same(focused, plain), `focus${hover ? ' and hover' : ''}: the pixels equal ordinary text on the focus colour (${top3(focused)} against ${top3(plain)})`);
      assert.equal(bandTotal(focused), 0, 'no band while focused');
      assert.ok(focused['11,12,12'] > 500, `every glyph is ink on yellow (${focused['11,12,12']} ink pixels)`);
      if (!hover) console.log(`Sweep focus, ${name}: ${top3(focused)}; text ${contrast(link.color, link.background).toFixed(2)}:1 (ink on yellow)`);
    }
    // The band returns when the focus leaves, because the focus rule changes nothing else.
    await page.mouse.move(0, 0);
    await page.evaluate(() => document.activeElement.blur());
    await freeze(page, 1500);
    assert.ok(bandTotal(await look(page, await clipOf(page, '#sweep-link'))) > 200, 'the band is back after blur');
  }));
}

test('sweep: a focusable element that carries the class also shows plain text on focus (acceptance 4)', () => run('/tests/contract.html', {}, async page => {
  await page.addStyleTag({ content: LARGE });
  await page.locator('#sweep-title').evaluate(el => el.setAttribute('tabindex', '0'));
  await keyboardFocus(page, '#sweep-title');
  const clip = await clipOf(page, '#sweep-title', 14);
  await freeze(page, 1500);
  const s = await page.locator('#sweep-title').evaluate(el => { const c = getComputedStyle(el); return { fill: c.webkitTextFillColor, bg: c.backgroundColor, image: c.backgroundImage }; });
  assert.deepEqual(s, { fill: 'rgb(11, 12, 12)', bg: 'rgb(255, 221, 0)', image: 'none' }, 'the standard focus colours, with no band');
  const hist = await look(page, clip);
  assert.equal(bandTotal(hist), 0);
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
  await freeze(page, 6000);
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
          for (const [moment, ms] of [['rest', 6000], ['band', 1500]]) {
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
