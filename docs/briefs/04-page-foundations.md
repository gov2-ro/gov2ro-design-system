# Brief 04: Page foundations through representative pages

Status: Ready for implementation after brief 01. D6 is accepted in ADR 0007.
The live guide and test runner already exist. Brief 03 can land before this package, but local fonts are not a functional prerequisite.
Do not implement an entire component catalogue from this brief.

## Problem and outcome

The current DS styles individual components but leaves common page structure and complete field examples to each project.
Establish a small shared foundation through two realistic page examples.
Consumer-specific data, adapters and framework code stay outside core CSS.

## Accepted scope

- A page container with responsive side gutters.
- A small spacing and typography scale with semantic documentation.
- Header/navigation and footer composition that work at narrow widths.
- Complete field, hint and error examples, including disabled states and accessible recovery.
- Two representative pages: directory/results and form/detail.

Tables, pagination, tabs, charts, complex filters, custom checkbox/radio widgets, icon-only action components and dark mode are deferred.
Record any further need rather than expanding this package automatically.

## Dependencies and file scope

Implement after brief 01 supplies whole-site activation, semantic tokens and the accepted cascade.
Reuse its migration document and the existing Playwright runner. Update the same tests rather than starting another framework.
Use local fonts when brief 03 has landed, and retain a system-font fallback test.

Change:

- `gov2.css`, `COMPONENTS.md` and `GUIDELINES.md`.
- `docs/index.html` and documentation layout CSS as needed to demonstrate the additions.
- New `docs/examples/directory.html`, `docs/examples/form.html` and `docs/examples/examples.css`.
- `tests/contract.html`, existing browser checks and new foundation checks under `tests/`.
- Shared test helpers if needed to reuse server/browser setup across test files.
- `docs/testing.md`, migration notes, `CHANGELOG.md`, `docs/BACKLOG.md` and `docs/ACTIVITY.md`.

Do not edit consumers, hosting or unrelated feature families.
Keep `docs/archive/2026-10-26-bundled-guide.html` byte-for-byte unchanged. Its API is historical and must not be migrated.

## Implementation defaults

The following names and values make the handoff concrete. They are implementation defaults within the accepted scope, not universal aesthetic rules.
Reuse an equivalent semantic token from brief 01 instead of adding a duplicate. Document any consolidation.
A material scope or interaction change needs a new decision; routine implementation details can be resolved and reported by the implementer.

### Container and spacing

Add `.g2-container` with border-box sizing, full available width, automatic inline margins and the shared `--g2-container-max`.
Retain the existing 1280px maximum as an equivalent relative-unit default, normally `80rem`.
Use a shared gutter token, initially `clamp(1rem, 3vw, 2rem)`, for inline padding.
The complete container, including its padding, must fit a 320px viewport.

Use a compact rem-based spacing scale, initially 0.25, 0.5, 0.75, 1, 1.5, 2 and 3rem.
Name steps consistently with the `--g2-` namespace and list their purposes in the reference.
Use tokens in the new shared compositions. Avoid adding a general utility-class framework.
Keep project-specific arrangements in example CSS and identify them as local composition.

### Typography

Provide semantic type tokens and opt-in role classes. Do not globally reset all headings.
Starting sizes at a 16px root are:

| Role | Default | Proposed class |
|---|---|---|
| Page title | 2rem / 32px, bold | `.g2-heading-page` |
| Section title | 1.5rem / 24px, bold | `.g2-heading-section` |
| Item title | 1.1875rem / 19px, bold | `.g2-heading-item` |
| Body | 1.0625rem / 17px, regular | Existing base type |
| Metadata | 0.9375rem / 15px, regular | `.g2-text-meta` |
| Short label | 0.875rem / 14px, semibold | Field label treatment |

Use readable line heights, initially 1.2–1.3 for headings and 1.55 for body text.
Map `.g2-link-title` to the same item-title token while retaining its link behaviour.
Preserve semantic HTML heading levels independently of presentation classes.
Describe these as starting treatments; variations can suit different content and task priorities.

### Header and footer composition

Keep the existing public header, wordmark, navigation and footer classes.
Use the shared container in their examples and allow the header/nav to wrap naturally.
Navigation must stay available without JavaScript. Prefer wrapping to adding a disclosure-menu interaction.
Retain current-page indication and readable keyboard/hover states.
Give important navigation links usable targets without clipping long labels.

Add an opt-in `.g2-footer-in` composition if needed for padding and wrapping groups.
Keep the outer footer surface treatment separate from its content layout.
Do not make authentication, language switching or a particular link list mandatory.

### Fields and recovery

Add shared `.g2-field`, `.g2-label` and `.g2-hint` roles if equivalents do not already exist.
Reuse `.g2-input`, `.g2-field-error` and `.g2-error-msg`.
Demonstrate text, email and search fields with associated labels, descriptions and appropriate autocomplete.
An invalid field has `aria-invalid="true"`, a useful error message and an `aria-describedby` relationship.
A recovery link moves keyboard focus to the relevant field. A local error-summary composition can provide the link without becoming a new core component.
A disabled example uses native `disabled` semantics and must not enter the tab sequence.

If either representative page needs textarea/select, support those explicitly with documented sizing and states using the existing field roles.
Otherwise leave them outside this slice and say so. Do not imply a full form-control catalogue has landed.
Checkboxes/radios can remain native when needed; they do not acquire an undocumented custom visual API.
Do not add application validation or a data service to demonstrate field styling.

## Representative pages

### Directory/results: `docs/examples/directory.html`

Include a long page title, search, populated results with metadata, a current filter and an empty-results example.
Use realistic Romanian institution names, diacritics, long labels, codes and dates.
Each result has an understandable title link; secondary links remain identifiable.
State that records and figures are demonstration data. Show how a real source and verification date would be attributed.
Keep the fixture static and readable without JavaScript. Label separate state examples clearly.
Native links and forms retain meaningful behaviour; do not suggest that a real search backend is present.

### Form/detail: `docs/examples/form.html`

Include a detail heading, reference/source information, labelled fields, hints, invalid input and recovery links.
Show the normal, error and disabled cases and distinguish their purpose.
Keep the form operable through native HTML; application submission and validation remain consumer responsibilities.
Support a keyboard path from the error summary to the field and onward to the primary/secondary actions.
No initial autofocus may move readers away from the page heading unexpectedly.

Both pages load the actual core CSS.
`examples.css` contains local page composition only. It must not repair shared component appearance or conceal overflow.
Link both examples from the live guide and reference their local composition rules.

## Acceptance checks

1. Both examples use the documented shared API and identified local composition rules, with no consumer adapters.
2. At 320, 390, 768 and 1280 CSS pixels, long content reflows without loss of controls or horizontal page overflow.
3. At 200% browser/text enlargement, headings, controls and recovery links remain readable and operable. Record any manual coverage.
4. Increasing the root text size demonstrates that the new rem-based type and spacing roles scale without clipping.
5. Keyboard navigation reaches the header, current links, fields, errors and actions in a sensible order; disabled controls are skipped.
6. Error recovery moves focus to the field and accessibility APIs expose labels, hints and errors correctly.
7. Text, control boundaries and focus meet the applicable contrast requirements on the rendered surfaces.
8. Hover plus focus, current selection and supported forced-colour behaviour remain understandable.
9. Both pages remain readable with JavaScript disabled and fonts blocked; no required navigation is hidden behind a script.
10. New core classes appear in `COMPONENTS.md`, the live guide and raw component checks in the same change.
11. Documented width/density customizations work under the accepted layer order and retain accessible behaviour.
12. The existing suite remains green; historical archive bytes and provenance remain unchanged.

## Handoff and report

Implement this ready brief after brief 01. Read ADRs 0001–0007 and preserve the shared-system boundary and customization policy.
Implement the selected foundations and two fixtures, extend the single test suite and update the live reference.
Report API additions, implementation choices, commands, browser versions, measurements and desktop/mobile screenshots.
Separate measured results from unperformed manual, assistive-technology or cross-browser checks.
List further component needs as follow-up work. Do not edit consumers, migrate the archive or publish a release.
