# Activity

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
