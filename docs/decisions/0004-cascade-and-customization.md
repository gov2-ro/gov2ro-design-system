# ADR 0004: Explicit layers and supported project customization

Date: 2026-10-26
Status: Accepted by the owner in this session.

## Context

Specificity alone cannot define override behaviour when a project uses cascade layers.
The owner also wants useful local variation without categorical aesthetic restrictions.
The owner accepted explicit layers and the proposed customization policy.

## Decision

Declare a layer order that puts resets before gov2 defaults and components, then project utilities and overrides.
Document complete integration examples and verify their rendered behaviour.
Keep gov2's own states after its component defaults so focus and combined states work consistently.
The exact layer names and import syntax are implementation details specified in brief 01.

Projects may customize layout, spacing, density and useful visual variants in their own stylesheets.
Keep the distributed gov2 stylesheet unchanged. Prefer shared tokens when their roles fit.
Document significant variations and verify accessible behaviour after customization.
Local spacing or density adjustments do not require a central DS variant.
Recurring useful variations may become shared options after review.

## Accessibility and limits

After customization, verify contrast, keyboard behaviour, focus and combined states such as hover plus focus.
Project styles must retain understandable control names, semantics and state communication.
The DS cannot guarantee accessibility under arbitrary overrides.
In particular, later unlayered rules and `!important` declarations can bypass the documented normal layer order.
Document these limits instead of claiming that specificity or layers protect every state automatically.

## Consequences

Projects can diverge visually. Shared defaults, documented variations and representative checks support consistency.
Brief 01 is ready for implementation with D1, D2 and D3 accepted.
Implementing the broader guide and regression suite still depends on D5.
This decision does not start another model, modify a consumer repository or publish a release.
