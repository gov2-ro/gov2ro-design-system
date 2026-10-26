# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The gov2 design system (DS): one shared stylesheet (`gov2.css`) and a style guide for gov2.ro projects (posturi, civtech, org…). Repo: https://github.com/gov2-ro/gov2ro-design-system.

The DS follows the GOV.UK-derived theme of igov.ro: Inter + Fragment Mono, square corners, underlined links, yellow focus, green primary button, six status tones and an optional Romanian tricolour mark. The repo has no build, lint or test tooling.

## How gov2.css is structured

- **Everything is scoped to `[data-skin="gov2"]`.** Tokens and base element styles (body, links, focus) apply only when the page sets `<html data-skin="gov2">`. Component classes are opt-in and use the prefix `.g2-` (`.g2-header`, `.g2-btn`, `.g2-tag`, `.g2-tile`…).
- **Colour tokens are bare RGB channels** (`--c-ink: 11 12 12;`). Use them as `rgb(var(--c-ink))` or `rgb(var(--c-ink) / .5)`. Give each new token the same format, with the hex value in a trailing comment.
- **Token names are a contract with the projects.** The status tones are neutral, info, progress, note, ok and alert, each with `-bg`, `-line` and `-ink`. In markup, `data-tone=warn` uses `note` and `data-tone=bad` uses `alert`. These names come from posturi.gov.ro.
- **Design rules in the tokens:** the radius is always 0, there are no decorative shadows (`--shadow-lift: none`), and the tricolour colours (`--c-ro-*`) are decorative only, never text. The default tricolour mark is `.g2-ro-corner`; the alternatives are `.g2-ro-bar` and `.g2-ro-dots`.
- Component rules are minified, one rule per line, and grouped under `/* ---- Section ---- */` comments. Keep that style.

## Style guide (`docs/index.html`)

GitHub Pages serves this file. A tool generated it as a self-contained bundle (`__bundler/manifest` and `template` script blocks, with lines of several hundred KB). The bundle does not load `../gov2.css`, so a stylesheet change does not show in the guide. Do not edit the layout or styles by hand. A plain text replacement (for example a URL) is safe, because the template has no integrity hash. The guide text is in Romanian.

## Logos

`logo/` holds one SVG for each project:
- Monochrome, with `fill="currentColor"`, so that the logo shows white on the black header.
- Square viewBox; `.g2-logo` shows it at 28px high.
- Decorative next to the wordmark: use `aria-hidden="true"`. The project name stays as text.

## How projects use the DS

- **Only one version exists: the latest.** There are no release branches and no backports.
- **Bigger projects include a copy of the files.** posturi.gov.ro has a copy in `webapp-php/static/skins/gov2.css`. A project with a copy stays on that version until it updates. When it updates, it goes to the latest version and reads `CHANGELOG.md` back to its old version. The project copies the file as it is and does not edit the copy.
- **Quick projects will load the files from gov2.ro or ui.gov2.ro.** This is not set up yet. CDN delivery is not set up either.
- A project keeps its own styles in its own file, with its own class prefix. It uses the `--c-*` tokens and the `.g2-*` classes, but it does not change how a `.g2-*` class looks. When a project needs an override, the DS probably needs a new variant.

## How the DS changes

- **Proposals are GitHub issues** on `gov2-ro/gov2ro-design-system`, with the label `ds-proposal`. An agent in any project can open one with `gh`. The issue gives the need, a screenshot, the markup, the projects that can use it, and the type: component, variant, token or fix.
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

**Publishing a release is separate, and happens only when asked.** Publishing includes `git push`, a GitHub release, a deploy to gov2.ro or ui.gov2.ro, and a message to the projects.

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

Note: GitHub Pages serves `docs/`, so these files are public.

## Opus designs, Sonnet builds

The work is divided by model. **When you are Opus**, give implementation and well-defined future work to Sonnet by default:

- **Opus** writes specs, ADRs and briefs. Opus makes and records decisions. Opus reviews the results of Sonnet against the brief before it accepts them.
- **Sonnet** does what a brief says: code, spikes, measurements and fixture changes. Sonnet also writes the activity and backlog entries for that work.
- **Opus does the work itself** when the task is a few lines, or when the design still changes and the work is part of the decision.

Write the brief in the GitHub issue. When there is no issue, write it in `docs/briefs/`.

**Sonnet stops and asks** when a step would change a spec, an ADR, a token or `.g2-` class name, or a file that the brief does not include. Sonnet reports what it measured and what it assumed.

To hand over, Opus tells the owner that the brief is ready. The owner runs the brief in a Sonnet session, or asks Opus to start a Sonnet agent on it.
