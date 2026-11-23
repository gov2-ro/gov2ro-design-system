# ADR 0011: Header background with a grid, punch-card perforations and glitter

Date: 2026-11-24
Status: Accepted by the owner in this session. Amended on the same day (title shadow and corner mark, see *Amendment*). Not implemented. Three points wait for the owner (see *Open points*).

## Context

Many civic projects copy the GOV.UK design system. The owner wants gov2 projects to look different from them.
GOV.UK changed its own header to blue in June 2025. A black header with a blue band is now the look of the copies.
The owner wants a header with a filled background, because it carries the brand and is easy to remember.
The owner also wants to keep the tricolour corner mark.

The owner compared the options in a design canvas on 2026-11-23 and 2026-11-24:
four identity directions, five header studies, eight background textures, and their variants on indigo.
The owner chose the variant named T9e. The canvas is not part of this repository; this ADR is the record.

## Decision

This decision is about the background of `.g2-header`. It does not change the site title.

### Colour

The background is a horizontal gradient: `linear-gradient(90deg, #0b3d91 0%, #3e3d6c 75%)`.
The left colour is the current `--g2-color-brand`. The right colour is a light indigo; the owner chose it on a second screen with better contrast.

### Pattern

The pattern is static. It sits on the right part of the header and has three stages from left to right:

1. No pattern. The site title and the first navigation links sit on the plain gradient.
2. A grid of 8px squares, with a stronger line each 40px. Line colour `#8cc6ff`, opacity .14 and .30.
3. Punch-card perforations. The grid lines become weaker, and squares of the same grid become perforations.

- A perforation is a white rectangle, 3px wide and 5px high, in an 8px square. Its opacity is .18, .26 or .34, chosen at random.
- The positions are random. The density increases to the right: probability `0.42 × ((x − 300) / 500)^1.3` in a strip 800px wide, measured from the left of the strip.
- The strip is anchored to the right edge of the header and repeats vertically each 80px.
- The whole pattern layer has opacity 0.5.
- The decision fixes the density, the sizes and the opacities. It does not fix the position of each perforation.

### Glitter

Some perforations become brighter and then return, slowly and at different times.

- 23 of the 103 perforations take part at the chosen strength. A second set of 31 takes part weakly.
- The perforations are in ten groups. At speed 1 the groups have cycles of 11, 17, 23, 29, 37, 13, 19, 27, 31 and 41 seconds.
  A group is lit for the middle 40% of its cycle. The different cycles prevent the groups from pulsing together.
- 29 of these 54 perforations can pulse in yellow (`#fcd116`) in place of white.

The owner chose these values:

| Control in the canvas | Value | Meaning |
|---|---|---|
| strength | 0.5 | Opacity of the pattern layer |
| glitter | 1.1 | The first set reaches 55% of a white overlay; the second set reaches 5% |
| speed | 2.5× | Cycles of 4.4 s to 16.4 s |
| frequency | 4 | One pulse in three is yellow |
| saturation | 1 | The yellow is the full `#fcd116` |

`prefers-reduced-motion: reduce` shows the static pattern with no glitter. This is a requirement.
The glitter never conveys information.

### Title

The site title stays as on posturi.gov2.ro and org.gov2.ro: the logo, the project name, then `.gov2.ro` in the muted colour (`.g2-wordmark`).
The moving effect on the title stays the tricolour sweep, `.g2-ro-sweep` (ADR 0010).
The path form `gov2.ro / posturi` from the canvas studies is not chosen.

### Tricolour corner

`.g2-ro-corner` stays at the top right. The amendment below changes how it is drawn.

## Computed contrast

These values are computed from the colour values with the WCAG formula. They are not measured in a browser.

| Pair | Left end `#0b3d91` | Right end `#3e3d6c` |
|---|---|---|
| White text on the background | 10.04:1 | 10.05:1 |
| `#cccccc` (muted text) on the background | 6.25:1 | 6.26:1 |
| `#8cc6ff` (current navigation item) on the background | 5.57:1 | 5.57:1 |
| Sweep blue `#002b7f` on the background | 1.27:1 | 1.26:1 |
| Sweep yellow `#fcd116` on the background | 6.83:1 | 6.83:1 |
| Sweep red `#ce1126` on the background | 1.79:1 | 1.79:1 |
| Bottom band `#1d4ed8` (canvas) against the background | 1.50:1 | 1.50:1 |
| Bottom band `#0b3d91` (current `--g2-color-brand`) against the background | 1.00:1 | 1.50:1 |

Text and navigation have sufficient contrast on the whole gradient.
The sweep is weaker than on the black header: ADR 0010 measured 1.54:1 for blue and 3.48:1 for red on `#0b0c0c`.

## Open points

The owner decides these before or in the implementation brief:

1. **Glitter and WCAG 2.2.2 (Pause, Stop, Hide).** The glitter starts automatically, loops and has no pause control. This is the same deviation as the sweep (ADR 0010). The owner has not accepted it for the glitter. The alternatives are a stop after 5 seconds, or a pause control.
2. **The sweep on the new background.** The blue and red segments are close to the background colour (see the table). Measure it in a browser. Then keep the token colours, or give the sweep lighter colours on this header.
3. **The bottom band.** The canvas used a 4px band in `#1d4ed8`. The current band is 8px in `--g2-color-brand`, which is the left colour of the gradient, so it is not visible there. Choose the colour and the height, or remove the band.
4. **The blue third of the corner mark.** Closed by the amendment: the mark has a light edge. Computed 1.27:1 for the blue against the background (1.54:1 on black).
5. **Narrow screens.** The header wraps, so navigation links sit on the dense end of the pattern. The pattern needs a rule that makes it thinner or hides it.
6. **Delivery.** The pattern is an SVG image. Decide between a data URI in `gov2.css` and a separate file. Measure the size.
7. **Token names and the dark scheme.** `--g2-color-header-bg` holds one colour now. The gradient needs new tokens (ADR 0003, ADR 0009).
8. **Type.** The canvas drew the header in IBM Plex Sans and IBM Plex Mono. That is a separate decision (ADR 0012).

## Consequences

`gov2.css` does not change with this ADR. An implementation brief follows the owner's answers to the open points.
The header of each project changes when the project updates its copy. The brief decides if that is listed under **Breaking**.
The description of the look in `README.md`, `CLAUDE.md`, `AGENTS.md` and the header comment of `gov2.css` ("black header with a brand band") changes with the implementation, not now.

## Amendment (2026-11-24): title shadow and corner mark

The owner compared four more variants in the canvas (V1, V2, V1a, V1b) and chose V1b.

### Title shadow

The site title has a small dark shadow: 1px down, 1px blur, black at 35%.
The canvas used `filter: drop-shadow(0 1px 1px rgb(0 0 0 / .35))` on the title, not `text-shadow`.
Reason: `.g2-ro-sweep` makes the glyph fill transparent, and a `text-shadow` can then show through the glyphs. I did not test `text-shadow`; the brief tests both.
Keyboard focus on the title link shows the standard focus treatment with no shadow.

### Corner mark

`.g2-ro-corner` keeps its position (top 0, right 24px) and its three colours. Its drawing changes:

| Part | Value |
|---|---|
| Each colour | 18px wide, 8px high (now 18px by 6px, as one gradient) |
| Line between two colours | 1px, white at 45% |
| Edge on the left, on the right and at the bottom | 1px, white at 45%. No edge at the top: the mark hangs from the top of the header |
| Shadow | `0 1px 2px`, black at 30% |
| Whole mark | 58px by 9px (now 54px by 6px) |

Computed (WCAG formula, not measured): the edge on the right end of the gradient is `#9594ae`. It has 3.41:1 against the background and 4.31:1 against the blue third.
The edge gives the blue third an outline. This closes open point 4.

### Not chosen

- V2: the same mark with a vertical light-to-dark gradient on each colour (a relief effect).
- V1 and V1a: the same mark, 6px high. V1 also had stronger shadows (55% on the title, 50% on the mark).

### Still open

The mark is drawn for this header. The brief decides if `.g2-ro-corner` changes for every header, or only together with the new background.
The white lines are not text and carry no information; they do not change the rule that the tricolour colours are decorative.
