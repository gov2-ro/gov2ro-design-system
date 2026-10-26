# gov2 design system

Shared stylesheet and style guide for gov2.ro projects (posturi, civtech, org…).
Follows igov.ro's GOV.UK-derived theme: Inter + Fragment Mono, square corners,
underlined links, yellow focus, green primary button, six status tones,
optional Romanian tricolour mark (default: `.g2-ro-corner`).

<!-- Style guide: https://gov2-ro.github.io/design-system/ -->

## Use it

<!-- ```html
<html lang="ro" data-skin="gov2">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/gov2-ro/design-system@1/gov2.css">
``` -->

`@1` follows the latest 1.x release (fixes, no breaking changes).
Pin an exact version with `@1.0.0`.

<!-- posturi.gov.ro: copy `gov2.css` into `webapp-php/static/skins/` and pick it in the style picker. -->

## Header markup

```html
<header class="g2-header">
  <span class="g2-ro-corner" aria-hidden="true"></span>
  <div class="g2-header-in">
    <a class="g2-wordmark" href="/">posturi<em>.gov2.ro</em></a>
    <nav class="g2-nav">…</nav>
  </div>
</header>
```

## Contents

- `gov2.css` — tokens (`--c-*`, RGB channels) and opt-in `.g2-*` classes
- `docs/index.html` — the style guide (self-contained, served by GitHub Pages)
- `logo/` — project marks (SVG, monochrome, white on the header)
- `CHANGELOG.md`

## Releasing

1. Edit `gov2.css`, note the change in `CHANGELOG.md`.
2. Tag: `git tag v1.0.1 && git push --tags`.
<!-- 3. jsDelivr picks the tag up within minutes. Purge if needed:
   https://purge.jsdelivr.net/gh/gov2-ro/design-system@1/gov2.css -->
