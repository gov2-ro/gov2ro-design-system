# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single shared stylesheet (`gov2.css`) plus a style guide for gov2.ro projects (posturi, civtech, org…). It follows igov.ro's GOV.UK-derived theme: Inter + Fragment Mono, square corners, underlined links, yellow focus, green primary button, six status tones, optional Romanian tricolour mark. There is no build, lint or test tooling. Consumers load the file from jsDelivr (`gh/gov2-ro/design-system@1/gov2.css`), and posturi.gov.ro uses a copy in `webapp-php/static/skins/gov2.css`.

## How gov2.css is structured

- **Everything is scoped to `[data-skin="gov2"]`.** Tokens and base element styles (body, links, focus) apply only when the consumer sets `<html data-skin="gov2">`. Component classes are opt-in and prefixed `.g2-` (`.g2-header`, `.g2-btn`, `.g2-tag`, `.g2-tile`…).
- **Colour tokens are bare RGB channels** (`--c-ink: 11 12 12;`), so they are always used as `rgb(var(--c-ink))` or `rgb(var(--c-ink) / .5)`. Keep that format for new tokens and put the hex in a trailing comment, as the existing ones do.
- **Token names are a contract with posturi.gov.ro.** The status tones are neutral/info/progress/note/ok/alert, each with `-bg`/`-line`/`-ink`. In markup `data-tone=warn` maps to `note` and `bad` maps to `alert`, because the token names were kept for posturi. Don't rename tokens without a breaking-version bump.
- Design rules built into the tokens: radius is always 0, there are no decorative shadows (`--shadow-lift: none`), and the tricolour colours (`--c-ro-*`) are decorative only, never used for text. Tricolour marks: `.g2-ro-corner` is the default; `.g2-ro-bar` and `.g2-ro-dots` are the alternatives.
- Component rules are written one per line, minified, grouped under `/* ---- Section ---- */` comments. Match that style.

## Style guide (`docs/index.html`)

GitHub Pages serves this file. It is a generated, self-contained bundle (`__bundler/manifest` / `template` script blocks, with lines of several hundred KB), not hand-written HTML. It does not load `../gov2.css`, so a change to the stylesheet doesn't show up in it automatically. Don't try to edit it by hand; if the guide needs updating, regenerate it or ask how it is produced. Its copy is in Romanian.

## Logos

`logo/` holds one SVG per project: monochrome, `fill="currentColor"` (so it renders white on the black header), square viewBox, shown at 28px through `.g2-logo`. Logos are decorative next to the wordmark (`aria-hidden="true"`); the project name stays as text.

## Releasing

Semver via git tags, and jsDelivr `@1` follows the latest 1.x tag. So anything that renames or removes a token or a `.g2-` class is a breaking change.

1. Edit `gov2.css` and record the change in `CHANGELOG.md`. Also update the version and date in the file's header comment.
2. `git tag vX.Y.Z && git push --tags`
3. If needed, purge the CDN cache: `https://purge.jsdelivr.net/gh/gov2-ro/design-system@1/gov2.css`
