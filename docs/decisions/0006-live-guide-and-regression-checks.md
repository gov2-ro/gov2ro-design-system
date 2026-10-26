# ADR 0006: A live guide and repeatable browser checks

Date: 2026-10-26
Status: Accepted by the owner, who explicitly requested implementation in this session.

## Decision

Replace the bundled showcase with editable HTML that loads the shipped `gov2.css` directly.
Use a small documentation stylesheet for layout and optional JavaScript for demonstrations and copy helpers.
Keep essential content and example markup usable without JavaScript.
Show implemented components as available and distinguish proposals and approved migrations that have not landed.
Preserve useful guidance on hierarchy, provenance, state communication and decorative identity.

Add repeatable browser regression checks against both the guide and raw component fixtures.
Check focus, combined states, geometry, selection, labels, contrast, reflow and documentation helpers.
Document manual coverage separately from automated results.

## Implementation order

The owner requested the guide replacement before implementation of brief 01.
The guide therefore demonstrates the current API and explicitly describes the approved migration as pending.
Brief 01 (0.8.0) replaced the two TODO tests with executable activation and layer assertions.
Brief 01 must migrate the live guide and existing fixtures along with the shared API.
Brief 03 extends the same suite for optional local fonts.
Do not create duplicate guide or test frameworks.

## Consequences

There is one executable guide at `docs/index.html`; no separate kitchen-sink page or generation tool is needed.
Editing the shared stylesheet changes examples without regeneration.
Projects see the CSS that is actually distributed, including its current limitations.
This change does not publish a hosted guide or implement the separate API/font migrations.

## Historical reference

The owner subsequently requested retaining the previous bundle for reference.
Preserve its exact committed bytes at `docs/archive/2026-10-26-bundled-guide.html`.
Link it through a labeled archive page and record source commit, size and checksum in the archive README.
Do not update the snapshot's examples, token names, versions or embedded runtime during current API migrations.
The live guide remains the source for current component examples.
