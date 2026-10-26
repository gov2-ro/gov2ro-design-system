# Patterns

Status: **defined, empty.** No pattern is here yet.

A pattern is an advanced component from a project, for example a job card, a filter sidebar or a result list. Other projects can borrow it. A pattern is not part of `gov2.css`.

## Status of a pattern

| Status | Meaning | Class prefix |
|---|---|---|
| Contributed | One project uses it. Other projects can copy it. | The prefix of the origin project, for example `.pst-card` |
| Candidate | A second project uses it, or needs it. The maintainer prepares it for the DS. | The origin prefix |
| Core | It is in `gov2.css` and in `COMPONENTS.md`. Its folder here is removed. | `.g2-` |

A pattern becomes core through a `ds-proposal` issue. The owner approves it, because it adds a component.

## Folder for each pattern

```
patterns/<name>/
  README.md     origin project, use, markup, states, the DS tokens and classes it uses
  <name>.css    the CSS, with the origin prefix; only DS tokens, no colour literals
  <name>.png    a screenshot from the origin project
```

- Prefer DS tokens (`rgb(var(--c-…))`) when their roles fit. Document useful local variations and retain accessible behaviour.
- The pattern follows `GUIDELINES.md`.

## How to contribute a pattern

1. Open a `ds-proposal` issue with the type "pattern". Give the origin project and the files.
2. The maintainer adds the folder here, and adds the pattern to the kitchen sink.

## Live guide

`docs/index.html` is the single executable guide and component inventory. It loads `../gov2.css` directly.
When adding a pattern, load its CSS there and label its contribution status. Keep pattern styles separate from core component styles.
No second kitchen-sink page is needed. The pattern library is currently empty.
