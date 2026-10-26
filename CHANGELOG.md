# Changelog

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
