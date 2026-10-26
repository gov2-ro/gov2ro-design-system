# ADR 0002: Loading gov2 activates whole-site defaults

Date: 2026-10-26
Status: Accepted by the owner in this session.

## Context

The existing stylesheet requires `data-skin="gov2"` for tokens and base styles.
The shared system no longer follows a consumer skin contract.
The owner selected whole-site activation from the two proposed activation models.

## Decision

Loading `gov2.css` applies the site's base typography, surfaces, links and focus treatment.
Publish shared custom properties on `:root`.
Components remain opt-in through their `.g2-*` classes.
No `data-skin` attribute or activation wrapper is required.

## Implementation requirements

Implement this change as part of brief 01, with the accepted naming and cascade decisions.
Remove activation gates from tokens, base rules, focus rules and reduced-motion rules.
Update installation examples and component documentation in the same change.
Do not retain the old activation attribute as a compatibility branch.

Replacing the focus selectors changes their specificity. Preserve the intended component states through the agreed cascade.
Verify the wordmark, its domain suffix, navigation, chips, buttons and fields with keyboard focus.
Check hover combined with focus and loading without a host reset.

## Acceptance

A minimal HTML document loads only the documented stylesheet and has no activation attribute or wrapper.
Its base styles, tokens and component focus treatment work as documented.
Core CSS contains no remaining `data-skin` activation selector.

## Consequences

Consumers choose to load gov2 as their site stylesheet and adapt their own styles to its public contract.
Token naming and cascade/customization are accepted separately in ADRs 0003 and 0004.
Brief 01 implemented this contract in 0.8.0. ADR 0008 records the implementation choices.
