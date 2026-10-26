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
<html lang="ro">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="/assets/gov2.css">
</head>
<body>…</body>
</html>
```

Loading the stylesheet applies the base styles to the whole page. No activation attribute or wrapper is needed.
The tokens (`--g2-*`) are on `:root`. The components are opt-in through their `.g2-*` classes.
The stylesheet declares the layers `reset, gov2, utilities, app`. Put your reset in `reset` and your own CSS in `app`.
The current CSS also loads Google Fonts. No public CDN or hosted guide is configured.

Read [COMPONENTS.md](COMPONENTS.md) for the API and [GUIDELINES.md](GUIDELINES.md) for design defaults and accessibility.
A project that uses 0.6.0 or 0.7.0 reads [the migration guide](docs/migration-from-0.6.0.md): old and new names, loading examples and the layer limits.

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

- `gov2.css` — layers, tokens (`--g2-*`, colours as RGB channels) and opt-in `.g2-*` classes
- `docs/index.html` — the editable live guide; it loads `gov2.css` directly
- `docs/guide.css` and `docs/guide.js` — documentation layout and optional helpers
- `docs/testing.md` — repeatable browser checks and manual verification procedures
- `docs/migration-from-0.6.0.md` — old-to-new names, layer integration and verified customization examples
- `docs/examples/` — two representative pages (directory/results and form/detail) with local composition in `examples.css`
- `docs/compat-analysis.md` — compatibility reports from the project sessions
- `logo/` — project marks (SVG, monochrome, white on the header)
- `CHANGELOG.md`
- `docs/briefs/` — decision sequence and implementation briefs
- `docs/decisions/` — accepted shared design decisions

## Releasing

Keep the stylesheet header, changelog version and tag consistent. Follow the version policy in `AGENTS.md` and `CLAUDE.md`.
Document public API removals and renames under **Breaking** and provide migration instructions.
A local tag does not publish a release. Push, release creation and deployment require a separate publishing request.
The owner decides when the DS reaches 1.0.0.
