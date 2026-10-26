# ADR 0008: Token names and layer placement in 0.8.0

Date: 2026-10-26
Status: Accepted by the maintainer after review of brief 01.

## Context

ADR 0003 fixed the namespace, the status vocabulary and eight example names.
ADR 0004 fixed the layer approach, and brief 01 fixed the public layer names.
The implementer had to name the remaining tokens and place each rule in a sublayer.
Brief 01 asks for those decisions to be recorded in an ADR.

## Decision

Accept the names in `docs/migration-from-0.6.0.md` as the 0.8.0 public token API. The role choices are:

| Token | Role, and the reason for the name |
|---|---|
| `--g2-color-surface-sunken` | A recessed surface. "Sunken" is a surface variant, not a separate group. |
| `--g2-color-control-border` | The border of form controls. It replaces `--c-line-strong`, which only controls used. |
| `--g2-color-selected-bg` | The background of a selected row or item. It is a selection role, not a link role. |
| `--g2-color-on-link` | Text on a fill in the link colour. "Accent" is not used, because the header has its own accent. |
| `--g2-color-on-header`, `--g2-color-on-header-muted`, `--g2-color-header-accent` | Text and the current-item mark on the dark header surface. |
| `--g2-color-action`, `-hover`, `-shadow`, `--g2-color-action-secondary-shadow` | The action (button) colours. "Primary" is not used, because it names a rank, not a role. |
| `--g2-color-danger-solid`, `--g2-color-success-solid` | Solid fills for errors, destructive actions and success marks. The `-bg/-line/-ink` tone groups stay separate. |
| `--g2-color-chart-selected` | The selected chart series. |
| `--g2-border-width-control` | The border width of buttons, chips and inputs. |

Remove `--font-display`, `--radius-md`, `--radius-lg`, `--radius-pill` and `--shadow-lift`.
They had no distinct role: each equalled another token or `none`. The migration document gives each reason.
`--g2-radius` is the single radius role. Every component with a box edge reads it.

Place rules in sublayers as follows:

- `gov2.tokens`: custom properties on `:root`.
- `gov2.base`: element defaults (`body`, links) and the reduced-motion rule.
- `gov2.components`: `.g2-*` defaults, including hover and the current-page navigation mark.
- `gov2.states`: keyboard focus, chip selection, disabled buttons and field errors.

Hover stays in `components`, so a variant default can still outrank the generic hover of its component.
No core rule sits outside a layer.

## Accepted behaviour changes

A focused current link in `.g2-nav` shows the standard focus treatment instead of the current-page bar.
A focused navigation link is not underlined on hover. Every other focused link already behaved that way.
These follow from the general rule that focus wins over component defaults.

## Known limits, deferred

- `.g2-btn.g2-warning` is the red destructive button, while `warning` is now the yellow status name. ADR 0003 keeps class names. A rename needs an owner decision.
- A disabled button still changes background on hover.
- The general `:focus-visible` rule fills a focused skip-link target, such as `<main tabindex="-1">`, with yellow.
- Some component colours are literals (`#fff`, `#dbdad9`, `#3a5aa0`) rather than tokens.

`docs/BACKLOG.md` tracks each limit.

## Consequences

Projects with a copy migrate once, with the table in `docs/migration-from-0.6.0.md`.
The suite compares that table with `gov2.css`, so a later rename must update both.
Briefs 03 and 04 build on these names and sublayers. New tokens follow the same role-name pattern.
