# Guidelines

Status: **draft**, for review by the owner.

`COMPONENTS.md` describes the current API. This file explains the design defaults and their reasons.
A proposed component is not available until it appears in `gov2.css` and `COMPONENTS.md`.

## How to apply this guidance

Use these defaults as a starting point. Adjust them when the content or task benefits.
Keep navigation, actions, states and reading order understandable after each adjustment.
Accessibility requirements still apply. An aesthetic preference is not an accessibility requirement.

Projects adapt to the shared system. A consumer's old skin, reset or framework does not define the DS API.
Keep consumer adapters in the consumer. See `docs/decisions/0001-shared-system-boundary.md`.

## Hierarchy

Make the page's main task and important content easy to find.
Size, weight, spacing and placement can establish hierarchy together. Every role does not need a unique appearance.

| Role | Starting point, not an implemented scale |
|---|---|
| Page title | 32px, bold |
| Section title | 24px, bold |
| Item title | 19px, bold |
| Body | 17px, regular |
| Metadata | 15px, regular, muted |
| Short label | 14px, semibold |

These sizes are proposals. The DS does not yet implement a complete type scale.
Use the content and available space to judge their suitability.

In a result list, a prominent title usually helps scanning. Metadata can be quieter without becoming difficult to read.
Use separators, grouping or separate lines as appropriate. Mono type helps align numbers and distinguish codes.

## Links and actions

Choose HTML by behaviour: an anchor navigates; a button performs an action.
A prominent navigation link may use button styling. A secondary action may use a quieter treatment.
The element must retain its native keyboard behaviour and an understandable name.

| Need | Available default |
|---|---|
| Link in prose | Base underlined link |
| Linked item title | `.g2-link-title` |
| Secondary metadata link | `.g2-link-quiet` |
| Link on a dark surface | `.g2-link-inverse` |
| Shortcut link or toggle | `.g2-chip`; use an anchor or button according to behaviour |
| Header navigation | `.g2-nav a` |
| Prominent action | `.g2-btn` |
| Secondary action | `.g2-btn.g2-secondary` |

Underlines are a useful default for links in prose. Navigation and chips have other visual cues.
Avoid styling ordinary text so that readers mistake it for an interactive control.
Visited colours help when readers return to lists or references; they are less useful for persistent navigation.

## Colour and surfaces

The default blue suggests a link. Other uses can work when context makes their meaning clear.
Use the dark-surface text tokens on dark backgrounds as a starting point, then measure the rendered result.
A status needs a textual or other accessible explanation; colour alone must not carry its meaning.
The tricolour marks are decorative. They do not convey status.

Text and background form a pair. A text token is not safe on every surface.
For example, `--g2-color-text-faint` measures about 4.57:1 on white and 4.08:1 on `--g2-color-surface-sunken`.
Use `--g2-color-text-muted` for ordinary metadata on the sunken surface.

## Accessibility

Target WCAG 2.2 AA. Validate applicable criteria, not only a screenshot or a list of token values.

- Ordinary text generally needs 4.5:1 contrast; qualifying large text needs 3:1.
- Essential control boundaries and graphical information generally need 3:1 against adjacent colours.
- Each interactive element needs an accessible name and appropriate keyboard behaviour.
- Keyboard focus must remain visible, including when hover and focus occur together. A project rule can replace the gov2 focus colours: see `docs/migration-from-0.6.0.md`.
- Aim for 44×44px targets for important controls when practical. WCAG 2.2 AA has a 24×24px minimum with exceptions.
- Check reflow, text enlargement and forced colours on representative pages.

See the [WCAG 2.2 standard](https://www.w3.org/TR/WCAG22/) for definitions and exceptions.

## Type and action emphasis

Sentence case and upright titles are useful defaults for scanning. Italic or uppercase can serve a particular context.
Judge longer labels and titles for readability instead of applying a fixed word-count rule.

A single prominent primary action usually makes the next step clearer.
Several independent tasks may justify more than one. Group related actions and make consequences understandable.
Icon-only controls need an accessible name; visible text often helps recognition.

## Review a page

1. Can readers identify the main task and scan the content hierarchy?
2. Can readers distinguish navigation, actions, state and ordinary text?
3. Do text and essential graphics meet contrast requirements on their actual surfaces?
4. Are controls named, usable by keyboard and visibly focused in combined states?
5. Does the page remain usable at narrow widths and with enlarged text?
6. Do disabled, selected, error and empty states communicate their meaning?
7. Are departures from the defaults useful and consistent within the project?

## Patterns from projects

Reusable patterns can be contributed to `patterns/`. See `patterns/README.md`.
A contribution records its origin. Its original project's framework and skin are not requirements for the core DS.
