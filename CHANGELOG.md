# Changelog

## 0.7.0 — 2026-10-26 (proposal, untested)

**Fixed**
- Wordmark focus uses ink for both the name and domain suffix.
- Secondary button hover no longer replaces its focused yellow background.
- Buttons, chips and inputs set their box sizing without requiring a host reset.
- False or empty `aria-current` no longer selects a chip.

**Changed**
- Consumers adapt to the shared DS; core CSS does not target a consumer skin contract. ADR 0001 records the decision.
- Design guidance presents defaults and reasons, with separate accessibility requirements.
- Corrected installation/release instructions, layer-precedence claims and faint-text background guidance.

**Added**
- A completed six-decision plan and four scoped implementation briefs with dependencies, migration instructions and acceptance checks.
- ADR 0002 accepts whole-site activation for brief 01; loading the future stylesheet will require no activation attribute or wrapper.
- ADR 0003 accepts semantic `--g2-` tokens and one status vocabulary, preserving component classes and colour values with no compatibility aliases.
- ADR 0004 accepts explicit cascade layers and supported project customization. Brief 01 is ready for implementation with baseline browser checks and migration instructions.
- ADR 0005 accepts optional self-hosted Inter and Fragment Mono and removal of the remote import. Brief 03 is ready after brief 01; font delivery is not yet changed.
- ADR 0006 accepts and implements the live guide against the current stylesheet: 14 sections, every core component class and 19 copyable examples.
- `docs/guide.css` and `docs/guide.js`: documentation layout and progressive copy/toggle/dismissal helpers; no framework or generation step.
- Pinned Playwright development tooling, a local preview server, raw component fixtures and browser regression checks. Manual coverage is documented in `docs/testing.md`.
- A historical guide archive with the original committed bundle, provenance and checksum, linked from the live guide.
- ADR 0007 accepts the first foundation package. All six follow-up decisions are settled; brief 04 is ready after brief 01.

Activation, naming and cascade/customization decisions are accepted for brief 01. The current runtime API remains in place until that brief is implemented. No API rename is released by this entry.

## 0.6.0 — 2026-10-26 (proposal, untested)

**Changed**
- The base rules for `body` and links now have the specificity of one element (0,0,1), with `:where()`. Before, `[data-skin="gov2"] a` (0,1,1) won over project classes, for example Tailwind utilities. They still win over an element reset that loads before `gov2.css`. The focus rules did not change.

**Added**
- Link role classes: `.g2-link-title`, `.g2-link-quiet`, `.g2-link-inverse`.
- `.g2-chip` and `.g2-chip-count`: shortcut and filter links. Select with `aria-current` or `aria-pressed="true"`.

## 0.5.0 — 2026-10-26 (proposal, untested)

No change to the styles in `gov2.css`.

- `GUIDELINES.md` (draft): hierarchy, link roles, colour, contrast, type, actions, and a review checklist. It proposes `.g2-link-title`, `.g2-link-quiet`, `.g2-link-inverse`, `.g2-chip` and `.g2-icon-btn`.
- `patterns/README.md`: how projects contribute advanced components (contributed → candidate → core).
- `docs/connect-a-project.md`: known transition issues (Google Fonts, link specificity, no link roles), and a review step in the adoption prompt.
- Known issue: the base link rule `[data-skin="gov2"] a` is stronger than single utility classes in projects.

## 0.4.0 — 2026-10-26 (proposal, untested)

No change to the styles in `gov2.css`.

- `docs/connect-a-project.md`: prompts for project sessions (compatibility report, adoption, proposal, update), and how sessions find the DS session.

## 0.3.0 — 2026-10-26 (proposal, untested)

No change to the styles in `gov2.css`.

- `COMPONENTS.md`: the reference for each `.g2-` class and token group, with markup.
- Proposals: GitHub issues with the label `ds-proposal`, and an issue template.
- `docs/project-block.md`: the DS rules block for `AGENTS.md` and `CLAUDE.md` in each project.

## 0.2.0 — 2026-10-26 (proposal, untested)

First tagged version, aligned with igov.ro (brand.css, GOV.UK theme of 2026-10).

- Type: Inter for text, Fragment Mono for codes and aligned numbers (replaces Public Sans + IBM Plex Mono).
- Colours: ink #0b0c0c, links #1d4fbf, brand band #0b3d91, primary button #00703c, focus #ffdd00.
- Status tones: neutral, info, progress, warn (`note`), ok, bad (`alert`). Token names kept from posturi.gov.ro.
- Square corners, no decorative shadows; lime highlight removed.
- Tricolour marks: `.g2-ro-corner` (default), `.g2-ro-bar`, `.g2-ro-dots`.
- Dismissible notice bar above the header: `.g2-notice-bar`.
- Header height 52px.
- Repo URLs point to `gov2-ro/gov2ro-design-system`.

## 0.1 — 2026-10 (unreleased draft)

Public Sans, navy #1241a1, lime accent. Superseded by 0.2.0.
