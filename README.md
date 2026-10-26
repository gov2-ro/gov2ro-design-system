# gov2 design system

Shared stylesheet and style guide for gov2.ro projects (posturi, civtech, org…).
Inspired by igov.ro's GOV.UK-derived theme (with some nods to monitorul.ai &amp; transparenta.eu): Inter + Fragment Mono, square corners,
underlined links, yellow focus, green primary button, six status tones,
optional Romanian tricolour mark (default: `.g2-ro-corner`).

## Inspiration

- [design-system.service.gov.uk](https://design-system.service.gov.uk/)
- [Government design systems](https://platformland.github.io/government-design-systems/)
- [Modelul Unitar de Design al Republicii Moldova](https://mud.egov.md/)
- [thedesignsystem.guide: Public Design Systems List](https://thedesignsystem.guide/public-design-systems-list)

<!-- Style guide: https://gov2-ro.github.io/gov2ro-design-system/ -->

---

## Use it

The current API is 0.x. Pin an exact tag when you copy the stylesheet into a project.
Copy the file without editing it. Put project styles in a separate file.
Consumers adapt to the DS; the DS does not implement consumer skin compatibility.

```html
<!doctype html>
<html lang="ro" data-skin="gov2">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="/assets/gov2.css">
</head>
<body>…</body>
</html>
```

This example describes the current API. The approved activation and naming migration is specified in
[the follow-up plan](docs/briefs/README.md). The current CSS also loads Google Fonts.
No public CDN or hosted guide is configured.

Read [COMPONENTS.md](COMPONENTS.md) for the API and [GUIDELINES.md](GUIDELINES.md) for design defaults and accessibility.

## Preview and check the guide

The guide is plain HTML. Editing `gov2.css` changes its examples immediately; no build is required.

```sh
npm ci
npm run dev
```

Open `http://127.0.0.1:4173/docs/`. The examples remain readable without JavaScript.
The [previous bundled guide](docs/archive/index.html) is preserved as a historical reference, with its original file and provenance.

To run the browser checks:

```sh
npx playwright install chromium
npm test
```

For an installed Chrome, use `PLAYWRIGHT_CHANNEL=chrome npm test`.
See [testing instructions](docs/testing.md) for coverage, screenshots and manual checks.
The current activation and layer migrations have explicit TODO checks; they are not claimed as implemented.

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
- `docs/index.html` — the editable live guide; it loads `gov2.css` directly
- `docs/guide.css` and `docs/guide.js` — documentation layout and optional helpers
- `docs/testing.md` — repeatable browser checks and manual verification procedures
- `logo/` — project marks (SVG, monochrome, white on the header)
- `CHANGELOG.md`
- `docs/briefs/` — decision sequence and implementation briefs
- `docs/decisions/` — accepted shared design decisions

## Releasing

Keep the stylesheet header, changelog version and tag consistent. Follow the version policy in `AGENTS.md` and `CLAUDE.md`.
Document public API removals and renames under **Breaking** and provide migration instructions.
A local tag does not publish a release. Push, release creation and deployment require a separate publishing request.
The owner decides when the DS reaches 1.0.0.
