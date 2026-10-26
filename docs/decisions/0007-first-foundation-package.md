# ADR 0007: The first page-foundation package

Date: 2026-10-26
Status: Accepted by the owner in this session.

## Decision

The first foundation package includes a container, spacing and typography,
responsive header/footer composition, and complete field, hint and error examples.
Verify the shared foundation through a directory/results page and a form/detail page.
Use realistic static Romanian content, with clear demonstration-data attribution.

Keep implementation choices within this scope. Record further component needs rather than adding an entire catalogue.
Tables, pagination, tabs, charts, complex filters and dark mode are later work selected through concrete tasks.
Give design defaults with reasons and room for useful project variation.

## Implementation

Brief 04 is ready after brief 01 establishes the shared API and cascade.
Its concrete class/token suggestions and starting values are implementation defaults, not universal aesthetic requirements.
Use the live guide and the single regression suite for examples and verification.
Check narrow layouts, enlarged text, keyboard paths, error recovery and accessible names/relationships.
Local font delivery can be added by brief 03 independently; keep a fallback-font check.

## Consequences

All six decisions in the audit follow-up are now accepted.
Brief 02 is implemented against the current API. Briefs 01, 03 and 04 are ready in their documented dependency order.
This acceptance finalizes the handoff; it does not start another model or implement the larger packages in this session.
Keep the prior guide snapshot unchanged while current APIs and examples evolve.
