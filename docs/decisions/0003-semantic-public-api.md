# ADR 0003: Namespaced semantic tokens and one status vocabulary

Date: 2026-10-26
Status: Accepted by the owner in this session.

## Context

The current custom properties use generic prefixes and some consumer-derived names.
Status token names and markup disagree: `note` maps to `warn`, and `alert` maps to `bad`.
The owner accepted the proposed semantic naming approach and status vocabulary.

## Decision

Namespace public custom properties with `--g2-`.
Use names that describe a shared role, such as text, link, header background, font family or container width.
Keep the existing `.g2-*` component class names.
Keep existing colour values and their RGB-channel representation during this API migration.

Accepted examples:

| Current | Replacement |
|---|---|
| `--c-ink` | `--g2-color-text` |
| `--c-gov` | `--g2-color-link` |
| `--c-gov-bar` | `--g2-color-header-bg` |
| `--font-sans` | `--g2-font-sans` |
| `--shell` | `--g2-container-max` |

Use the same six status names in custom properties, markup, documentation and tests:
`neutral`, `info`, `progress`, `warning`, `success`, `danger`.

| Current token group | Current markup | Replacement status |
|---|---|---|
| `neutral` | absent or `neutral` | `neutral` |
| `info` | `info` | `info` |
| `progress` | `progress` | `progress` |
| `note` | `warn` | `warning` |
| `ok` | `ok` | `success` |
| `alert` | `bad` | `danger` |

For example, warning surface tokens use `--g2-color-warning-bg` and markup uses `data-tone="warning"`.
The absent tone remains the neutral default unless a later explicit decision changes it.

## Migration

Implement this with whole-site activation and the cascade contract in ready brief 01.
Inventory every existing token and publish a complete old-to-new migration table, including intentional removals.
Apply the accepted naming pattern to remaining tokens according to their documented role.
Explain removals and consolidations. Equal values or no core reference alone do not prove that a public role is redundant.
Do not ship legacy aliases or dual old/new status selectors for consumer compatibility.
Consumers replace their references and state attributes in their own repositories.

## Acceptance

All public custom properties use the accepted namespace and semantic naming pattern.
Every retained old token has an explicit replacement; every removal has a reason.
Status names agree across tokens, markup, reference and rendered examples.
All variable references resolve, and the migration preserves existing colour values.
The migration does not rename `.g2-*` component classes or add compatibility branches.

## Consequences

Consumers incur a one-time API migration. The DS publishes migration instructions rather than maintaining their old contract.
Cascade and customization are accepted separately in ADR 0004. Runtime changes are deferred to ready brief 01.
