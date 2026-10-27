# Backlog

Statuses: `[ ]` open, `[~]` in progress, `[x]` done, `[-]` dropped.

## Current direction: audit follow-up

The owner decided on 2026-10-26 that consumers adapt to gov2. Posturi skin compatibility does not constrain core CSS.
See `decisions/0001-shared-system-boundary.md` and `briefs/README.md` for the sequential decisions and implementation packages.

- [x] Remove consumer-specific stylesheet comments and paths; stop treating consumer checks as core requirements.
- [x] Fix focus text in the wordmark, secondary hover plus focus, false chip selection and component box sizing.
- [x] Rewrite design guidance as defaults with reasons; keep accessibility requirements separate.
- [x] Correct the README's current installation and publication instructions.
- [x] Verify quick corrections in Chrome 155. Eight rendered-state checks passed; measurements are in `ACTIVITY.md`.
- [x] Settle D1: loading gov2 activates whole-site defaults. ADR 0002 records the decision; implementation is in brief 01.
- [x] Settle D2: semantic `--g2-` tokens and one status vocabulary, with a migration table and no compatibility aliases. ADR 0003 records the decision.
- [x] Settle D3: explicit layers and supported project customization. ADR 0004 records the decision; brief 01 is ready for handoff.
- [x] Settle D4: optional self-hosted Inter and Fragment Mono, with no remote core font request. ADR 0005 records the decision; brief 03 is ready after brief 01.
- [x] Settle D5: editable live guide and browser checks. ADR 0006 records the explicit implementation request.
- [x] Settle D6: the first foundation package and two representative pages. ADR 0007 records the decision; brief 04 is ready after 01.
- [x] Settle D1–D6 with the owner; finalize the implementation briefs.
- [x] Preserve the prior guide bundle unchanged, record its provenance and link it from the live guide.
- [x] Implement brief 01: independent shared CSS contract and migration (Unreleased in `CHANGELOG.md`; 59 browser checks pass in Chrome 155). Released as 0.9.0.
- [ ] Review brief 01 (Opus): record the token inventory (names, five removals, `--g2-radius` use) and the layer structure in an ADR; accept or revise the naming choices listed in `ACTIVITY.md`; bump the version (minor, with **Breaking**) and tag.
- [ ] Tell the projects that the project block in `project-block.md` changed (layer order, no activation attribute). Publishing is separate.
- [x] Implement brief 02 against the current API: live guide, raw fixtures, browser checks and manual procedures. Brief 01 owns the two migration TODOs.
- [x] Implement brief 03: local fonts and reproducible file delivery (`## Unreleased` in `CHANGELOG.md`). `fonts.css` and `fonts/` (Inter variable and Fragment Mono 400, latin and latin-ext, 172,660 bytes), the Google Fonts `@import` removed, the exact-tag install procedure in `README.md`, and `tests/fonts.test.mjs` (23 checks). All 7 acceptance criteria have executable assertions (130 browser checks pass in Chrome 155). The owner directed that local fonts are the standard installation step; only quick one-off projects skip them.
- [x] Review brief 03 (Opus): accepted the variable Inter files (declared range 100–900, the real axis of the file), the Fontsource 5.2.8 source, no layer in `fonts.css` and the install procedure. Released as 0.10.0.
- [ ] Tell the projects that `docs/project-block.md` changed again (install `gov2.css`, `fonts.css` and `fonts/` from one tag) and that the Google Fonts import is gone (Breaking). org and stiri wait for this release. Publishing is separate.
- [x] Implement brief 05: the opt-in dark scheme (`## Unreleased` in `CHANGELOG.md`). `data-g2-scheme` (`light`, `dark`, `auto`), 46 dark colour tokens in `gov2.tokens`, four new tokens (`--g2-color-on-solid`, `--g2-color-action-secondary-hover`, `--g2-color-control-bg`, `--g2-color-ro-blue-ring`), no colour literal in any component rule, `tests/scheme.test.mjs` and a guide section. All 12 acceptance checks have executable assertions except the manual ones in `testing.md`. Opus reviews it, then bumps the version and tags.
- [x] Review brief 05 (Opus): accepted the dark values (page darkest, raised surfaces lighter), the text colour in the field focus rule, `data-g2-scheme="auto"` on the guide, previews without `fonts.css` and the vendored 0.11.0 baseline. Released as 0.12.0.
- [ ] Tell the projects that `docs/project-block.md` changed again (one line on `data-g2-scheme`). org replaces its local dark overrides with `data-g2-scheme="auto"` when the release reaches it. Publishing is separate.
- [x] Implement brief 06: the tricolour title sweep (`## Unreleased` in `CHANGELOG.md`). `.g2-ro-sweep` and the keyframes `g2-ro-sweep` in `gov2.components`, its focus rule in `gov2.states`, no new token, `tests/sweep.test.mjs`, both hosts in `tests/contract.html`, a guide demonstration with both deviations in Romanian, and "never text, except `.g2-ro-sweep` (ADR 0010)" in `CLAUDE.md`, `AGENTS.md`, `GUIDELINES.md`, `COMPONENTS.md` and `gov2.css`. All 10 acceptance checks have executable assertions except the manual ones in `testing.md`. Opus reviews it, then bumps the version and tags.
- [x] Review brief 06 (Opus): kept the reduced-motion wrapper and the self-focus selector, accepted the band geometry and the 3-pixel antialias clip, recorded selected-text contrast (3.18:1) under the ADR 0010 contrast deviation, updated the tricolour rows of the migration document, and made the scrollbar check skip on overlay scrollbars. Released as 0.13.0.
- [x] Implement brief 07: navigation and data components (`## Unreleased` in `CHANGELOG.md`). `.g2-breadcrumbs`, `.g2-pagination`, `.g2-table` with `.g2-table-wrap`, `.g2-table-stacked` and `.g2-cell-num`, `.g2-summary-list`, `.g2-skip-link`, `--g2-color-highlight-bg` with a `mark` rule, and the `tabindex="-1"` focus-fill fix. `tests/navigation.test.mjs`, the new pieces in `tests/contract.html`, a guide section, both example pages updated. All 7 acceptance checks have executable assertions except the manual ones in `testing.md`. Opus reviews it, then bumps the version and tags.
- [x] Issues #3 (breadcrumbs), #4 (pagination), #5 (data table), #6 (summary list), #7 (skip link and focus fill), #8 (highlight token): implemented in brief 07. Close each issue when the release is published. Publishing is separate. Released in 0.14.0.
- [x] Review brief 07 (Opus): accepted the names, the dark highlight `#5c4d00` (7.46:1 with text), no focus indicator on a non-control `tabindex="-1"` target (as GOV.UK does for `main`), the 45em stack width with explicit roles in the documented markup, and pagination as a position `<p>` plus a `<ul>` of links. Released as 0.14.0.
- [ ] Tell the projects (stiri, org) that the pieces exist, so that they replace `.st-crumbs`, `.st-pager`, `.st-table`, `.st-dl`, `.st-skip` and `.crumbs` and the local `mark` colour. Publishing is separate.
- [ ] Manual checks not done for brief 07: a screen reader on the stacked table (Safari and Firefox drop table semantics under `display: block` without explicit roles; only Chrome was measured), the skip link and the table wrapper in Safari and Firefox, real forced colours on Windows. See `testing.md`.
- [ ] Tell the projects (org, civtech) that `.g2-ro-sweep` exists, with the two deviations to list in their accessibility statements. They adopt it after the release. Publishing is separate.
- [x] Implement brief 08: the select control (`## Unreleased` in `CHANGELOG.md`; issue #10 in progress). `.g2-input` on a native `<select>`, no new class, no new token. A CSS arrow from `--g2-color-text`, the native arrow in forced colours, `opacity: 1` when disabled, native `multiple` and `size` lists. `tests/select.test.mjs` (20 checks), the fixture, the guide, the directory example and `COMPONENTS.md`. Chrome 156: 258 run, 257 passed, 1 skipped. Released in 0.15.0.
- [x] Review brief 08 (Opus): accepted the arrow (two 0.45em halves, 1rem from the right, 2.5rem padding), the native arrow in forced colours, `opacity:1` on every disabled select, and the static Sortare select in the directory example. Released as 0.15.0.
- [ ] Tell the projects (stiri, org) that `.g2-input` works on `<select>`, so that they delete their copied select rules. Publishing is separate.
- [ ] Manual dark-scheme checks not done for brief 05: Safari, Firefox, a real phone with the system dark mode, native controls of a real project, real forced colours on Windows, the paint before the stylesheet loads. See `testing.md`, *Dark colour scheme*.
- [ ] Manual font checks not done for brief 03: Safari and Firefox rendering of the variable Inter file, a machine without Inter, a real host below a subpath with its real Content-Security-Policy header. See `testing.md`, *Fonts*.
- [x] Implement brief 04: the selected page-foundation slice (container, spacing, type roles, header/nav/footer composition, fields, two example pages; `## Unreleased` in `CHANGELOG.md`). All 12 acceptance checks have executable assertions (106 browser checks pass in Chrome 155); native zoom, screen readers and other engines are recorded as manual in `testing.md`. Opus reviews it, then bumps the version and tags.
- [x] Review brief 04 (Opus): accepted the 44px navigation targets, `overflow-wrap` on headings and fields, the 12rem scroll margin, the forced-colours rules and the disabled field look. Released as 0.9.0.

The older compatibility findings below are historical evidence, not acceptance criteria for the new core API.

## Governance

- [x] Create the label `ds-proposal` on GitHub, and an issue template in `.github/ISSUE_TEMPLATE/ds-proposal.md`.
- [x] Write `COMPONENTS.md`: each `.g2-` class, its markup, when to use it, and its states. Agents cannot read the bundle in `docs/index.html`, so they need this reference.
- [x] Write the DS block for the project repos: `docs/project-block.md`.
- [~] Add the DS block to posturi.gov.ro. The block is in `AGENTS.md` and `CLAUDE.md` of posturi, but it is not committed there. The owner or the posturi agent commits it.
- [x] Write the prompts for project sessions: `docs/connect-a-project.md`.
- [ ] Decide if the shared agent rules move from `CLAUDE.md` to `AGENTS.md`, so that agents from other providers read them.

## Compatibility analysis of the live projects

Analyse each project and list the bottlenecks for the DS. A session in each project writes a report with prompt 1 of `docs/connect-a-project.md`. The DS session writes the result in `docs/compat-analysis.md`. For each project, find:
- the stack: framework, CSS method (Tailwind, plain CSS, other), build;
- the tokens and class names that exist, and conflicts with the `--c-*` tokens and the `.g2-` classes;
- the fonts, the header, the footer and the skins or themes;
- the rules that a DS file must follow in the project (scoping, CSP, no external fonts);
- the work to adopt the DS, and the DS changes that the project needs.

Items:
- [ ] **posturi.gov2.ro** — repo `posturi.gov.ro`. First finding, measured on 2026-10-26: `php webapp-php/assets/check-skins.php` reports 69 problems for `gov2.css`.
  - 46 problems: `.g2-` rules outside `[data-skin]`. posturi loads all skin files on each page, so an unscoped rule leaks into the other skins (`hartie`, `govuk`, `posturi`).
  - 23 problems: DS tokens that the posturi skin contract (39 tokens) does not know, for example `--c-primary`, `--c-brand` and `--c-ro-*`.
  - Superseded requirement: satisfying the posturi skin checker is consumer work. Shared activation is being decided under D1.
  - Measured: no posturi template uses a `.g2-` class, so the unscoped rules do not change pages now. The 23 unknown tokens are warnings only. `gov2.css` sets 32 of the 32 colour tokens in the contract.
  - Measured on 2026-10-26, from the owner's screenshot and the CSS: all links look the same (blue, underlined). Cause: `[data-skin="gov2"] a` (0,1,1) is stronger than the Tailwind utilities (0,1,0), for example `.text-on-bar-muted`. Header links: 2.73:1 (visited 1.94:1) instead of the intended 12.2:1. `check-skins.php` passes, because it checks the tokens, not the page.
  - Italic job titles come from posturi (`font-display italic`), not from the DS.
  - Google Fonts (accepted during the transition): posturi links all skin files on each page, so the `@import` in `gov2.css` loads Google Fonts for each visitor, with each skin. posturi serves its other fonts itself (`@font-face` with files in `/static/fonts/`). Possible DS change: `@font-face` with font files in the DS, or the fonts in a separate file.
- [ ] **ins.gov2.ro** — repo not confirmed. Several repos mention the domain: `tempo-at`, `tempo-at-ui`, `tempo-at23`, `tempo-landing`, and the project has worktrees. The owner starts a session there with prompt 1 of `docs/connect-a-project.md`.
- [ ] **civtech.gov2.ro** — repo `awesome-civetch` (confirmed by the owner).
- [x] **stiri.gov2.ro** — repo `gov2-ro/stiri`. Report received 2026-10-26 and recorded in `compat-analysis.md`. Adopted v0.6.0 unedited; no conflicts; 12 proposals.
  - [x] Fix `.g2-notice-bar`: `display:flex` overrides the `hidden` attribute, and its `> p` keeps its margin and does not grow (stiri proposal 8). Fixed in 0.9.1.
  - [ ] Ask the owner whether to file stiri proposals 2, 3, 4, 5, 7 and 11 as `ds-proposal` issues (breadcrumbs, pagination, table, summary list, skip link, highlight token).
- [x] **org.gov2.ro** — repo `gov2-ro/institutii-publice` (the domain is `org.gov2.ro`, not `orgs`). Report received 2026-10-26 against 0.8.0 and recorded in `compat-analysis.md`.
  - Conflicts are now with `--g2-*` and the layers: all project CSS is unlayered, and a local `:focus-visible` replaces the DS focus. The project moves its CSS into `@layer app`.
  - [-] Shared compact density. Not needed: the owner chose the DS sizes for org (2026-10-26).
  - [ ] Owner decisions relayed 2026-10-26: DS fonts (brief 03 is implemented; org waits for the release), DS sizes, local dark mode until issue #1, no tricolour text. The org adoption brief waits for a release.
  - [x] Adopted 0.13.0 on 2026-10-27 (`compat-analysis.md`). Findings: reset-in-`app` focus case documented in the migration document; sticky-header note in `COMPONENTS.md`; select control is issue #10 (needs owner approval).
- [x] Issue #1, dark colour scheme for the `--g2-color-*` tokens (org; civtech assumed). Approved by the owner (ADR 0009), implemented in brief 05 (`## Unreleased`). org adopts it with `data-g2-scheme="auto"` after the release.
- [x] Issue #2, tricolour title treatment (org, civtech). The owner chose the sweep on the text (option 2) and accepted two deviations (ADR 0010). Implemented in brief 06 (`## Unreleased`). Open until Opus reviews it and the release reaches org and civtech. Released in 0.13.0.
- [x] Cross-project questions: Do the projects need dark mode? Yes: org has one, civtech is assumed to have one. The DS ships it (brief 05). (The Google Fonts question is closed: brief 03 removes the import and the DS ships local fonts.)
- [x] Replace the Google Fonts `@import` with `@font-face` and font files in the DS (Unreleased, brief 03).

## Hierarchy and link roles

From the posturi test. `GUIDELINES.md` has the rules.

- [x] Wrap the base rules of `gov2.css` in `:where()`, so that a project class is stronger than a DS base rule (0.6.0). No project depended on the old specificity: only posturi uses the DS, and it needed the opposite.
- [x] Add the link role classes: `.g2-link-title`, `.g2-link-quiet`, `.g2-link-inverse` (0.6.0).
- [x] Add `.g2-chip` and `.g2-chip-count` (shortcut and filter links, with a count and a selected state) (0.6.0).
- [ ] Check visited states with an explicit history procedure. Hover is testable in headless Chrome; the earlier claimed limitation was incorrect.
- [ ] Use the link classes in posturi (job title, institution, shortcuts, build stamp). This is posturi work.
- [ ] Add `.g2-icon-btn` (icon button with a label and a 44px target).
- [x] Add a type scale (page title, section title, item title, body, metadata, label) (Unreleased, brief 04).
- [ ] The owner reviews `GUIDELINES.md` (status: draft).

## Patterns and kitchen sink

- [x] Use `docs/index.html` as the single live guide and component inventory. It loads `../gov2.css` directly; no separate kitchen sink is needed.
- [ ] First pattern: the job card from posturi.gov2.ro (`patterns/job-card/`).

## Checklist for 1.0.0

The owner decides on 1.0.0 when all items are done.

- [ ] At least two live projects use the shared API. Local variations follow the accepted customization contract and retain accessible behaviour.
- [x] `COMPONENTS.md` exists. Keep it in agreement with `gov2.css`.
- [x] The editable live guide loads the current `gov2.css` directly and demonstrates each core class.
- [ ] The contrast of each text and background pair is measured. The ratios in the `gov2.css` comments (19:1, 7:1, 4.6:1) are not measured yet.
- [ ] Keyboard focus is checked on each component.
- [ ] No open `ds-proposal` issue is a breaking change.
- [x] No Google Fonts request (Unreleased, brief 03: the import is removed and the suite fails on any external request).
- [ ] A project passes the review checklist in `GUIDELINES.md`.

## DS gaps

Found while writing `COMPONENTS.md`. Each gap is also listed in `COMPONENTS.md` under *Not in the DS yet*.

- [x] Page container. `.g2-container` reads `--g2-container-max` and `--g2-gutter` (Unreleased, brief 04).
- [ ] A grid inside the container (columns, sidebars). Neither example page needed one.
- [x] Layout for `.g2-nav` and `.g2-footer`: wrapping header, wrapping navigation, `.g2-footer-in` (Unreleased, brief 04).
- [ ] Classes for `textarea`, `select`, checkboxes and radios. Outside brief 04: neither example page needs them. Decide with the next concrete task.
- [ ] A core error summary. The form example has a local composition (`ex-summary`); promote it when a second project needs it.
- [~] A core skip link: `.g2-skip-link` (Unreleased, brief 07, issue #7). Done when Opus accepts and releases it.
- [ ] Icon buttons, complex filters and charts (deferred by ADR 0007).
- [ ] A hover state for `.g2-btn.g2-danger`.
- [x] Dark mode: opt-in with `data-g2-scheme` (Unreleased, brief 05).
- [ ] A sequential colour ramp for maps, with dark values (org has its own; a separate proposal, ADR 0009).
- [ ] The tricolour blue (`#002b7f`) is 1.54:1 against the dark page, so the blue third of `.g2-ro-bar` and `.g2-dash` is hard to see on a dark page. Not changed (ADR 0009). A change needs a separate decision.
- [x] Tables, pagination, breadcrumbs and summary lists: implemented in brief 07 (issues #3 to #6, 0.14.0). Done when Opus accepts and releases them.
- [ ] Tabs. Still not in the DS.

Follow-ups from brief 04 (measured or decided in `ACTIVITY.md`):

- [-] Unify the line height of `.g2-link-title` with `--g2-line-height-heading`. Kept at 1.3: a multi-line underlined link needs room between its underline and the next line. The 0.95px difference per line has no other benefit.
- [ ] The wrapped header is tall on a narrow screen: 229px at 320px with four navigation links, one link per row (each 44px high). Wrapping was chosen over a menu button (brief 04). Review it with real navigation lists; a compact variant (smaller targets or fewer links) is a later decision.
- [ ] `.g2-wordmark` (19px) and the close button of `.g2-notice-bar` (22px) still use px. Convert them when the maintainer decides which role they read.
- [ ] A disabled `.g2-input` is styled with the sunken surface and muted text. Check it in Safari and on iOS, where the browser can add its own disabled style. Not measured.
- [ ] Manual checks not done for brief 04: screen reader pass on both pages, native browser zoom at 200% and 400%, WCAG 1.4.12 text-spacing override, real forced-colours rendering on Windows, Firefox and Safari. See `testing.md`.
- [x] `README.md` lists `docs/examples/` (maintainer, 0.9.0).
- [x] After brief 03: the fonts-blocked check did not show a different fallback face, because Chrome falls back to an installed Inter. `tests/fonts.test.mjs` now also removes `"Inter"` from the stack and checks the rendered family and the overflow. A run on a machine without Inter is still manual.

Defects found during brief 01. They existed in 0.7.0. The migration did not change them, by design: a rendering correction is separate work.

- [ ] A disabled `.g2-btn` still changes its background on hover (measured: primary `#00703c` to `#005a30`, secondary `#f3f2f1` to `#dbdad9`, at 50% opacity). Guard the hover rules with `:not(:disabled)`.
- [x] The general `:focus-visible` rule gave any focused element the yellow background (`<main tabindex="-1">` after a skip link). Fixed in brief 07 (Unreleased): a `tabindex="-1"` container that is not a control gets no fill. A control, a link and a widget role keep it.
- [x] Some components used colour literals where a token role exists: `#fff`, `#dbdad9` and `#3a5aa0`. They are tokens now (`--g2-color-on-solid`, `--g2-color-action-secondary-hover`, `--g2-color-control-bg`, `--g2-color-ro-blue-ring`) and `.g2-nav a` reads `--g2-color-on-header` (Unreleased, brief 05). A static test fails on a colour literal in any component rule.
- [x] The class `.g2-btn.g2-warning` is red (destructive), but the status `warning` is yellow. The owner approved a new name: `.g2-btn.g2-danger`, with no alias (issue #9, 0.11.0).

## Delivery

- [ ] Set up file delivery from gov2.ro or ui.gov2.ro for quick projects. It must serve `gov2.css`, `fonts.css` and `fonts/` together, with `font/woff2` for the files. A second origin for the fonts also needs `Access-Control-Allow-Origin` and `font-src` (untested). Hosting is a separate decision.
- [ ] `docs/connect-a-project.md` still says that `gov2.css` loads Google Fonts (the *Google Fonts* line and the prompt 1 hint). The maintainer updates that file: brief 03 did not edit it.
- [~] Update the copy in posturi.gov.ro (`webapp-php/static/skins/gov2.css`). The owner copied 0.4.0, and the block says 0.4.0. Not committed in posturi yet.

## Style guide

- [x] Replace the generated bundle with an editable live guide; no regeneration is needed.
- [x] Remove obsolete CDN and `@1` claims. Describe the current installation and distinguish approved but unimplemented migrations.
- [ ] Decide if GitHub Pages publishes the guide. Pages is not enabled now, and the repo is private.

Brief 06 follow-ups (measured in `ACTIVITY.md`):

- [ ] Selected text in the sweep has less contrast than plain text, because the browser draws the selection over the transparent glyphs. Chrome, default selection colours, measured: 3.18:1 against 4.74:1 for plain text, at 64px. ADR 0010 does not list it as a deviation. Decide: accept and document (done in `COMPONENTS.md`, *Title sweep*), or add it to the ADR.
- [ ] Manual checks not done for brief 06: Safari and Firefox (the technique, the `@supports` fallback, selection), a screen reader on the title link, real forced colours on Windows, a real print or PDF, and a real project header. See `testing.md`.
- [ ] `docs/migration-from-0.6.0.md` (token table rows for `--c-ro-blue`, `--c-ro-yellow`, `--c-ro-red`) still says "Decorative only, never text." The file is outside the scope of brief 06. Update the three rows to name the exception, or leave them: they describe the 0.6.0 tokens.

## Later: explorations requested by the owner

- [ ] **Skins.** Explore different styles and colours with the same structure: the same `.g2-*` classes and markup, with other token values (palette, type, density). Decide how a skin is delivered (a token file loaded after `gov2.css`, or an attribute like `data-g2-scheme`) and how it combines with the light and dark schemes. Needs an ADR. Owner request, 2026-10-27.
- [ ] **Rotating title text for civtech.** A component that changes the title text with transitions, like the civtech `.brand-name` (several effects, `data-fx`). First try CSS only: stack the variants in one grid cell (`grid-area:1/1`, so the box takes the widest), and give each the same keyframes with a staggered `animation-delay` (`calc(var(--i) * …)`). Known limits of CSS only: the number of items and the timing are fixed in the markup or the CSS; there is no random effect choice; screen readers find every variant (give the variants `aria-hidden` and keep one real title); reduced motion shows the first variant only. Check WCAG 2.2.2 (moving content). Owner request, 2026-10-27.
- [ ] **Assets library for optional scripts.** JavaScript is not part of the core system. When a component needs a script (for example the civtech effect choice), build an optional assets library: start it in this repository, in its own folder, separate from `gov2.css`, with its own version notes. Move it to its own repository only if it grows. Owner direction, 2026-10-27.

## Verified limits

- [-] Ship Fragment Mono with the cedilla t (Ţ ţ, U+0162 and U+0163). Dead end: the Fragment Mono 1.011 files do not contain them (read from the `cmap` of both shipped files); the comma-below forms Ț ț are there. The required Romanian letters are all covered. Text that uses Ţ ţ in monospace falls back for those two letters. Inter has all four cedilla and comma-below forms.
- [-] Ship Inter as four static weights. Not chosen: 240,272 bytes in 8 files against 133,324 bytes in 2 variable files (measured, `fonts/README.md`). The variable file covers 100 to 900.
- [-] Make the gov2 focus unbreakable by layers alone. Dead end: a rule in `utilities`, in `app` or outside every layer that sets `background` or `color` on a focusable control replaces `gov2.states`. Measured in the suite (*documented limits*). The documented mitigation is to change colours only with `:not(:focus-visible)`, or to repeat the focus rule in the same layer.
- [-] Keep an unlayered consumer reset working by source order. Dead end: unlayered rules outrank every layer. Measured in Chrome 155 with the old reset `a{color:inherit;text-decoration:inherit}`: 122 property differences in 169 element states, including the text colour of button-styled links. The reset must go in the `reset` layer.
- [-] Fix the layer order with a later `@layer` statement. Dead end: a layer keeps the position of its first appearance. Measured in the suite (*a layer created before the order declaration keeps its position*).
- [-] Restore the contrast of selected sweep text with a `::selection` rule. Dead end in Chrome 156: `-webkit-text-fill-color` in `::selection` has no effect on the transparent glyphs (glyph and fill measured the same, 3.18:1). `color` and `background-color` in `::selection` change the selection colour only for the title (4.43:1 with `Highlight` and `HighlightText`, which is still under 4.5:1) and make it differ from the rest of the page. Measured in a scratch page; not kept.
- [-] Remove the clip of the last glyph edge by padding the sweep element. Not chosen: the box of the span clips 3 faint antialiased pixels at the right edge of the last glyph at 19px (measured: 3 of about 7,400; none at 64px). A padding and a negative margin would remove them, but they change the box of the element for an effect that no one sees.
