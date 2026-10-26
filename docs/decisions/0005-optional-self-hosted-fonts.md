# ADR 0005: Optional self-hosted fonts

Date: 2026-10-26
Status: Accepted by the owner in this session.

## Context

Core CSS currently imports Inter and Fragment Mono from Google Fonts.
The owner accepted keeping these families while making their delivery optional and local.

## Decision

Keep Inter for the default sans-serif role and Fragment Mono for the monospace role.
Remove the Google Fonts import from `gov2.css`.
Core CSS makes no remote font request and retains usable system fallback stacks.
Provide an optional `fonts.css` that declares local WOFF2 assets with relative URLs.
Projects already supplying the families can reuse their own assets without loading this optional file.

Include the Romanian lowercase and uppercase letters ă, â, î, ș and ț.
Include font sources, versions and required licence notices in the package.
Use `font-display:swap` and test the fallback experience.

## Consequences

Projects that use the intended typography distribute an additional stylesheet and font assets.
Other projects retain the font stacks and supply their own files or use system fallbacks.
No remote font service is required by the shared stylesheet.
Hosting, CDN setup and publishing are separate work.

## Implementation

Brief 03 is ready for implementation after brief 01 establishes the shared API and baseline tooling.
Check core-only and optional-font modes, network requests, Romanian coverage, fallback rendering and subpath URLs.
Record the actual font versions and asset sizes instead of assuming an unmeasured performance benefit.
The existing import remains until brief 03 is implemented; this ADR does not claim the runtime has changed.
