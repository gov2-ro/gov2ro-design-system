# Brief 07: Navigation and data components

Status: Ready for implementation after brief 06 lands. The owner approved issues #3–#8 on 2026-10-27.
Briefs 05 and 06 also edit `gov2.css` and the suite. Start from the commit that releases brief 06.

## Problem and outcome

stiri.gov2.ro and org.gov2.ro each built local breadcrumbs, tables, summary lists, pagination and skip links.
The owner prefers shared fixes in the DS over local versions.
Add six opt-in pieces to `gov2.css`, demonstrate them in the guide and the example pages, and retire the matching local example rules.

| Issue | Piece | Projects |
|---|---|---|
| #3 | Breadcrumbs | stiri, org |
| #4 | Pagination | stiri |
| #5 | Data table | stiri, org |
| #6 | Summary list | stiri, org, the form example |
| #7 | Skip link, and the focus fill on `tabindex="-1"` targets | stiri, both example pages |
| #8 | Highlight colour for `<mark>` | stiri |

Each issue has the project's local CSS and maintainer notes. Read them with `gh issue view <n> -R gov2-ro/gov2ro-design-system`.

## Scope

Change:

- `gov2.css`, `COMPONENTS.md` and `GUIDELINES.md`.
- `docs/index.html` and `docs/guide.css`: one example of each piece, with copyable markup.
- `docs/examples/*.html` and `docs/examples/examples.css`: use the new pieces where the pages already need them, and delete the local rules they replace (`ex-skip` and the record grid, if a summary list fits it). Add breadcrumbs to the form/detail page and pagination to the directory page.
- `tests/contract.html` and the suite.
- `docs/testing.md`, `docs/migration-from-0.6.0.md` (new classes and the token, no migration step), `CHANGELOG.md` (`## Unreleased`), `docs/BACKLOG.md` and `docs/ACTIVITY.md`.

Do not edit `docs/decisions/`, `docs/briefs/`, consumer repositories or the archive snapshot.

## Decided names

Use these. Do not invent alternatives.

| Piece | Classes and tokens |
|---|---|
| Breadcrumbs | `.g2-breadcrumbs` on a `<nav>` that contains an `<ol>` |
| Pagination | `.g2-pagination` on a `<nav>` |
| Data table | `.g2-table` on `<table>`; `.g2-table-stacked` modifier; `.g2-table-wrap` scroll container; `.g2-cell-num` numeric cell |
| Summary list | `.g2-summary-list` on `<dl>`, one `<div>` for each row |
| Skip link | `.g2-skip-link` |
| Highlight | `--g2-color-highlight-bg` (light `#fff7bf`) and a base rule for `mark` |

## Requirements

These are accessibility requirements:

- **Breadcrumbs:** a long current item wraps; it is never truncated. The separator is not announced. The current item has `aria-current="page"` and is not a link.
- **Pagination:** links have a target of at least 44px high. The current page, if numbered links are shown, has `aria-current="page"`. An absent previous or next link is left out, not shown as a disabled link.
- **Table:** a `<caption>` or an accessible name is documented as required. Header cells use `scope`. Numeric cells use tabular figures and align right.
  - `.g2-table-stacked` shows one row as a block under a documented width. It must keep the table semantics in the accessibility tree; verify with the Chrome accessibility tree, not by assumption.
  - `.g2-table-wrap` scrolls a wide table inside the page. It is keyboard-scrollable: document `tabindex="0"`, `role="region"` and an accessible name.
  - The page itself never scrolls horizontally.
- **Summary list:** labels and values stay associated (`dt`/`dd`). Rows stack under a narrow width. A long value wraps.
- **Skip link:** it is the first focusable element. It is invisible until focused, then visible with the standard focus treatment. Activating it moves focus to the main content.
  - Fix the backlog defect in the same change: a target with `tabindex="-1"` that receives focus does not get the yellow focus fill.
- **Highlight:** `mark` text meets 4.5:1 in both schemes. The highlight stays visibly different from the yellow focus fill. Give the token a dark value under ADR 0009.

These are defaults with reasons:

- Start from the local versions in the issues. Use the type scale, spacing tokens and colour tokens; no colour literal.
- Breadcrumb separator `/`, in the faint text colour.
- Table header row on the sunken surface, with a label-size font; row rules in the line colour.
- Summary list label at the label size, muted; one rule between rows.

## Acceptance checks

1. Each new class and the token appear in `COMPONENTS.md`, the guide, the raw fixture and `gov2.css` in the same change.
2. Each requirement above has an executable check, including the accessibility tree for the stacked table and the focus path of the skip link.
3. At 320, 390, 768 and 1280 CSS pixels, and with 200% root text, the guide and both example pages have no horizontal page overflow.
4. Keyboard order on both example pages starts with the skip link, then the header, then the breadcrumbs.
5. Contrast, focus, hover plus focus and forced colours pass for every new piece, in the light and dark schemes.
6. The example pages use the new pieces, and `examples.css` no longer contains the rules they replace.
7. The existing suite stays green, and the archive bytes stay unchanged.

## Handoff prompt

Implement this brief after brief 06 has landed. Read ADRs 0001–0010, the six issues and their comments first.
Use the decided names. Report each acceptance check, measured ratios, commands, browser version and screenshots.
Stop and ask if a step needs a name, a token or a file that this brief does not list.
Do not commit, tag, publish, comment on issues or edit consumers.
