# Compatibility analysis

Each project session sends a compatibility report (prompt 1 of `connect-a-project.md`).
The DS maintainer records it here and updates `BACKLOG.md`. Newest report first.
Each finding keeps the project's mark: **measured** or **assumed**.

## org.gov2.ro — 2026-10-26

Source: the g2-org session (repo `gov2-ro/institutii-publice`), relayed as a cross-session message. Report title `[compat] org.gov2.ro`.
The session read the project only and changed no files. The report targets the 0.8.0 API.

### Live code and stack

- **Domain:** `org.gov2.ro` (CNAME), not `orgs.gov2.ro`. Measured.
- **Live page:** `explorer/index.html` on `main`. `scripts/publish_pages.sh` force-pushes it as one orphan commit to `gh-pages`. GitHub Pages serves it; Cloudflare is DNS only. Measured with matching SHA-1 values.
- **Stack:** one 1766-line HTML file with vanilla JS. No framework, no build, no dependencies. Data comes from `metadata.json` and `rows.json` on the same origin. Maps are inline SVG from local GeoJSON. Measured.
- **CSS:** about 300 lines in one inline `<style>`, with no `@layer`. Fonts load from `assets/fonts/fonts.css`. Measured.
- **Constraints:** no CSP. Fonts must be self-hosted (project rule). A DS copy must be a committed plain file in `explorer/assets/`. The page must work over `python3 -m http.server` with relative paths. Measured.

### Tokens, classes and cascade

- **Tokens:** unprefixed hex tokens (`--bg`, `--text`, `--accent`, `--warn`, `--radius: 5px`, `--shadow`, a map ramp `--m0`…`--m5` and others). None has a `--g2-` name. Measured.
- **Classes:** generic local names (`.btn`, `.chip`, `.notice`, `.crumbs`, `.panel`, `.tree`, `.seg` and others). No collision with `.g2-`. Measured.
- **Cascade conflict:** every project rule is unlayered, so each one outranks all DS layers, including `gov2.states`. Measured from the CSS.
  - Unlayered `* {box-sizing}`, `body {font: 15px/1.45 …}` and `a {color: var(--accent)}` replace the DS base. Measured.
  - An unlayered `:focus-visible {outline: 2px solid var(--accent)}` replaces the DS yellow focus. Measured.
  - After a move into `@layer app`, rules such as `.seg button[aria-pressed=true]`, `.cat-tab`, `.directory a:hover` and `tbody tr:hover` can hide DS focus in combined states. Assumed, not tested in a browser.

### Look

- **Fonts:** IBM Plex Sans, Instrument Sans and JetBrains Mono, self-hosted woff2 (latin and latin-ext). The DS defaults are Inter and Fragment Mono. Measured.
- **Visual source:** civtech.gov2.ro tokens, a 5px radius and drop shadows on dialogs and panels. The DS defaults are radius 0 and no decorative shadows. Measured.
- **Header:** sticky, light and translucent, with logo, h1, statistics, a "Mai multe" menu and a filter bar. No black header and no brand band. Measured.
- **Tricolour as text:** the h1 uses an animated tricolour gradient as its text colour. The DS keeps the tricolour decorative, never text. Measured.
- **Footer:** none. Measured.
- **Dark mode:** yes, with `prefers-color-scheme: dark` and its own map ramp. The DS has no dark mode. Measured.
- **Density:** body 15px, controls 34px and 28px high. The DS defaults are body 17px and 44px controls. The owner chose the dense list on purpose (commit `51b699b`). Intent assumed.

### Adoption work reported by the project

- **S:** copy `gov2.css` to `explorer/assets/`, link it first and wrap the inline style in `@layer app`.
- **S:** remove the local `:focus-visible`; test focus on `.seg`, `.cat-tab`, rows and map paths.
- **S:** add `.g2-footer`; map `.chip` and `.flag` to `.g2-tag`; replace the tricolour text with `.g2-ro-corner` or `.g2-dash`.
- **M:** move the header to `.g2-header`, `.g2-wordmark` and `.g2-ro-corner`, and keep it sticky.
- **M:** map local tokens to `--g2-*`, use radius 0 and remove the shadows. Keep the map ramp local.
- **M:** decide fonts: self-hosted Inter and Fragment Mono, or the project fonts.
- **M:** move buttons and inputs to `.g2-btn.g2-secondary` and `.g2-input`; resolve 34px versus 44px in the filter bar.
- **M:** keep dark mode as `--g2-*` overrides in `app`, or drop it until the DS has one.

### DS requests and status

| Request | Size | DS status |
|---|---|---|
| Correct the backlog domain to `org.gov2.ro`; conflicts are now with `--g2-*` | S | Accepted |
| Fonts without the Google Fonts `@import` | M | Accepted in ADR 0005; brief 03 is ready |
| Compact density for data explorers (body 15px, 32–36px controls) | M | Withdrawn: the owner chose the DS sizes for org |
| Dark mode | L | Issue #1 (`ds-proposal`), opened 2026-10-26. Needs owner approval and an ADR |
| Tricolour title treatment | M | Issue #2 (`ds-proposal`), opened 2026-10-26. Conflicts with "tricolour is never text" |
| Patterns: choropleth and legend, multi-select filter, responsive filter bar, tree, breadcrumbs, tabs, data table, source badges, detail dialog | L | Contributed candidates for `patterns/`. Breadcrumbs and tables now have two projects (stiri, org) |

### Adoption of 0.13.0 (2026-10-27)

Relayed by the g2-org session. Commit `36c089f`, tag `v0.16.0` in `institutii-publice`. Not published; the owner reviews first.

- **Install:** `git archive v0.13.0 gov2.css fonts.css fonts` into `explorer/assets/gov2/`, unedited (equal to the tag). Measured.
- **Uses:** `data-g2-scheme="auto"`, `.g2-header`, `.g2-ro-corner`, `.g2-wordmark` with `.g2-ro-sweep`, `.g2-nav`, `.g2-btn`, `.g2-secondary`, `.g2-input`, `.g2-tag`, `.g2-footer`, `.g2-container`. The accessibility statement lists both ADR 0010 deviations.
- **Checklist:** headless Chromium, 5 views, light and dark, 1280 and 375px. No text below 4.5:1 in the first screen, no overflow, no third-party request, Inter renders, focus visible on 14 tab stops in both schemes. Measured. Not checked: forced colours, 200% zoom, screen reader.
- **Findings for the DS:**
  1. A reset in `app` (`button, select, input { font: inherit; color: inherit }`) beats `.g2-btn` and `gov2.states`. In dark, a focused `.g2-btn.g2-secondary` showed light text on yellow. org fixed it with `:where(button, select, input):not(.g2-btn, .g2-input)`. Measured. DS action: name this case in the migration document, next to "a project rule in app that sets colour on a focusable control".
  2. No DS style for `<select>`; org copies `.g2-input`. stiri asked for the same (proposal 10). Two projects: issue opened.
  3. The wrapping `.g2-nav` makes the header about 190px tall at 375px (wordmark, nav, utilities). org makes only its filter bar sticky. DS action: a note on sticky headers in `COMPONENTS.md`.
  4. DS sizes raise list rows from 53 to 73px (1280) and from 75 to 125px (375). The owner's choice; recorded.
- org commented on #3, #5 and #6: it has local breadcrumbs, a data table and a summary list.

### Owner decisions for org (2026-10-26)

Relayed by the g2-org session after the report.

- **Fonts:** DS fonts (Inter, Fragment Mono), with no local exception. org waits for a release with ADR 0005 (brief 03), so that the page makes no third-party request.
- **Sizes:** the DS type scale and control sizes. No compact variant.
- **Dark mode:** org keeps it with local `--g2-*` overrides in `@layer app`. The owner asks the DS for a shared dark scheme: issue #1.
- **Tricolour title:** the local sweep on the title text goes. The owner asks the DS for a shared treatment: issue #2.
- **Adoption brief:** `institutii-publice` `docs/briefs/ds-adoption.md` (tag v0.13.0). It waits for the owner's release announcement.
- The DS GitHub remote has tags up to v0.6.0 only. Measured by the g2-org session.

### Notes for the DS

- The 44px control height is an accessibility-motivated default (target size). A compact variant must keep a sufficient target, or document the WCAG 2.2 target-size exception it relies on.
- A project can set `--g2-font-sans` and `--g2-font-mono` in `app` to keep its own fonts. This is a significant variation, so the project documents it.
- The tricolour text gradient conflicts with a DS design rule, not an accessibility rule. The project decides; the review checklist asks the question.
- Breadcrumbs and data tables meet the promotion rule: a second project needs each one. The owner still approves each new component.

## stiri.gov2.ro — 2026-10-26

Source: `~/devbox/gov2/stiri/docs/reports/2026-10-26-ds-compat.md`, commit `973d5ed` in repo `gov2-ro/stiri`.
The stiri session relayed it at the operator's request. No GitHub issues were opened.

### Adoption

- **Stack:** Python and Jinja2, static output in `site/_build/`. Plain CSS, no build step, no Tailwind. Measured.
- **DS version:** v0.6.0, copied unedited to `site/static/gov2.css` (sha1 `da16ce003bb63949f3f0df2e2456f197dced4bd4`). A project test checks the hash. Measured.
- **Load order:** `/static/gov2.css`, then `/static/site.css`. Project classes use the prefix `st-`. Measured.
- **Classes used:** `.g2-header`, `.g2-ro-corner`, `.g2-nav`, `.g2-footer`, `.g2-notice-bar`, `.g2-tile`, `.g2-chip`, `.g2-tag`, `.g2-link-title`, `.g2-link-quiet`, `.g2-btn`, `.g2-input`, `.g2-inset`, `.g2-dash`, `.g2-mono`.
- **Conflicts:** none. No project rule changes the colour, font, border or background of a `.g2-` class. Five project rules set layout on DS markup only. Measured.
- **Contrast:** every measured pair passes 4.5:1. The lowest is `.g2-tag` ok at 6.16:1. Measured in headless Chrome with the system fallback font.
- **Review checklist:** `GUIDELINES.md` items 1–9 pass, including yellow focus by keyboard. Measured.
- **Fonts:** operator decision D20 is self-hosted fonts (Inter variable and Fragment Mono, fontsource 5.2.8, latin and latin-ext, OFL). The stiri build removes the Google Fonts `@import` line from the served copy. The pinned copy stays unedited.
- **Not prepared:** the 0.8.0 token rename. stiri is on the 0.6.0 API.

### Proposals and DS status

| # | Type | Need | DS status |
|---|---|---|---|
| 1 | component | Page container with side gutters; `--shell` had no class | Covered by brief 04 (`.g2-container`, `--g2-gutter`), in progress |
| 2 | component | Breadcrumbs: `ol`, `/` separators, `aria-current="page"` on the last item | Issue #3, approved 2026-10-27; brief 07 |
| 3 | component | Pagination: plain links, 44px targets, a position line | Issue #4, approved 2026-10-27; brief 07 |
| 4 | component | Table: sunken header, numeric column, stacked layout under 720px with `data-label` | Issue #5, approved 2026-10-27; brief 07 |
| 5 | component | Summary list (`dl`): 14px muted label, one rule per row | Issue #6, approved 2026-10-27; brief 07 |
| 6 | pattern | Result list: item title, mono date and quiet links on a meta line, snippet | Brief 04's directory page shows a local version. Candidate for `patterns/` when a second project needs it |
| 7 | component | Skip link that shows on focus | Issue #7, approved 2026-10-27; brief 07. Related defect: `:focus-visible` fills a focused `<main tabindex="-1">` with yellow |
| 8 | fix | `.g2-notice-bar{display:flex}` overrides `hidden`; `> p` keeps its margin and does not grow | Fixed in 0.9.1 |
| 9 | component | `.g2-nav` layout: flex, wrap, 44px targets | Covered by brief 04 (header/nav composition), in progress |
| 10 | variant | `.g2-input` on `<select>` | Brief 04 adds select only if an example page needs it. Otherwise open |
| 11 | token | Highlight colour for `<mark>`; yellow focus must stay distinct | Issue #8, approved 2026-10-27; brief 07. stiri uses `--c-note-bg` (0.8.0: `--g2-color-warning-bg`) |
| 12 | question | Font delivery without the Google Fonts `@import` | Accepted in ADR 0005; brief 03 ships optional local fonts and removes the import |

### Notes for the DS

- Proposals 1 and 9 give a second project need for the brief 04 container and navigation layout. Brief 04 already covers them.
- Proposals 2–5 match the deferred list in brief 04. stiri is the first project with a stated need. Promote each one when a second project needs it, or when the owner judges it clearly generic.
- Proposal 8 is a defect in a shipped class. The maintainer fixes it without approval.
- The stiri report confirms the brief 03 direction. stiri can drop its build step that strips the `@import` after brief 03 lands.
