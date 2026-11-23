# ADR 0012: Typeface direction — IBM Plex Sans and IBM Plex Mono

Date: 2026-11-24
Status: Proposed. The owner said on 2026-11-23 that they lean to this direction. The owner has not confirmed it as final.

## Context

Inter and Fragment Mono come from the GOV.UK-derived theme of igov.ro (ADR 0005).
The owner wants gov2 projects to look different from other GOV.UK copies, and asked for typeface options.
The owner compared four directions in a design canvas on 2026-11-23:

| Direction | Type | Other marks |
|---|---|---|
| A · Retuș | Inter, Fragment Mono (no change) | White header, five token values |
| B · Monitor | Source Serif 4 headings, Inter text | Masthead header, black button |
| C · Registru | IBM Plex Sans, IBM Plex Mono | Uppercase mono labels, accent `#1d4ed8` |
| D · Paralel | Instrument Sans headings, Inter text | Double rule, indigo accent |

The owner chose to continue with C · Registru. All later header studies used IBM Plex Sans and IBM Plex Mono.
civtech.gov2.ro already uses IBM Plex Sans for text (with Instrument Sans for headings and JetBrains Mono).

## Proposed decision

- `--g2-font-sans` names IBM Plex Sans, for text and for headings.
- `--g2-font-mono` names IBM Plex Mono, for numbers, codes and metadata.
- Short labels can use the mono family in uppercase: field labels, statistic labels and tags (12px, weight 500, letter spacing .06em to .08em in the canvas).
- Headings use weight 600 in the canvas, not 700.

The delivery rule of ADR 0005 does not change: the files are local, `gov2.css` makes no font request, and the notices stay with the files.
This ADR changes only the two families that ADR 0005 names. Fragment Mono and Inter leave `fonts/` when this is implemented.

## Not part of this proposal

The canvas drew other parts of direction C. The owner has not chosen them:

- the accent `#1d4ed8` for links and for the primary button, and the button without a bottom shadow;
- the header of direction C (white, with a blue rule). ADR 0011 replaces it;
- the title as a path, `gov2.ro / posturi`. ADR 0011 keeps the current title.

## To measure before acceptance

- The Romanian letters ă, â, î, ș, ț and their capitals in both families, in the `latin` and `latin-ext` subsets.
- File sizes. The current fonts are 172,660 bytes in 4 files (`fonts/README.md`). Check if a variable IBM Plex Sans file exists and compare it with four static weights (400, 500, 600, 700).
- Text width against Inter at the same size: the wrapped header, the buttons and the table columns in the two example pages.
- The fallback stack when the files do not load.

## Consequences

This is a breaking change for projects with a copy: two token values and the font files change. The owner approves it in an issue.
`docs/migration-from-0.6.0.md`, `fonts/README.md`, `COMPONENTS.md` and the guide change with the implementation.
civtech comes closer to the DS for text. Its heading and mono families stay local until civtech adopts the DS.
