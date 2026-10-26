# Brief 01: Shared CSS contract

Status: Ready for implementation. D1, D2 and D3 are accepted.
Owner direction: ADRs 0001–0004 define the accepted shared contract.
The live guide and browser suite were implemented first at the owner's request. Migrate them with this contract.
This handoff does not include font delivery, guide redesign or component expansion.

## Problem and outcome

The existing API mixes a shared visual system with activation and vocabulary inherited from a consumer skin system.
Base rules also promise override behaviour that does not hold across cascade layers.
Produce a coherent shared stylesheet. Consumers adapt to it; the core contains no consumer compatibility layer.

## Accepted decisions

- D1 activation: accepted in ADR 0002. Automatic whole-site defaults, tokens on `:root`, no required activation attribute or wrapper.
- D2 names: accepted in ADR 0003. Use `--g2-` semantic custom properties and the accepted status vocabulary; retain `.g2-*` classes and colour values, without compatibility aliases.
- D3 cascade: accepted in ADR 0004. Explicit layer order puts resets before gov2, then project utilities and overrides.
- D3 customization: accepted in ADR 0004. Projects can compose and customize in their own stylesheet; they document significant variations and verify accessible behaviour.

Remove `data-skin` gates from tokens, base rules, focus and reduced-motion rules.
Replacing scoped focus selectors changes specificity. Check all component states under the accepted cascade rather than deleting the prefix mechanically.
Installation examples use ordinary `<html lang="ro">` markup and a stylesheet link.

## Scope

Change `gov2.css`, `COMPONENTS.md`, `GUIDELINES.md`, `README.md`, `docs/project-block.md`,
`docs/connect-a-project.md`, `AGENTS.md`, `CLAUDE.md`, `docs/BACKLOG.md`, `docs/ACTIVITY.md` and `CHANGELOG.md` as needed.
Add a public migration document under `docs/` and migrate the live guide and browser fixtures from package 02.
Do not edit consumer repositories or redesign the live guide as part of this package.
Keep the historical bundle in `docs/archive/` byte-for-byte unchanged. Migrate only the live guide and current fixtures.

Use `docs/migration-from-0.6.0.md` for the migration table and integration examples.
Reuse `tests/contract.html`, `tests/guide.test.mjs`, `scripts/serve.mjs`, `package.json` and the committed lockfile format.
Update `docs/index.html` and `docs/guide.css` for the new activation, token names, status values and layer placement.
Remove the guide's pending-migration notices only when the corresponding runtime behaviour is implemented.
Replace the two explicit migration TODOs with executable activation and layer assertions.
Preserve the guide's no-JavaScript behaviour and its copy/toggle/dismissal helpers.
Keep `docs/testing.md` and the single `npm test` command accurate. Do not create a parallel runner or require personal absolute paths.

## Inventory and API design

Before editing, list every defined custom property and every public class/state selector.
For each, record its current purpose and whether the shared API retains, renames or removes it.
An unused variable in core CSS can still be a public consumer token. Explain removal; do not infer obsolescence from usage alone.

Review these inherited groups explicitly:

| Current group | Treatment under the accepted D2 approach |
|---|---|
| `--c-gov`, `--c-gov-visited`, `--c-gov-light`, `--c-on-gov` | Describe link, visited-link, selection and on-accent roles rather than a consumer colour slot |
| `--c-gov-bar`, `--c-on-bar*` | Describe header/dark-surface roles consistently |
| `note` tokens with `warn` markup; `alert` tokens with `bad` markup | One semantic vocabulary used in tokens, markup, documentation and tests |
| `--c-ok-solid` and existing success/action colours | Retain separate semantic roles only where they have a stated purpose |
| `--font-display` duplicating `--font-sans` | Keep only if a distinct public typography role is intended |
| `--radius-md`, `--radius-lg`, `--radius-pill` all equal to zero | Keep only purposeful shared roles, not a consumer's required token list |
| `--shadow-lift` equal to `none` | Retain only if it is an intentional public customization role |
| `--c-line-strong`, `--border-ink` versus component literals | Use declared control-border roles consistently, or remove redundant API entries |
| `--shell` | Keep as a documented layout token if package 04 uses it |
| Six status tones and chart colours | Retain useful shared semantics; their consumer origin alone is not grounds for removal |

Accepted status vocabulary: neutral, info, progress, warning, success and danger.
Map each old token and `data-tone` value explicitly. An absent tone remains neutral.
Retain existing colour values and their RGB-channel representation during the API migration.
Any later visual correction is separate work; do not combine it with renaming silently.

Naming examples following accepted D2:

| Existing API | Shared API |
|---|---|
| `--c-ink` | `--g2-color-text` |
| `--c-gov` | `--g2-color-link` |
| `--c-gov-bar` | `--g2-color-header-bg` |
| `--c-note-bg` | `--g2-color-warning-bg` |
| `--font-sans` | `--g2-font-sans` |
| `--shell` | `--g2-container-max` |
| `data-tone="warn"` | `data-tone="warning"` |
| `data-tone="ok"` | `data-tone="success"` |
| `data-tone="bad"` | `data-tone="danger"` |

Use the same status name in its token group and markup.
Keep `.g2-*` component classes; these examples do not propose renaming them.
The final inventory must cover all tokens, not only these examples.

Status mapping: `note`/`warn` becomes `warning`; `ok` becomes `success`; `alert`/`bad` becomes `danger`.
Keep neutral, info and progress. Do not add old-name aliases or dual state selectors.

## Cascade behaviour

Use this public top-level layer order:

```css
@layer reset, gov2, utilities, app;
```

Inside `gov2`, use ordered sublayers `tokens`, `base`, `components` and `states`.
The core declares the public order before rules or imports that establish layer positions.
Put ordinary component defaults in `components`, and focus/state treatments that must beat those defaults in `states`.
Test the resulting combined states rather than relying on source order alone.

For a standalone page, loading `gov2.css` alone applies the base styles and components.
For customized pages, show project CSS in `app` and utilities in `utilities`.
For pages with a reset, show the reset assigned to `reset`.
The integration example must establish the public order before another stylesheet first creates those layers.
Document that a later order declaration cannot rearrange layers already established by earlier CSS.
Explain ordinary linked stylesheets, imports into layers and unlayered consumer rules.
Do not import the whole already-layered DS into another `gov2` wrapper, which would change its public layer paths.
Do not claim that a project class always wins based only on specificity.

Test the actual chosen integration, including a project rule inside a named layer.
Keep focus visible after supported customization. Avoid broad `!important` declarations as a substitute for a cascade contract.
A consumer's unsupported reset order is a consumer integration problem, not a reason for a core compatibility branch.

## Customization contract

Projects keep the distributed file unchanged and place local CSS in their own stylesheet.
Layout, spacing, density and useful visual variants are supported customization needs.
Use a project class alongside a component class where a local variant fits.
Prefer shared tokens with suitable semantic roles, and document significant departures.
Do not require a proposal issue for every local spacing or density adjustment.
Use the proposal workflow when a recurring variation would benefit shared consumers.

Include a compact component example and a page-width token override in the migration document.
Verify each example's keyboard focus, contrast and hover plus focus after customization.
Explain that later project colours or state rules can still break accessibility; consumers must check their result.
Keep accessibility requirements separate from guidance about aesthetic consistency.

## Migration

Publish a table from the 0.6.0 token names, classes, state attributes and activation markup to their replacements.
Include deleted names and their replacement, if any. State the new CSS/layer loading order.
Do not ship legacy aliases, dual selectors or a posturi adapter merely to preserve existing consumers.
Report the old skin checker as retired for this core; do not make the core pass it.

## Acceptance criteria

1. A minimal HTML page activates whole-site defaults using only the documented stylesheet link, with no activation attribute or wrapper.
2. No core comment, selector or alias exists solely for a consumer skin contract.
3. Every `var()` reference resolves, and the reference documents every public token and component.
4. Each status example uses the same semantic name in markup and token documentation.
5. The documented layered integration lets a permitted project override win, while component focus remains visible.
6. Buttons and button-styled anchors have consistent geometry without a host reset.
7. Focus, hover plus focus, false selection, disabled controls and field errors retain their intended behaviour.
8. The migration table covers every removed or renamed public identifier.
9. Existing generic components remain functional; unrelated component expansion is deferred.
10. Documented compact and token-override examples work under the public layer order and retain accessible component states.
11. A clean checkout can install development tooling and run the baseline checks with the documented commands.

## Report and boundaries

Record decisions in an ADR and update specifications with the CSS in the same change.
Report browser versions, commands and measured outcomes. Separate confirmed results from assumptions.
Do not publish, deploy, create consumer commits or add components outside this scope.

## Handoff prompt

Implement this ready brief in the gov2 repository. Read ADRs 0001–0004 and the current contributor instructions first.
Keep the accepted decisions and limit changes to this package. Preserve the existing quick-fix baseline.
Produce the complete API inventory and migration table, implement the contract and run the baseline browser checks.
Finish with a reviewable diff and a report of measured results, remaining limitations and migration instructions.
Do not implement draft packages 02–04 or change consumer repositories.
