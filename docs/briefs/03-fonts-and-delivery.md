# Brief 03: Fonts and file delivery

Status: Ready for implementation after brief 01. D4 is accepted in ADR 0005.
Use the accepted token names and baseline tooling from brief 01. D5 does not block this package.
Hosting destination and publication remain separate decisions.

## Problem and outcome

Loading the core CSS currently triggers a Google Fonts request.
Consumers also lack one accurate, reproducible installation procedure.
Make core delivery independent of remote font services while retaining the intended typography as an optional asset package.

## Accepted decision

Keep Inter and Fragment Mono as the intended families.
Remove remote `@import` from core CSS and retain usable system fallbacks.
Provide optional `fonts.css` with local WOFF2 assets and relative URLs.
Consumers that already provide the families need not load the optional file.
The owner accepted this delivery model. Keep the existing families.

## Scope

`gov2.css`, new `fonts.css`, `fonts/`, font licence/provenance files,
`README.md`, `COMPONENTS.md`, the guide, migration notes and project memory.
Update browser checks for core-only and optional-font modes.
No CDN provisioning, DNS change, deployment or consumer repository changes.

Put asset provenance, versions, included weights and file sizes in `fonts/README.md`.
Keep required licence notices alongside the redistributed assets and document their paths.
Extend the fixtures and runner introduced in brief 01; do not create a separate test framework.
Update `docs/migration-from-0.6.0.md`, `CHANGELOG.md`, `docs/BACKLOG.md` and `docs/ACTIVITY.md`.
Update the live guide if package 02 has landed. Otherwise demonstrate both modes in the existing contract fixtures.
Do not edit or replace the old bundled guide under this package.
Its preserved snapshot is now in `docs/archive/`; do not rewrite its embedded fonts or runtime.

## Requirements

- Core CSS triggers no external font request and remains readable offline.
- Optional assets cover Romanian characters ă, â, î, ș and ț, including uppercase forms.
- Include only weights/styles the current API actually uses, or explain a deliberately supplied range.
- Record each font's source, version, included files, licence and measured file sizes.
- Preserve required font notices with redistributed assets.
- Use relative font URLs that work from both root and subpath deployments.
- Set `font-display:swap` and appropriate fallback families.
- `fonts.css` declares font faces; core CSS keeps the family tokens and fallback stacks. Avoid duplicate global type rules in the optional file.
- Cover Inter's used 400, 500, 600 and 700 weights and Fragment Mono's used 400 weight. Verify actual use after brief 01 before selecting assets.
- Verify coverage from the shipped font files and rendered Romanian samples, rather than assuming a download has the required glyphs.
- Document font loading order, asset locations and CSP requirements in plain terms.
- Provide an exact-tag installation procedure for local assets. Do not advertise an unavailable CDN.
- Clarify that only the latest DS is maintained, while consumers choose when to update pinned copies.

## Acceptance criteria

1. A network trace for a core-only page contains no Google Fonts or other remote font request.
2. The optional-font page loads only the documented local font assets.
3. Romanian sample strings render in the intended family when assets are available.
4. Blocking font requests leaves readable controls and no horizontal overflow in the representative fixture.
5. Font URLs work when the stylesheet is served below a subpath.
6. A consumer can copy all required files from a tag using the documented procedure.
7. Font sources, versions and licences are reviewable in the repository.

## Handoff

Report before/after network requests and asset sizes.
List any hosting decision still required, without provisioning a service or publishing files.

## Handoff prompt

Implement this ready brief after brief 01. Read ADR 0005 and the accepted shared CSS contract.
Source and record the font files, ship their required notices, remove the remote import and add optional local delivery.
Extend the existing browser checks and document exact-tag asset installation.
Report measured network behaviour, asset sizes, Romanian coverage, fallback behaviour and subpath results.
Do not replace the bundled guide, provision hosting, change consumers or implement draft component work.
