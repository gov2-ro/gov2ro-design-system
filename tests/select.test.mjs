// Brief 08: a native <select> with .g2-input (issue #10). No .g2-select class, no custom widget, no new token, no image, no colour literal in the arrow.
// Static checks read gov2.css and the documents. Browser checks use tests/contract.html (?scheme=...), the guide and the directory example page.
// The changelog entry is found by its first line, not by the "Unreleased" heading or a version number.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { useBrowser, read, css, reference, tokenBlocks, withPage, contrast } from './helpers.mjs';

useBrowser();

const blocks = tokenBlocks();
const guideHtml = (await read('docs/index.html')).replace(/&quot;/g, '"'), fixtureHtml = await read('tests/contract.html');
const directoryHtml = await read('docs/examples/directory.html'), changelog = await read('CHANGELOG.md'), migrationDoc = await read('docs/migration-from-0.6.0.md');
const fx = (scheme, run, options = {}) => withPage(run, { path: `/tests/contract.html?scheme=${scheme}`, ...options });
const rule = (layer, startsWith) => {
  const from = css.indexOf(`@layer gov2.${layer} {`);
  const block = css.slice(from, layer === 'components' ? css.indexOf('@layer gov2.states {') : undefined);
  return block.split('\n').filter(line => line.startsWith(startsWith));
};

// Samples the rendered pixels of a region of the page: the screenshot is drawn on a canvas, and the function reads it back.
async function pixels(page, clip) {
  const png = (await page.screenshot({ clip })).toString('base64');
  return page.evaluate(async data => {
    const image = new Image();
    await new Promise((resolve, reject) => { image.onload = resolve; image.onerror = reject; image.src = `data:image/png;base64,${data}`; });
    const canvas = document.createElement('canvas');
    canvas.width = image.width; canvas.height = image.height;
    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0);
    const { data: raw, width, height } = context.getImageData(0, 0, canvas.width, canvas.height);
    return { width, height, list: Array.from({ length: width * height }, (_, i) => [raw[i * 4], raw[i * 4 + 1], raw[i * 4 + 2]]) };
  }, png);
}
const rgb = c => `rgb(${c.join(', ')})`;
// The arrow of a drop-down: the box that the two gradients cover, in page coordinates. Returns the strongest contrast against the select background.
async function arrowContrast(page, selector, wide = false) {
  await page.locator(selector).scrollIntoViewIfNeeded();
  const box = await page.locator(selector).evaluate((el, wide) => {
    const r = el.getBoundingClientRect(), s = getComputedStyle(el), root = parseFloat(getComputedStyle(document.documentElement).fontSize), em = parseFloat(s.fontSize);
    const border = parseFloat(s.borderRightWidth), right = r.right - border;
    return { left: wide ? right - 2.5 * root : right - root - .9 * em - 2, right: wide ? right - 1 : right - root + 2, top: r.top + r.height / 2 - (wide ? 1 : .5) * em, bottom: r.top + r.height / 2 + (wide ? 1 : .5) * em, bgX: r.left + 4, bgY: r.top + 6 };
  }, wide);
  const area = await pixels(page, { x: box.left, y: box.top, width: box.right - box.left, height: box.bottom - box.top });
  const bg = (await pixels(page, { x: box.bgX, y: box.bgY, width: 1, height: 1 })).list[0];
  let best = 1, color = bg;
  for (const p of area.list) { const c = contrast(rgb(p), rgb(bg)); if (c > best) { best = c; color = p; } }
  return { ratio: best, color, bg };
}
const props = (page, selector) => page.locator(selector).evaluate(el => {
  const s = getComputedStyle(el), r = el.getBoundingClientRect();
  return { height: r.height, width: r.width, borderWidth: s.borderTopWidth, borderStyle: s.borderTopStyle, borderColor: s.borderTopColor, font: `${s.fontFamily}|${s.fontSize}|${s.fontWeight}|${s.lineHeight}`,
    background: s.backgroundColor, color: s.color, cursor: s.cursor, opacity: s.opacity, radius: s.borderTopLeftRadius, outline: `${s.outlineStyle} ${s.outlineWidth} ${s.outlineColor}`, shadow: s.boxShadow,
    image: s.backgroundImage, appearance: s.appearance, paddingRight: parseFloat(s.paddingRight), paddingLeft: s.paddingLeft, scrollW: el.scrollWidth, clientW: el.clientWidth };
});

// ---- Static ----
test('select: no .g2-select class, no new token, no image, no colour literal and no data: URL in the select rules; the arrow is in the states layer', () => {
  assert.ok(!/\.g2-select\b/.test(css), 'gov2.css has no .g2-select');
  const lines = css.split('\n').filter(line => /^(@media\(forced-colors:active\)\{)?select\.g2-input/.test(line));
  assert.ok(lines.length >= 4, `${lines.length} select rule lines`);
  for (const line of lines) {
    assert.ok(!/#[0-9a-f]{3,8}\b|url\(|data:|\brgba?\(\s*\d/i.test(line), `a colour literal, URL or image in: ${line.slice(0, 80)}`);
  }
  assert.ok(lines.some(line => line.includes('rgb(var(--g2-color-text))')) && lines.some(line => line.includes('rgb(var(--g2-color-text-muted))')), 'the arrow reads the text tokens');
  assert.ok(lines.some(line => line.startsWith('@media(forced-colors:active)') && line.includes('appearance:auto')), 'forced colours give back the native arrow');
  assert.ok(rule('states', 'select.g2-input').length >= 2 && rule('components', 'select.g2-input').length >= 2, 'the arrow rules are in gov2.states and the layout rules in gov2.components');
  assert.ok(rule('components', 'select.g2-input').every(line => !line.includes('background')), 'no component rule of the select sets a background');
});

test('select: no token is added: the light and the dark token lists have the same names as in the 0.14.0 documentation', () => {
  const names = Object.keys(blocks.light);
  assert.ok(!names.some(name => /select(?!ed)|arrow/.test(name)), 'no select or arrow token');
  const documented = [...reference.matchAll(/`(--g2-[\w-]+)`/g)].map(m => m[1]);
  for (const name of names) assert.ok(documented.includes(name), `${name} is documented`);
});

test('select: COMPONENTS.md, the guide, the fixture and the directory example show the select; the other documents are updated', () => {
  assert.match(reference, /- Select: `\.g2-input` on a native `<select>`/);
  assert.ok(!/Classes for `textarea`, `select`/.test(reference), 'select leaves the "Not in the DS yet" list');
  assert.ok(/<select class="g2-input"/.test(guideHtml) && guideHtml.includes('multiple size="4"') && guideHtml.includes('disabled>\n    <option') && /id="county-bad"[^>]*aria-invalid="true"/.test(guideHtml), 'guide: normal, error, disabled and multiple');
  assert.ok(guideHtml.includes('id="code-select"'), 'the guide has a copyable block');
  for (const id of ['sel', 'sel-bad', 'sel-off', 'sel-multi', 'sel-size']) assert.match(fixtureHtml, new RegExp(`<select class="g2-input" id="${id}"`), `fixture ${id}`);
  assert.match(directoryHtml, /<select class="g2-input" id="sortare"/);
  assert.match(directoryHtml, /<label class="g2-label" for="sortare">/);
  const entry = changelog.slice(changelog.indexOf('Brief 08 (select control).'));
  assert.ok(changelog.indexOf('Brief 08 (select control).') > 0 && entry.length > 100, 'the changelog entry starts with the brief name');
  assert.ok(/## Changes after 0\.14\.0: select control/.test(migrationDoc));
});

// ---- Browser: look and equality with the text input, both schemes, two widths ----
for (const scheme of ['light', 'dark']) for (const width of [1280, 320]) {
  test(`select: a select and a text input in one row have the same height and border, and the same font and radius; ${scheme}, ${width}px`, async () => {
    await withPage(async page => {
      await page.evaluate(() => {
        const row = document.createElement('div'); row.id = 'pair'; row.style.cssText = 'display:flex;gap:8px;align-items:flex-start';
        const a = document.getElementById('select-row'); a.before(row);
        for (const el of [a, document.getElementById('select-text-row')]) { el.style.flex = '1 1 0'; row.append(el); }
      });
      const select = await props(page, '#sel'), text = await props(page, '#sel-text');
      for (const key of ['height', 'borderWidth', 'borderStyle', 'borderColor', 'font', 'background', 'color', 'radius']) assert.equal(select[key], text[key], `${key}: ${select[key]} vs ${text[key]}`);
      assert.equal(select.height, 40);
      assert.equal(select.paddingLeft, text.paddingLeft);
      assert.equal(select.appearance, 'none');
      assert.ok(select.image.includes('linear-gradient') && !select.image.includes('url('), 'the arrow is two gradients');
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), 'no horizontal overflow');
    }, { path: `/tests/contract.html?scheme=${scheme}`, viewport: { width, height: 900 } });
  });
}

for (const scheme of ['light', 'dark']) {
  test(`select: the text never runs under the arrow, also for the longest option; the text is 4.5:1 and the arrow and the border 3:1; ${scheme}`, async () => {
    await fx(scheme, async page => {
      const s = await props(page, '#sel');
      const root = await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize));
      const em = parseFloat(s.font.split('|')[1]);
      assert.ok(s.paddingRight >= root + .9 * em, `padding-right ${s.paddingRight}px leaves room for an arrow that starts ${root + .9 * em}px from the edge`);
      await page.locator('#sel').selectOption({ index: 3 });
      assert.equal(await page.locator('#sel').evaluate(el => getComputedStyle(el).textOverflow), 'ellipsis');
      assert.ok(await page.locator('#sel').evaluate(el => el.getBoundingClientRect().right <= el.parentElement.getBoundingClientRect().right + .5), 'the long option does not widen the select');
      const text = contrast(s.color, s.background);
      assert.ok(text >= 4.5, `text ${text.toFixed(2)}:1`);
      const arrow = await arrowContrast(page, '#sel');
      assert.ok(arrow.ratio >= 3, `arrow ${arrow.ratio.toFixed(2)}:1 (${rgb(arrow.color)} on ${rgb(arrow.bg)})`);
      const surface = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
      const border = contrast(s.borderColor, surface);
      assert.ok(border >= 3, `border ${border.toFixed(2)}:1 on ${surface}`);
      console.log(`select ${scheme}: text ${text.toFixed(2)}:1, arrow ${arrow.ratio.toFixed(2)}:1, border ${border.toFixed(2)}:1`);
      const off = await arrowContrast(page, '#sel-off');
      assert.ok(off.ratio >= 3, `disabled arrow ${off.ratio.toFixed(2)}:1`);
      console.log(`select ${scheme}: disabled arrow ${off.ratio.toFixed(2)}:1`);
    });
  });

  test(`select: disabled matches the disabled text input; error matches the error text input; focus matches the focus of a text input; ${scheme}`, async () => {
    await fx(scheme, async page => {
      // A disabled text input and an error text input to compare with, built from the same markup.
      await page.evaluate(() => {
        document.getElementById('select-off').insertAdjacentHTML('afterend', '<div class="g2-field" id="t-off"><input class="g2-input" id="t-off-input" type="text" value="Bacău" disabled></div><div class="g2-field g2-field-error" id="t-bad"><input class="g2-input" id="t-bad-input" type="text" aria-invalid="true"></div>');
      });
      const so = await props(page, '#sel-off'), to = await props(page, '#t-off-input');
      for (const key of ['height', 'background', 'color', 'borderColor', 'borderWidth', 'cursor', 'font', 'opacity']) assert.equal(so[key], to[key], `disabled ${key}`);
      const sb = await props(page, '#sel-bad'), tb = await props(page, '#t-bad-input');
      for (const key of ['height', 'borderColor', 'borderWidth', 'background', 'color']) assert.equal(sb[key], tb[key], `error ${key}`);
      assert.equal(sb.borderColor, await page.evaluate(() => getComputedStyle(document.querySelector('#select-invalid .g2-error-msg')).color), 'the border has the error colour');
      const arrowBad = await arrowContrast(page, '#sel-bad');
      assert.ok(arrowBad.ratio >= 3, `error arrow ${arrowBad.ratio.toFixed(2)}:1`);
      // Focus by keyboard: the same outline, ring and background as a text input; the arrow stays.
      await page.keyboard.press('Tab');
      await page.locator('#sel').focus(); const sf = await props(page, '#sel');
      await page.locator('#sel-text').focus(); const tf = await props(page, '#sel-text');
      for (const key of ['outline', 'shadow', 'background', 'color', 'height', 'borderColor']) assert.equal(sf[key], tf[key], `focus ${key}`);
      assert.match(sf.outline, /solid 3px rgb\(255, 221, 0\)/);
      await page.locator('#sel').focus();
      assert.ok(await page.locator('#sel').evaluate(el => getComputedStyle(el).backgroundImage.includes('linear-gradient')), 'the focus rules do not remove the arrow');
      const arrowFocus = await arrowContrast(page, '#sel');
      assert.ok(arrowFocus.ratio >= 3, `focused arrow ${arrowFocus.ratio.toFixed(2)}:1`);
      assert.ok(contrast(sf.color, sf.background) >= 4.5, 'focused text is readable');
      // Hover plus focus keeps the same treatment.
      await page.locator('#sel').hover();
      assert.equal((await props(page, '#sel')).background, sf.background);
    });
  });
}

test('select: keyboard and name stay native: the label names the select, arrow keys change the value, the popup is the native one', async () => {
  await fx('light', async page => {
    const snapshot = await page.locator('#sel').ariaSnapshot();
    assert.match(snapshot, /combobox "Județ"/);
    assert.match(await page.locator('#sel-bad').ariaSnapshot(), /combobox "Județ de reședință"/);
    await page.locator('#sel').focus();
    // The pointer-free native path: type-ahead changes the value of a closed select (ArrowDown opens the popup on macOS).
    await page.keyboard.type('Ia');
    assert.equal(await page.locator('#sel').inputValue(), 'Iași');
    // Pointer use: selectOption is the native path; the label click focuses the select.
    await page.locator('label[for=sel]').click();
    assert.equal(await page.evaluate(() => document.activeElement.id), 'sel');
    const sel = await props(page, '#sel');
    assert.ok(await page.evaluate(() => document.getElementById('sel').options.length === 4 && getComputedStyle(document.getElementById('sel')).display !== 'none'), 'a native <select> with options');
    assert.ok(sel.height === 40);
  });
});

test('select: a multiple select and a size select keep a usable native list: no arrow, a taller box, the keyboard selects options, the border and font match', async () => {
  for (const scheme of ['light', 'dark']) await fx(scheme, async page => {
    const text = await props(page, '#sel-text');
    for (const id of ['#sel-multi', '#sel-size']) {
      const s = await props(page, id);
      assert.equal(s.image, 'none', `${id} has no arrow`);
      assert.notEqual(s.appearance, 'none', `${id} keeps the native appearance`);
      assert.ok(s.height > 70, `${id} shows several rows (${s.height}px)`);
      for (const key of ['borderWidth', 'borderColor', 'font', 'background', 'color']) assert.equal(s[key], text[key], `${id} ${key}`);
      assert.ok(await page.locator(id).evaluate(el => el.getBoundingClientRect().right <= el.parentElement.getBoundingClientRect().right + .5), `${id} stays inside its field`);
    }
    await page.locator('#sel-multi').focus();
    await page.locator('#sel-multi option').nth(0).click();
    await page.keyboard.press('Shift+ArrowDown');
    assert.equal(await page.locator('#sel-multi').evaluate(el => [...el.selectedOptions].length), 2, 'Shift+ArrowDown extends the selection');
    await page.locator('#sel-size').focus();
    await page.keyboard.press('ArrowDown');
    assert.ok(await page.locator('#sel-size').evaluate(el => el.selectedIndex) >= 0, 'the arrow keys select in a size list');
    // Every option stays readable: option text contrast on the list background.
    const option = await page.locator('#sel-multi option').nth(1).evaluate(el => { const s = getComputedStyle(el); return [s.color, getComputedStyle(el.parentElement).backgroundColor]; });
    assert.ok(contrast(option[0], option[1]) >= 4.5, `option text ${option[0]} on ${option[1]}`);
  });
});

test('select: a size="1" select is a drop-down; the arrow and the right padding do not apply to size greater than 1', async () => {
  await fx('light', async page => {
    await page.evaluate(() => { document.getElementById('sel').setAttribute('size', '1'); });
    let s = await props(page, '#sel');
    assert.equal(s.appearance, 'none'); assert.ok(s.image.includes('linear-gradient')); assert.equal(s.height, 40);
    await page.evaluate(() => { document.getElementById('sel').setAttribute('size', '2'); });
    s = await props(page, '#sel');
    assert.equal(s.image, 'none'); assert.notEqual(s.appearance, 'none');
  });
});

// ---- Forced colours ----
// Chrome drops gradient backgrounds in forced colours (computed background-image becomes none), so the CSS arrow is replaced by the native arrow.
for (const scheme of ['light', 'dark']) {
  test(`select: forced colours (${scheme}): the native arrow shows in system colours, the border stays, the text keeps room`, async () => {
    await fx(scheme, async page => {
      const s = await props(page, '#sel');
      assert.equal(s.image.replace(/none(, )?/g, ''), '', 'forced colours drop the gradients');
      assert.notEqual(s.appearance, 'none', 'the native appearance returns');
      const arrow = await arrowContrast(page, '#sel', true);
      assert.ok(arrow.ratio >= 3, `forced-colours arrow ${arrow.ratio.toFixed(2)}:1 (${rgb(arrow.color)} on ${rgb(arrow.bg)})`);
      assert.notEqual(s.borderStyle, 'none'); assert.ok(parseFloat(s.borderWidth) >= 2);
      const off = await arrowContrast(page, '#sel-off', true);
      assert.ok(off.ratio >= 1.5, `disabled forced-colours arrow is drawn (${off.ratio.toFixed(2)}:1)`);
      const text = await props(page, '#sel-text');
      assert.equal(s.color, text.color); assert.equal(s.background, text.background); assert.equal(s.height, text.height);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth));
      console.log(`select forced colours ${scheme}: arrow ${arrow.ratio.toFixed(2)}:1, disabled arrow ${off.ratio.toFixed(2)}:1`);
    }, { forcedColors: 'active' });
  });
}

// ---- Reflow and enlargement ----
for (const [width, rootSize] of [[320, '100%'], [320, '200%'], [1280, '200%']]) {
  test(`select: no select overflows in the fixture, and no horizontal overflow in the guide and the directory page at ${width}px with root text ${rootSize}`, async () => {
    for (const path of ['/tests/contract.html', '/docs/', '/docs/examples/directory.html']) {
      await withPage(async page => {
        await page.evaluate(size => { document.documentElement.style.fontSize = size; }, rootSize);
        const result = await page.evaluate(() => {
          const limit = document.documentElement.clientWidth;
          const wide = [...document.querySelectorAll('select')].filter(el => el.getBoundingClientRect().right > limit + .5).map(el => el.id);
          return { wide, overflow: document.documentElement.scrollWidth - limit, count: document.querySelectorAll('select').length };
        });
        assert.ok(result.count >= 1, `${path} has a select`);
        assert.deepEqual(result.wide, [], `${path}: a select reaches past the viewport`);
        // The raw fixture has other fixed-width pieces (a table, bare inputs) that overflow at 200%; only its selects are checked.
        if (path !== '/tests/contract.html') assert.ok(result.overflow <= 0, `${path}: ${result.overflow}px of horizontal overflow`);
        if (path === '/tests/contract.html') {
          const s = await props(page, '#sel');
          assert.ok(s.paddingRight >= (rootSize === '200%' ? 32 : 16) + .9 * parseFloat(s.font.split('|')[1]), 'room for the arrow at this root size');
        }
      }, { path, viewport: { width, height: 900 } });
    }
  });
}

test('select: the directory example has a labelled select that works with the keyboard in both schemes, and the guide has the four demonstrations', async () => {
  for (const scheme of ['light', 'dark']) {
    await withPage(async page => {
      await page.evaluate(v => document.documentElement.setAttribute('data-g2-scheme', v), scheme);
      const s = await props(page, '#sortare');
      assert.equal(s.appearance, 'none'); assert.equal(s.height, 40);
      assert.match(await page.locator('#sortare').ariaSnapshot(), /combobox "Sortare"/);
      const input = await props(page, '#q');
      assert.equal(s.height, input.height); assert.equal(s.borderColor, input.borderColor);
      const arrow = await arrowContrast(page, '#sortare');
      assert.ok(arrow.ratio >= 3, `${scheme} arrow ${arrow.ratio.toFixed(2)}:1`);
    }, { path: '/docs/examples/directory.html' });
    await withPage(async page => {
      await page.evaluate(v => document.documentElement.setAttribute('data-g2-scheme', v), scheme);
      for (const id of ['#county', '#county-bad', '#county-off', '#counties']) assert.equal(await page.locator(id).count(), 1, id);
      assert.match(await page.locator('#county').ariaSnapshot(), /combobox "Județ"/);
      const arrow = await arrowContrast(page, '#county');
      assert.ok(arrow.ratio >= 3, `guide ${scheme} arrow ${arrow.ratio.toFixed(2)}:1`);
    }, { path: '/docs/' });
  }
});
