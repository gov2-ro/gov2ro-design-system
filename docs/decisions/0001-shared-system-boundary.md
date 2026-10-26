# ADR 0001: The shared system defines its own contract

Date: 2026-10-26
Status: Accepted by the owner in this session.

## Context

The initial stylesheet retained names and activation behaviour from posturi's skin system.
Compatibility checks then treated that consumer's contract as a requirement for the DS.
The owner has decided that posturi will adapt to gov2 instead.

## Decision

Gov2 defines a shared stylesheet API for its consumers.
Posturi's skin checker, token list, file paths and framework do not constrain that API.
Consumer-specific adapters and migration work belong in the consumer repository.
Do not add legacy aliases or skin-specific branches solely to preserve a consumer's behaviour.

A useful generic component can originate in posturi or any other project.
Its origin alone is not a reason to remove it. Retention depends on its purpose in the shared API.

Design guidance gives defaults, reasons and room for justified variation.
Separate accessibility requirements from aesthetic preferences.

## Consequences

Remove consumer instructions and compatibility rationales from `gov2.css`.
Inventory inherited names before designing the replacement public API.
Record the migration from the last published contract, without implementing its adapter in the core.

Activation, naming and cascade/customization are accepted separately in ADRs 0002–0004.
This ADR does not approve the proposed alternatives in the implementation briefs.
Historical measurements remain valid records, but no longer impose consumer compatibility requirements.

## Alternative

Preserve the posturi skin contract in the DS. Rejected by the owner.
That approach would make other projects inherit a consumer-specific integration model.
