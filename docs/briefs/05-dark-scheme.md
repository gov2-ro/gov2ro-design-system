# Brief 05: Opt-in dark colour scheme

Status: Implemented in 0.12.0. ADR 0009 records the decision. Issue #1.
Brief 03 also edits `gov2.css` and the suite. Start this brief from the commit that releases brief 03.

## Problem and outcome

The DS has no dark scheme, so projects invent their own dark values.
Ship dark values for the `--g2-color-*` tokens in `gov2.css`, behind an opt-in attribute.
A page that does not opt in looks exactly as before.

## Scope

Change:

- `gov2.css`: four new tokens, literal colours replaced by tokens, dark values and `color-scheme`.
- `COMPONENTS.md`, `GUIDELINES.md`, `README.md` and `docs/project-block.md` (one line on the attribute).
- `docs/index.html` and `docs/guide.css`: a dark scheme section and a way to view examples in both schemes.
- `docs/examples/*.html`: no change to their default; tests render them in both schemes.
- `tests/contract.html` and the existing suite; add a test file if that keeps it readable, with one runner.
- `docs/testing.md`, `CHANGELOG.md` (`## Unreleased`), `docs/BACKLOG.md` and `docs/ACTIVITY.md`.

Do not edit `docs/decisions/`, `docs/briefs/`, consumer repositories or the archive snapshot.
Do not add a toggle, a script, a sequential map ramp or new components.

## Decided names and markup

Use these. Do not invent alternatives.

- Attribute on `<html>`: `data-g2-scheme` with the values `light`, `dark` and `auto`. No attribute means light.
- `auto` follows `@media (prefers-color-scheme: dark)`.
- New tokens, with their light values unchanged from the current literals:
  - `--g2-color-on-solid` (`#ffffff`): text on the action and danger buttons and on the notice title band.
  - `--g2-color-action-secondary-hover` (`#dbdad9`): hover background of `.g2-btn.g2-secondary`.
  - `--g2-color-control-bg` (`#ffffff`): background of `.g2-input`, also in the focused input rule.
  - `--g2-color-ro-blue-ring` (`#3a5aa0`): ring of the blue `.g2-ro-dots` dot.
- `.g2-nav a` reads `--g2-color-on-header`. `.g2-notice>*:last-child` reads `--g2-color-surface`.
- After this brief, no component rule in `gov2.css` contains a colour literal. A static test checks this.

## Implementation defaults

- Put the dark values in `gov2.tokens`, after the light block. Repeat one value set for two selectors: `:root[data-g2-scheme=dark]` and `:root[data-g2-scheme=auto]` inside the media query. Avoid two hand-maintained copies; if CSS forces duplication, add a test that both blocks are equal.
- Set `color-scheme: light` on `:root` and `color-scheme: dark` in the dark blocks.
- Keep the RGB-channel format. Give each dark value its hex in a trailing comment.
- Dark values are yours to propose within ADR 0009's requirements. Start from GOV.UK-like neutrals: a near-black page, a slightly lighter surface, light text, a light blue link. Report each value with its measured ratios.
- Keep the tricolour values unchanged. Measure and report how the marks look on the dark page; do not change them.
- The header stays dark. If the dark page and the header are the same colour, the brand band separates them; report what you chose.

## Acceptance checks

1. A page with no attribute, and a page with `data-g2-scheme="light"`, render exactly as before. Compare computed styles for every component state against the previous release.
2. `data-g2-scheme="dark"` applies the dark values. `auto` applies them only under emulated `prefers-color-scheme: dark`.
3. `color-scheme` matches the active scheme. A native `<select>` or scrollbar follows it; record what you measured.
4. In the dark scheme, every rendered text pair in the guide, the fixture and both example pages meets 4.5:1 (3:1 for large text).
5. In the dark scheme, control boundaries, the selected chip border, the field error bar and the focus indicator meet 3:1.
6. Status tones in dark: each `-ink` meets 4.5:1 on its `-bg`, and each `-line` meets 3:1 on the page.
7. Focus, hover plus focus, disabled, selected and error states remain distinguishable in both schemes.
8. Forced-colours emulation behaves the same in both schemes.
9. No component rule contains a colour literal; every `var()` resolves in both schemes.
10. The new tokens and the attribute appear in `COMPONENTS.md`, the guide and the fixture in the same change.
11. Desktop and 320px screenshots of the guide and both example pages, in both schemes, are reviewed.
12. The existing suite stays green, and the archive bytes stay unchanged.

## Handoff prompt

Implement this brief in the gov2 repository after brief 03 has landed. Read ADRs 0001–0009 first.
Use the decided names. Propose the dark values and measure them.
Report the full dark value table with ratios, every acceptance check, commands, browser version and screenshot paths.
Stop and ask if a step needs a name, a token or a file that this brief does not list.
Do not commit, tag, publish or edit consumers.
