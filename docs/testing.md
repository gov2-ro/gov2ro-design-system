# Checking the live guide

The guide loads `../gov2.css` directly. No build or generation step is required.
`guide.css` styles documentation layout; it must not repair core component appearance.

## Run locally

Use Node.js 20 or later.

```sh
npm ci
npx playwright install chromium
npm test
npm run dev
```

Open `http://127.0.0.1:4173/docs/`.
If Chrome is already installed, use `PLAYWRIGHT_CHANNEL=chrome npm test` instead of downloading Chromium.
Generate review screenshots with `GUIDE_ARTIFACT_DIR=/tmp/gov2-guide PLAYWRIGHT_CHANNEL=chrome npm test`.
The tests start their own server on a free local port and close it when finished.
`npm test` runs every `tests/*.test.mjs` file: `guide.test.mjs` (guide, contract, layers, migration), `foundation.test.mjs` (page foundations and the example pages), `fonts.test.mjs` (local fonts and file delivery), `scheme.test.mjs` (the dark colour scheme) and `sweep.test.mjs` (the title sweep) and `navigation.test.mjs` (navigation and data components) and `select.test.mjs` (the select control) and `select.test.mjs` (the select control).
`tests/helpers.mjs` holds the shared set-up: server, browser, page openers, the contrast and focus helpers, `tokenBlocks` (the light and the dark token values read from `gov2.css`), `setScheme` and `contrastReport`. `tests/woff2.mjs` reads the `cmap`, `fvar` and `name` tables of a WOFF2 file with Node's built-in Brotli. Neither is a test file.
With `GUIDE_ARTIFACT_DIR` set, the example-page reflow checks also save full-page screenshots at 1280, 390 and 320px (`example-directory-1280.png`, and so on).
The scheme checks also save the guide and both example pages in the light and the dark scheme at 1280 and 320px, in chunks of 3000px (`scheme-guide-dark-320-01.png`, and so on). Each chunk is checked against its expected size: a single full-page capture of a very tall page can repeat content.

## Automated coverage

The suite checks the stylesheet through the browser, with no guide CSS in the raw component fixture.
It covers metadata, local links, IDs, component coverage, labels and descriptions, no-JavaScript reading,
copy helpers and their failure path, toggle and dismissal behaviour, live stylesheet changes,
320/390/768/1280px layouts, a 200% zoom check, component geometry with/without a reset,
keyboard focus, hover plus focus, disabled/selected/error states, text contrast, forced colours and reduced motion.

The contract checks cover whole-site activation, the `--g2-` namespace and that every `var()` resolves,
the six status names in tokens, rules, reference, guide and fixture, and the layer order and structure of `gov2.css`.
They also check that `COMPONENTS.md` documents every token and class, and that the token tables in
`docs/migration-from-0.6.0.md` match `gov2.css` value for value.

The suite runs the code blocks marked `<!-- example: … -->` in `docs/migration-from-0.6.0.md`: a standalone page,
a page with a reset and project CSS in layers, and an `@import` into layers. It checks layer precedence
(reset, gov2, utilities, app, and unlayered rules), a project rule that wins in `app`, a compact variant,
a page-width token override, a recoloured variant, keyboard focus and hover plus focus after customization.
It also checks the documented limits: a late-layer colour rule replaces the gov2 focus colours,
an unlayered rule outranks all layers, and a layer that exists before the order declaration keeps its position.

The fixture `tests/contract.html` takes `?reset=1` (a host reset in the `reset` layer) and `?reset=unlayered`
(a host reset outside every layer, which is an unsupported integration). The geometry checks run in all three modes.

### Page foundations and example pages (`tests/foundation.test.mjs`)

Static checks: the decided token names and values; the new classes in `COMPONENTS.md`, the live guide, the raw fixture and `gov2.css`;
the example pages use only classes that `gov2.css` defines or that `examples.css` defines with the `ex-` prefix; `examples.css` is one `@layer app` block with no `.g2-*` selector,
no hidden overflow, no `!important`, no colour literal and no unknown token; the guide describes every local class.

Raw component checks (`tests/contract.html`, no guide CSS): rule placement in the sublayers; converted sizes equal to the old px values at a 16px root; the decided sizes of the new roles;
the container at 320, 390, 768, 1280 and 1600px; the field stack and the disabled field; the root text size at 16, 20 and 32px (type, spacing, gutter, no clipping).

Page checks (`docs/examples/*.html`, real `gov2.css`): structure, IDs, labels, descriptions, heading order and local links; reflow at 320, 390, 768 and 1280px with the same controls at every width;
enlargement (a 640px viewport, root text 150% and 200% at 320, 640 and 1280px, and CSS zoom 2) with clipping and overflow checks and operable controls;
keyboard order against the source order, with disabled controls skipped; recovery by click and by keyboard, with focus on the field, the label in view and the path on to the actions;
accessible name, description and invalid or disabled state through the Chrome accessibility tree; text and field-boundary contrast on the rendered surfaces and a focus indicator of at least 3:1;
hover plus focus and the current selection; forced-colour emulation; JavaScript disabled with the local font files blocked (the fonts that render are not web fonts); and the documented width and density example from `docs/migration-from-0.6.0.md`.

External requests are blocked during checks, and a check fails if a page tries one. A page that links only `gov2.css` makes no font request.

### Fonts and file delivery (`tests/fonts.test.mjs`)

Static checks read the shipped files: `gov2.css` has no `@import`, no remote URL and no `@font-face`, and keeps the two family tokens with their fallback stacks;
`fonts.css` has only `@font-face` rules (no layer, token or type rule) with `font-display: swap`, `format("woff2")` and relative `fonts/` URLs, and declares every shipped file;
`fonts/README.md` lists every file with its exact size and SHA-256, the upstream font version read from each file, the package versions and the licence paths and checksums, and both OFL notices are present.
Romanian coverage is read from the font files, not from documentation: the `cmap` table of each WOFF2 file must contain Ă ă Â â Î î Ș ș Ț ț in the file that `fonts.css` selects for that code point (the face that the browser picks, where `unicode-range` values overlap).
The `fvar` table must give Inter a weight axis from 400 to 700 or wider. Every weight that `gov2.css` names must be in the shipped ranges.

Browser checks (`tests/contract.html`, the example pages and the guide):

- Core only: the fixture and the minimal page of the migration document make zero font requests and zero external requests, and define no `@font-face`.
- With `fonts.css`: only the documented files under `/fonts/` are requested, each once, each with status 200 and the recorded size, no external request, every face `swap`, and the files that the page needs have loaded.
- Romanian samples: Chrome's platform-font query (`CSS.getPlatformFontsForNode`) shows that every glyph of the sample is painted with the shipped Inter or Fragment Mono (`isCustomFont`), and the four Inter weights have four different widths (a variable axis, not a synthetic bold).
- Fallback: with the font files blocked, every face fails, monospace text uses another font, and the fixture and both example pages show visible controls and no horizontal overflow at 320, 390 and 1280px.
  Chrome falls back to an installed Inter when a web font fails, and the machine that runs the suite may have Inter. So the suite also removes `"Inter"` from the stack of `--g2-font-sans` (the list that a browser walks on a machine without Inter), checks that the text renders in another family, and checks for overflow again. The h1 text width differs by 0.5% to 3.6% between the two stacks in the recorded run, so the fallback is a different set of metrics.
- Subpath: the real `gov2.css`, `fonts.css` and `fonts/` files are served from the site root and from three subpaths (linked by an absolute path, a relative path and a `../` path). Every font request goes below the subpath, and the shipped Inter renders.
- Content-Security-Policy: with `default-src 'none'; style-src 'self'; font-src 'self'` the fonts load with no violation. Without `font-src` the browser refuses them and the page stays readable. A core-only page needs no `font-src`.
- Install procedure: the commands of the README block *Install from an exact tag* run in a temporary directory against a throwaway repository with a tag, and every required file is copied unchanged.
  The check serves only the three documented paths, so a file outside them cannot hide a missing dependency.
- Documentation: the changelog lists the removed import under **Breaking** with the fix, and no current document calls the fonts optional or says that the stylesheet imports them.

### Dark colour scheme (`tests/scheme.test.mjs`)

`tests/baseline/gov2-0.11.0.css` is a byte copy of `git show v0.11.0:gov2.css`, the last release before the scheme. A test checks its SHA-256. When a later release changes the colours, replace the file with that release and update the hash.

Static checks read `gov2.css`, the guide and the reference: the four new tokens and their light values; no colour literal outside the token layer (a detector, tested against the eight literals of 0.11.0); the dark block and the auto block are equal and set only colour tokens that exist;
the tokens that keep their light value are the documented ones (the header group, focus, the tricolour and its ring); each colour token has its hex value in a trailing comment that matches its channels; every text pair of ADR 0009 meets 4.5:1, every border and graphic pair meets 3:1,
each status tone meets its pairs, the visited link is as far from the link as in the light scheme, the chart ramp keeps its order of emphasis; the guide tables equal the contrast that the tokens give; the reference, the guide, the other documents and the changelog name the attribute and the tokens.

Browser checks (acceptance 1 to 11 of brief 05):

- **Acceptance 1.** The fixture, both example pages and the guide are loaded with the 0.11.0 stylesheet and with the current one, without an attribute and with `light`. A fingerprint of every longhand computed property of every element (except `color-scheme` and custom properties) must be equal at rest.
  The same holds for hover, keyboard focus and focus plus hover of every fixture control (25), and of one control for each distinct class and state on the other pages. A second check proves that the fingerprint tells the dark scheme from the light scheme.
- **Acceptance 2 and 3.** Eleven combinations of the emulated `prefers-color-scheme` and the attribute (none, `light`, `auto`, `dark`, an unknown value, a capitalised value, an empty value) must give the light or the dark token values and the matching `color-scheme`. The native `select`, `textarea`, date field and the system colours `Canvas`, `Field` and `ButtonFace` follow the scheme.
  The scrollbar is measured from pixels in a second browser that keeps classic scrollbars (Playwright hides them in headless Chrome by default).
- **Acceptance 4 to 7.** Text contrast on the rendered surfaces in the dark scheme (fixture, guide with every code block open, both example pages, and the two guide previews); the borders of fields, the selected chip, the error bar and the keyboard focus indicator against their surfaces; each status tone as rendered; and hover, focus, hover plus focus, disabled, selected and error states, in both schemes.
- **Acceptance 8.** With forced-colour emulation, every element and the control states compute the same in the light and in the dark scheme.
- **Acceptance 9.** Every `var(--g2-…)` of `gov2.css`, `guide.css` and `examples.css` has a value in the light, dark and auto schemes.
- **Acceptance 11.** The guide and both example pages have no horizontal overflow in either scheme at 1280 and 320px.

### Title sweep (`tests/sweep.test.mjs`)

The band is measured from pixels. A test pauses the CSS animation at a known time (`Animation.currentTime`), takes a screenshot of the title and counts the pixels of each tricolour colour in the PNG.
"Plain" means the same element with the class removed: a check compares the pixels of the sweep with the pixels of ordinary text.
Most checks run at the real size and at 64px, where the glyphs have interiors of one colour. `tests/contract.html` has the two documented hosts: a `.g2-wordmark` link and a title heading, each in a `.g2-header`. A real page uses the class once.

Static checks read `gov2.css`, the documents and the guide: the decided names (`.g2-ro-sweep`, `g2-ro-sweep`) and no token with "sweep" in its name; the transparent fill is written once, inside `@supports`; the band reads the three tricolour tokens and `currentColor`;
the cycle is 9s or more and the sweep keyframes last 3s or less; the static position is the first keyframe; the rule for forced colours and print; the focus rules. Every "never text" in `gov2.css`, `COMPONENTS.md`, `GUIDELINES.md`, `CLAUDE.md` and `AGENTS.md` names the exception.
`COMPONENTS.md` has the section, the markup, both deviations, the scope and the statement text; `GUIDELINES.md` has the checklist question. The guide has one live use, the markup, both deviations in Romanian, and contrast numbers that equal the ones that the tokens give. The changelog entry is found by its title ("Brief 06 (tricolour title sweep)"), not by the `## Unreleased` heading.

Browser checks (acceptance 1 to 10 of brief 06):

- **Acceptance 1.** At rest (the cycle at 6s) and with `animation: none !important` (the static frame), every solid glyph pixel has the host colour, and the picture equals ordinary text. This holds in the light scheme, the dark scheme and `auto` with the system in dark mode, for both hosts.
  At the real size, 3 pixels of the wordmark differ: the box of the span clips the faint antialiased edge of the last glyph. At 64px none differ.
- **Acceptance 2.** With `prefers-reduced-motion: reduce`, no sweep animation runs, the computed style has no background, and four screenshots over 1.8s show no band and equal ordinary text. The control (no preference) runs both animations.
- **Acceptance 3.** The animation timing is read from `getComputedTiming()` (9000ms, linear, infinite) and from real time (it advanced 1000ms in 1000ms). Pixel sampling at 100ms steps over one cycle gives the time that the band is over the glyphs, and checks that it crosses once, with no gap.
  The contrast of each band colour is measured from the painted pixels, on the header and on the page, in both schemes, and compared with ADR 0010.
- **Acceptance 4.** Keyboard focus, and focus plus hover, on the host link: yellow background, ink text (14.55:1), the span paints its text with no band, also when the animation is in the middle of the band, and the picture equals ordinary text on the focus colour. The band returns after blur. An element that carries the class and has `tabindex` shows plain text on focus too.
- **Acceptance 5.** Forced-colour emulation (light and dark) and print emulation: no animation, no background, and the picture equals ordinary text.
- **Acceptance 6.** Two simulations of a browser without `background-clip: text`: the `@supports` block removed from `gov2.css`, and a false `@supports` condition. The text is plain in both. A control checks that the real stylesheet makes the fill transparent.
- **Acceptance 7.** The accessibility tree of the link is the same with and without the class (`ariaSnapshot`); the role queries find the link and the heading by the title text; the element has no child element; `user-select` is `auto`; a text selection returns the title. The selected glyphs stay visible, with less contrast than plain text (see *Manual checks*).
- **Acceptance 8.** The computed style of the link in rest, hover, focus and focus plus hover is equal with and without the class, and equal to the plain wordmark of the fixture.
- **Acceptance 9 and 10.** The document checks above; the component rule sits in `gov2.components` and the focus rule in `gov2.states` (read from the CSSOM); the guide demonstration runs in both schemes, the guide keeps its text contrast, and the demonstration takes focus.
  `tests/scheme.test.mjs` compares the guide and the fixture with the 0.11.0 stylesheet, and skips an element that has `.g2-ro-sweep` (the old stylesheet has no rule for it). Every other element, including the host link, must still match.
  The existing archive checksum test is unchanged.

With `GUIDE_ARTIFACT_DIR` set, the sweep checks also save screenshots of the fixture and of the guide demonstration, in the light and the dark scheme, at 1280 and 320px, at rest and in the middle of the band (`sweep-guide-dark-320-band.png`, and so on).

### Navigation and data components (`tests/navigation.test.mjs`)

Brief 07 (issues #3 to #8). The raw fixture `tests/contract.html` has each piece, so the checks run without documentation CSS, in the light and the dark scheme (`?scheme=`). The changelog entry is found by its first line ("Brief 07 (navigation and data components)."), not by the `## Unreleased` heading or a version number.

Static checks: the decided class names and the token in `gov2.css`, `COMPONENTS.md`, the guide and the fixture; the light value `#fff7bf` and the dark value `#5c4d00`, equal in both dark blocks; the rules sit in `gov2.components`, `gov2.base` (the `mark` rule) and `gov2.states` (every focus rule); `examples.css` has no `ex-skip` or `ex-facts`, the guide has no `guide-skip`; both example pages use the skip link, breadcrumbs and `tabindex="-1"` on `main`; every `.g2-table` in the documents has a caption or a name and `scope` on each header cell; the archive SHA-256.

Browser checks:

- **Highlight.** Text on the highlight is 18.01:1 (light) and 7.46:1 (dark); the highlight is at least 40 CIE76 units from the focus yellow in both schemes (60.8 and 72.5); the rendered `mark` uses the token and the text colour; forced colours still mark the word.
- **Breadcrumbs.** A long current item wraps (3 or more lines at 320px), is not clipped (`text-overflow: clip`, no `nowrap`, `scrollWidth <= clientWidth`) and the page does not overflow. The accessibility tree of the `<nav>` (`ariaSnapshot`) has no `/`. The current item has `aria-current="page"` and no link. The separator has the faint text colour. A link is at least 24px high. Focus and hover plus focus on a link.
- **Pagination.** Every link is at least 44px by 44px at 1280 and 320px. The current link has a border; the others have none. No disabled link. Focus and hover plus focus. The directory example has no `rel="prev"` link. Forced colours: the current link differs from the others.
- **Table.** Header surface and label size, row rules, right-aligned tabular numeric cells (header too), the caption. `.g2-table-stacked`: at 1280px the parts are table elements; at 390px every part is `display: block`, the header row is 1px and clipped, each cell shows its `data-label`, and a numeric cell aligns left.
  The Chrome accessibility tree is read through the DevTools protocol (`Accessibility.getFullAXTree`) at both widths, for a stacked table without roles and one with explicit roles: table, rowgroup, row, columnheader, rowheader and cell are present, and at 390px the cell name includes its label. `ariaSnapshot` agrees. `.g2-table-wrap`: `tabindex="0"`, `role="region"` and a name; a 900px table scrolls inside a 390px page without page overflow; the arrow key scrolls it; focus shows a yellow outline and an inner ring with no fill, also with hover.
- **Summary list.** Wide: label and value share a line and the values align. At 320px: value under label, inside the viewport, a long value wraps. One rule between rows (none above the first). Label 14px and muted.
- **Skip link.** First focusable element in the source and the first Tab stop; 1px and clipped before focus; with focus it is visible inside the viewport with the yellow fill (also with hover) and 4.5:1 text; it fits 320px; forced colours keep an outline. Enter moves focus to `main`, the hash changes, `main` has no fill, shadow or outline, and the next Tab leaves the link. Both example pages: Tab order is skip link, wordmark, four navigation links, first breadcrumb.
- **The `tabindex="-1"` fix.** A `div` and a `section` with `tabindex="-1"` get no fill; a `button`, a `role="tab"` element and a `a[href]` with `tabindex="-1"` keep the yellow fill.
- **Overflow.** The guide and both example pages, light and dark, at 320, 390, 768 and 1280px with every code block open, and with the root text at 200%: no horizontal page overflow.
- **Contrast.** Every rendered text pair in the fixture (95 text nodes) and in the new guide section (185 text nodes with every code block open), in both schemes.
- **Guide.** The demonstrations and the copy buttons; the 360px frame stacks the table and the markup carries explicit roles.
- `tests/scheme.test.mjs` removes the new pieces and `mark` from both documents before it compares the guide, the fixture and the example pages with the 0.11.0 stylesheet; every other element must match.

### Select control (`tests/select.test.mjs`)

Brief 08 (issue #10). The raw fixture `tests/contract.html` has a drop-down, an error select, a disabled select, a `multiple` select and a `size` select, in the light and the dark scheme (`?scheme=`). The changelog entry is found by its first line ("Brief 08 (select control)."), not by a version number.

- **Static.** No `.g2-select` class; the select rules have no colour literal, no `url(` and no `data:`; the arrow reads `--g2-color-text` and `--g2-color-text-muted`; the arrow rules are in `gov2.states`, the layout rules in `gov2.components` and no component rule of the select sets a background; no new token; the select appears in `COMPONENTS.md`, the guide, the fixture and the directory example.
- **Equality.** A select and a text input in one flex row have the same height (40px), border width, style and colour, font, background, text colour and radius, at 1280 and 320px, in both schemes.
- **Arrow and text.** The padding leaves room for an arrow of 1rem plus 0.9em; a long option is clipped with an ellipsis and does not widen the select. The arrow is measured from rendered pixels (the screenshot drawn on a canvas): the strongest pixel against the select background.
- **Disabled, error and focus.** The disabled select equals the disabled text input (colours, cursor, font, `opacity`), the error select equals the error text input, and the focus outline and ring equal those of a text input. The focus rules do not remove the arrow.
- **Native use.** The label names the select (`combobox "Județ"` in the accessibility tree). Type-ahead changes the value of a closed select. A `multiple` and a `size` select keep the native appearance, show several rows, have no arrow, and select options by keyboard. `size="1"` is a drop-down; `size="2"` is a list.
- **Forced colours.** Chrome emulation drops the gradients, so the select returns to `appearance: auto` and the native arrow shows. The arrow is measured in system colours.
- **Reflow.** No select reaches past the viewport in the fixture, the guide and the directory page at 320px with root text 100% and 200%, and at 1280px with 200%. The guide and the directory page have no horizontal overflow. The raw fixture itself overflows at 200% for pieces other than selects (a table, bare inputs): it is not checked as a whole.
- `tests/scheme.test.mjs` removes `select` from both documents before it compares with the 0.11.0 stylesheet.

## Manual checks

### Dark colour scheme

- Look at the dark scheme in Safari and Firefox, and on a real phone with the system dark mode. The suite runs only in Chrome.
- Check the native `select`, `textarea`, checkbox, radio and date controls of a real project in the dark scheme. The DS has no class for them; they follow `color-scheme` only.
- Check a project's own colours (literals written for a light page) on a dark page before the project opts in.
- Review forced colours on a real Windows system in both schemes. The suite uses Chrome's emulation.
- Check how the browser paints the page before the stylesheet loads, for a reader with the dark system setting and `data-g2-scheme="auto"`. This is not measured.

### Title sweep

- Look at `.g2-ro-sweep` in Safari and Firefox: the band, the rest, the keyboard focus and the plain text in a browser without `background-clip: text`. The suite runs only in Chrome.
- Select the title with the mouse in each browser. In Chrome the selected glyphs show through the selection colour, with less contrast than plain text: 3.18:1 against 4.74:1 on the default selection colours (64px, measured). Check the selection in a real project.
- Open a page with the sweep in a screen reader: the link and the heading are read by their text, and nothing is read twice.
- Check forced colours on a real Windows system, and a real print or PDF preview, with and without the print of background graphics.
- Change the system setting for reduced motion while a page is open, and check that the band stops.
- Look at a long title that wraps to two or three lines on a narrow screen. The wordmark host is one block, so the band crosses every line at once. The heading host is inline and paints one strip across its line fragments, so the band crosses line 1, then line 2.
  This was looked at once, at 320px, and is not asserted.
- A project that adopts the class lists both deviations in its accessibility statement. Check the wording with the owner of the statement.

### Navigation and data components

- A screen reader pass over the stacked table in Safari (VoiceOver) and Firefox (NVDA): the suite measures Chrome only. Without explicit roles, Safari and Firefox can drop the table semantics under `display: block`.
- The skip link, the focused table wrapper and the breadcrumb separator (`content: "/" / ""`) in Safari and Firefox. A browser without the alternative-text syntax shows the same `/` and can announce it.
- Real forced colours on Windows for the pagination and the `mark` colours.
- The cell name in the stacked table repeats the label ("Posturi 12"): listen to how a screen reader reads it.

### Fonts

- Open a page with `fonts.css` on a machine that has no Inter installed, in Safari and in Firefox. Check that Romanian text in titles and body text shows the comma-below shapes of ș and ț, and that weights 400 to 700 look different.
  The suite runs only in Chrome, where Inter is installed on the maintainer machine. It proves the fallback stack by removing the first family, not by running on a machine without Inter.
- Serve the files from a real host below a subpath, with the real Content-Security-Policy header of that host, and check the network panel. The suite emulates the server.
- If fonts are ever served from another origin, check the `Access-Control-Allow-Origin` header and `font-src`. No second origin or CDN is configured, so this is untested.
- Check the page on a slow connection: the text shows in the system font first and swaps. Check that the swap does not shift the layout in a way that hides content. The suite measures overflow with the web fonts and with the fallback, not the shift between them.

### Visited links

1. Serve the guide and open it in a normal browser profile with history enabled.
2. Choose an unvisited in-text or title link with a distinct destination.
3. Follow the link, then return with the browser's Back action.
4. Confirm the visited colour on in-text/title links. Quiet and inverse links keep their normal colour.
5. Repeat with keyboard focus and hover; focus must remain readable.
6. Record the browser/version, destination, result and any history restrictions.

Browser privacy protections conceal visited-state information from ordinary script observations.
Do not infer success from `getComputedStyle()` alone. Hover is independently testable in headless mode.

### Assistive technology and enlargement

- Check landmark and heading navigation, names, field hints/errors and toggle state with a screen reader.
- Check browser-native 200% zoom and text enlargement, not only the automated CSS zoom fixture.
- Review forced-colour rendering on a supported operating system. Browser emulation is a useful supplement.
- Inspect keyboard focus visibility, clipping and scroll position throughout the guide.
- Verify representative pages in additional browser engines before claiming cross-browser coverage.

### Page foundations: what the automated checks do not cover

- Screen reader pass on both example pages: the error summary, the recovery links, the field names and descriptions, the disabled field, and the landmarks. The accessibility-tree checks use Chrome only.
- Native browser zoom at 200% and 400%, and an operating-system text size setting. The suite emulates them with a narrow viewport, a larger root font size and CSS zoom.
- WCAG 1.4.12 text spacing: apply the text-spacing bookmarklet or a user style sheet and check that nothing clips.
- Real forced-colours rendering on Windows (the suite uses Chrome's emulation) and the `Highlight` colours of the current link and the selected chip.
- Firefox and Safari. The disabled field in Safari and on iOS can show a browser style of its own; this is not measured.
- Visited links on the result titles (see *Visited links*).
- Keyboard focus visibility while the page scrolls after a recovery link, on a phone-sized screen with an on-screen keyboard.

The automated suite does not establish full WCAG conformance. Record actual coverage and remaining gaps in `ACTIVITY.md`.

### Select control

- Open a drop-down in Safari, Firefox and on a phone: the native popup is not styled by the DS. In the dark scheme the popup follows `color-scheme` and the select colours; this is not measured outside Chrome.
- Real forced colours on Windows: the select returns to the native look; look at the arrow and the disabled state.
- A screen reader reads the label, the hint and the error with the select (only the Chrome accessibility tree is measured).

## Last recorded run

2026-10-27 (brief 08), Chrome 156.0.8078.48 (installed Chrome):
258 run, 257 passed, 0 failed, 1 skipped (the scrollbar check, overlay scrollbars), 0 TODO, 385.1 seconds. Before the change the suite had 238 checks; `select.test.mjs` has 20. Command: `PLAYWRIGHT_CHANNEL=chrome npm test`. The archive checksum is unchanged (`3cdbe56f…1952`).
Measured: select text 19.59:1 (light) and 17.52:1 (dark); arrow 19.59:1 and 17.52:1; border 19.59:1 and 17.52:1 (the control border is the text colour); disabled arrow 6.33:1 and 7.51:1; native arrow in forced colours 21.00:1.
Reviewed by eye: the fixture block, the guide demonstration and the directory search row at 1280 and 320px in both schemes. Not performed: every item under *Select control* in the manual checks, and a second browser engine.

2026-10-27 (brief 07), Chrome 156.0.8078.48 (installed Chrome):
238 run, 237 passed, 0 failed, 1 skipped (the scrollbar check, overlay scrollbars), 0 TODO, 331.7 seconds. Before the change the suite had 204 checks; `navigation.test.mjs` has 34. Command: `PLAYWRIGHT_CHANNEL=chrome npm test`. The archive checksum is unchanged (`3cdbe56f…1952`).
Measured: Chrome keeps the table semantics of the stacked table at 390px, with and without explicit roles; text on the highlight 18.01:1 (light) and 7.46:1 (dark); lowest rendered text 4.86:1 (fixture, light) and 6.21:1 (guide section, light).
Reviewed by eye: the guide section 13 and both example pages at 1280 and 320px in both schemes. Not performed: every item under *Navigation and data components* in the manual checks, and a second browser engine.

2026-10-27 (brief 06), Chrome 156.0.8078.48 (installed Chrome):
212 run, 211 passed, 1 failed, 0 skipped, 0 TODO, 283.2 seconds, with `GUIDE_ARTIFACT_DIR` set (`guide.test.mjs` 60 checks, `foundation.test.mjs` 47, `fonts.test.mjs` 23, `scheme.test.mjs` 52, `sweep.test.mjs` 30).
Without `GUIDE_ARTIFACT_DIR` the sweep file has 22 checks (57.4 seconds alone) and the suite has 204. The archive checksum is unchanged (`3cdbe56f…1952`). Before the change the suite had 182 checks.
The failed check is `scheme: the scrollbar of a native scroll container follows the active scheme`: "this browser draws a classic scrollbar". It failed the same way on a clean copy of v0.12.0, so it is the machine: macOS draws overlay scrollbars when no mouse is attached. From 0.13.0 the check skips when the scrollbar has no gutter; check the scrollbar by hand on such a machine.
Command: `GUIDE_ARTIFACT_DIR=<dir> PLAYWRIGHT_CHANNEL=chrome npm test`.
Measured in this run (from pixels): the band is over the glyphs from 500ms to 2500ms of a 9000ms cycle (at most 2.1s), and the title is plain for the other 6.9s. Contrast of the band colours on the header: blue 1.54:1, red 3.48:1, yellow 13.31:1; yellow on white 1.47:1; rest 19.59:1 on the header (both schemes) and 17.52:1 on the dark page; focus 14.55:1.
At the real size 3 pixels of the wordmark differ from ordinary text (the clipped antialiased edge of the last glyph); at 64px none differ. Selected text: 3.18:1 against 4.74:1 for plain text (Chrome default selection colours).
Reviewed by eye: the guide demonstration and the fixture at 1280 and 320px in both schemes, at rest and in the middle of the band; a long title that wraps at 320px.
Not performed: every item under *Title sweep* in the manual checks, and a second browser engine.

2026-10-27 (brief 05), Chrome 156.0.8078.48 (installed Chrome):
182 passed, 0 failed, 0 skipped, 0 TODO, 209.8 seconds (`guide.test.mjs` 60 checks, `foundation.test.mjs` 47, `fonts.test.mjs` 23, `scheme.test.mjs` 52; `scheme.test.mjs` alone 91.8 seconds).
Command: `GUIDE_ARTIFACT_DIR=<dir> PLAYWRIGHT_CHANNEL=chrome npm test`. The archive checksum is unchanged (`3cdbe56f…1952`). Before the change the suite had 130 checks (115.4 seconds, rerun at the start).
Measured in this run: dark text pairs on the rendered surfaces (lowest 6.24:1 in the fixture and both example pages, 5.82:1 in the guide with every code block open); native `select`, `textarea` and date field, `Canvas` and the scrollbar follow `color-scheme`; the tricolour on the dark page (blue 1.54:1, yellow 13.31:1, red 3.48:1).
Reviewed by eye: the guide and both example pages in both schemes at 1280 and 320px (screenshots saved in chunks of 3000px; the guide at 320px has 12 chunks, of which the first, the second and the one with the colour section were looked at).
Not performed: every item under *Dark colour scheme* in the manual checks, and a second browser engine.

2026-10-26 (brief 03), Chrome 155.0.8059.85 (installed Chrome):
130 passed, 0 failed, 0 skipped, 0 TODO, 117.5 seconds (`guide.test.mjs` 60 checks, `foundation.test.mjs` 47, `fonts.test.mjs` 23; 24.6 seconds alone).
Command: `GUIDE_ARTIFACT_DIR=<dir> PLAYWRIGHT_CHANNEL=chrome npm test`. The archive checksum is unchanged (`3cdbe56f…1952`).
Before the change the suite had 107 checks (about 86 s, as handed over; not rerun). Measured network, example page `directory.html`: before, 5 third-party requests (one Google Fonts stylesheet of 11,251 bytes and four font files of 156,140 bytes); after, no third-party request and four local font files of 172,660 bytes plus `fonts.css` of 2,296 bytes. A core-only page makes no font request.
Not performed: the manual checks under *Fonts*, and a second browser engine.

2026-10-26 (brief 04), Chrome 155.0.8059.85 (installed Chrome, because the bundled Chromium is not installed on this machine):
106 passed, 0 failed, 0 skipped, 0 TODO, 84.0 seconds (`guide.test.mjs` 59 checks, `foundation.test.mjs` 47 checks).
Command: `GUIDE_ARTIFACT_DIR=<dir> PLAYWRIGHT_CHANNEL=chrome npm test`. The archive checksum is unchanged (`3cdbe56f…1952`).
Measured on the example pages in this run: 127 text nodes on the directory page (lowest ratio 5.17:1, the notice title) and 64 on the form page (lowest 4.86:1, the red error text);
under forced-colour emulation the lowest ratio is 11.30:1 on both pages. 37 controls on the directory page and 21 on the form page (19 tab stops).
Reviewed by eye: both pages at 1280px, the form at 320px, both pages at 390px, crops of the directory at 320px, and the changed guide sections 03, 08, 10 and 11. The `GUIDE_ARTIFACT_DIR` screenshots of the other guide sections at 320px were not reviewed.
Not performed: every item under *Page foundations: what the automated checks do not cover*, and a second browser engine.

2026-10-26 (brief 01), Chrome 155.0.8059.85:
59 passed, 0 failed, 0 skipped, 0 TODO, 43.6 seconds.
Command: `PLAYWRIGHT_CHANNEL=chrome npm test`. A copy of the working tree without `node_modules` passed after `npm ci --prefer-offline` (58 of 58 checks at that time, 41.6 seconds; the 59th check came later).
The brief 01 migration added 23 checks. The two earlier TODOs are now executable assertions.

Before the migration, the same command gave 36 passed, 0 failed, 2 TODO in 29.6 seconds.
Reviewed: desktop and 390px screenshots of the changed installation section, and a computed-style comparison of the guide against 0.7.0. Not performed: review of the 320px screenshots and of the other 390px sections, and every manual procedure above (visited links, screen readers, native zoom, forced colours on a real system, other browser engines).

Archive follow-up (earlier run): nine focused checks passed in Chrome 155.0.8059.85, including exact snapshot checksum,
original-bundle rendering, archive navigation, no-JavaScript reading and 320/390/768/1280px reflow.
