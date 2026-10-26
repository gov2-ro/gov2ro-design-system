# Backlog

Statuses: `[ ]` open, `[~]` in progress, `[x]` done, `[-]` dropped.

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
  - Possible DS change: scope the `.g2-` classes under `[data-skin="gov2"]`. Not decided. This is a breaking change.
  - Measured: no posturi template uses a `.g2-` class, so the unscoped rules do not change pages now. The 23 unknown tokens are warnings only. `gov2.css` sets 32 of the 32 colour tokens in the contract.
  - Measured on 2026-10-26, from the owner's screenshot and the CSS: all links look the same (blue, underlined). Cause: `[data-skin="gov2"] a` (0,1,1) is stronger than the Tailwind utilities (0,1,0), for example `.text-on-bar-muted`. Header links: 2.73:1 (visited 1.94:1) instead of the intended 12.2:1. `check-skins.php` passes, because it checks the tokens, not the page.
  - Italic job titles come from posturi (`font-display italic`), not from the DS.
  - Google Fonts (accepted during the transition): posturi links all skin files on each page, so the `@import` in `gov2.css` loads Google Fonts for each visitor, with each skin. posturi serves its other fonts itself (`@font-face` with files in `/static/fonts/`). Possible DS change: `@font-face` with font files in the DS, or the fonts in a separate file.
- [ ] **ins.gov2.ro** — repo not confirmed. Several repos mention the domain: `tempo-at`, `tempo-at-ui`, `tempo-at23`, `tempo-landing`, and the project has worktrees. The owner starts a session there with prompt 1 of `docs/connect-a-project.md`.
- [ ] **civtech.gov2.ro** — repo `awesome-civetch` (confirmed by the owner).
- [ ] **orgs.gov2.ro** — repo `institutii-publice` (confirmed by the owner).
- [ ] Cross-project questions: Is the Google Fonts `@import` permitted in each project? Do the projects need dark mode?
- [ ] Replace the Google Fonts `@import` with `@font-face` and font files in the DS. Accepted during the transition; fix before 1.0.0.

## Hierarchy and link roles

From the posturi test. `GUIDELINES.md` has the rules.

- [ ] Wrap the base rules of `gov2.css` in `:where([data-skin="gov2"])`, so that a project class is stronger than a DS base rule. Check if any project depends on the current specificity. Probably a minor change, not breaking.
- [ ] Add the link role classes: `.g2-link-title`, `.g2-link-quiet`, `.g2-link-inverse`.
- [ ] Add `.g2-chip` (shortcut and filter links, with a count and a selected state).
- [ ] Add `.g2-icon-btn` (icon button with a label and a 44px target).
- [ ] Add a type scale (page title, section title, item title, body, metadata, label).
- [ ] The owner reviews `GUIDELINES.md` (status: draft).

## Patterns and kitchen sink

- [ ] Write `docs/kitchensink.html` by hand. It loads `../gov2.css` and the pattern CSS, and shows each core component and each pattern. Brief for Sonnet.
- [ ] First pattern: the job card from posturi.gov2.ro (`patterns/job-card/`).

## Checklist for 1.0.0

The owner decides on 1.0.0 when all items are done.

- [ ] At least two live projects use the DS, with no overrides of `.g2-` classes.
- [x] `COMPONENTS.md` exists. Keep it in agreement with `gov2.css`.
- [ ] The style guide is regenerated from the current `gov2.css`.
- [ ] The contrast of each text and background pair is measured. The ratios in the `gov2.css` comments (19:1, 7:1, 4.6:1) are not measured yet.
- [ ] Keyboard focus is checked on each component.
- [ ] No open `ds-proposal` issue is a breaking change.
- [ ] No Google Fonts request.
- [ ] A project passes the review checklist in `GUIDELINES.md`.

## DS gaps

Found while writing `COMPONENTS.md`. Each gap is also listed in `COMPONENTS.md` under *Not in the DS yet*.

- [ ] Page container and grid. The token `--shell` exists, but no class uses it.
- [ ] Layout for `.g2-nav` and `.g2-footer` (no flex, no padding).
- [ ] Classes for `textarea`, `select`, checkboxes and radios.
- [ ] Tables, pagination, breadcrumbs, tabs and summary lists.
- [ ] A hover state for `.g2-btn.g2-warning`.
- [ ] Dark mode.

## Delivery

- [ ] Set up file delivery from gov2.ro or ui.gov2.ro for quick projects.
- [~] Update the copy in posturi.gov.ro (`webapp-php/static/skins/gov2.css`). The owner copied 0.4.0, and the block says 0.4.0. Not committed in posturi yet.

## Style guide

- [ ] Find out which tool generates `docs/index.html`, and document how to regenerate it. The guide does not load `gov2.css`, so it can show old styles.
- [ ] Update the usage section of the guide when delivery is decided. It still shows the CDN and says that `@1` gets the fixes automatically.
- [ ] Decide if GitHub Pages publishes the guide. Pages is not enabled now, and the repo is private.

## Verified limits

(none yet)
