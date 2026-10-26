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
`npm test` runs every `tests/*.test.mjs` file: `guide.test.mjs` (guide, contract, layers, migration) and `foundation.test.mjs` (page foundations and the example pages).
`tests/helpers.mjs` holds the shared set-up: server, browser, page openers and the contrast and focus helpers. It is not a test file.
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
hover plus focus and the current selection; forced-colour emulation; JavaScript disabled with web fonts blocked (the fonts that render are installed fonts, not web fonts); and the documented width and density example from `docs/migration-from-0.6.0.md`.

External requests are blocked during checks. This makes the system-font fallback reproducible.
The current stylesheet still imports Google Fonts. Removing that request and testing optional local fonts belongs to brief 03.

## Manual checks

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
