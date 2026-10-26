# Gov2 audit follow-up

Date: 2026-10-26
Status: D1–D6 accepted. Briefs 02, 01 and 04 are implemented; brief 03 is ready.

The owner wants quick corrections now and implementation briefs for another model.
Take the decisions in order. Record each answer here and in the affected brief before starting dependent work.

## Agreed direction

- Gov2 defines a shared system. Posturi and other consumers adapt in their own repositories.
- Remove consumer-specific compatibility behaviour and naming rationales from the shared stylesheet.
- Give design defaults, their reasons and useful exceptions. Avoid categorical aesthetic guidance.
- Keep accessibility requirements distinct from aesthetic preferences.

See ADR 0001 in `../decisions/0001-shared-system-boundary.md`.

## Decision sequence

| ID | Decision | Proposed direction | Status | Affected brief |
|---|---|---|---|---|
| D1 | Activation | Loading the stylesheet applies whole-site defaults; no `data-skin` or required wrapper | Accepted; ADR 0002 | 01 |
| D2 | Public API | Use `--g2-` semantic tokens and neutral/info/progress/warning/success/danger; retain `.g2-*` classes and colour values; provide migration without compatibility aliases | Accepted; ADR 0003 | 01 |
| D3 | Cascade and customization | Named layers with documented order; permit project composition and tested local variants | Accepted; ADR 0004 | 01, 02 |
| D4 | Font delivery | Core CSS makes no remote font request; provide optional self-hosted Inter and Fragment Mono | Accepted; ADR 0005 | 03 |
| D5 | Guide and verification | Editable live guide loading shipped CSS, with browser checks and separate manual procedures | Accepted; ADR 0006; implemented against the current API | 02 |
| D6 | Next component scope | Container, spacing, type, responsive header/footer and field examples, checked through directory/results and form/detail pages | Accepted; ADR 0007 | 04 |

All decisions above are accepted. Each implementation brief describes its scope and acceptance checks.

## Quick corrections

These corrections do not depend on D1–D6:

- [x] Remove consumer paths, skin metadata and consumer naming rationales from the stylesheet comments.
- [x] Fix the wordmark text and domain suffix on keyboard focus.
- [x] Keep the secondary button's focus background while hovered.
- [x] Make button, chip and input box sizing independent of a host reset.
- [x] Do not select chips with false or empty `aria-current`.
- [x] Explain the allowed background for the faint text token.
- [x] Replace categorical aesthetic rules with defaults, reasons and review questions.
- [x] Record that consumer compatibility work belongs in consumers.
- [x] Verify the corrections in Chrome 155: eight rendered-state checks passed. Results are recorded in `../ACTIVITY.md`.
- [x] Repair the README's installation and release instructions.

Whole-site activation, semantic naming and cascade/customization are accepted in ADRs 0002–0004.
Brief 01 is implemented in 0.8.0: whole-site activation, `--g2-` tokens, one status vocabulary and the layer order.
ADR 0008 records the token names and layer placement that the brief left to the implementer.
Brief 04 is implemented in 0.9.0. Brief 03 is ready.

## Implementation packages

1. `01-shared-css-contract.md` — **Implemented (0.8.0):** activation, token and state vocabulary, cascade and customization.
2. `02-live-guide-and-checks.md` — **Implemented:** executable documentation and regression checks then migrated to the 0.8.0 API by brief 01.
3. `03-fonts-and-delivery.md` — **Ready:** optional local fonts and reproducible installation.
4. `04-page-foundations.md` — **Implemented (0.9.0):** the accepted foundation and two representative pages.

The owner requested package 02 first. Its guide, fixtures and test runner now exist.
Package 01 migrated those files and turned the two TODOs into real assertions. Do not create a second fixture framework.
Next implement 03.
The prior bundle is preserved under `docs/archive/` for historical reference. Keep its snapshot unchanged during migrations.

Each package ends with an implementation report: changes, commands, measured results, remaining assumptions and migration notes.
A model receives a ready package after its decision dependencies are accepted.
The owner decides whether to start another model; drafting these briefs does not start agents or change consumer repositories.

## Completion rules

A quick correction is complete when its reported behaviour is verified.
A brief is ready when its decision dependencies, file scope, migration and acceptance criteria are explicit.
Do not mark a proposed component as available until it exists in the stylesheet and component reference.
Publishing and changes to consumer repositories are separate work.
