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
`npm test` runs every `tests/*.test.mjs` file: `guide.test.mjs` (guide, contract, layers, migration), `foundation.test.mjs` (page foundations and the example pages) and `fonts.test.mjs` (local fonts and file delivery).
`tests/helpers.mjs` holds the shared set-up: server, browser, page openers and the contrast and focus helpers. `tests/woff2.mjs` reads the `cmap`, `fvar` and `name` tables of a WOFF2 file with Node's built-in Brotli. Neither is a test file.
With `GUIDE_ARTIFACT_DIR` set, the example-page reflow checks also save full-page screenshots at 1280, 390 and 320px (`example-directory-1280.png`, and so on).

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

## Manual checks

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

## Last recorded run

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
