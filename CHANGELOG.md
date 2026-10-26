# Changelog

## 0.9.0 — 2026-10-26 (proposal, untested)

Brief 04 (page foundations). Nothing here is a breaking change: no token or class is renamed or removed.
`docs/migration-from-0.6.0.md` has a section, *Changes after 0.8.0*, for projects that update.

**Added**
- Tokens (in `gov2.tokens`): the type scale `--g2-font-size-heading-page` (2rem), `--g2-font-size-heading-section` (1.5rem), `--g2-font-size-heading-item` (1.1875rem), `--g2-font-size-body` (1.0625rem), `--g2-font-size-meta` (.9375rem), `--g2-font-size-label` (.875rem), `--g2-line-height-heading` (1.25) and `--g2-line-height-body` (1.55);
  the spacing scale `--g2-space-1` to `--g2-space-7` (.25, .5, .75, 1, 1.5, 2 and 3rem); and `--g2-gutter` (`clamp(1rem, 3vw, 2rem)`).
- Classes (in `gov2.components`): `.g2-container`, `.g2-heading-page`, `.g2-heading-section`, `.g2-heading-item`, `.g2-text-meta`, `.g2-field`, `.g2-label`, `.g2-hint` and `.g2-footer-in`.
- A disabled `.g2-input` now has a style (sunken surface, muted text, `not-allowed` cursor). Before, it looked like an enabled input. The rule is in `gov2.states`.
- Forced-colours rules: the current `.g2-nav` link and the selected `.g2-chip` use `Highlight` and `HighlightText`. Before, forced colours removed the navigation bar and gave every chip the same border.
- `docs/examples/directory.html`, `docs/examples/form.html` and `docs/examples/examples.css`: two static Romanian pages with demonstration data, a local `ex-` composition in the `app` layer, native recovery links and no script. The live guide links both.
- A live-guide section (*Pagină și exemple*) for the container, the spacing scale and the local composition rules; the type roles, the field states, the recovery link and the footer composition in their sections.
- Browser checks: `tests/foundation.test.mjs` (47 checks) and the shared `tests/helpers.mjs`. They cover the acceptance checks of brief 04: reflow at 320, 390, 768 and 1280px, enlargement, root text size, keyboard order, error recovery and accessibility-API names and descriptions, contrast, hover plus focus, forced colours, no script and no web fonts, and the documented customization.

**Changed**
- `--g2-container-max` is `80rem`, not `1280px`. The width is the same at a 16px root; it now follows the root text size. This is a correction, not a breaking change.
- Text sizes of `body`, `.g2-btn`, `.g2-input`, `.g2-link-title`, `.g2-nav a`, `.g2-chip`, `.g2-chip-count`, `.g2-tag` and `.g2-notice-bar` are in rem and read the new type tokens. The computed sizes at a 16px root are the same as before.
  `.g2-link-title` keeps its line height of 1.3. `.g2-wordmark` and the close button of the notice bar still use px.
- `.g2-header-in` wraps (`flex-wrap`), uses `--g2-space-2` between rows and `--g2-space-5` between columns, and has `--g2-space-1` padding above and below. It is `box-sizing: border-box`, so a header that is not wrapped keeps its 52px height.
- `.g2-nav` is a wrapping flex row with a 4px gap. `.g2-nav a` is at least 44px high (it was about 23px) and has `--g2-space-2` padding above and below. The current-page bar is now at the bottom of the taller link. Check the header height in a project that arranged these classes itself.
- Headings with a role class (`.g2-heading-*`) and `.g2-field` break a word that is wider than the line, so that long words and addresses do not overflow a narrow screen.
- `.g2-field>.g2-input` has a `scroll-margin` of 12rem above it, so that the label, the hint and the error message stay in view after a recovery link moves focus to the field.
- The live guide, `tests/contract.html`, `COMPONENTS.md` and `GUIDELINES.md` describe the new API. `GUIDELINES.md` no longer calls the type scale a proposal and has sections for page structure and for fields and errors.
- The tests moved their shared set-up to `tests/helpers.mjs`. The existing checks are unchanged apart from the new section count (15), the new `--g2-container-max` value and the migration-table check, which now lists the tokens added after 0.8.0.
- The archived bundle (`docs/archive/2026-10-26-bundled-guide.html`) is unchanged.

## 0.8.0 — 2026-10-26 (proposal, untested)

Brief 01 (shared CSS contract). ADR 0008 records the token names and the layer placement. Read `docs/migration-from-0.6.0.md` before you update a project.

**Breaking**
- **Activation.** `<html data-skin="gov2">` is removed. Loading `gov2.css` applies the base styles to the whole page and publishes the tokens on `:root`. No attribute and no wrapper is needed (ADR 0002). The stylesheet ignores the old attribute.
- **Token names.** Every custom property has the `--g2-` namespace and a role name (ADR 0003). The colour values and the RGB-channel format are unchanged. There are no aliases. The DS had 62 tokens and has 57:
  - Surfaces: `--c-page` → `--g2-color-page`; `--c-surface` → `--g2-color-surface`; `--c-sunken` → `--g2-color-surface-sunken`; `--c-line` → `--g2-color-line`; `--c-line-strong` → `--g2-color-control-border`.
  - Text: `--c-ink` → `--g2-color-text`; `--c-ink-muted` → `--g2-color-text-muted`; `--c-ink-faint` → `--g2-color-text-faint`.
  - Links and selection: `--c-gov` → `--g2-color-link`; `--c-gov-visited` → `--g2-color-link-visited`; `--c-gov-light` → `--g2-color-selected-bg`; `--c-on-gov` → `--g2-color-on-link`.
  - Brand and header: `--c-brand` → `--g2-color-brand`; `--c-gov-bar` → `--g2-color-header-bg`; `--c-on-bar` → `--g2-color-on-header`; `--c-on-bar-muted` → `--g2-color-on-header-muted`; `--c-on-bar-accent` → `--g2-color-header-accent`.
  - Actions: `--c-primary` → `--g2-color-action`; `--c-primary-hover` → `--g2-color-action-hover`; `--c-primary-shadow` → `--g2-color-action-shadow`; `--c-secondary-shadow` → `--g2-color-action-secondary-shadow`; `--c-danger` → `--g2-color-danger-solid`; `--c-danger-shadow` → `--g2-color-danger-shadow`.
  - Focus: `--c-focus` → `--g2-color-focus`; `--c-focus-ink` → `--g2-color-on-focus`.
  - Status: `--c-neutral-bg` → `--g2-color-neutral-bg`; `--c-neutral-line` → `--g2-color-neutral-line`; `--c-neutral-ink` → `--g2-color-neutral-ink`; `--c-info-bg` → `--g2-color-info-bg`; `--c-info-line` → `--g2-color-info-line`; `--c-info-ink` → `--g2-color-info-ink`; `--c-progress-bg` → `--g2-color-progress-bg`; `--c-progress-line` → `--g2-color-progress-line`; `--c-progress-ink` → `--g2-color-progress-ink`; `--c-note-bg` → `--g2-color-warning-bg`; `--c-note-line` → `--g2-color-warning-line`; `--c-note-ink` → `--g2-color-warning-ink`; `--c-ok-bg` → `--g2-color-success-bg`; `--c-ok-line` → `--g2-color-success-line`; `--c-ok-ink` → `--g2-color-success-ink`; `--c-alert-bg` → `--g2-color-danger-bg`; `--c-alert-line` → `--g2-color-danger-line`; `--c-alert-ink` → `--g2-color-danger-ink`; `--c-ok-solid` → `--g2-color-success-solid`.
  - Tricolour: `--c-ro-blue` → `--g2-color-ro-blue`; `--c-ro-yellow` → `--g2-color-ro-yellow`; `--c-ro-red` → `--g2-color-ro-red`.
  - Charts: `--c-chart-1` → `--g2-color-chart-1`; `--c-chart-2` → `--g2-color-chart-2`; `--c-chart-3` → `--g2-color-chart-3`; `--c-chart-4` → `--g2-color-chart-4`; `--c-chart-sel` → `--g2-color-chart-selected`.
  - Type: `--font-display` removed; `--font-sans` → `--g2-font-sans`; `--font-mono` → `--g2-font-mono`.
  - Metrics: `--radius` → `--g2-radius`; `--radius-md` removed; `--radius-lg` removed; `--radius-pill` removed; `--border-ink` → `--g2-border-width-control`; `--shadow-lift` removed; `--shell` → `--g2-container-max`.
- **Removed tokens.** `--font-display` (same value as `--g2-font-sans`; use that), `--radius-md`, `--radius-lg` and `--radius-pill` (use `--g2-radius`) and `--shadow-lift` (no replacement; no component has a lift state). Each reason is in the migration document.
- **Status names.** One set of six names in tokens and markup: neutral, info, progress, warning, success, danger. Token groups `note`, `ok` and `alert` are now `warning`, `success` and `danger` (see the lists above). `data-tone="warn"` is now `"warning"`, `"ok"` is `"success"` and `"bad"` is `"danger"`. A tag with an old value renders as neutral.
- **Cascade layers.** `gov2.css` declares `@layer reset, gov2, utilities, app;` and the sublayers `gov2.tokens`, `gov2.base`, `gov2.components` and `gov2.states` before any rule (ADR 0004). Every rule is in a layer. A project reset or rule that is outside every layer now outranks gov2, focus included. Put the reset in `reset` and project CSS in `app` or `utilities`. A project that links `gov2.css` after an unlayered reset sees different link, button and focus colours until it moves the reset into a layer.
- **Behaviour.** A keyboard-focused link in `.g2-nav` shows the standard focus bars (yellow above, ink below) instead of the blue current-page bar. Hovering that link no longer underlines it. Both changes follow from the layered focus rules. They are the only rendered differences in a one-time comparison of 169 element states against 0.7.0 in Chrome 155.

**Changed**
- `.g2-input` reads its border colour from `--g2-color-control-border`. `.g2-btn`, `.g2-chip` and `.g2-input` read their border width from `--g2-border-width-control`. `.g2-btn`, `.g2-chip`, `.g2-input`, `.g2-tag`, `.g2-tile` and `.g2-notice` read `--g2-radius`. The rendered values are the same as before.
- Focus, the selected chip, the disabled button and the field error are in `gov2.states`. Hover stays with each component default, so `.g2-btn.g2-warning` keeps its colour on hover.
- No `.g2-*` class is renamed or removed. `.g2-btn.g2-warning` is still the red destructive button.
- The live guide, the archive landing page, `tests/contract.html` and the documentation use the new names and the layers. The archived bundle (`docs/archive/2026-10-26-bundled-guide.html`) is unchanged.
- `README.md`, `COMPONENTS.md`, `GUIDELINES.md`, `AGENTS.md`, `CLAUDE.md`, `docs/project-block.md` and `docs/connect-a-project.md` describe the new contract. The project block now tells projects to declare the layer order.

**Added**
- `docs/migration-from-0.6.0.md`: the old-to-new table for 62 tokens, the status mapping, the layer rules and limits, and verified examples (a standalone page, a page with a reset, a compact variant, a page-width token override and a recoloured variant that keeps focus). It covers 0.6.0 and 0.7.0, because their runtime API is the same.
- Browser checks: 59 tests replace 36 tests and 2 TODOs. New checks cover whole-site activation, the `--g2-` namespace, token and reference completeness, migration-table values, the status vocabulary, layer order and precedence, the documented examples, documented limits and the combined states.
- The old posturi skin checker is retired for this core. `gov2.css` does not pass it and does not try to.

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
