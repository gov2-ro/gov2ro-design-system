# ADR 0009: Opt-in dark colour scheme

Date: 2026-10-26
Status: Accepted. The owner approved the scheme in issue #1 and chose opt-in activation in this session.

## Context

org.gov2.ro has a dark mode, and civtech.gov2.ro is assumed to have one. The DS has none.
Without a shared scheme, each project invents dark values for the same `--g2-color-*` tokens.
The owner prefers shared fixes in the DS over local overrides.
Some projects have local colours that assume a light page. An automatic dark scheme could make those pages unreadable after an update.

## Decision

`gov2.css` ships dark values for the `--g2-color-*` tokens. Projects do not write their own dark values.

Light stays the default. A page opts in with one attribute on the root element:

| Markup | Result |
|---|---|
| no attribute, or `data-g2-scheme="light"` | Light scheme |
| `data-g2-scheme="auto"` | Follows `prefers-color-scheme` |
| `data-g2-scheme="dark"` | Dark scheme |

The attribute has the `g2` prefix so that it does not collide with a project's own theme attribute.
The core sets `color-scheme` to match the active scheme, so native controls and scrollbars follow it.
The core contains no toggle and no script. A project that offers a viewer choice sets the attribute itself and stores the choice.

Dark values live in the `gov2.tokens` sublayer, after the light values. Component rules do not change per scheme; they read tokens.
Therefore every colour a component paints must come from a token. The component literals `#fff`, `#dbdad9` and `#3a5aa0` become tokens:

| New token | Light value | Role |
|---|---|---|
| `--g2-color-on-solid` | `#ffffff` | Text on a saturated fill: action and danger buttons, the notice title band |
| `--g2-color-action-secondary-hover` | `#dbdad9` | Hover background of the secondary button |
| `--g2-color-control-bg` | `#ffffff` | Background of an input, also while focused |
| `--g2-color-ro-blue-ring` | `#3a5aa0` | Ring around the blue tricolour dot |

The navigation link colour reads `--g2-color-on-header`. The notice body reads `--g2-color-surface`.

## Requirements for the dark values

These are accessibility requirements, not preferences:

- Every text and background pair that a component or the base styles render meets 4.5:1, and 3:1 for large text.
- Control boundaries, the selected chip border and the field error bar meet 3:1 against their background.
- The focus indicator stays the yellow fill with dark text, and it meets 3:1 against the dark page.
- Status tones keep their meaning: each `-ink` meets 4.5:1 on its `-bg`, and each `-line` meets 3:1 on the page.
- Visited links stay distinguishable from unvisited links.

These are defaults with reasons:

- Keep the tricolour values unchanged in both schemes. They are national colours. Their visibility on a dark surface is measured and reported; a change needs a separate decision.
- The header is already dark. In the dark scheme, the brand band separates the header from the page.
- Give the existing chart tokens dark values that keep their order of emphasis. A sequential map ramp is a separate proposal.

## Consequences

The change adds four tokens and one attribute. It renames nothing, so it is a minor version without **Breaking**.
A project with local light-only colours stays light until it opts in and checks its own colours.
org replaces its local dark overrides with `data-g2-scheme="auto"` when the release reaches it.
Brief 05 implements this decision.
