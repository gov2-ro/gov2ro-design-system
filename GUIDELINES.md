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

| Role | Starting point | Class or token |
|---|---|---|
| Page title | 2rem (32px), bold | `.g2-heading-page` |
| Section title | 1.5rem (24px), bold | `.g2-heading-section` |
| Item title | 1.1875rem (19px), bold | `.g2-heading-item`, `.g2-link-title` |
| Body | 1.0625rem (17px), regular | the base style, `--g2-font-size-body` |
| Metadata | .9375rem (15px), regular, muted | `.g2-text-meta` |
| Short label | .875rem (14px), semibold | `.g2-label` |

The type scale is implemented in `gov2.css` (see *Type roles* in `COMPONENTS.md`). The sizes are in rem, so they follow the reader's text size.
They are starting treatments, not rules. Use the content and available space to judge their suitability.
Line height: about 1.25 for headings (1.2 to 1.3 reads well) and 1.55 for running text.
Choose the HTML heading level from the document structure, and the class from the look that the role needs. The two are independent.
A project that needs another size overrides the token in its `app` layer. A recurring variation can become a shared option.

## Page structure

Put the header content, the main content and the footer content in `.g2-container`, so that their edges align and the side gutters are equal.
The container, with its gutter, must fit a 320px viewport.

- Use the spacing steps (`--g2-space-1` to `--g2-space-7`) for gaps and padding. Small steps group things that belong together; larger steps separate groups and sections.
- Let the header and navigation wrap. Wrapping keeps every link visible and needs no script. A disclosure menu adds an interaction that a page may not need.
- Make navigation targets large enough to use. 44px high is a good aim. Do not clip a long label.
- Show the current page in the navigation with `aria-current="page"`. Do not rely on one visual cue: forced colours can remove a shadow.
- Put the source and the date of verification next to a figure. Label demonstration data as demonstration data.

## Fields and errors

- Give each field a visible label, with `for`. Put a hint before the control when the reader needs a format or an example.
- Tell the reader what is wrong and how to fix it. Start the message with a word such as "Eroare:", so that colour is not the only cue.
- Mark an invalid control with `aria-invalid="true"` and connect the hint and the message with `aria-describedby`.
- After a failed submission, list the problems in a summary with a link to each field. The link moves keyboard focus to the field.
  Do not move focus when the page loads for the first time.
- Use `disabled` only for a control that cannot be used. Say why in the hint. A disabled control is not focusable and is not submitted.

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

A page can offer a dark scheme with `data-g2-scheme` on `<html>` (`COMPONENTS.md`, *Colour scheme*). Light stays the default.
Then every colour comes from a token: a colour literal that was written for a light page stays light on a dark page.
Judge a dark page by its measured pairs, not by its look. A saturated fill, such as the primary button, carries dark text in the dark scheme (`--g2-color-on-solid`).
The tricolour does not change with the scheme. Its blue is hard to see on a dark page, so do not use it where the reader must see it.

## Accessibility

Target WCAG 2.2 AA. Validate applicable criteria, not only a screenshot or a list of token values.

- Ordinary text generally needs 4.5:1 contrast; qualifying large text needs 3:1.
- Essential control boundaries and graphical information generally need 3:1 against adjacent colours.
- Each interactive element needs an accessible name and appropriate keyboard behaviour.
- Keyboard focus must remain visible, including when hover and focus occur together. A project rule can replace the gov2 focus colours: see `docs/migration-from-0.6.0.md`.
- Aim for 44×44px targets for important controls when practical. WCAG 2.2 AA has a 24×24px minimum with exceptions.
- Check reflow, text enlargement and forced colours on representative pages.
- When the page offers the dark scheme, repeat the contrast, focus and state checks in both schemes.

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
