# Brief 08: Select control

Status: Implemented in 0.15.0. The owner approved issue #10 on 2026-10-27.

## Problem and outcome

stiri.gov2.ro and org.gov2.ro both style `<select>` by copying `.g2-input`.
The DS documents no select: no arrow space, no disabled, error or dark-scheme state.
Make `.g2-input` the one class for text inputs and native selects.

## Decision

- Use `.g2-input` on `<select>`. Do not add a `.g2-select` class. One class for each text-like control keeps one term for one concept.
- Keep the native control. Do not build a custom widget, and do not replace the native popup.
- Draw the arrow with CSS only, from tokens, so that it follows the colour scheme. Do not add an image file or a colour literal.
- No new token is expected. If one is needed, stop and ask.

## Scope

Change `gov2.css`, `COMPONENTS.md` (the *Fields* section), `docs/index.html`, `tests/contract.html`, the suite,
`docs/migration-from-0.6.0.md` (a "Changes after 0.14.0" section), `docs/testing.md`, `CHANGELOG.md` (`## Unreleased`,
first line "Brief 08 (select control)."), `docs/BACKLOG.md` and `docs/ACTIVITY.md`.
Add one select to the directory example if a filter there fits; otherwise demonstrate it only in the guide and the fixture.
Do not edit `docs/decisions/`, `docs/briefs/`, `CLAUDE.md`, `AGENTS.md`, consumers or the archive snapshot.

## Requirements

- A select with `.g2-input` has the same height, border, font, focus treatment and error state as a text input.
- The arrow is visible in light, dark and forced colours, and the text never runs under it.
- `:disabled` matches the disabled text input.
- `multiple` and `size` selects keep a usable native list. Document what the class does to them.
- Keyboard and pointer use stay native. The accessible name comes from the label.
- Contrast: the text 4.5:1 and the arrow and border 3:1, in both schemes.

## Acceptance checks

1. The checks above are executable, in light and dark, including forced-colours emulation.
2. A select and a text input in one `.g2-field` row have equal height and border at 1280 and 320px.
3. No horizontal overflow at 320px and with 200% root text.
4. `COMPONENTS.md`, the guide and the fixture show the select in the same change.
5. The existing suite stays green. The archive bytes stay unchanged.

## Handoff

Do not pin tests to `## Unreleased` or to a version number. Do not commit, tag, publish or message other sessions.
Report the CSS, each check with its result, commands, browser version and screenshots.
