# Activity

## 2026-10-27 — The civtech sweep (tests and documents; ADR 0010 amendment, 0.16.0)

**Done**
- The maintainer (Opus) changed `gov2.css` (`.g2-ro-sweep`, keyframes `g2-ro-sweep`) to the civtech effect. I did not change the CSS values. I adapted tests and documents.
- `tests/sweep.test.mjs`: the static timing check now asserts a 7s linear infinite loop, exactly two keyframes (`100% 0` to `0 0`), the civtech gradient, and a static position equal to the first keyframe. The "crossing at most 3s" and "rest at least 6s" assertions are gone. The timing check keeps pixel sampling over one cycle, asserts no band in the first and the last frame, and logs the band time. "At rest" checks use t=0 and the static frame, with strict pixel equality kept. The contrast check samples a whole cycle at 50ms steps and measures the lowest contrast of band-tinted solid glyph pixels. Focus checks and screenshots use the measured middle of the crossing (3500ms) instead of 1500ms, and the rest screenshot uses t=0.
- New band detector. The band is blended, so exact-token pixel counts no longer work. A pixel is "tinted" when it is solid (all four neighbours within 6 per channel) and far (more than 12) from every mix of the neutral header, page and text colours and from the colours of the same area with the class removed.
- Documents: `COMPONENTS.md` (*Title sweep*), the guide (`docs/index.html`, the Romanian text and the accessibility statement), `docs/testing.md`, `docs/migration-from-0.6.0.md` (*Changes after 0.15.0: the civtech sweep*), `CHANGELOG.md` (`## Unreleased`), `docs/BACKLOG.md` (review item). `GUIDELINES.md` states no timing, so it did not change.
- Not touched: `gov2.css`, `docs/decisions/`, `docs/briefs/`, `CLAUDE.md`, `AGENTS.md`, `docs/compat-analysis.md`, consumers, the archive (SHA-256 `3cdbe56f…1952`, checked). No commit, no tag, no version change.

**Hard**
- Chrome (channel `chrome`), command `PLAYWRIGHT_CHANNEL=chrome npm test`.
- Measured, 100ms steps, 64px text: the band (at least 5 tinted solid pixels) is over the glyphs from 200ms to 6800ms in both hosts, so 6.7s of each 7s cycle, with no gap. Frames at 0ms and 7000ms show no band. The middle is 3500ms; the peak is at 3600ms (6,202 tinted pixels in the wordmark, 4,788 in the heading).
- Measured, t=0 and the static frame (animation removed), light, dark and `auto`+dark: pixels that differ from ordinary text are 3 at the real size in the wordmark (the clipped antialiased edge of the last glyph, as before), 0 in the heading, 0 at 64px. The 100deg slant tints no pixel in the first frame.
- Measured, lowest contrast of band-tinted solid glyph pixels against the surface, over a whole cycle (50ms steps): light header 1.54:1 (rgb 0,43,126 at 2650ms); light page 1.47:1 (rgb 252,209,23 at 1800ms); dark header 1.54:1; dark page 1.54:1 (rgb 0,43,127 at 2650ms). Rest: 19.59:1 on the header, 17.52:1 on the dark page. The lowest value equals the lowest pure token colour, so the blends are never worse than blue or yellow. Samples with a pixel below 4.5:1: 112 of 141 on the header (5.6s of 7s), 91 on the light page (4.55s), 113 on the dark page. The deviation therefore applies for most of each cycle.
- Wrong turn 1: I counted tricolour pixels by exact colour, as the old test did. The blend makes that useless. Wrong turn 2: I defined a tinted pixel as "off the line between surface and host colour". It counted 6,204 pixels in plain text, because the 64px glyph edge has coloured fringes, and because the fixture has a blue neighbour (`11,61,145`). Fix: read only solid pixels and exclude the colours of the plain picture.
- Assumed, not measured: Safari and Firefox. The ADR amendment claims plain text in six cases; the suite checks all six in Chrome only.

**Decided**
- Maintainer review (Opus): looked at the dark guide screenshot mid-band; it matches civtech. Released as 0.16.0, a minor version, because the ADR 0010 amendment changes the spec. No class or token changed, so nothing is breaking.
- The band time threshold is 5 tinted solid pixels in the whole title. A lower threshold would read the soft edge of the band as band time; a higher one would shorten the figure. The number is a measurement of this detector, not a perceptual claim.
- The contrast check asserts that the lowest value is below 4.5:1 (the deviation exists) and not more than 0.15 below the lowest token colour. The alternative, exact equality with the tokens, would fail if a blend were ever lower, and it would hide that. The tolerance catches a regression and the report shows the number.
- Docs say "about 6.7s of each 7s cycle". The measured figure has 100ms resolution.

## 2026-10-27 — Select control (brief 08, 0.15.0)

**Done**
- `gov2.css` (version header unchanged, 0.14.0): `.g2-input` on a native `<select>`, no new class and no new token.
  `gov2.components`, after `.g2-input`: `select.g2-input:not([multiple],[size]:not([size="1"]))` gets `appearance: none`, `max-width: 100%`, `padding-right: 2.5rem` and `text-overflow: ellipsis`; `select.g2-input:is([multiple],[size]:not([size="1"]))` gets `max-width: 100%`; in `@media(forced-colors:active)` the drop-down returns to `appearance: auto`.
  `gov2.states`, after the field error rule: `select.g2-input:disabled{opacity:1}` and two gradient arrow rules (text colour; muted when disabled). Their selectors outrank the focus rules, which reset the `background` shorthand.
- Documents: `COMPONENTS.md` (*Fields*: the select bullet, the table row, the dark-scheme note, *Not in the DS yet*), `CHANGELOG.md` (`## Unreleased`), `docs/migration-from-0.6.0.md` (*Changes after 0.14.0: select control*), `docs/testing.md`, `docs/BACKLOG.md`.
- Guide: a *Listă de selecție* subsection in section 09 (normal, error, disabled, multiple; copyable markup). Directory example: a *Sortare* select in the search row. Fixture: five selects.
- Tests: `tests/select.test.mjs` (20 checks). Changed: `tests/scheme.test.mjs` (`select` joins the elements removed before the 0.11.0 comparison).
- Not touched: `docs/decisions/`, `docs/briefs/`, `docs/compat-analysis.md`, `CLAUDE.md`, `AGENTS.md`, consumers, the archive (SHA-256 `3cdbe56f…1952`, checked at the end). No commit, no tag.

**Hard**
- Chrome 156.0.8078.48. Command: `PLAYWRIGHT_CHANNEL=chrome npm test`. Before: 238 checks. After: 258 run, 257 passed, 0 failed, 1 skipped (the scrollbar check), 385.1s.
- Contrast, from rendered pixels: text 19.59:1 (light) and 17.52:1 (dark); arrow the same; border the same (the control border is the text colour). Disabled arrow 6.33:1 and 7.51:1. Native arrow in forced colours 21.00:1.
- Select height 40px, equal to the text input, at 1280 and 320px in both schemes; widths equal in a row of two fields.
- Wrong turn 1: the arrow disappeared in forced colours. Chrome reports `background-image: none, none` for a gradient under forced colours, and my `CanvasText` gradient rules had no effect. I measured it (`getComputedStyle`), then replaced those rules with `appearance: auto` in forced colours. The native arrow measures 21.00:1 there. Alternative: `forced-color-adjust: none` with system colours, which would also override the border and the text colours of the select.
- Wrong turn 2: the disabled arrow measured 3.20:1 (light) instead of about 6.3:1. Cause: Chrome's default `select:disabled{opacity:.7}`. A disabled text input has no such default, so the select differed from it. Fixed with `opacity: 1`; the test now compares `opacity`.
- The first arrow rules sat in `gov2.components`. The focus rules in `gov2.states` set the `background` shorthand and removed the arrow on focus, so the arrow rules moved to `gov2.states` (specificity 0,2,1 against 0,1,1).
- The raw fixture overflows at 320px with root text 200% for reasons other than the selects (a table 412px wide, bare inputs 402 and 422px). It overflowed before this change. The test checks the selects there, and the whole page for the guide and the directory page.
- Keyboard test: `ArrowDown` opens the popup on macOS, so the test uses type-ahead to change a closed select.

**Decided**
- Maintainer review (Opus): accepted the CSS and the four open choices. The native arrow in forced colours keeps the system colours; `forced-color-adjust:none` would override them. Added the breadcrumb rule from the org update: each step is a link with its own URL.
- The arrow is two 0.45em gradient halves at `1rem` from the right edge, from `--g2-color-text`: no image, no colour literal, no token. It scales with the font size. Alternative: an inline SVG data URI needs a colour literal or a mask, which the brief rules out.
- `size="1"` counts as a drop-down: the list case is `multiple` or `size` greater than 1. The class on a list gives border, font, background, padding and `max-width: 100%` only; height follows `size`.
- Forced colours: the native appearance returns (see wrong turn 1).
- Padding is `2.5rem` on the right: 1rem offset plus 0.9em arrow plus a gap. At 200% root text it scales with the root.
- The directory example gets a *Sortare* select, because a sort order fits a result list. It sits in the existing search row.
- Open for the maintainer: whether the 2.5rem padding and the `.45em` arrow suit the design; the `opacity: 1` reset is in `gov2.states` and applies to a multiple select too.

## 2026-10-27 — Navigation and data components (brief 07, 0.14.0)

**Done**
- `gov2.css` (version header unchanged, 0.13.0): one token and six pieces, no other token.
  `--g2-color-highlight-bg` (light `#fff7bf`, dark `#5c4d00`, in `gov2.tokens` and in both dark blocks) and a `mark` rule in `gov2.base`.
  In `gov2.components`: `.g2-skip-link` (a 1px clipped box until `:focus`), `.g2-breadcrumbs`, `.g2-pagination`, `.g2-table` with `.g2-table-wrap`, `.g2-table-stacked` (inside `@media(max-width:45em)`) and `.g2-cell-num`, `.g2-summary-list`.
  In `gov2.states`: the `[tabindex="-1"]` focus fix, `.g2-table-wrap:focus-visible`, the current pagination link and its forced-colours rule.
- Documents: `COMPONENTS.md` (six sections, the token row, *Not in the DS yet* keeps tabs), `GUIDELINES.md` (page structure bullets, review question 9), `CHANGELOG.md` (`## Unreleased`, Added, Changed, Fixed, no Breaking), `docs/migration-from-0.6.0.md` (*Changes after 0.13.0*), `docs/testing.md`, `docs/BACKLOG.md`.
- Guide: section 13 (*Navigare, tabele și liste de date*) with a demonstration and copyable markup for each piece, a live stacked table and a 360px frame; a highlight row in the dark contrast table; the top skip link is `.g2-skip-link`; `guide-skip` removed. Sections 13 to 16 became 14 to 17.
- Example pages: `.g2-skip-link`, breadcrumbs and `tabindex="-1"` on `main` in both; pagination (page 1 of 3, no previous link) and `mark` on the search word in the directory page; `.g2-summary-list` instead of `ex-facts` in the form page. `ex-skip` and `ex-facts` are gone from `examples.css`.
- Tests: `tests/navigation.test.mjs` (34 checks) and the new pieces in `tests/contract.html`. Changed: `tests/foundation.test.mjs` (`.ex-skip` became `.g2-skip-link`; the tab order has the breadcrumb at stop 7), `tests/guide.test.mjs` (the token list; 17 sections), `tests/scheme.test.mjs` (a highlight text pair; the new pieces and `mark` are removed from both documents before the comparison with 0.11.0).
- Not touched: `docs/decisions/`, `docs/briefs/`, `docs/compat-analysis.md`, `docs/connect-a-project.md`, `CLAUDE.md`, `AGENTS.md`, consumers, the archive (SHA-256 `3cdbe56f…1952`, checked at the end). No commit, no tag.

**Hard**
- Chrome 156.0.8078.48. Command: `PLAYWRIGHT_CHANNEL=chrome npm test`. Before: 204 checks. After: 238 run, 237 passed, 0 failed, 1 skipped (the scrollbar check, overlay scrollbars), 331.7s.
- Stacked table semantics, measured with `Accessibility.getFullAXTree` and `ariaSnapshot`: Chrome 156 keeps table, rowgroup, row, columnheader, rowheader and cell at 390px under `display: block`, with and without explicit roles. The hidden header row stays in the tree. The cell name gains the label ("Posturi 3"). I did not measure Safari or Firefox; the documented markup carries explicit roles for them (an assumption).
- Contrast: text on the highlight 18.01:1 (light) and 7.46:1 (dark); CIE76 distance from the focus yellow 60.8 (light) and 72.5 (dark). Rendered text, fixture: 95 text nodes, lowest 4.86:1 (light, "Șterge") and 6.24:1 (dark). Guide section 13 with every code block open: 185 text nodes, lowest 6.21:1 (light) and 6.24:1 (dark).
- The comparison with the 0.11.0 stylesheet failed by design for the new pieces, and also changed the height of their parents (new rules change layout). Removing the pieces and `mark` from both documents before the fingerprint was the smallest change that keeps every other element compared. Alternative: skip only the elements, which would leave the parents' heights different.
- Pre-existing overflow, found by the 200% check on the guide at 320px: an unbreakable word in the recovery link (348px) and `.guide-logo-slot` (332px). I fixed both in `docs/guide.css` (`overflow-wrap: break-word` on `.guide-main`, `flex-wrap` on `.guide-logo-slot`). They are not from this brief.
- Wrong turn: the first breadcrumb check failed because the `ariaSnapshot` of a link contains `/url:`. The test now removes those lines before it looks for a separator.

**Decided**
- Maintainer review (Opus): accepted the CSS, the highlight dark value, the `tabindex="-1"` exclusion list and no indicator on a non-control container, the 45em stack width and the pagination markup. Added the org findings: the reset-in-`app` case to the migration document and a sticky-header note to `COMPONENTS.md`.
- `[tabindex="-1"]` fix excludes links, buttons, fields, `summary`, `contenteditable` and widget roles (button, link, tab, menuitem, option, treeitem, gridcell, checkbox, radio, switch), so that roving-focus widgets keep an indicator. A blanket rule is simpler but removes the indicator of a roving widget. The fixed container shows no indicator at all (no outline): it is not a control, as GOV.UK does for `main`.
- Dark highlight `#5c4d00`: 7.46:1 with the dark text, 2.35:1 against the dark page (visible), 6.2:1 against the focus yellow. `#3a3100` (the dark warning surface) was 1.51:1 against the page and almost invisible.
- Summary list uses flex wrap (`dt` 14rem, `dd` basis 12rem), not a media query: it stacks when the list is narrow, whatever the viewport.
- The stacked threshold is `45em` (720px at a 16px root), as in the issue. The guide frame is 360px.
- Pagination markup is `<p>` position plus `<ul>` of links; the `<p>`-only form of issue #4 also works (links keep 44px).
- The directory example page shows "Pagina 1 din 3" with 5 results, so its heading no longer says "5 rezultate" and the Bacău chip count is 12.

## 2026-10-27 — Tricolour title sweep (brief 06, 0.13.0)

**Done**
- `gov2.css` (version header unchanged, 0.12.0): `.g2-ro-sweep` and `@keyframes g2-ro-sweep` in `gov2.components`, after `.g2-logo`; the focus rule in `gov2.states`, after `.g2-wordmark:focus-visible em`. No token. Four blocks:
  `@supports((-webkit-background-clip:text) or (background-clip:text)){@media(prefers-reduced-motion:no-preference){.g2-ro-sweep{…}}}` (gradient, clip, transparent fill, `animation:g2-ro-sweep 9s linear infinite`);
  the keyframes (`from` 100% 0, `33.33%` 0 0, `to` 0 0: a 3s sweep, then 6s at rest); `@media(forced-colors:active),print{.g2-ro-sweep{background:none;-webkit-text-fill-color:currentColor;animation:none}}`;
  and `:focus-visible .g2-ro-sweep{background:none}` with `:focus-visible .g2-ro-sweep,.g2-ro-sweep:focus-visible{-webkit-text-fill-color:currentColor}`.
- Documents: "never text" became "never text, except `.g2-ro-sweep` (ADR 0010)" in `gov2.css` (the token comment), `COMPONENTS.md` (token row, new section *Title sweep* with the markup, the scope, both deviations, the six plain cases and a suggested accessibility statement), `GUIDELINES.md` (colour rule, accessibility bullet, review question 8), `CLAUDE.md` and `AGENTS.md`.
  Guide: section 11 has *Banda tricoloră pe titlu* (a live demonstration, the copyable markup for both hosts, and a callout with both deviations, the scope, who must not use it and a proposed accessibility statement, in Romanian); section 02 names the exception.
  `CHANGELOG.md` (`## Unreleased`, Added and Changed, no Breaking), `docs/testing.md`, `docs/BACKLOG.md`.
- Tests: `tests/sweep.test.mjs` (22 checks, plus 8 screenshot checks when `GUIDE_ARTIFACT_DIR` is set), both hosts in `tests/contract.html` (a wordmark link and a title heading, each in a `.g2-header`), and one line in `tests/scheme.test.mjs`: the fingerprint skips an element that has `.g2-ro-sweep`.
- Not touched: `docs/decisions/`, `docs/briefs/`, `docs/compat-analysis.md`, `docs/connect-a-project.md`, `docs/migration-from-0.6.0.md`, consumers, the archive (SHA-256 `3cdbe56f…1952`, checked after the last change).

**Hard**
- Chrome 156.0.8078.48. Command: `GUIDE_ARTIFACT_DIR=<dir> PLAYWRIGHT_CHANNEL=chrome npm test`. Before: 182 checks. After: 212 run (182 + 22 sweep checks + 8 screenshot checks), 211 passed, 1 failed, 283.2s (`guide` 60, `foundation` 47, `fonts` 23, `scheme` 52, `sweep` 30). Without `GUIDE_ARTIFACT_DIR`: 204 checks. The sweep file alone: 22 checks in 57.4s, 30 with the screenshots in 65.5s. The one failure is not from this work (see below).
- Timing, from pixels at 100ms steps over one 9000ms cycle, both hosts: the band is over the glyphs from 500ms to 2500ms (21 samples, so 2.0s to 2.1s), the title is plain for the other 6.9s. The animation is 9000ms, linear, infinite, delay 0 (`getComputedTiming()`), and it advanced 1000ms in 1000ms of real time. Keyframes: the sweep lasts 3000ms; the band is on the glyphs for about 2/3 of it.
  The band is 12% of a 300% gradient (3 × 4%: blue, yellow, red, hard stops, 0.36 of the title width), so the time does not depend on the title width.
- Contrast, measured from the painted pixels (the glyph pixel colours are exactly the token colours), light and dark scheme:

| Surface | Rest (glyph colour) | Blue band | Yellow band | Red band | Worst moment |
|---|---|---|---|---|---|
| Header `#0b0c0c`, light scheme | `#ffffff` 19.59:1 | 1.54:1 | 13.31:1 | 3.48:1 | blue, 900ms, 1.54:1 |
| Header `#0b0c0c`, dark scheme | `#ffffff` 19.59:1 | 1.54:1 | 13.31:1 | 3.48:1 | blue, 900ms, 1.54:1 |
| Page `#ffffff` (not a documented host), light | `#0b0c0c` 19.59:1 | 12.71:1 | 1.47:1 | 5.63:1 | yellow, 700ms, 1.47:1 |
| Page `#0b0c0c` (not a documented host), dark | `#f3f2f1` 17.52:1 | 1.54:1 | 13.31:1 | 3.48:1 | blue, 900ms, 1.54:1 |

  The numbers equal the table of ADR 0010. The header is dark in both schemes, so the two header rows are equal. Focus: ink `#0b0c0c` on yellow `#ffdd00`, 14.55:1, in both schemes, with no band, also when the animation is in the middle of the band.
- Rest equals ordinary text: at 64px, 0 pixels differ in the light, dark and `auto` (system dark) schemes, both hosts; at the real size the wordmark differs by 3 of about 7,400 pixels (`#sweep real`: 3; the heading: 0). The 3 pixels are the faint antialiased right edge of the last glyph (`11,12,12` against `30,31,31`, `28,29,29`, `12,13,13`): the background of the span stops at the box of the span. Solid host-colour pixels are equal in number.
- Reduced motion, forced colours, print and no `background-clip: text` (two simulations) all give the picture of ordinary text and no tricolour pixel. Focus and focus plus hover too. Forced colours in Chrome: the glyphs get the system link colour; the computed `-webkit-text-fill-color` still reads `rgb(255, 255, 255)` there, but the painted pixels are the system colour (measured from pixels).
- Selected text: Chrome, default selection colours, 64px: sweep glyph `rgb(179,215,254)` on `rgb(81,118,157)` = 3.18:1; ordinary text `rgb(255,255,255)` on the same selection = 4.74:1. The selection is painted over the transparent glyphs. Not in ADR 0010 (see the questions).
  `::selection{-webkit-text-fill-color:…}` has no effect (3.18:1 with `currentColor`, `#fff`, `HighlightText` and an explicit colour). `::selection{color:HighlightText;background-color:Highlight;-webkit-text-fill-color:HighlightText}` gives 4.43:1 and a selection colour that differs from the rest of the page. I did not keep either (BACKLOG, *Verified limits*).
- Wrapped title at 320px (looked at, not asserted): the wordmark host is one block, so the band crosses all lines at once; the heading host is inline and paints one strip across its three line fragments, so the band crosses line 1, then line 2.
- Mutation checks, each on a scratch copy with one change to `gov2.css` (sweep file, 22 checks each): without both focus rules 7 checks fail (focus x3, layers, guide x2, static); without the forced-colours and print rule 3 fail; cycle 6s: 2 fail (static, timing); a 55% sweep keyframe (4.95s): 2 fail (static, timing); the transparent fill outside `@supports`: 3 fail (static, reduced motion, no support); static position 50%: 4 fail (static, rest x3);
  without the focus text fill: 6 fail; without the `no-preference` wrapper (base rule stays): 3 fail, because check 12 also pins "no background under reduced motion" (the pixel check alone passes, since the base rule already shows the static frame); without the base rule only (wrapper stays): 0 fail, the wrapper alone is enough; without both: 3 fail (reduced motion, static, layers).
- The suite has one failure that does not come from this work: `scheme: the scrollbar of a native scroll container follows the active scheme` fails with "this browser draws a classic scrollbar". It fails the same way on a clean `git archive` of v0.12.0 (HEAD c91ae2d), so it is the machine: macOS draws overlay scrollbars when no mouse is attached (`AppleShowScrollBars` is not set, so the setting is automatic). It passed in the brief 05 run.
- Wrong turns, all in my own checks: the first rest check required identical pixels at the real size (3 pixels differ, see above); the first hover check expected a thicker underline on hover (the wordmark has `text-decoration:none` in the components layer, which wins over the base layer thickness: no hover treatment); the first focus check cropped before the Tab key scrolled the page; the `ariaSnapshot` of a link includes its URL, so it is compared and not matched to a fixed string; `timeout` is not a macOS command (a `perl alarm` wrapper); one full run of `sweep.test.mjs` stopped for 10 minutes at its first browser check, with Chrome idle (0.46s CPU), right after the session scratchpad was removed. I stopped it and ran the same file again: 30 of 30 passed. I do not know the cause; the run before and the runs after were normal.
- Not done: Safari and Firefox, a screen reader, real forced colours on Windows, a real print or PDF, a real project header. `docs/testing.md` lists them.

**Decided**
- Maintainer review (Opus): accepted the CSS and both additions (reduced-motion wrapper, self-focus selector). Selected sweep text (3.18:1) is recorded in ADR 0010 under the 1.4.3 deviation, not as a third one. Updated the three tricolour rows of the migration document. The scrollbar check now skips when the machine draws overlay scrollbars (no gutter), instead of failing.
- Band: hard stops (as `.g2-ro-bar`, not the soft blend of the org and civtech code), 90deg, 12% of a 300% gradient, blue then yellow then red. A soft blend would add colours that are not tokens and would be darker than blue on the header at its worst. A wider band would give more glyph pixels under a low-contrast colour.
- The sweep lasts 3s (33.33% of 9s) from the first to the last position, so the band is over the glyphs for about 2s. The alternative, a 3s on-glyph window, needs a 4.4s sweep: closer to the limit and slower to notice a mistake. 9s is the minimum cycle in ADR 0010.
- I wrapped the effect in `@media(prefers-reduced-motion:no-preference)`. The brief's default relies on the base rule and a static frame without a band. The wrapper makes reduced motion pure ordinary text, not a clipped gradient. Cost: one more nesting level, and a browser without the media feature shows plain text. Opus can remove it: the base rule still shows no band (mutation checks above).
- A focusable element that carries the class gets plain text on focus (the second focus selector). The brief names the host link; the case costs one selector, and without it the text is transparent on yellow (`:focus-visible` sets the background in `gov2.states` and the fill stays transparent). The class belongs on a plain span, so this is a safeguard.
- The keyframes and the forced-colours and print rule sit outside `@supports`, so that removing the `@supports` block (the simulation in the brief) leaves a valid file with plain text.
- `tests/scheme.test.mjs` skips an element with `.g2-ro-sweep` in the 0.11.0 comparison. The alternative, a variant of the fixture, does not cover the guide. The host link and every other element are still compared, and the four comparison checks (fixture, directory, form, guide) pass.
- The fixture has both documented hosts although a page uses the class once. The guide has one live use (a test checks it).
- No `::selection` rule and no padding for the clipped edge pixels (BACKLOG, *Verified limits*).
- `docs/migration-from-0.6.0.md` still says "Decorative only, never text." for the three `--c-ro-*` rows. It is outside the brief, so I did not change it.

**Questions for the maintainer**
1. Selected text in the sweep is 3.18:1 on the default selection (plain text 4.74:1). Accept it as documented in `COMPONENTS.md`, or add it to ADR 0010 as a third deviation (WCAG 1.4.3)?
2. Keep the `no-preference` wrapper, or rely on the base rule only? Keep the self-focus selector?
3. The three `--c-ro-*` rows of `docs/migration-from-0.6.0.md` say "never text". Update them, or leave them as the 0.6.0 record? Acceptance 9 says "everywhere it appears".
4. Accept the band geometry (12% of 300%, about 2s over the glyphs)?
5. `CLAUDE.md` and `AGENTS.md`: only the "never text" line changed. The project block (`docs/project-block.md`) does not mention the class; add a line when the release reaches the projects?

## 2026-10-27 — Opt-in dark colour scheme (brief 05, 0.12.0)

**Done**
- `gov2.css` (version header unchanged, 0.11.0): the attribute `data-g2-scheme` (`light`, `dark`, `auto`; none means light). 46 dark colour tokens in `gov2.tokens`, after the light block, written twice (`:root[data-g2-scheme=dark]`, and `:root[data-g2-scheme=auto]` inside `@media (prefers-color-scheme: dark)`) with a trailing hex comment each.
  `color-scheme: light` on `:root`, `color-scheme: dark` in both dark blocks. Four tokens, each with the light value of the literal it replaces: `--g2-color-on-solid` (`#ffffff`), `--g2-color-action-secondary-hover` (`#dbdad9`), `--g2-color-control-bg` (`#ffffff`), `--g2-color-ro-blue-ring` (`#3a5aa0`).
  `.g2-nav a` reads `--g2-color-on-header`; `.g2-notice>*:last-child` reads `--g2-color-surface`. No component rule has a colour literal now (a static test fails on one; the detector finds the eight literals of 0.11.0).
  One rule added beyond the brief's list: the focus rule of `input`, `textarea` and `select` also sets `color: rgb(var(--g2-color-text))` (see Hard).
- Header tokens, focus pair, the three tricolour colours and the new ring keep their light value in the dark scheme (10 of 56 colour tokens). The dark page is the header colour (`#0b0c0c`); the brand band separates them.
- Documents: `COMPONENTS.md` (new section *Colour scheme*, four token rows, the dark mode removed from *Not in the DS yet*), `GUIDELINES.md`, `README.md`, `docs/project-block.md` (one line), `docs/migration-from-0.6.0.md` (*Changes after 0.11.0: the dark scheme*, checklist item 8), `CHANGELOG.md` (`## Unreleased`: Added and Changed, no Breaking), `docs/testing.md`, `docs/BACKLOG.md`.
- Guide: `data-g2-scheme="auto"` on `<html>`; new section 03 *Schema întunecată, la cerere* (sections 03 to 15 are 04 to 16 now) with the attribute table, two `srcdoc` previews of the same components (light and dark, real `gov2.css`, no `fonts.css`), a table of the four new tokens, and four contrast tables computed from the tokens (a test recomputes every cell). `docs/guide.css`: three layout rules for the previews. `docs/guide.js` and `docs/examples/*.html` are unchanged.
- Tests: `tests/scheme.test.mjs` (52 checks), `tests/baseline/gov2-0.11.0.css` (byte copy of `git show v0.11.0:gov2.css`, SHA-256 `a20b4417…b2c5`), `?scheme=` and eight added elements in `tests/contract.html` (ro-bar, ro-corner, ro-dots, inverse link, dashes, notice bar, inset, notice, tile), `tokenBlocks`, `setScheme` and `contrastReport` in `tests/helpers.mjs` (`contrastReport` moved from `foundation.test.mjs`). `guide.test.mjs`: the token tests read the light block, the four tokens join `foundationTokens`, the layer test expects the two dark blocks, the guide has two attributes (`lang`, `data-g2-scheme`) and 16 sections.

**Hard**
- Chrome 156.0.8078.48 (the installed Chrome updated since the 155.0.8059.85 of earlier entries). `PLAYWRIGHT_CHANNEL=chrome npm test`. Before: 130 passed, 0 failed, 115.4 s (rerun at the start). After: 130 existing + 52 new = 182 passed, 0 failed, 0 skipped, 0 TODO, 209.8 s (`guide` 60, `foundation` 47, `fonts` 23, `scheme` 52; `scheme` alone 91.8 s). The archive SHA-256 is unchanged (`3cdbe56f…1952`). Command: `GUIDE_ARTIFACT_DIR=<dir> PLAYWRIGHT_CHANNEL=chrome npm test`.
- Acceptance 1, measured: the 0.11.0 stylesheet and the new one give the same fingerprint (every longhand computed property of every element, except `color-scheme` and custom properties) for no attribute and for `light`, at rest on the fixture (98 elements), both example pages and the guide, and in rest, hover, keyboard focus and focus plus hover for 25 fixture controls and one control per distinct class and state on the other pages. A control check shows that the fingerprint changes for more than 30 elements in the dark scheme.
  Mutation checks in a scratch copy, one change each: `#fff` back in `.g2-btn` (fails the literal check and the token-rule check); one dark value changed in the auto block only (fails the equality check); `text-faint` set to its light value (fails the ADR 0009 pairs); `--g2-color-control-bg` changed to `#fafafa` (fails acceptance 1 on the fixture); the text colour removed from the focused-field rule (fails the dark state check); `color-scheme: light` in the auto block (fails the matrix and the equality check).
- `color-scheme` on native controls, measured by computed style (light → dark): `select`, `textarea` and date field background `rgb(255, 255, 255)` → `rgb(59, 59, 59)`, text `rgb(0, 0, 0)` → `rgb(255, 255, 255)`; system colours `Canvas` `rgb(255, 255, 255)` → `rgb(18, 18, 18)`, `Field` → `rgb(59, 59, 59)`, `ButtonFace` `rgb(239, 239, 239)` → `rgb(107, 107, 107)`. No attribute computes the same as `light`.
  Scrollbars, measured from pixels in a second Chrome that keeps classic scrollbars (Playwright hides them in headless mode; the first attempt read 0 px of gutter): light track `rgb(250, 250, 250)` and thumb `rgb(193, 193, 193)`; dark track `rgb(44, 44, 44)` and thumb `rgb(107, 107, 107)`. No attribute draws the light scrollbar.
- The focus rule of fields: the general `:focus-visible` rule sets the text colour to `--g2-color-on-focus` (`#0b0c0c`), and `.g2-input` colours sit in a lower layer, so a focused field had dark text on the field background. That is right on white. With `--g2-color-control-bg` dark, the same text would be `#0b0c0c` on `#0b0c0c`. The field rule now sets `color: rgb(var(--g2-color-text))`: the same computed value in the light scheme (`rgb(11, 12, 12)`, checked by acceptance 1), light text in the dark scheme. Mutation check: without it, the dark state check fails.
- Dark text pairs as rendered: fixture 52 text nodes, lowest 6.24:1 (the primary button); guide with every code block open 894 nodes, lowest 5.82:1 (error text on the raised surface); directory 127 nodes, lowest 6.24:1; form 64 nodes, lowest 6.24:1. Light, for comparison: lowest 4.86:1 (the destructive button). The two dark previews in the guide pass too. Field borders 17.52:1 on the page and 15.81:1 on the raised surface.
- Tricolour on the dark page (unchanged values): blue `#002b7f` 1.54:1, yellow `#fcd116` 13.31:1, red `#ce1126` 3.48:1; on white: 12.71:1, 1.47:1, 5.63:1. The header is dark in both schemes, so the corner mark and the dots look the same in both: the blue third is 1.54:1 there already, and the ring (`#3a5aa0`, 2.94:1 on the header) keeps the blue dot visible. Marks that sit on the page (`.g2-ro-bar`, `.g2-dash`) lose their blue third on the dark page. Seen in the screenshots: the blue segment of the bar is a faint dark band; the yellow and red segments are clear.
- Forced colours (acceptance 8): every non-colour property of every fixture element and of ten controls in four states is equal in the two schemes, and the behaviours hold in both (current link and selected chip differ from the others, the disabled field differs, the error bar stays 5px, the box shadow is removed, the focus outline is solid). Colour-valued computed properties are not equal: Chrome keeps the author colour of `html` and `body` text and some `Highlight` blends in the computed style (for example `rgba(5, 0, 73, 0.8)` against `rgba(55, 0, 110, 0.8)` on the current link), so a first version of the check that compared every property failed on 85 of 98 elements. The painted palette is the same in both: `Canvas` `rgb(255, 255, 255)` and `CanvasText` `rgb(0, 0, 0)` in both schemes (measured with a probe element). In a screenshot, the current link and the selected chip show a purple box with a white inner box; this is identical to 0.11.0 in the light scheme (acceptance 1) and was not investigated.
- Wrong turns, all in my own checks: the detector expectation (eight literals, not seven; `box-shadow` reports its hex); the fingerprint first included custom properties (the four new tokens differ by design); the representative controls included an off-screen skip link and the copy buttons inside closed `<details>`; `cssRules` on a style rule is an empty list, not `undefined`; `document.styleSheets` of the preview includes an inline `<style>` with no `href`; the light focus indicator is the dark bar below the control (yellow on white is 1.35:1), so the focus check takes the strongest of the yellow and the shadow colours (in the dark scheme the yellow itself must reach 3:1: 14.55:1).
  After the guide change the full suite failed four checks: the fonts check (each font file once: each preview iframe requested the four files again, so the previews no longer link `fonts.css`), two section counts (15 to 16), and the reference check (`--g2-color-*` in `COMPONENTS.md` reads as a token name).
- First draft of the dark link pair had a luminance ratio of 1.17:1 between link and visited link (light: 1.40:1). I changed link `#7cb4ff` to `#86b9ff` and visited `#b394f2` to `#a98af0`: CIE76 ΔE 33.9 (light 19.8), luminance ratio 1.37:1.
- Not done: Safari and Firefox, a phone with the system dark mode, native controls of a real project, real Windows forced colours, the paint before the stylesheet loads. `docs/testing.md` lists them.

**Dark values** (proposed by me; light → dark; ratios measured from the token values in each scheme)

| Token | Light | Dark | Measured (light → dark) |
|---|---|---|---|
| `page` | `#ffffff` | `#0b0c0c` | text on it 19.59 → 17.52 |
| `surface` | `#ffffff` | `#16191a` | text on it 19.59 → 15.81 |
| `surface-sunken` | `#f3f2f1` | `#202426` | text on it 17.52 → 14.00; muted text on it 6.33 → 7.51 |
| `line` | `#b1b4b6` | `#41484b` | against page 2.08 → 2.10 |
| `control-border` | `#0b0c0c` | `#f3f2f1` | on page 19.59 → 17.52; on surface 19.59 → 15.81 |
| `control-bg` | `#ffffff` | `#0b0c0c` | text on it 19.59 → 17.52 |
| `text` | `#0b0c0c` | `#f3f2f1` | on page 19.59 → 17.52; on sunken 17.52 → 14.00; on selected 14.82 → 11.82 |
| `text-muted` | `#505a5f` | `#b1b4b6` | on page 7.07 → 9.40; on sunken 6.33 → 7.51 |
| `text-faint` | `#6f777b` | `#8e979b` | on page 4.56 → 6.58; on sunken 4.08 → 5.25 |
| `link` | `#1d4fbf` | `#86b9ff` | on page 7.18 → 9.70; on sunken 6.43 → 7.75; on selected 5.44 → 6.54 |
| `link-visited` | `#4c2c92` | `#a98af0` | on page 10.08 → 7.07; on sunken 9.02 → 5.65; on selected 7.63 → 4.77 |
| `selected-bg` | `#d2e2f1` | `#17314f` | text on it 14.82 → 11.82 |
| `on-link` | `#ffffff` | `#0b0c0c` | on link fill 7.18 → 9.70 |
| `brand` | `#0b3d91` | `#2f6bd1` | against page 10.04 → 3.87; against sunken 8.98 → 3.09 |
| `action` | `#00703c` | `#2fa564` | on-solid text 6.21 → 6.24; against page 6.21 → 6.24 |
| `action-hover` | `#005a30` | `#4cc382` | on-solid text 8.38 → 8.80 |
| `action-shadow` | `#002d18` | `#145c36` | edge vs fill 2.44 → 2.56 |
| `action-secondary-shadow` | `#929191` | `#5e666a` | edge vs page 3.14 → 3.34 |
| `action-secondary-hover` | `#dbdad9` | `#30363a` | text on it 14.03 → 10.96; vs rest 1.25 → 1.28 |
| `danger-solid` | `#d4351c` | `#f06a5b` | on-solid text 4.86 → 6.45; text/bar on page 4.86 → 6.45 |
| `danger-shadow` | `#55150b` | `#8a2a1f` | edge vs fill 2.89 → 2.84 |
| `on-solid` | `#ffffff` | `#0b0c0c` | on info-line band 5.17 → 7.40 |
| `neutral-bg` | `#e5e6e7` | `#2b3033` | ink on it 8.57 → 10.75 |
| `neutral-line` | `#505a5f` | `#8d979c` | on page 7.07 → 6.57 |
| `neutral-ink` | `#383f43` | `#e4e7e9` | on bg 8.57 → 10.75 |
| `info-bg` | `#d2e2f1` | `#15304c` | ink on it 10.66 → 10.44 |
| `info-line` | `#1d70b8` | `#5aa4ea` | on page 5.17 → 7.40 |
| `info-ink` | `#0c2d4a` | `#d0e5fb` | on bg 10.66 → 10.44 |
| `progress-bg` | `#dbd5e9` | `#2a2150` | ink on it 8.67 → 11.22 |
| `progress-line` | `#4c2c92` | `#a68ee9` | on page 10.08 → 7.15 |
| `progress-ink` | `#3d2375` | `#e5ddfb` | on bg 8.67 → 11.22 |
| `warning-bg` | `#fff7bf` | `#3a3100` | ink on it 7.77 → 10.68 |
| `warning-line` | `#b58800` | `#d9a41a` | on page 3.24 → 8.65 |
| `warning-ink` | `#594d00` | `#ffe98c` | on bg 7.77 → 10.68 |
| `success-bg` | `#cce2d8` | `#0f3a25` | ink on it 6.16 → 10.02 |
| `success-line` | `#00703c` | `#2fa564` | on page 6.21 → 6.24 |
| `success-ink` | `#005a30` | `#c8edd8` | on bg 6.16 → 10.02 |
| `danger-bg` | `#f4cdc6` | `#4a1b15` | ink on it 12.53 → 11.05 |
| `danger-line` | `#d4351c` | `#f06a5b` | on page 4.86 → 6.45 |
| `danger-ink` | `#2a0b06` | `#ffd9d3` | on bg 12.53 → 11.05 |
| `success-solid` | `#00703c` | `#2fa564` | vs page 6.21 → 6.24 |
| `chart-1` | `#1d70b8` | `#4f94d8` | vs page 5.17 → 6.12 |
| `chart-2` | `#0b3d91` | `#9cc3f6` | vs page 10.04 → 10.77 |
| `chart-3` | `#505a5f` | `#97a1a6` | vs page 7.07 → 7.43 |
| `chart-4` | `#b1b4b6` | `#41484b` | vs page 2.08 → 2.10 |
| `chart-selected` | `#0b0c0c` | `#f3f2f1` | vs page 19.59 → 17.52 |

**Decided**
- Maintainer review (Opus): reran the suite, 182 passed and 0 failed; looked at the dark form page at 1280px. Accepted all dark values. In the dark scheme the `surface-sunken` role is a raised, lighter surface; the token name describes the light-scheme role and stays, because renaming it would break projects for a word. Accepted the field focus text colour: the light value is unchanged, and without it a focused field would show dark text on a dark field. Kept the blue third of `.g2-ro-bar` and `.g2-dash` faint on a dark page (ADR 0009 keeps national colours); a dark-page variant needs an owner decision. Added a dark-scheme line to `CLAUDE.md` and `AGENTS.md`.
- The dark page is the header colour, `#0b0c0c` (GOV.UK black), not a new neutral. Cost of the alternative (a page lighter than the header, for a tonal edge): one more neutral to explain, and a tonal edge that would be about 1.1:1, too weak to carry the separation alone. The 8px brand band (`#2f6bd1`, 3.87:1 against both) separates header and page. The surface (`#16191a`) and the sunken surface (`#202426`) are lighter than the page, so the sunken tokens in the dark scheme are raised, not recessed; the token names keep their role (panels, footer, chips, disabled field).
- Saturated fills are light with dark text in the dark scheme (`--g2-color-on-solid` `#0b0c0c`): primary `#2fa564` 6.24:1, danger `#f06a5b` 6.45:1, notice band `#5aa4ea` 7.40:1. Cost of keeping white text on the light-scheme fills: the light-scheme green (`#00703c`) is 3.16:1 against the dark page, and the light-scheme red (`#d4351c`), which is also the error text, is 4.03:1, which fails 4.5:1 as text. This is why the brief has the `on-solid` token.
- The enabled field border is the text colour (`#f3f2f1`) and the disabled border is `--g2-color-text-muted`, as in the light scheme (ink and muted ink), so enabled and disabled fields stay apart by border, background and text colour (all three differ, tested). Field background is the page colour, so a field on a raised surface reads as a well.
- `--g2-color-success-solid` equals `--g2-color-action` and `--g2-color-success-line`; `--g2-color-danger-line` equals `--g2-color-danger-solid`, as in the light scheme.
- Chart ramp in the dark scheme keeps the contrast order of the light ramp (against the page): selected 17.52, chart-2 10.77, chart-3 7.43, chart-1 6.12, chart-4 2.10 (light: 19.59, 10.04, 7.07, 5.17, 2.08). The lowest series stays a quiet grey, as before.
- The dark values are written twice because CSS cannot share one rule between a media query and a plain selector. Cost of the alternatives: `light-dark()` takes colours, not RGB channels; a custom-property toggle would change the channel format that every consumer reads. A test compares the two blocks.
- The guide sets `data-g2-scheme="auto"`, so the whole guide follows the system setting, and shows both schemes side by side in two `srcdoc` previews. Cost: the only script-free way to show a dark and a light page next to each other is a separate document with its own root element, so the sample markup exists twice (a test checks that the two copies are equal except the attribute). The example pages stay without an attribute (brief 05: no change to their default); the tests render them in both schemes.
- The baseline for acceptance 1 is a committed copy of the 0.11.0 stylesheet, not a `git show` at test time: a clone without tags still runs the check. Cost: a 19.7 KB file in `tests/` that the next release must replace.
- Fixture elements were added at the end of `<main>` so that the existing tab-order and geometry checks do not change.

**Questions for the maintainer**
1. Accept the dark values and the surface order (page, raised surface, sunken surface, getting lighter)?
2. Accept the added `color` in the focus rule of fields (needed in the dark scheme; the light computed value is equal)?
3. Accept `data-g2-scheme="auto"` on the guide, and the preview iframes without `fonts.css`?
4. `CLAUDE.md` and `AGENTS.md` carry the project block: add the line from `docs/project-block.md`? I did not edit them.
5. The blue third of `.g2-ro-bar` and `.g2-dash` is nearly invisible on the dark page (1.54:1). Keep it, or open a decision for a dark-page variant?

## 2026-10-26 — Destructive button renamed (0.11.0)

**Done**
- Renamed `.g2-btn.g2-warning` to `.g2-btn.g2-danger` in `gov2.css`, `COMPONENTS.md`, the guide, the raw fixture and the migration document. Opened issue #9 to record the owner's approval.
- Opened issues #3–#8 for the stiri proposals (breadcrumbs, pagination, table, summary list, skip link, highlight token).

**Hard**
- The colour values and states did not change. Chrome 155.0.8059.85: 130 passed, 0 failed in 118.2 s. The existing state checks on the fixture's `#danger` button cover the renamed class.

**Decided**
- `danger`, not `destructive`: one word, one meaning across the status tokens, `data-tone` and the button. Cost of the alternative: a second term for the same red role.
- Released alone, before brief 05, so that the breaking change does not hide inside the dark scheme release.

## 2026-10-26 — Local fonts and file delivery (brief 03, 0.10.0)

**Done**
- `gov2.css`: removed the Google Fonts `@import` (the only change besides two header comment lines; the version header is untouched). `--g2-font-sans` and `--g2-font-mono` and their fallback stacks are unchanged.
- `fonts.css` (2,296 bytes): four `@font-face` rules, one per family and subset, with `font-display: swap`, the Google Fonts `unicode-range` of each subset and URLs relative to the file (`fonts/…`). No layer, no token and no type rule.
- `fonts/`: four WOFF2 files copied unchanged from `@fontsource-variable/inter` 5.2.8 (Inter 4.001, `wght` build) and `@fontsource/fragment-mono` 5.2.8 (Fragment Mono 1.011), two OFL notices (`LICENSE-inter.txt`, `LICENSE-fragment-mono.txt`, the package `LICENSE` files unchanged) and `fonts/README.md` (sources, versions, tarball URL, npm integrity, tarball SHA-256, size and SHA-256 of every file, coverage, the weight and subset choice, load order, CSP, reproduction commands).
  Both npm integrity values from `npm pack` match `npm view … dist.integrity`. Files shipped: Inter latin 48,256 bytes, Inter latin-ext 85,068, Fragment Mono latin 25,224, Fragment Mono latin-ext 14,112; 172,660 bytes in total.
- `README.md`: *Install from an exact tag* (`git archive "$TAG" gov2.css fonts.css fonts | tar -x -C assets/gov2`), the load order, the CSP, and the exceptions. `COMPONENTS.md`: a *Fonts* section. `docs/project-block.md`, `docs/migration-from-0.6.0.md` (*Changes after 0.9.1: fonts*, checklist item 7), `CHANGELOG.md` (`## Unreleased`, **Breaking**), `docs/testing.md`, `docs/BACKLOG.md`.
- The live guide, both example pages and `tests/contract.html?fonts=1` link `fonts.css`. The guide installation section shows the standard install and the exceptions, and section 03 shows Romanian samples in both families. `tests/contract.html` without the parameter and the minimal page of the migration document stay core-only.
- `tests/fonts.test.mjs` (23 checks) and `tests/woff2.mjs` (a dependency-free reader for the `cmap`, `fvar` and `name` tables of WOFF2 files, using Node's Brotli). `tests/foundation.test.mjs`: the no-script check now blocks the local font files and asserts no external request, and the stylesheet-order check expects `fonts.css`. `scripts/serve.mjs`: `.woff2` as `font/woff2`, `.txt` as `text/plain`.
- Owner direction received during the work: local fonts are the standard installation step; only quick one-off projects skip them. All documents use that wording, and a check fails if a current document calls `fonts.css` optional.

**Hard**
- Chrome 155.0.8059.85, `PLAYWRIGHT_CHANNEL=chrome npm test`. Before, as given at handoff and in the 0.9.1 entry (I did not rerun it): 107 passed, 0 failed, about 86 s. After: 130 passed, 0 failed, 0 skipped, 117.5 s (`guide` 60, `foundation` 47, `fonts` 23; `fonts` alone 24.6 s). The archive SHA-256 is unchanged (`3cdbe56f…1952`). A copy of the working tree without `node_modules` and `.git` passed after `npm ci --prefer-offline`: 130 of 130, 114.5 s. No dependency was added.
- Network, `directory.html`, Chrome 155, measured once with the real network. Before (HEAD `cac9db1`): `/gov2.css` 19,571 bytes, `examples.css` 3,046, then 5 third-party requests: `fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Fragment+Mono&display=swap` (11,251 bytes) and four files on `fonts.gstatic.com` (Fragment Mono 7,260 and 15,176 bytes; Inter 48,432 and 85,272 bytes; 156,140 bytes of fonts). With external requests blocked, as in the suite, the page still tried the Google stylesheet once.
  After: `/gov2.css` 19,706 bytes (the header comment grew), `/fonts.css` 2,296, `examples.css` 3,046 and four local files (172,660 bytes), no third-party request. The same four files load on the guide and on `form.html`. A core-only page (`tests/contract.html`) requests only its document and `gov2.css`.
  The local fonts are 16,520 bytes larger than the Google subsets of that day (mostly Fragment Mono: 39,336 against 22,436 bytes). No performance claim is made; the benefit is no third-party request and a reproducible, reviewable file set.
- Static against variable Inter, measured from `@fontsource/inter` 5.2.8 and `@fontsource-variable/inter` 5.2.8: four static weights (400, 500, 600, 700), latin and latin-ext, are 8 files and 240,272 bytes. One variable file per subset is 2 files and 133,324 bytes (44.5% smaller) and covers 100 to 900. Latin only is 48,256 bytes and has no ă ș ț.
- Romanian coverage, read from the `cmap` of the shipped files and not from documentation: Ă ă Â â Î î Ș ș Ț ț are in both families, in the file that the `unicode-range` selects (â î Â Î in the latin files; Ă ă Ș ș Ț ț in the latin-ext files). Inter also has the cedilla forms Ş ş Ţ ţ. Fragment Mono has Ş ş but not Ţ ţ (U+0162, U+0163). This is recorded in `fonts/README.md` and in the backlog as a verified limit.
- Rendered check: Chrome's platform-font query reports `Inter` and `Fragment Mono` with `isCustomFont: true` and a glyph count equal to the sample length (32 glyphs) for the Romanian samples in the fixture and in the guide. The four weights 400, 500, 600 and 700 give four increasing widths.
- Wrong turn (assumed, then measured): I assumed that a failed `@font-face` named `Inter` hides the installed Inter, so that blocking `/fonts/` would show a real fallback. It does not: with the four files blocked, Chrome paints the text with the installed Inter (`Inter-Bold`, `isCustomFont: false`). So the blocked-file check proves only that every face fails, the text stays readable and nothing overflows. The proof of the stack is a second check that removes `"Inter"` from the stack of `--g2-font-sans` (the list a browser walks on a machine without Inter). Then the h1 renders in another family, and the text width is 0.5% to 3.6% different (for example 766.4px against 746.8px at 1280px in the fixture), so the fallback has other metrics. A real run on a machine without Inter is still manual.
- Monospace on this machine: with Fragment Mono unavailable, Chrome paints `ui-monospace, SFMono-Regular, monospace` with Courier.
- Mutation checks (scratch copy of the tree, one change at a time, `fonts.test.mjs`): re-adding an `@import` fails 8 checks; a root-absolute font URL (`/fonts/…`) fails 6 (the subpath and CSP checks and the file checks); removing U+0218 to U+021B from the latin-ext range fails 6 (coverage, rendering and the pages); `font-display: block` fails 5; one flipped byte in an Inter file fails 13 (checksum, `cmap`, loading and rendering); pointing the latin-ext face at the latin file fails 11; leaving `fonts` out of the README install command fails 7. A mutation that changes only the CSP header was not run; the negative CSP check (no `font-src`) proves that the check reacts to the header.
- First runs: 22 of 23 fonts checks passed. The failing check was my own: it forbade the words "still imports" in the migration document, which says on purpose that 0.9.1 and earlier still import. The foundation suite had one real failure: the stylesheet-order check did not expect `fonts.css` on the example pages.
- Not mine: `docs/briefs/`, `docs/decisions/`, `docs/compat-analysis.md` and `docs/connect-a-project.md` changed in the repository while I worked (two maintainer commits, `0d81be3` and `db2c85f`). I did not edit them. `docs/connect-a-project.md` still says that `gov2.css` loads Google Fonts.
- Reviewed by eye: the guide sections 03 and 13 at 1280px (the Romanian sample in Inter and Fragment Mono, the install blocks), section 13 at 390px, and the top of the directory page at 1280px with the web fonts. Not reviewed: Safari, Firefox, a machine without Inter, and every manual check in `docs/testing.md`.

**Decided**
- Maintainer review (Opus): accepted the Fontsource 5.2.8 files, one variable Inter file per subset (44.5% smaller than four static weights) with the declared range `100 900` (the file's real axis; declaring less hides nothing), and no layer in `fonts.css`. Fragment Mono lacks the legacy cedilla forms Ţ ţ; the correct comma forms Ș ș Ț ț are present, so this is a recorded limit, not a blocker. Updated `connect-a-project.md`, `CLAUDE.md` and `AGENTS.md` for local fonts. Released as 0.10.0.
- Inter is one variable file per subset, not four static weights: 44.5% fewer bytes, 2 requests instead of 8, and the weights 100 to 900 stay available. The declared range is `100 900` (the axis range of the file), because a `400 700` declaration would clamp weights that the file can draw. The cost: a browser without variable-font support gets no web Inter (every browser that supports cascade layers supports variable fonts). The DS uses 400, 500, 600 and 700, checked against `gov2.css` by a test.
- Source: the pinned Fontsource packages, not the upstream releases. They are reproducible with `npm pack` and match what stiri uses (5.2.8, same subsets; not compared byte for byte). The cost: the files are Google Fonts builds (Inter 4.001 `wght` axis only, optical size fixed), not the upstream Inter release with the `opsz` axis. No runtime dependency and no devDependency was added: the files are committed, and a test compares them with `fonts/README.md`.
- Subsets: latin and latin-ext with the `unicode-range` values of the packages. Declared in the same order as the packages (latin-ext first), so that for the overlapping combining marks the latin face wins. The cost of one file with only the Romanian range: a custom subset is a derived file that needs a build step and its own provenance; not done.
- No cascade layer in `fonts.css`. A layer does not change an `@font-face` (font faces are not cascaded by layer), so it would add nothing. A `fonts.css` that declared `@layer gov2` and loaded before `gov2.css` would also fix the layer order in the wrong place. A test fails on `@layer`.
- WOFF2 only. The `.woff` copies in the Fragment Mono package are not shipped: every browser that supports the layers supports WOFF2. No italic is shipped: the DS uses none. Fragment Mono has no bold; the DS sets no weight on monospace text.
- Removing the import is listed under **Breaking** with the one-line fix, and the migration document has a section for it. The version header of `gov2.css` is unchanged; the maintainer bumps the version.
- The install procedure is in the root `README.md`, not in `fonts/README.md`, because a consumer reads the root README first. `fonts/README.md` points to it. The test runs the commands of the README block, so the text and the check cannot drift apart.
- `tests/helpers.mjs` is unchanged. `tests/fonts.test.mjs` has its own request recorder and platform-font query, because only these checks need them.
- A small addition outside the brief's file list: `scripts/serve.mjs` maps `.woff2` and `.txt` to their media types. Without it, the dev server sends the fonts as `application/octet-stream`. The cost: one line in a file that the brief does not name.

**Questions for the maintainer**
1. Accept the declared weight range `100 900`, or declare `400 700` to state the supported range?
2. Accept the Fontsource source (Google Fonts builds, Inter 4.001 without the `opsz` axis), or ship the upstream releases?
3. `docs/connect-a-project.md` (two lines) and `CLAUDE.md`/`AGENTS.md` do not mention `fonts.css` yet. Update them?
4. Where do quick projects get the files (gov2.ro or ui.gov2.ro)? Not set up. See the backlog (*Delivery*).

## 2026-10-26 — Notice bar fix from the stiri report (0.9.1)

**Done**
- `.g2-notice-bar[hidden]` now hides the bar, and a `<p>` child fills the row with no outer margin. `COMPONENTS.md` documents both.
- Added one browser check. 107 passed and 0 failed in Chrome 155.0.8059.85.

**Hard**
- The live guide did not show the defect: its demo hides a wrapper `div`, not the bar. The stiri session found it in a real page.
- Mutation check: without the two rules, the new test fails (`display` is `flex`, expected `none`).

**Decided**
- A patch release, because it corrects a shipped class without new API. The selector `.g2-notice-bar>p` is the documented markup; other child elements keep browser defaults.
- Recorded the stiri (0.6.0) and org (0.8.0) reports in `compat-analysis.md`. The new component and token proposals wait for the owner.

## 2026-10-26 — Page foundations implemented (brief 04, 0.9.0)

**Done**
- `gov2.css` (0.9.0 after review): 16 tokens in `gov2.tokens` (type scale: 6 sizes and 2 line heights; spacing `--g2-space-1` to `-7`; `--g2-gutter`), `--g2-container-max` from `1280px` to `80rem`, and nine classes in `gov2.components`: `.g2-container`, `.g2-heading-page`, `.g2-heading-section`, `.g2-heading-item`, `.g2-text-meta`, `.g2-field`, `.g2-label`, `.g2-hint`, `.g2-footer-in`.
  In `gov2.states`: `.g2-input:disabled` and the forced-colours rule for the selected chip. In `gov2.components`: the forced-colours rule for the current navigation link. Layout added to `.g2-header-in`, `.g2-nav` and `.g2-nav a`.
- Converted to rem tokens (same computed value at a 16px root, asserted): `body` 17px, `.g2-btn` 17px, `.g2-input` 17px (body token); `.g2-link-title` 19px (item token); `.g2-nav a`, `.g2-chip`, `.g2-notice-bar` 15px (meta token); `.g2-chip-count`, `.g2-tag` 14px (label token). Left in px: `.g2-wordmark` 19px, the close button of the notice bar 22px.
- `docs/examples/directory.html`, `docs/examples/form.html`, `docs/examples/examples.css`: Romanian, demonstration data, no script, no consumer reference. Local classes use the prefix `ex-` and one `@layer app` block. The guide links both and describes each local class.
- Live guide: new section 11 *Container, spațiere și pagini de exemplu* (sections 11 to 14 are now 12 to 15), type roles with a token table, fields with normal, error and disabled examples and a recovery link, header and footer composition.
- `tests/helpers.mjs` (shared set-up) and `tests/foundation.test.mjs` (47 checks); `tests/guide.test.mjs` imports the helpers and has four edits (15 sections, `80rem`, the migration-table token count, the file lists). `tests/contract.html` has the new classes.
- Docs: `COMPONENTS.md` (container, spacing, type roles, header, footer, fields, recovery, *Not in the DS yet*), `GUIDELINES.md` (type scale no longer a proposal, page structure, fields and errors), `docs/migration-from-0.6.0.md` (*Changes after 0.8.0* with a verified example), `docs/testing.md`, `CHANGELOG.md`, `docs/BACKLOG.md`.

**Hard**
- Chrome 155.0.8059.85, `PLAYWRIGHT_CHANNEL=chrome npm test`. Baseline before my changes: 59 passed, 43.1 s. Final: 106 passed, 0 failed, 84.0 s (59 + 47). The archive SHA-256 is unchanged (`3cdbe56f…1952`).
- Forced colours (measured with `forcedColors: 'active'`, before any fix): the current navigation link lost its bar, because forced colours remove `box-shadow`; a selected chip and an unselected chip had the same 2px border. After the fix they differ (`Highlight`). First run of the new rule: the count inside a selected chip was 1.24:1 (the span got `CanvasText` on `Highlight`); a rule that sets the count to `HighlightText` fixed it. Lowest text ratio in forced-colours emulation is now 11.30:1.
- Narrow screen with enlarged text (measured, before fixes): at 320px with root text 150% and 200%, the directory page overflowed by 45px and 166px (a long e-mail address in a `dd`), and the form page by 10px and 113px (the error text "nume@institutie.ro."). Shrink-wrapped grid and flex items keep the width of their longest word. Fixes: `overflow-wrap: anywhere` on `.g2-field` and on `.ex-meta dd`, `min-width: 0` on the grid and flex items, `overflow-wrap: break-word` on the heading roles. After the fixes there is no overflow in any of the six enlargement scenarios on both pages.
- Recovery: a link to `#email` moves focus to the input in Chrome, without a script (checked by click and by Enter). Chrome aligns the field to the top of the window. With a 6rem `scroll-margin` the label of a field with a hint and an error was 13px above the window at 1280x400 and 89px above it at 320px. At 12rem the label stays in view at 1280x400, 390x500 and 320x500 for both invalid fields (the field head is up to 186px high at 320px). My first label-in-view check passed for the wrong reason: the page was scrolled to its end, so the browser could not scroll further. I replaced it with a check in short windows and verified that it fails without the margin.
- Page sizes: directory 2676px high at 1280px and 5585px at 320px; form 2069px and 4344px. The header is 60px at 1280px (52px content and the 8px band) and 229px at 320px (four links, one per row, each 44px high). Navigation links were about 23px high before; they are 44px.
- Contrast on the rendered pages: 127 text nodes on the directory page, lowest 5.17:1 (white on the notice title band); 64 on the form page, lowest 4.86:1 (red error text on white). Muted text is 7.07:1 on white and 6.33:1 on the sunken surface (the disabled value). Ink on the focus yellow is 14.55:1. Each focus target has an indicator of at least 3:1 against its surface.
- Fonts blocked: the only blocked request is the Google Fonts `@import`. The Chrome DevTools platform-font query for the title, the navigation and the text returns an installed font with `isCustomFont: false` (Inter is installed on this machine). So the check proves that no web font loads and that the text renders; it does not show a different fallback face.
- JavaScript disabled: Playwright `evaluate` and the DevTools queries still work, and an injected script does not run, so the check proves the context.
- Mutation checks (scratch copy of the tree, one change to `gov2.css` at a time, both test files): removing either forced-colours rule, the nav target height (44px to 24px), the disabled field style, the field `overflow-wrap`, `box-sizing` on the container, the body token, a heading line height of 1.5, and the wrapping of the footer content were all caught. Two mutations were not caught at first: removing `scroll-margin` (the wrong-reason check above) and removing the heading `overflow-wrap`. I added four tests (three window sizes, one long-word check with a control that shows the overflow) and re-ran: both are now caught, as is a 6rem margin. Removing `flex-wrap` from the header is caught only by the large-text checks, because the navigation wraps by itself.
- Foundation checks: 35 of 43 passed on the first run. I fixed seven test mistakes (the header test used a page without that header, the word `posturi` in my consumer-reference regex matched the Romanian word, a landmark count was wrong, a strict-mode locator matched two elements, and my own script probe added a script element) and one real defect (the chip count in forced colours, above). Then four checks were added, for 47.
- Not mine: `docs/connect-a-project.md` and `docs/compat-analysis.md` changed in the working tree while I worked. I did not touch them.
- Reviewed by eye: both pages at 1280px (full page), the form at 320px and both pages at 390px (full page, scaled down), the directory at 320px (top, middle and bottom crops, and the top with keyboard focus), and the guide sections 03, 08, 10 and 11 at 1280px and 08 and 11 at 390px. Not reviewed: the other guide sections at 320px.
- Not performed: every manual and assistive-technology check in `docs/testing.md` (screen reader, native zoom, text spacing, real forced colours, Firefox, Safari, the disabled field on iOS, visited links).

**Decided**
- Maintainer review (Opus): reran the suite in Chrome 155.0.8059.85, 106 passed and 0 failed in 86 s; the archive SHA-256 is unchanged. Took an own 1280px full-page screenshot of the form page, because the implementer's 1280px capture repeated the page three times (a capture artefact; `scrollHeight` is 2069px and the page renders once). Checked at 320px that `#email` recovery focuses the input with its label, hint and error in view.
- Accepted: 44px navigation targets (they were about 23px, below the WCAG 2.5.8 minimum of 24px), `overflow-wrap` on the heading roles and fields, the forced-colours rules, the disabled field look and the 12rem scroll margin. Wrote the margin as `12rem` instead of `calc(var(--g2-space-7)*4)`: it is a scroll offset, not a spacing step.
- Kept `.g2-link-title` at line height 1.3 (BACKLOG, Verified limits reason). Left `.g2-wordmark` and the notice-bar close button in px until a role is chosen.
- Added `docs/examples/` and `docs/compat-analysis.md` to the README contents list.
- Names and values are the maintainer's, as given. `--g2-container-max` is `80rem` (same width at a 16px root): a correction in the changelog, not breaking.
- Header composition: `.g2-header-in` wraps, is `box-sizing: border-box` and has 4px padding above and below, so a one-row header keeps its 52px height. `.g2-nav a` is 44px high with `--g2-space-2` above and below and `--g2-space-3` at the sides (12px, as before). `.g2-nav` has a 4px column gap, which replaces the width of the space between inline links. The cost of the alternative (keep the 23px links): they miss the 24px minimum of WCAG 2.5.8 and the 44px aim of `GUIDELINES.md`. The cost of the change: the current-page bar moves down about 10px, and a project with its own header height rules must check them.
- `.g2-link-title` keeps `line-height: 1.3`. Using `--g2-line-height-heading` (1.25) would change the title link by 0.95px a line, and the maintainer allowed only identical conversions. Question below.
- Role classes set size, weight and line height only (headings also `overflow-wrap: break-word`). No margin, and no global heading reset. The cost of margins in the class: the page cannot choose the rhythm. The cost of none: each page sets its own; the examples do it in `ex-stack`.
- `.g2-field` sets no outer margin. The form sets the space between fields (`ex-fields`, `--g2-space-5`). Adjacent-sibling margins would double inside a grid with a gap.
- `.g2-field` is a grid with `justify-items: start`, so the label and the hint shrink to their text. `.g2-field>.g2-input` is 100% wide. The cost: a project that wants a narrow input sets `max-width` itself.
- Disabled field: sunken surface, muted text and border, `not-allowed` cursor, not an opacity. The value stays at 6.33:1, so a reader can still read a locked code. The cost: it looks different from the disabled button, which uses 50% opacity.
- Textarea and select are outside this slice: neither page needs them. `COMPONENTS.md` says so in the *Fields* section and in *Not in the DS yet*.
- Two forced-colours rules are part of this change, although the brief names only "supported forced-colour behaviour". They apply only in that mode, so no normal rendering changes. The alternative was to record two known defects in the new header composition.
- The error summary and the skip link are local (`ex-summary`, `ex-skip`), not core. The summary has no `role="alert"`: the pages are static, and an alert that exists at load is not reliably announced. In an application, moving focus to the summary after a failed submission is the consumer's job; the page says so.
- All result titles link to the one detail page, and the page says so. Pagination is deferred.
- `.ex-state` frames mark the separate state examples (with results, without results, form after a submission with errors). The form shows its three field states in one realistic form, with a short legend.
- `README.md` is not updated (outside the brief's file scope); it is in the backlog.

**Questions for the maintainer**
1. Unify `.g2-link-title` line height with the heading role (1.3 to 1.25)?
2. Accept 44px navigation targets and a 229px header at 320px, or ask for a compact variant?
3. Accept `overflow-wrap` in core on the heading roles (`break-word`) and `.g2-field` (`anywhere`)?
4. Accept the 12rem `scroll-margin` on `.g2-field>.g2-input`? It is generous; a smaller value hides the label for a field with a long hint or error.
5. Convert `.g2-wordmark` and the notice-bar close button to rem tokens, and with which role?
6. Should the two forced-colours rules stay in this package?

## 2026-10-26 — Shared CSS contract implemented (brief 01, 0.8.0)

**Done**
- `gov2.css`: whole-site activation (tokens on `:root`, base styles on every page, no `data-skin` anywhere), 57 `--g2-` tokens, six status names in tokens and markup, and the layer order `@layer reset, gov2, utilities, app;` with sublayers `gov2.tokens`, `gov2.base`, `gov2.components`, `gov2.states`. The order is declared before the font import. No rule is outside a layer. Colour values and the RGB-channel format are unchanged. The maintainer set the version to 0.8.0 after review.
- Layer placement: hover and the current-page navigation bar stay in `components`. Keyboard focus, the selected chip, the disabled button and the field error are in `states`.
- `docs/migration-from-0.6.0.md`: summary, steps, 62-row token table, status mapping, layer rules, `@import` into layers, three verified examples, limits, a customization section that separates requirements from guidance, and a checklist. It covers 0.6.0 and 0.7.0, because their runtime API is the same.
- Migrated the live guide (names, status values, installation section with three examples, no pending notices), `docs/guide.css` (now in the `app` layer, as a project stylesheet), the archive landing page and `tests/contract.html` (`?reset=1` puts the reset in the `reset` layer; `?reset=unlayered` is the unsupported case).
- Updated `COMPONENTS.md` (every token and class, a layers section), `GUIDELINES.md`, `README.md`, `AGENTS.md`, `CLAUDE.md`, `docs/project-block.md`, `docs/connect-a-project.md`, `docs/testing.md`, `patterns/README.md`, `docs/BACKLOG.md` and `CHANGELOG.md` (`## Unreleased`, with **Breaking**).
- Tests: the two TODOs are now executable assertions, inside one suite with no second runner. 36 passed plus 2 TODO became 59 passed, 0 failed, 0 TODO.

**Hard**
- Chrome 155.0.8059.85 (installed Chrome; the bundled Chromium is not installed). `PLAYWRIGHT_CHANNEL=chrome npm test`: baseline 36 passed, 2 TODO, 29.6 s. Final: 59 passed, 0 failed, 43.6 s. A copy of the tree without `node_modules` passed after `npm ci --prefer-offline` (58 of 58 at that time, 41.6 s). The install came from the local npm cache, so a registry download is not shown.
- State comparison (scratch tool, not in the repo): 57 elements in rest, hover, focus and hover plus focus, 169 element-states, 0.7.0 with `data-skin` against the new file. 6 property differences in 3 element-states, all in the navigation: the focused current link shows the focus bars instead of the blue inset bar (focus and hover plus focus), and a hovered focused navigation link is no longer underlined (current and other link, hover plus focus). With the documented layered reset, the same 6 differences. With the old unlayered reset (`a{color:inherit;text-decoration:inherit}`), 122 property differences, including the text colour of button-styled links. This is the cost of the accepted layer design.
- Why the navigation changed: `.g2-nav a[aria-current=page]` has specificity (0,2,1), which beat the old focus rule (0,2,0) by accident. Inside one layer, specificity beats order, so keeping it in `states` would have kept that accident. Hover stays in `components` for a different reason: in `states`, the primary hover rule would beat the `.g2-btn.g2-warning` default by layer and turn the destructive button green on hover.
- The font `@import` placed after the two `@layer` statements is still requested (measured: one request to fonts.googleapis.com). Chrome accepts it.
- A project rule in `app` that sets `background` replaces the gov2 focus background. First seen in analysis of `.guide-copy`; then measured: with the guide fix reverted, `[data-copy]` loses the focus background (test fails); with `:not(:focus-visible)` it passes. The suite checks this limit.
- Mutation checks in a scratch copy: swapping the sublayer order (18 tests fail), reverting one tone name (3), changing one token value (4) and adding one unlayered rule (9). Each mutation is caught.
- Computed-style comparison of the guide against 0.7.0: 490 elements before and 512 after; every section is identical except the intended text, token-label and installation changes. Byte comparison of section screenshots differed in unchanged sections because of fractional offsets above them, so it is not a valid check.
- Wrong turns: my first test helper edit used a Python string with bad escapes and wrote nothing (no harm). Two new static tests failed at first: `--guide-swatch` is set in `index.html` and read in `guide.css` (the check now spans files), and Chrome serializes `[aria-pressed=true]` with quotes in `selectorText`. The first `grep` check wrote a temporary file in `/tmp`; I removed it.
- The archived bundle checksum is unchanged: `3cdbe56f9a4bec755eb6b03e7c44344b38d5e0009a48dc2e89b3116607451952`.
- Not done: manual procedures (visited links, screen readers, native zoom, real forced colours, other engines), the 320px screenshot review, and any consumer repository.

**Decided**
- Maintainer review (Opus): reran the suite in Chrome 155.0.8059.85, 59 passed and 0 failed in 42.1 s; the archive SHA-256 is unchanged. Accepted the implementer's token names, the five removals and the sublayer placement in ADR 0008. Accepted the two navigation focus changes, because focus must win over component defaults. Updated the stale status lines in ADRs 0002 and 0006 and in the brief index.
- Token names follow ADR 0003 and the role in the brief's table. Where the brief gave no name, I chose: `surface-sunken`, `control-border` (for `--c-line-strong`), `selected-bg` (for `--c-gov-light`), `on-link` (for `--c-on-gov`; no accent token exists), `on-header*` and `header-accent`, `action*` (for `primary`), `danger-solid` and `success-solid`, `chart-selected`, `border-width-control` and `container-max`. The cost of the alternative (`primary`, `on-accent`, `accent`): "accent" would clash with the header accent, and "primary" is ambiguous with the brand colour. These names await Opus review.
- Five tokens are removed: `--font-display` (equal to `--font-sans`, no stated role), `--radius-md`, `--radius-lg`, `--radius-pill` (a scale of zeros) and `--shadow-lift` (no component has a lift state). The brief lets me keep a token only when it has a stated public role; none was documented. Keeping them would carry consumer slots into the API.
- `--g2-radius` stays and is now read by every boxed component (button, chip, field, tag, tile, notice), so it is a complete customization hook. The alternative (read only by button and field) would make a partial hook. Values are unchanged.
- `--c-line-strong` and `--border-ink` are now read by the components (`control-border` by the field, `border-width-control` by button, chip and field), as the brief asks. Other colour literals (`#fff`, `#dbdad9`, `#3a5aa0`) stay; replacing them is a separate correction (see the backlog).
- The migration document's code blocks are executed by the tests, and its token table is compared with `gov2.css`. The cost: a documentation edit can fail the suite. The benefit: the documented integration cannot drift.
- `guide.css` sits in the `app` layer, so the guide shows the recommended integration. `.guide-copy` recolours only outside `:focus-visible`; the migration document recommends the same pattern.
- No ADR was written, and no brief or ADR was edited. The ADR for the token inventory and the layer structure is for Opus. `docs/decisions/0002-whole-site-activation.md` still says the stylesheet "still uses its existing activation", and `docs/briefs/README.md` still lists brief 01 as ready. Both are now stale.
- No version bump, no tag, no commit, no push. The maintainer bumps the minor version (the change is **Breaking**).
- No class is renamed. `.g2-btn.g2-warning` (red, destructive) now shares the word "warning" with the yellow status. ADR 0003 keeps the class names, so this is a question, not a change.

## 2026-10-26 — Foundation scope accepted and original guide preserved

**Done**
- Recorded accepted D6 in ADR 0007 and finalized brief 04 for implementation after brief 01.
- Specified the container, spacing/type defaults, header/footer composition, field recovery, two static example pages and acceptance checks.
- Restored the prior bundle to `archive/2026-10-26-bundled-guide.html` from source commit `0fe519de926e52b15312e769baf35d3694544712` (tag `v0.6.0`).
- Added a labeled historical archive page, provenance README and links from the live guide and repository README.
- Updated future implementation briefs and contributor guidance to preserve archive bytes during API migrations.

**Hard**
- Verified byte equality against the source git blob: 501,498 bytes, SHA-256 `3cdbe56f9a4bec755eb6b03e7c44344b38d5e0009a48dc2e89b3116607451952`.
- Chrome 155.0.8059.85: all nine focused archive, metadata/link, no-JavaScript and reflow checks passed in 7.59 seconds.
- Verified both the archive wrapper and the original bundle's rendered heading. The snapshot's embedded runtime remains unchanged.
- The archive displays the old guide's v0.2 visual proposal; its source commit is tagged v0.6.0. The archive explains that distinction.

**Decided**
- The owner accepted the first foundation package and requested retaining the prior guide for reference.
- All six audit-follow-up decisions are settled. Brief 02 is implemented against the current API; 01, 03 and 04 are ready in dependency order.
- Keep the live guide current and the archived bundle immutable. Its old token/API/CDN examples are historical reference.
- No larger foundation implementation, consumer changes, commit, tag or publication was performed.

## 2026-10-26 — Live guide implemented and verified

**Done**
- Replaced the generated bundle with editable Romanian HTML loading `../gov2.css` directly.
- Added 14 sections, examples of all 29 core classes and 19 copyable markup blocks.
- Preserved guidance on hierarchy, data provenance, readable status, typography and decorative identity.
- Added documentation-only layout CSS and progressive copy, toggle and notice-dismissal demonstrations.
- Added Node preview tooling, pinned Playwright 1.56.1 with a lockfile, raw component fixtures and browser checks.
- Updated contributor instructions, references, pattern contribution guidance and briefs for the guide-first implementation order.
- Recorded D5 in ADR 0006. Brief 01 must migrate this guide and suite rather than replace or duplicate them.

**Hard**
- Chrome 155.0.8059.85: 34 browser checks passed, zero failures, two explicit migration TODOs. Final run: 29.03 seconds.
- Checked 1280, 768, 390 and 320 CSS pixel widths with expanded code, plus a 200% CSS zoom fixture.
- Checked no-JavaScript reading, copy success/failure feedback, toggle state, dismissal focus, labels, links, keyboard/hover states, raw geometry with/without reset, contrast, forced-colour focus and reduced motion.
- Reviewed desktop and mobile full-page screenshots in `/tmp/gov2-live-guide/`. Preview runs at `http://127.0.0.1:4173/docs/`.
- The old HTML was 501,498 bytes. New HTML is 34,486 bytes, with 7,173 bytes of guide CSS and 1,547 bytes of helper JavaScript.
- Wrong turn: the first preview-server implementation retained a trailing root slash, causing its path boundary check to return 404. Normalizing the root with `resolve()` fixed it; fixture navigation now asserts HTTP 200 immediately.
- The sandbox blocked npm registry access and local listeners. Approved execution installed the dependency and ran the browser suite.
- External requests were blocked for repeatable system-font fallback tests. The existing remote font import is still present pending brief 03.
- Manual visited-state, screen-reader, native browser zoom, other engines and real OS high-contrast checks remain unperformed. Procedures are in `testing.md`.

**Decided**
- The owner explicitly requested replacing the guide now. D5 is implemented against the current runtime API.
- Whole-site activation, token/status migration and CSS layer integration remain brief 01 work; two TODO checks identify that dependency.
- Brief 03 owns local font delivery. D6 foundation scope remains undecided.
- Keep one live guide and one regression suite. No generation step, second kitchen sink or framework runtime is needed.
- Changes remain uncommitted and unpublished. No consumer repository was changed.

## 2026-10-26 — Optional local fonts accepted; brief 03 ready

**Done**
- Recorded ADR 0005 and finalized brief 03 for implementation after brief 01.
- Added font asset provenance, weight and glyph checks, fixture ownership and a handoff prompt.
- Kept the package independent of the pending guide-replacement decision.

**Hard**
- No font assets were downloaded or runtime imports changed. Network and glyph acceptance checks belong to the implementation.
- Font versions, required notices and payload sizes must come from the actual sourced files.

**Decided**
- The owner accepted optional self-hosted Inter and Fragment Mono, system fallbacks and no remote core font request.
- Briefs 01 and 03 are ready. The guide and foundation briefs remain drafts.
- D5 live documentation and verification is next. Changes remain uncommitted; no other model was started.

## 2026-10-26 — Cascade and customization accepted; brief 01 ready

**Done**
- Recorded ADR 0004 and marked brief 01 ready for implementation.
- Specified a public layer order, customization examples, baseline test ownership and a handoff prompt.
- Removed the circular fixture dependency: package 01 provides baseline checks; package 02 extends them.

**Hard**
- A layer order cannot rearrange layers already established by earlier CSS. The integration examples must establish order first.
- Later consumer rules can still break accessible states. The brief requires checks of the documented customization examples.
- No runtime CSS changed in this step; this is a specification handoff, not an implementation claim.

**Decided**
- The owner accepted explicit layers and project customization with documented variations and accessibility checks.
- Projects can adjust layout, spacing, density and useful variants while keeping the distributed stylesheet unchanged.
- Brief 01 is ready. Other packages remain drafts, and no other model or consumer work was started.
- D4 font delivery is the next owner decision. Changes remain uncommitted.

## 2026-10-26 — Semantic public API accepted

**Done**
- Recorded ADR 0003 and updated the plan, briefs and backlog for accepted D2.
- Specified the status migration and retained the absent-tone neutral default.

**Hard**
- No runtime CSS changed. The full token inventory and old-to-new migration table belong to brief 01.
- A token's equal value or lack of a core reference alone does not justify deleting a public role.

**Decided**
- The owner accepted namespaced semantic tokens and neutral/info/progress/warning/success/danger in both tokens and markup.
- Keep component classes, colour values and RGB channels. Do not add compatibility aliases.
- D3 cascade and customization is the next decision. Brief 01 remains a draft until D3 is settled.

## 2026-10-26 — Whole-site activation accepted

**Done**
- Recorded ADR 0002 and updated the decision plan and brief 01.
- Added concrete semantic token and status naming examples for the next owner decision.

**Hard**
- Removing the scoped focus prefix will change specificity. Brief 01 requires component-state verification under the accepted cascade.
- No runtime CSS changed in this decision-recording step. The earlier quick-fix measurements remain the current baseline.

**Decided**
- The owner accepted automatic whole-site activation. Tokens will be on `:root`; components retain `.g2-*` classes.
- No activation attribute or wrapper will be required. Implement this with brief 01 after D2 and D3 are settled.
- D2 naming and D3 cascade/customization remain pending. Changes remain uncommitted.

## 2026-10-26 — Shared system boundary, audit corrections and draft briefs

**Done**
- Recorded ADR 0001: the DS defines its API. Posturi adapts in its own repository.
- Removed consumer paths, skin metadata and legacy naming rationales from stylesheet comments.
- Fixed wordmark focus, secondary hover plus focus, false chip selection and component box sizing.
- Rewrote design guidance as defaults with reasons and separate accessibility requirements.
- Corrected the current installation example, publication instructions and layer-precedence claims.
- Added `briefs/README.md` and four draft implementation briefs with scope, migration and acceptance criteria.
- Updated the existing untracked `AGENTS.md` alongside `CLAUDE.md`. No commit, tag, push or consumer change was made.

**Hard**
- Verified in Chrome 155.0.8059.85 using temporary static fixtures and the actual stylesheet. External font requests were blocked.
- Eight rendered-state checks passed: wordmark text and suffix are ink on focus; secondary hover plus focus stays yellow; native/link buttons are 44px; native/link chips are 36px; text input is 40px; a false-current chip has a transparent border; title hover has a 3px underline.
- Measured before correction: button-styled link 64px, link chip 52px and text input 54px without a reset.
- The existing layered-utility fixture still returns the DS link colour. Layer integration is pending D3, not claimed fixed.
- The bundled guide still renders without title/language metadata and does not load the shared CSS. Its replacement is draft brief 02.
- Earlier claims that headless Chrome cannot show hover were incorrect. Visited-state verification remains separate.
- The fixture and browser output are temporary audit tools. Checked-in repeatable regression tooling is specified in brief 02.

**Decided**
- Consumer skin compatibility is not a core requirement. Owner instruction in this session supersedes the old compatibility premise.
- A component's origin alone does not make it consumer-specific. Retain useful shared behaviour; inventory inherited names before changing the API.
- Activation, public naming, layers/customization, fonts, guide replacement and next component scope are sequential owner decisions.
- D1 was presented with automatic whole-site activation as the recommendation. No answer is recorded yet.
- Quick corrections are implemented. The four larger briefs remain drafts until their stated decisions are accepted.
- Changes remain uncommitted while the owner reviews the decision sequence. The changelog records this work under Unreleased.

## 2026-10-26 — Link specificity fix and link role classes (0.6.0)

**Done**
- Changed the base rules for `body` and links to `:where([data-skin="gov2"]) a` and so on: specificity 0,0,1. `:visited` and `:hover` are inside `:where()` too.
- Added `.g2-link-title`, `.g2-link-quiet`, `.g2-link-inverse`, `.g2-chip` and `.g2-chip-count`. Their states use `:where()`, so that the focus rule (0,2,0) stays stronger.
- Updated `COMPONENTS.md` (Links, Chips, specificity note), `GUIDELINES.md` (classes exist, measured contrast) and the known transition issues in `docs/connect-a-project.md`.
- Committed the owner's changes on the owner's request: `docs/index.html` and a new `.gitignore`. The `.gitignore` excludes `*.code-workspace`, so `g2-ds.code-workspace` stays local.

**Hard**
- Measured in headless Chrome, with a test page that loads a Tailwind-like reset and the class `.text-on-bar-muted` before `gov2.css`. With 0.5.0, each link was `rgb(29,79,191)` and underlined, also the link with `.text-on-bar-muted`. With 0.6.0: the utility link is `rgb(204,204,204)`; the title is bold 19px blue; the quiet link is ink; the inverse link is white; the chip is ink on `rgb(243,242,241)`, without underline; the selected chip has an ink border; a focused chip is yellow with ink text.
- Not measured: `:visited` and `:hover`. A headless browser does not show them. Assumed: `:visited` inside `:where()` works, as in the Selectors Level 4 specification.
- posturi links that have no `no-underline` class stay underlined, because the DS rule is later than Tailwind preflight at the same specificity. This is intended: an underline means a link.
- Contrast of the new classes: title 7.18:1 (visited 10.08:1), quiet and inverse 19.59:1, chip 17.52:1, chip count 6.33:1 (5.66:1 on hover).

**Decided**
- **Specificity 0,0,1, not 0,0,0.** With 0,0,0 (`:where([data-skin] a)`), Tailwind preflight (`a{color:inherit}`) wins, and plain links lose their colour. With 0,0,1, a project class wins, and the DS still wins over an element reset that loads before it. Cost of the alternative: no DS link style in each Tailwind project.
- **Focus rules stay strong (0,2,0).** The yellow focus must show on each element, also on project classes. Cost of the alternative: a project class can hide the focus.
- **`.g2-link-inverse` is white and underlined**, not muted with an underline on hover only. An underline marks a link on the dark bar too. Cost of the alternative: links on the dark bar that look like text.
- **No `.g2-icon-btn` yet.** The owner asked for the link roles; an icon button is an action, not a link.

## 2026-10-26 — Guidelines for hierarchy and link roles, patterns (0.5.0)

**Done**
- Wrote `GUIDELINES.md` (draft): hierarchy, link roles, colour, contrast, type, actions, and a review checklist.
- Wrote `patterns/README.md`: the status of a pattern, the folder, and how to contribute. The kitchen sink is defined, not built.
- Added "Known transition issues" to `docs/connect-a-project.md`, and a review step to the adoption prompt.
- Added "pattern" to the issue template.

**Hard**
- The owner tested 0.4.0 as a skin in posturi.gov2.ro. All links looked the same: header links, job titles, institution links, shortcuts and the build stamp. Measured by reading the CSS, not in devtools: `[data-skin="gov2"] a` has specificity 0,1,1; the Tailwind utility `.text-on-bar-muted` has 0,1,0. The DS rule wins on every link.
- Measured contrast (WCAG formula): header link `#1d4fbf` on `#0b0c0c` is 2.73:1, visited `#4c2c92` is 1.94:1. The intended `#cccccc` is 12.2:1. The posturi skin check passes, because it checks token pairs, not the rendered page.
- Even without the specificity problem, the DS has only one link style. So there are no link roles.

**Decided**
- **The Google Fonts `@import` is accepted during the transition.** Fix before 1.0.0. Cost of the alternative: font files and a font licence check now, before the analysis of the projects.
- **`GUIDELINES.md` is separate from `COMPONENTS.md`.** One file says what exists; the other says how parts work together. Cost of the alternative: a long `COMPONENTS.md` that mixes facts and proposals.
- **Link roles follow the GOV.UK link modifiers** (inverse, muted, no visited state). Cost of the alternative: new names that projects must learn.
- **Patterns keep the prefix of the origin project until they become core.** A `.g2-` class is a promise of the DS; a contributed pattern is not. Cost of the alternative: `.g2-` classes that the DS does not maintain.
- **No change to `gov2.css` now.** The owner asked for the rules first. The fixes are in the backlog.

## 2026-10-26 — Prompts for project sessions (0.4.0)

**Done**
- Wrote `docs/connect-a-project.md`: four prompts (compatibility report, adoption, proposal, update) and how sessions find the DS session.
- The owner confirmed the repos: civtech.gov2.ro is `awesome-civetch`, orgs.gov2.ro is `institutii-publice`. ins.gov2.ro has worktrees; the owner starts a session there.
- Published on the owner's request: pushed `main` and the tags `v0.2.0`, `v0.3.0` and `v0.4.0` to GitHub.
- Open in posturi.gov.ro, not committed: the DS block in `AGENTS.md` and `CLAUDE.md`, and the 0.3.0 copy of `gov2.css`.

**Decided**
- **Each project session writes its own compatibility report.** The session in the project knows its live worktree and its build. The DS session writes the results into `docs/compat-analysis.md`. Cost of the alternative: the DS session reads each repo from outside and guesses which worktree is live.
- **Reports go by `SendMessage`, or by a GitHub issue `[compat] <domain>` when there is no DS session.** Agents from other providers can use the issue. Cost of the alternative: a report is lost when no DS session runs.
- **The prompts find the DS session with `ListAgents`, by the name prefix `gov2ro-design-system`.** The suffix changes for each session, so a fixed name does not work.

## 2026-10-26 — Component reference, proposal flow, project block (0.3.0)

**Done**
- Wrote `COMPONENTS.md`: the specification of each `.g2-` class and token group, with markup, use and states.
- Created the label `ds-proposal` on GitHub, and the issue template `.github/ISSUE_TEMPLATE/ds-proposal.md`.
- Wrote the DS block for the projects in `docs/project-block.md`. Added a posturi version of the block to `AGENTS.md` and `CLAUDE.md` in posturi.gov.ro. It is not committed there.
- Added the compatibility analysis of the live projects to `docs/BACKLOG.md`.
- Corrected `CLAUDE.md`: GitHub Pages is not enabled, and the repo is private. The earlier text said that Pages serves `docs/`.

**Hard**
- posturi has a skin contract. Measured: `check-skins.php` reports 69 problems for `gov2.css`, 46 unscoped `.g2-` rules and 23 unknown tokens. posturi loads all skin files on each page, so the unscoped rules leak into the other skins. This is the first compatibility bottleneck.
- The mapping from domains to repos is partly assumed. Only `posturi.gov.ro` is certain.

**Decided**
- **`COMPONENTS.md` is the specification, and `docs/index.html` is the showcase.** Agents cannot read the 480 KB bundle. Cost of the alternative: agents read `gov2.css` and guess the markup.
- **The issue template asks for the local version.** A project does not wait for the DS. It builds a local version and links the issue. Cost of the alternative: the project work stops until the DS releases.
- **The posturi block is not committed in posturi.** Another agent can work in that repo, and posturi has its own process. Cost of the alternative: a commit in a repo that this session does not maintain.
- **Version 0.3.0:** `COMPONENTS.md` and the proposal flow are deliverables, so the minor version goes up. `gov2.css` itself did not change.

## 2026-10-26 — Agent guidance and DS governance

**Done**
- Added `CLAUDE.md` with the structure of `gov2.css`, the governance rules, the version rules and the process notes.
- Changed the repo URLs from `gov2-ro/design-system` to `gov2-ro/gov2ro-design-system` in `README.md`, `gov2.css` and `docs/index.html`.
- Set the version to 0.2.0 in the header comment of `gov2.css`, in `CHANGELOG.md` and in the commented CDN URLs of `README.md`. Tagged `v0.2.0`.
- Created `docs/BACKLOG.md` and this file.

**Hard**
- `docs/index.html` is a generated bundle. The URL change is a plain text replacement: 5 URLs in the template. Before the change, a check showed that the template has no integrity hash. Assumed, not verified: the bundle source also has the old URLs, so a regeneration can bring them back.

- Wrong turn: first, the header of `gov2.css` changed from v0.2 to v1.0.0, to match `CHANGELOG.md`. The 1.0.0 entry in `CHANGELOG.md` was boilerplate. The style guide also shows v0.2.

**Decided**
- **The version is 0.2.0, not 1.0.0.** The DS is a proposal: only one project has a copy, the contrast ratios are not measured, and the style guide does not load `gov2.css`. A 1.0.0 promises stable names, and nothing supports that promise yet. Cost of the alternative: a 2.0.0 after the first rename, and projects that trust names that are not stable. The owner decides on 1.0.0 with the checklist in `docs/BACKLOG.md`.
- **Proposals are GitHub issues with the label `ds-proposal`.** Agents from all providers can use `gh`, and the owner sees all proposals in one place. Cost of the alternative (a `proposals/` folder): many agents write to the same repo, and the maintainer must look for new files.
- **Only the latest version is maintained.** Bigger projects include a copy and update when they choose. Cost of the alternative: backports to each maintained version.
- **The maintainer releases small fixes without approval.** The owner approves new components, variants, tokens and breaking changes. Cost of the alternative: each typo fix waits for the owner.
- **CDN delivery is deferred.** Quick projects will load the files from gov2.ro or ui.gov2.ro.
- **Remote-control messages are notifications only.** GitHub issues and git are the record, because agents from other providers do not get the messages, and a message is lost when a session closes.
