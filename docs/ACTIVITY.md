# Activity

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
