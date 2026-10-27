# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The gov2 design system (DS): one shared stylesheet (`gov2.css`) and a style guide for gov2.ro projects (posturi, civtech, org…). Repo: https://github.com/gov2-ro/gov2ro-design-system.

The DS follows the GOV.UK-derived theme of igov.ro: Inter + Fragment Mono, square corners, underlined links, yellow focus, green primary button, six status tones and an optional Romanian tricolour mark. The guide has no build step. `npm run dev` serves it; `npm test` runs the Playwright browser checks. See `docs/testing.md`.

## How gov2.css is structured

- **Activation:** loading `gov2.css` applies the base styles (body, links, focus) to the whole page and publishes the tokens on `:root`. The page needs no attribute and no wrapper (ADR 0002). Component classes are opt-in and use the prefix `.g2-` (`.g2-header`, `.g2-btn`, `.g2-tag`, `.g2-tile`…).
- **Layers (ADR 0004):** the first lines declare `@layer reset, gov2, utilities, app;` and then `gov2.tokens, gov2.base, gov2.components, gov2.states`. No rule sits outside a layer. Put component defaults and hover in `components`. Put focus, selection, disabled and error in `states`. A layer decides before specificity, so test each combined state.
- **Colour tokens are bare RGB channels** (`--g2-color-text: 11 12 12;`). Use them as `rgb(var(--g2-color-text))` or `rgb(var(--g2-color-text) / .5)`. Give each new token the `--g2-` prefix and the same format, with the hex value in a trailing comment.
- **Names follow ADR 0003:** tokens describe a role (`--g2-color-link`, `--g2-color-header-bg`). The six status names are neutral, info, progress, warning, success and danger. Tokens (`-bg`, `-line`, `-ink`) and `data-tone` values use the same names. Do not add aliases for old names; `docs/migration-from-0.6.0.md` lists them. Their origin does not constrain the shared API. See `docs/decisions/0001-shared-system-boundary.md`.
- **Design rules in the tokens:** the radius is always 0 (`--g2-radius`), there are no decorative shadows, and the tricolour colours (`--g2-color-ro-*`) are decorative only, never text, except `.g2-ro-sweep` (ADR 0010). The default tricolour mark is `.g2-ro-corner`; the alternatives are `.g2-ro-bar` and `.g2-ro-dots`.
- **Fonts (ADR 0005):** `gov2.css` makes no font request. `fonts.css` and `fonts/` supply Inter and Fragment Mono as local files; every project installs them, except a quick one-off project. Do not add a remote font import.
- **Colour scheme (ADR 0009):** light is the default. `<html data-g2-scheme="auto">` follows the system, and `"dark"` forces dark. Dark values live in `gov2.tokens`; components read tokens only, so no component rule contains a colour literal.
- Component rules are minified, one rule per line, and grouped under `/* ---- Section ---- */` comments. Keep that style.

## Style guide (`docs/index.html`)

The guide is editable HTML in Romanian and loads `../gov2.css` directly.
`docs/guide.css` provides documentation layout; it must not repair or duplicate `.g2-*` component appearance.
`docs/guide.js` adds copy, toggle and dismissal demonstrations. Essential content and markup stay available without JavaScript.
Keep every implemented component and documented state represented. Label approved but unimplemented work separately.
Run `npm test` after changing component examples or shared behaviour; see `docs/testing.md` for browser setup and manual coverage.
The suite runs the code blocks marked `<!-- example: … -->` in `docs/migration-from-0.6.0.md`, and it compares the token tables there with `gov2.css`. Change both together.
`tests/contract.html` tests raw components without documentation CSS. Extend the same suite for later briefs.
The live guide replaces the historical bundle. The owner requested preserving that bundle in `docs/archive/` for reference.
Keep the archived snapshot byte-for-byte unchanged; record provenance in its README. Do not migrate its tokens or embedded runtime.
No hosted guide or CDN is configured.

## Logos

`logo/` holds one SVG for each project:
- Monochrome, with `fill="currentColor"`, so that the logo shows white on the black header.
- Square viewBox; `.g2-logo` shows it at 28px high.
- Decorative next to the wordmark: use `aria-hidden="true"`. The project name stays as text.

## How projects use the DS

- **Only one version exists: the latest.** There are no release branches and no backports.
- **Projects may include a copy of the files.** The consumer chooses its own asset path. A project with a copy stays on that version until it updates. When it updates, it goes to the latest version and reads `CHANGELOG.md` back to its old version. The project copies the file as it is and does not edit the copy.
- **Quick projects will load the files from gov2.ro or ui.gov2.ro.** This is not set up yet. CDN delivery is not set up either.
- A project keeps its own styles in its own file, with its own class prefix. Prefer shared components where they fit. Document useful local variations and retain accessible behaviour. The customization contract is accepted in ADR 0004 and specified for implementation in `docs/briefs/01-shared-css-contract.md`.

## Shared system boundary

The DS defines its own API. Consumer skin contracts, token lists, frameworks and paths do not constrain it.
Consumers, including posturi, adapt in their own repositories. Do not put consumer compatibility adapters in `gov2.css`.
Design guidance expresses defaults and reasons; separate accessibility requirements from aesthetic preferences.
See `docs/decisions/0001-shared-system-boundary.md` and the decision sequence in `docs/briefs/README.md`.

## How the DS changes

- **`COMPONENTS.md` is the specification** of each `.g2-` class and token group. Change it in the same commit as `gov2.css`.
- **`GUIDELINES.md` tells how components work together:** hierarchy, link roles, colour, contrast, type, and a review checklist. `COMPONENTS.md` tells what exists. When a proposed class in `GUIDELINES.md` goes into `gov2.css`, add it to `COMPONENTS.md` and remove "proposed".
- **`patterns/` holds advanced components from projects** (contributed → candidate → core). See `patterns/README.md`.
- **Proposals are GitHub issues** on `gov2-ro/gov2ro-design-system`, with the label `ds-proposal`. An agent in any project can open one with `gh`. The template is `.github/ISSUE_TEMPLATE/ds-proposal.md`. It asks for the type (component, variant, token or fix), the need, the markup, the projects that can use it, and the local version.
- **Each project has the same DS block** in its `AGENTS.md` and `CLAUDE.md`. The block is in `docs/project-block.md`. When the block changes, tell the projects.
- **`docs/connect-a-project.md` has the prompts for project sessions:** compatibility report, adoption, proposal and update. When a project session sends a compatibility report, write it into `docs/compat-analysis.md`, update `docs/BACKLOG.md`, and reply to the session. A report can also arrive as a GitHub issue with the title `[compat] <domain>`.
- **Promote a local pattern to the DS** when a second project needs it, or when it is clearly generic. Until then, keep it in the project.
- **One maintainer edits the DS.** Only the agent that works in this repo changes `gov2.css`, `CHANGELOG.md` and the docs. Agents in other repos open issues; they do not edit the DS.
- **The maintainer releases small fixes without approval.** The owner approves each new component, variant or token, and each breaking change, in the issue.
- **GitHub issues and git are the record.** Claude sessions can send notifications to each other with remote-control, for example "proposal #14 is open" or "1.2.0 closes #14". A message is not the record: agents from other providers do not get it, and it is lost when a session closes. Each agent can find the current state in the open issues and the tags.

## Versions

The version is in three places: the header comment of `gov2.css`, the heading in `CHANGELOG.md`, and the git tag `vX.Y.Z`. Keep the three equal.

The DS is at 0.x: a proposal, not tested yet. Before 1.0.0:

- **Minor:** a new component, variant, token, ADR or spec; a structural change; or a breaking change. A breaking change renames or removes a token or a `.g2-` class, or changes its meaning. The owner must approve a breaking change in an issue. List it under **Breaking** in `CHANGELOG.md`, because the projects with a copy need the warning.
- **Patch:** a correction only.

**Only the owner decides on 1.0.0.** Do not bump to 1.0.0 without the owner. The checklist for 1.0.0 is in `docs/BACKLOG.md`. From 1.0.0, a breaking change bumps the major version.

**Versions follow the work.** The project is spec-driven (SDD), so documentation is also a deliverable. A spec, an ADR, a decision that changes a spec, a set of named tests and a measured spike are deliverables. After each committed chunk, check what changed since the last tag (`git log $(git describe --tags --abbrev=0)..HEAD`). For a deliverable or a structural change, bump the minor version. For a correction only, bump the patch version. Then commit and tag the commit. Do this without asking, and say when you did it.

**Push after every release.** The owner gave standing permission on 2026-10-27: after you tag a release, run `git push origin main --tags`. Projects then find the latest tag on GitHub.

**Other publishing happens only when asked.** This includes a GitHub release, a deploy to gov2.ro or ui.gov2.ro, and a message to the projects.

## Tone of voice

Follow Simplified Technical English (ASD-STE100) for docs, error messages and agent-facing text:

- One instruction per sentence; at most ~20 words (procedures), ~25 (descriptive).
- Active voice; name the actor.
- Simple tenses.
- One word, one meaning; the same term every time.
- No noun clusters over three words; keep the articles.
- Keep every condition and qualifier.

ASD-STE100 is for English. For Romanian UI copy, use the same principles: short sentences, active voice, and one term for each concept.

## Process notes

Two files carry the project memory between sessions. Create each file with the first work that needs it. Read both files before you start.

**`docs/BACKLOG.md`** — roadmap, tasks and bugs. Statuses: `[ ]` open, `[~]` in progress, `[x]` done, `[-]` dropped.
- Change an item to `[x]` in the same change that finishes it.
- Add a defect or deferred work when you find it.
- Mark a dead end `[-]` **with the reason**, under *Verified limits*, so that nobody investigates it again.

**`docs/ACTIVITY.md`** — dated entries, newest first. Each entry has **Done / Hard / Decided**.
- Add an entry when a chunk of work lands.
- Give each decision its rationale and the cost of the alternative.
- Record wrong turns. Say what you measured and what you assumed. Keep the measured numbers: they are the baseline for regressions.

Record a design rule that the projects depend on as an ADR in `docs/decisions/NNNN-title.md`.

## Opus designs, Sonnet builds

The work is divided by model. **When you are Opus**, give implementation and well-defined future work to Sonnet by default:

- **Opus** writes specs, ADRs and briefs. Opus makes and records decisions. Opus reviews the results of Sonnet against the brief before it accepts them.
- **Sonnet** does what a brief says: code, spikes, measurements and fixture changes. Sonnet also writes the activity and backlog entries for that work.
- **Opus does the work itself** when the task is a few lines, or when the design still changes and the work is part of the decision.

Write the brief in the GitHub issue. When there is no issue, write it in `docs/briefs/`.

**Sonnet stops and asks** when a step would change a spec, an ADR, a token or `.g2-` class name, or a file that the brief does not include. Sonnet reports what it measured and what it assumed.

To hand over, Opus tells the owner that the brief is ready. The owner runs the brief in a Sonnet session, or asks Opus to start a Sonnet agent on it.
