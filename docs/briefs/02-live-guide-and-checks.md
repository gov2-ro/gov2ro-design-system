# Brief 02: Executable guide and regression checks

Status: Implemented against the current API at the owner's explicit request. D5 is accepted in ADR 0006.
Whole-site activation and layer-contract checks remain TODO for brief 01; optional-font checks belong to brief 03.

## Problem and outcome

The bundled guide contains its own styles and cannot show regressions in `gov2.css`.
Replace it with reviewable source that demonstrates the distributed API and provides stable browser fixtures.

## Accepted decisions

Use hand-authored HTML and a small documentation stylesheet.
Use JavaScript only for demonstrated behaviour or useful guide controls.
Do not require a component framework or runtime transpiler to read a CSS reference.
Make `docs/index.html` the live guide and component inventory, avoiding two independent showcases.
The owner accepted D5 and requested replacement in this session.
The owner also requested retaining the original bundle as a historical reference in `docs/archive/`.
Keep the archived snapshot unchanged and link it through the archive landing page.

## Scope

`docs/index.html`, optional `docs/guide.css` and `docs/guide.js`,
`tests/` or `scripts/` for browser checks, and minimal package metadata if needed.
Update `README.md`, `COMPONENTS.md`, `patterns/README.md`, contributor instructions and project memory for the chosen structure.
Do not redesign core components, add production JavaScript to the DS or edit consumer repositories.

## Guide requirements

- Load `../gov2.css` directly. Documentation layout CSS must not repair or recreate component styles.
- When brief 03 is implemented, load its optional local `../fonts.css` for intended typography and preserve a core-only fallback fixture.
- Include `lang="ro"`, a meaningful title, viewport metadata, landmarks and a useful heading structure.
- Show every core component, variant and documented state, with copyable markup.
- Mark examples requiring project behaviour, such as dismissal persistence, with their behavioural responsibility.
- Separate implemented components from proposals. A proposal must not look like a supported copy-and-paste API.
- Include long Romanian labels and diacritics, error messages and narrow-width examples.
- Demonstrate both links and native buttons where the API supports both.
- Keep essential reference content and examples available without JavaScript.
- Remove obsolete CDN, version, Pages and distribution claims. Display accurate status instead of a hard-coded release promise.
- Retain useful visual explanations from the old guide in editable source; do not preserve obsolete API examples for their appearance.

## Checks

Use a small reproducible browser setup. Pin development dependency versions and commit its lockfile.
Document a clean-checkout installation and one command to run the checks.
Tests load the actual stylesheet and derive important conclusions from rendered styles or user interaction.
Do not replace rendered assertions with snapshots of CSS source strings.

Required coverage:

1. Whole-site activation without a wrapper or activation attribute, as accepted in D1.
2. Wordmark, navigation, links, chips, buttons and fields using keyboard focus.
3. Hover combined with focus, including secondary and destructive actions.
4. False, empty and selected chip states; native disabled button behaviour.
5. Button/anchor geometry with no reset and with the documented reset.
6. The accepted named-layer integration and a permitted consumer override.
   Use `reset, gov2, utilities, app` with the `gov2` sublayers defined in brief 01.
7. Representative text/surface pairs, including focus and status combinations.
8. Reflow at 320 CSS pixels and with long content; text enlargement at a representative desktop width.
9. A forced-colours inspection and reduced-motion behaviour where there is motion.
10. Guide metadata, no missing local assets and no unexpected JavaScript errors.

Hover is testable in headless browsers. Do not repeat the former claim that it requires a headed browser.
Treat visited-link checks separately: browser privacy protections limit programmatic observations.
Document a reproducible manual visit/history procedure and its measured outcome rather than claiming unobserved results.
Automated accessibility tools can supplement these checks; they do not establish full conformance.

## Acceptance criteria

- A clean checkout can serve the guide and run the documented checks.
- Editing a core style changes the guide without regeneration or duplicate edits.
- All implemented components appear in both the reference and executable examples.
- The guide has no framework/CDN dependency and remains readable with JavaScript disabled.
- Regression checks fail when a confirmed focus, false-selection, sizing or layer-order defect is reintroduced.
- Record manual coverage, browser versions and remaining browser/assistive-technology gaps.

## Handoff

The owner selected guide-first implementation. The existing runner is `tests/guide.test.mjs`; the raw fixture is `tests/contract.html`.
Brief 01 must reuse and migrate these files and the live guide, replacing the two TODO checks with real assertions.
Brief 03 extends the same suite for font delivery.
Provide commands, measurements and screenshots of representative desktop and narrow layouts.
Do not describe unperformed screen-reader or cross-browser checks as passing.
