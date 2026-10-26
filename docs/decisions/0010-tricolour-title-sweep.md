# ADR 0010: Tricolour title sweep, with two deliberate WCAG deviations

Date: 2026-10-26
Status: Accepted by the owner in issue #2 and in this session.

## Context

org.gov2.ro and civtech.gov2.ro animate a blue–yellow–red band across their site title text.
The DS rule says the tricolour colours are decorative and never text.
The owner asked for a shared component and chose the sweep on the text itself (option 2 in issue #2).
The owner also accepted that the sweep loops with no pause control.

Measured contrast of the band colours (issue #2):

| Colour | On white | On the header (`#0b0c0c`) |
|---|---|---|
| `--g2-color-ro-blue` `#002b7f` | 9.61:1 | 1.54:1 |
| `--g2-color-ro-yellow` `#fcd116` | 1.47:1 | 13.31:1 |
| `--g2-color-ro-red` `#ce1126` | 5.63:1 | 3.48:1 |

## Decision

Add one opt-in class, `.g2-ro-sweep`, for a site title. It is the only exception to "tricolour is never text".

```html
<a class="g2-wordmark" href="/"><span class="g2-ro-sweep">Instituții publice</span></a>
```

- Use it on an inline element that contains only the title text. The element sits in `.g2-wordmark` or in a title heading inside `.g2-header`.
- Do not use it on body text, on content links or on a status. Do not use it more than once on a page.
- At rest, the glyphs have the normal text colour of their surface. A narrow tricolour band crosses the glyphs, then the text rests.
- The text stays real text: it keeps its accessible name, and the reader can select it.

## Deliberate deviations

The owner accepts these deviations for `.g2-ro-sweep` only:

1. **WCAG 2.2.2 Pause, Stop, Hide (level A).** The sweep starts automatically, loops and has no pause control. Reason given by the owner: it is slow and small. `prefers-reduced-motion: reduce` is the only stop.
2. **WCAG 1.4.3 Contrast (Minimum) (level AA).** While the band crosses a glyph, that glyph can fall below 4.5:1. The yellow segment fails on white and the blue segment fails on the header.

A project that must conform to WCAG 2.1 or 2.2 level AA does not use `.g2-ro-sweep`.
A project that uses it lists both deviations in its accessibility statement.

## Required mitigations

These limit the deviations. They are requirements, not preferences:

- The band crosses the title in at most 3 s. The full cycle is at least 9 s, so the text rests at full contrast for most of each cycle.
- At rest and in the static state, every glyph has its normal contrast (4.5:1 or better).
- `prefers-reduced-motion: reduce` shows the static state with no band. The base rule already stops animation; the static frame must show no band.
- Forced colours show plain system text. Print shows plain text.
- Keyboard focus on the containing link shows the standard focus treatment with fully visible text. The sweep must not leave the glyphs transparent on focus.
- A browser without `background-clip: text` shows plain text.
- The sweep never conveys information.

## Consequences

CLAUDE.md, AGENTS.md, GUIDELINES.md and COMPONENTS.md change "never text" to "never text, except `.g2-ro-sweep` (ADR 0010)".
The review checklist asks whether a project that uses `.g2-ro-sweep` lists the deviations.
This is a new component: a minor version without **Breaking**. Brief 06 implements it.
