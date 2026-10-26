# Guidelines

Status: **draft**, for review by the owner.

`COMPONENTS.md` tells what each component is. This file tells how components work together on a page: hierarchy, link roles, colour, contrast and type. Some classes in this file are **proposed**: they are not in `gov2.css` yet. The backlog tracks them.

The examples come from the first test of the DS in posturi.gov2.ro (26.10.2026). In that test, the header links, the job titles, the institution links, the shortcut links and the build stamp all had the same treatment: blue and underlined. The reader could not see which link is the main one.

## Hierarchy

Give each level on a page one treatment. Two levels must not look the same.

| Level | Example | Treatment (proposed scale) |
|---|---|---|
| Page title | "Posturi active" | 32px, bold, ink |
| Section title | "Filtre" | 24px, bold, ink |
| Item title | A job title in a result list | 19px, bold, link (see *Link roles*) |
| Body | A description | 17px, regular, ink |
| Metadata | Institution, county, salary, contract | 15px, regular, `--c-ink-muted` |
| Label | "STARE", "SORTARE" | 14px, semibold; uppercase only for 1–3 words |

- The item title is the strongest element in each item. Icons and metadata next to it are quieter.
- Separate metadata values with " · ". Show numbers, dates and codes in `.g2-mono`.
- The DS has no type scale yet. The sizes above are a proposal. They use the sizes that `gov2.css` already has: 17px body, 19px wordmark, 15px nav, 14px tag.

## Link roles

A link goes to a place. A button does an action. Do not make a link look like a button, or a button look like a link.

Each link role has one treatment. On one page, two roles must not share a treatment.

| Role | Example | Treatment | Class |
|---|---|---|---|
| In-text link | A link in a paragraph | `--c-gov`, underlined, visited colour | none (base style) |
| Item title | Job title → job page | `--c-gov`, bold, 19px, underlined, visited colour | `.g2-link-title` (proposed) |
| Quiet link | Institution or county in the metadata | `--c-ink`, underlined, no visited colour | `.g2-link-quiet` (proposed) |
| Shortcut or filter | "Medic specialist 76", "Fără experiență 778" | A chip: `--c-sunken` background, ink text, no underline, the count in muted mono. A selected chip has a 2px ink border. | `.g2-chip` (proposed) |
| Header navigation | "Salvate", "Despre" | White, no underline; underlined on hover; a blue bar for the current page | `.g2-nav a` (exists) |
| Other link on the dark bar | The build stamp | `--c-on-bar-muted`, underlined on hover | `.g2-link-inverse` (proposed) |
| Action | Save, hide, edit | A button: `.g2-btn`, or an icon button with a label | `.g2-icon-btn` (proposed) |

- An underline means a link. Do not underline other text. For an abbreviation, use `<abbr title="…">` with a dotted underline, or no underline.
- Keep the visited colour only where the reader goes back to a list: item titles and in-text links.

## Colour

- **Blue is for links only.** Do not use `--c-gov` for text that is not a link.
- **On the dark bar, use only `--c-on-bar`, `--c-on-bar-muted` and `--c-on-bar-accent`.** Do not use `--c-gov` there.
- **A status colour always comes with text.** A tag says "Activ" or "Închis"; the colour only supports the text.
- The tricolour is decorative only. Do not use it for text or for a state.

## Contrast

- Text: at least 4.5:1. Large text (24px, or 19px bold) and UI parts (borders, icons): at least 3:1.
- **Measure the page that the browser shows, not only the tokens.** In the posturi test, the skin check passed, because each token pair was correct. But a DS rule changed the colour of the header links in the page:

| Pair in the posturi test | Ratio | Result |
|---|---|---|
| Header link, `#1d4fbf` on `#0b0c0c` | 2.73:1 | Fails |
| Visited header link, `#4c2c92` on `#0b0c0c` | 1.94:1 | Fails |
| Intended header link, `#cccccc` on `#0b0c0c` | 12.2:1 | Passes |
| Link, `#1d4fbf` on white | 7.18:1 | Passes |

Cause: the base rule `[data-skin="gov2"] a` (specificity 0,1,1) is stronger than a utility class such as `.text-on-bar-muted` (0,1,0). The backlog has the DS fix.

## Type

- Do not use italic for titles. Use italic only for emphasis in text.
- Use uppercase only for short labels (1–3 words). Do not use it for titles or for sentences.
- Use `.g2-mono` for numbers in columns, dates, amounts and codes.

## Actions

- Use one primary button (`.g2-btn`) for each view or form. Other actions use `.g2-secondary`.
- An icon button has an `aria-label`, and a target of at least 44×44px.
- Icons next to an item title use `--c-ink-muted`, so that the title stays stronger.

## Review checklist

Use this checklist when a project adopts the DS, or adds a page. Make a screenshot of each main page, and check:

1. Each link role has one treatment. No two roles look the same.
2. No text is blue if it is not a link.
3. No text is underlined if it is not a link.
4. On the dark bar, each text and link uses an `--c-on-bar*` token.
5. Each text pair on the rendered page has at least 4.5:1. Measure it in the browser.
6. In each item, the title is the strongest element. The metadata is muted.
7. Each view has one primary button at most.
8. Each icon button has a label and a 44px target.
9. With the keyboard, each link and button shows the yellow focus.

## Patterns from projects

Advanced components from projects (for example a job card) go into `patterns/`, so that other projects can use them. See `patterns/README.md`.
