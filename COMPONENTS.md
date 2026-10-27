# Components

This is the reference for `gov2.css`, for people and for agents. It lists each `.g2-` class, its markup and when to use it. When `gov2.css` changes, change this file in the same commit.

This file is the current API specification. The live guide (`docs/index.html`) loads the shipped stylesheet and demonstrates every core class.
A project that uses 0.6.0 or 0.7.0 reads `docs/migration-from-0.6.0.md`.

## Before you start

- Load `gov2.css` with a `<link>`. Write `<html lang="ro">`. The page needs no activation attribute and no wrapper element.
- Loading the file applies the base styles to the whole page and publishes the tokens on `:root`.
- The `.g2-` classes are opt-in. A component appears only where the markup has its class.
- `gov2.css` declares four layers, in this order: `reset`, `gov2`, `utilities`, `app`. See *Layers and project CSS*.
- The page is light by default. `data-g2-scheme` on `<html>` opts in to the dark scheme. See *Colour scheme*.
- `gov2.css` makes no font request. Standard installation also copies `fonts.css` and the `fonts/` folder from the same tag, and links `fonts.css` next to `gov2.css`. See *Fonts*.
- `.g2-container` sets the page width and the side padding. See *Container*. Spacing and type roles have tokens and classes: see *Spacing* and *Type roles*.

## Layers and project CSS

The public layer order is declared in the first lines of `gov2.css`:

```css
@layer reset, gov2, utilities, app;
```

Inside `gov2`, the sublayers are `tokens`, `base`, `components` and `states`.

| Layer | Contents |
|---|---|
| `reset` | A reset from the project or from a vendor. Put it here. |
| `gov2.tokens` | The custom properties on `:root`: the light values first, then the dark values. See *Colour scheme*. |
| `gov2.base` | `body`, links and the reduced-motion rule. |
| `gov2.components` | Every `.g2-` class default, including its hover treatment. |
| `gov2.states` | Keyboard focus, the selected chip, the disabled button and the field error. They win over the component defaults. |
| `utilities` | Project utility classes. |
| `app` | Project styles and local variants. |

- A normal declaration in a later layer wins over an earlier layer, whatever the specificity. Inside one layer, specificity and then source order decide.
- A rule that is in no layer wins over every layer, including `gov2.states`. Put reset and project rules in a layer.
- An `!important` declaration reverses the layer order. The reduced-motion rule of gov2 is the only important declaration in `gov2.css`.
- A later `@layer` statement cannot move a layer that earlier CSS created. Declare the order first.
- A project rule in `app` or `utilities` that sets `background`, `color`, `outline` or `box-shadow` on a focusable control also replaces the gov2 focus treatment.
  Change colours only outside `:focus-visible`, or write the focus rule again in the same layer.
- Import `gov2.css` without `layer()`. Do not wrap the file in a `gov2` layer.

`docs/migration-from-0.6.0.md` has the verified loading examples, a compact variant and a page-width override.

## Tokens

Colour tokens are RGB channels. Use them as `rgb(var(--g2-color-text))` or `rgb(var(--g2-color-text) / .5)`. The values are in `gov2.css`, in a light and a dark set. See *Colour scheme*.
Length and font tokens are plain values, not RGB channels. Override a token in your own `app` layer. Check contrast and focus after each change.

| Group | Tokens | Use |
|---|---|---|
| Surfaces | `--g2-color-page`, `--g2-color-surface`, `--g2-color-surface-sunken`, `--g2-color-line`, `--g2-color-control-border`, `--g2-color-control-bg` | Backgrounds and rules. `--g2-color-page` is the page background and `--g2-color-surface` is a raised surface such as a card. `--g2-color-surface-sunken` is for panels, footer, toolbars, the notice bar and tags. `--g2-color-control-border` is the border of form controls. `--g2-color-control-bg` is the background of `.g2-input`, also while the field has focus. |
| Text | `--g2-color-text`, `--g2-color-text-muted`, `--g2-color-text-faint` | `--g2-color-text-faint` for text on the page background only (about 4.57:1); it fails ordinary-text contrast on `--g2-color-surface-sunken`. |
| Links and selection | `--g2-color-link`, `--g2-color-link-visited`, `--g2-color-selected-bg`, `--g2-color-on-link` | `--g2-color-selected-bg` for selected rows. `--g2-color-on-link` is the text colour on a fill of the link colour. No component reads it. |
| Brand and header | `--g2-color-brand`, `--g2-color-header-bg`, `--g2-color-on-header`, `--g2-color-on-header-muted`, `--g2-color-header-accent` | Header, header band, footer rule, tile rule, and other dark surfaces. `--g2-color-header-accent` marks the current navigation item. |
| Actions | `--g2-color-action`, `--g2-color-action-hover`, `--g2-color-action-shadow`, `--g2-color-action-secondary-shadow`, `--g2-color-action-secondary-hover`, `--g2-color-danger-solid`, `--g2-color-danger-shadow`, `--g2-color-on-solid` | Buttons. `--g2-color-action-secondary-hover` is the hover background of the secondary button. `--g2-color-danger-solid` is also the colour of error text and the error bar. `--g2-color-on-solid` is the text colour on a saturated fill: the primary and danger buttons and the title band of a notice. |
| Focus | `--g2-color-focus`, `--g2-color-on-focus` | Focus state only. |
| Status | `--g2-color-success-solid` and the 18 tone tokens in the table under *Tags* | Tags and status panels. `--g2-color-success-solid` is a solid success fill; no component reads it. |
| Highlight | `--g2-color-highlight-bg` | The background of a matched word in `mark`. `#fff7bf` in the light scheme, `#5c4d00` in the dark scheme. It is not the focus yellow: yellow means keyboard focus. See *Highlight*. |
| Tricolour | `--g2-color-ro-blue`, `--g2-color-ro-yellow`, `--g2-color-ro-red`, `--g2-color-ro-blue-ring` | Decorative marks only: never text, except `.g2-ro-sweep` (ADR 0010). `--g2-color-ro-blue-ring` is the ring around the blue dot of `.g2-ro-dots`. |
| Charts | `--g2-color-chart-1`, `--g2-color-chart-2`, `--g2-color-chart-3`, `--g2-color-chart-4`, `--g2-color-chart-selected` | Blue series, then greys. `--g2-color-chart-selected` marks the selection. |
| Type | `--g2-font-sans`, `--g2-font-mono` | Text family. Family for codes and aligned numbers. Each names Inter or Fragment Mono first, then system fonts. See *Fonts*. |
| Type scale | `--g2-font-size-heading-page`, `--g2-font-size-heading-section`, `--g2-font-size-heading-item`, `--g2-font-size-body`, `--g2-font-size-meta`, `--g2-font-size-label`, `--g2-line-height-heading`, `--g2-line-height-body` | Font sizes in rem and two line heights. See *Type roles*. |
| Spacing | `--g2-space-1`, `--g2-space-2`, `--g2-space-3`, `--g2-space-4`, `--g2-space-5`, `--g2-space-6`, `--g2-space-7` | Seven steps in rem, from .25rem to 3rem. See *Spacing*. |
| Metrics | `--g2-radius` (0), `--g2-border-width-control` (2px), `--g2-container-max` (80rem), `--g2-gutter` (`clamp(1rem, 3vw, 2rem)`) | `--g2-radius` is read by buttons, chips, fields, tags, tiles and notices. `--g2-border-width-control` is the border width of buttons, chips and fields. `--g2-container-max` and `--g2-gutter` are read by `.g2-container`. |

## Colour scheme

The default is the light scheme. A page opts in to the dark scheme with one attribute on the root element.

| Markup | Result |
|---|---|
| no attribute, or `data-g2-scheme="light"` | The light scheme. The page looks as in 0.11.0. |
| `data-g2-scheme="auto"` | Follows `prefers-color-scheme`. The scheme is dark only when the reader asks for it. |
| `data-g2-scheme="dark"` | The dark scheme. |

```html
<html lang="ro" data-g2-scheme="auto">
```

- Any other value gives the light scheme.
- The dark values are in `gov2.css`, in the `gov2.tokens` layer, after the light values. The component rules do not change for a scheme: they read the tokens. A project does not write dark values for the colour tokens.
- The dark values are written twice: for `:root[data-g2-scheme=dark]`, and for `:root[data-g2-scheme=auto]` inside `@media (prefers-color-scheme: dark)`. CSS cannot share one rule between these two. A test checks that the two blocks are equal.
- `color-scheme` is `light` on `:root` and `dark` in the dark blocks. A native `select`, `textarea` or date field, and the scrollbars, follow it. They have no DS class: `color-scheme` is the only dark styling that they get.
- The core has no toggle and no script. A project that lets the reader choose sets the attribute itself and stores the choice.
- These colour tokens keep their light value in both schemes: the header group (`--g2-color-header-bg`, `--g2-color-on-header`, `--g2-color-on-header-muted`, `--g2-color-header-accent`), the focus pair, the three tricolour colours and `--g2-color-ro-blue-ring`.
  The header is dark in both schemes. The dark page has the colour of the header, so the brand band separates them.
- A saturated fill carries light colour and dark text in the dark scheme. `--g2-color-on-solid` is `#ffffff` in the light scheme and `#0b0c0c` in the dark scheme. It colours the text of the primary and danger buttons and of the notice title band.
- Keyboard focus is the same in both schemes: a yellow fill with dark text. A focused field has a yellow outline and an inset ring in `--g2-color-text`, on `--g2-color-control-bg`.
- The tricolour is not changed for the dark scheme. The blue (`#002b7f`) has 1.54:1 against the dark page and the dark header. The corner mark and the dots stay in the header, so they look the same in both schemes.
  `.g2-ro-bar` and `.g2-dash` sit on the page: their blue third is hard to see on the dark page. A change needs a separate decision.
- The status tones keep their meaning: a dark background, a light ink and a light line, with the same six names. A visited link has another hue (violet) than a link (blue) in both schemes.
- The chart tokens keep their order of emphasis. There is no sequential ramp for maps.
- The live guide shows the measured contrast of every pair. A test recomputes each value from the tokens.

For a project:

1. Set `data-g2-scheme="auto"` on `<html>`. Without the attribute, the project stays light after an update.
2. Do not write dark values for the colour tokens. Use the tokens in your own rules.
3. Check the colours of the project on the dark page. A colour literal that was written for a light page stays light.
4. Check focus, hover plus focus, selection, disabled and error states in both schemes.

## Fonts

Standard installation copies `fonts.css` and the `fonts/` folder with `gov2.css`, from one tag, and links `fonts.css` on every page. The README has the procedure under *Install from an exact tag*.

- `gov2.css` makes no font request and works offline. `--g2-font-sans` is `"Inter", -apple-system, "Segoe UI", Arial, sans-serif`. `--g2-font-mono` is `"Fragment Mono", ui-monospace, SFMono-Regular, monospace`.
- `fonts.css` declares Inter and Fragment Mono as local WOFF2 files. The URLs are relative to `fonts.css`, so it works from the site root and from a subpath if `fonts/` stays next to it.
  Each face has `font-display: swap` and a `unicode-range` for its subset (latin or latin-ext), so the browser downloads a file only when the page uses a character from it.
- `fonts.css` declares font faces only. It has no layer, no token and no type rule, so its load order against `gov2.css` does not matter.
- Inter is one variable file for each subset, with weights 100 to 900. The DS uses 400, 500, 600 and 700. Fragment Mono has the weight 400 only.
- The files contain the Romanian letters Ă ă Â â Î î Ș ș Ț ț. Fragment Mono has no Ţ ţ (the old cedilla forms of t).
- `fonts/README.md` records the source, version, licence, size and SHA-256 of every file. The OFL notices are in `fonts/`. Copy the whole folder, so that the notices stay with the files.
- A page that links `fonts.css` needs `font-src 'self'` and `style-src 'self'` in its Content-Security-Policy when it serves the files itself.
- Without `fonts.css`, the page falls back to the system fonts in the two tokens above. Skip `fonts.css` only for a quick one-off project that accepts system fonts, or when the project already serves both families.
  A project that uses other families sets `--g2-font-sans` and `--g2-font-mono` in `app`, and documents the variation.

## Base styles

On every page that loads the stylesheet, these styles apply without a class. They are in the `gov2.base` layer, except focus, which is in `gov2.states`:

- `body`: Inter at `--g2-font-size-body` (1.0625rem, 17px at a 16px root) with line height `--g2-line-height-body` (1.55), text colour on page background.
- Links: underlined, `--g2-color-link`; visited `--g2-color-link-visited`; on hover the underline is 3px.
- `:focus-visible`: yellow background, ink text, black bar below.
- `input`, `textarea`, `select` on focus: yellow 3px outline and a 2px ink inset.
- With `prefers-reduced-motion: reduce`, transitions and animations stop. This rule uses `!important`, so a project rule in a later layer cannot restore motion.

The base rules have the specificity of one element (0,0,1), but layers decide first: any rule in `gov2.components`, `gov2.states`, `utilities` or `app` wins over them.
A reset in the `reset` layer loses to them.

## Links

Each link role has one class. `GUIDELINES.md` tells when to use each role.

```html
<p>Citiți <a href="/despre">regulile</a> înainte să aplicați.</p>
<a class="g2-link-title" href="/joburi/medic-specialist">Medic specialist</a>
<a class="g2-link-quiet" href="/?institutie=123">Spitalul Județean de Urgență Bacău</a>
<a class="g2-link-inverse" href="/despre/#versiunea-datelor">Bază generată: 17 oct</a>
```

| Class | Role | Look |
|---|---|---|
| (none) | In-text link | Blue, underlined, visited colour. |
| `.g2-link-title` | Item title, to a detail page | Blue, bold, `--g2-font-size-heading-item` (19px at a 16px root), line height 1.3, underlined, visited colour. |
| `.g2-link-quiet` | Secondary link in metadata | Ink, underlined, no visited colour. |
| `.g2-link-inverse` | Link on the dark bar | White, underlined, no visited colour. For the header navigation, use `.g2-nav`. |

On hover, the underline of each link is 3px. On focus, each link is yellow with ink text.

## Chips

A chip is a shortcut link or a toggle button. Use an anchor for navigation and a button for an action. A tag displays a state.

```html
<a class="g2-chip" href="/?ocupatie=medic-specialist">Medic specialist <span class="g2-chip-count">76</span></a>
<a class="g2-chip" href="/?stare=active" aria-current="true">Active</a>
```

- `.g2-chip`: grey background, ink text, no underline, at least 36px high, text at `--g2-font-size-meta`. On hover, the background is darker.
- `.g2-chip-count`: the count, in muted mono.
- `aria-current="false"`, an empty `aria-current`, and `aria-pressed="false"` do not select a chip.
- Mark the selected chip with `aria-current="true"` (a link) or `aria-pressed="true"` (a button). It gets a 2px ink border. The rule is in `gov2.states`.
- On keyboard focus, a chip is yellow with ink text, also when hovered and also when selected. The selected border stays.
- With forced colours, every chip has the same border. The selected chip then uses the system selection colours (`Highlight`, `HighlightText`).

## Container

`.g2-container` sets the page width and the side padding.

```html
<main class="g2-container" id="content">…</main>
```

- Border-box sizing, `width: 100%`, automatic inline margins and `max-width: var(--g2-container-max)`. The padding is part of the maximum.
- The inline padding is `--g2-gutter`: `clamp(1rem, 3vw, 2rem)`. The container, with its padding, fits a 320px viewport.
- It sets no vertical padding and no vertical margin. The page sets those with the spacing tokens.
- Put `.g2-container` on `<main>`, on `.g2-header-in` and on `.g2-footer-in`, so that all three align.
- Customize the width and the gutter with `--g2-container-max` and `--g2-gutter` in the `app` layer. `docs/migration-from-0.6.0.md` has a verified example.

## Spacing

Seven steps in rem. They are for the gaps and padding of your compositions. The DS has no spacing utility classes.

| Token | Value | Use |
|---|---|---|
| `--g2-space-1` | .25rem (4px) | Between a label, its hint and its control. Between navigation links. |
| `--g2-space-2` | .5rem (8px) | Between items in a row. Between rows of a header. |
| `--g2-space-3` | .75rem (12px) | Inline padding of a navigation link. |
| `--g2-space-4` | 1rem (16px) | Between related blocks. Between footer rows. |
| `--g2-space-5` | 1.5rem (24px) | Between groups. Between header columns. Between fields in a form. |
| `--g2-space-6` | 2rem (32px) | Between page sections. Between footer groups. |
| `--g2-space-7` | 3rem (48px) | Above and below the page content. |

The px values are for a 16px root. The steps follow the root text size.

## Type roles

Six roles. The sizes are starting treatments, in rem, so that they follow the reader's text size. Use a different size when the content needs it.

| Role | Class | Size token | Size (16px root) | Weight |
|---|---|---|---|---|
| Page title | `.g2-heading-page` | `--g2-font-size-heading-page` | 2rem (32px) | bold |
| Section title | `.g2-heading-section` | `--g2-font-size-heading-section` | 1.5rem (24px) | bold |
| Item title | `.g2-heading-item` | `--g2-font-size-heading-item` | 1.1875rem (19px) | bold |
| Body | none: the base style | `--g2-font-size-body` | 1.0625rem (17px) | regular |
| Metadata | `.g2-text-meta` | `--g2-font-size-meta` | .9375rem (15px) | regular, muted colour |
| Short label | `.g2-label` | `--g2-font-size-label` | .875rem (14px) | semibold |

```html
<h1 class="g2-heading-page">Directorul instituțiilor publice</h1>
<h2 class="g2-heading-section">Rezultate</h2>
<h3 class="g2-heading-item"><a class="g2-link-title" href="/detaliu">Casa Județeană de Pensii Bacău</a></h3>
<p class="g2-text-meta">Verificat la 26.10.2026</p>
```

- The class sets size, weight and line height, and a heading breaks a word that is wider than its line (`overflow-wrap: break-word`). It sets no margin. The page sets the margins.
- The HTML heading level (`h1` to `h6`) follows the structure of the document. The class chooses the look. An `h3` can look like a page title.
- Line height: `--g2-line-height-heading` (1.25) for the three heading roles, `--g2-line-height-body` (1.55) for running text.
- `.g2-link-title` reads `--g2-font-size-heading-item`, so a linked item title and an item heading have the same size. Its line height stays 1.3.
- No global heading reset: a bare `<h1>` keeps the browser style.
- These components read a type token: body (`body`, `.g2-btn`, `.g2-input`), item title (`.g2-link-title`), meta (`.g2-nav a`, `.g2-chip`, `.g2-notice-bar`) and label (`.g2-chip-count`, `.g2-tag`, `.g2-label`).
  `.g2-wordmark` (19px) and the close button of the notice bar (22px) still use px.

## Header

A black bar with an 8px brand band below it.

```html
<header class="g2-header">
  <span class="g2-ro-corner" aria-hidden="true"></span>
  <div class="g2-header-in">
    <a class="g2-wordmark" href="/">
      <img class="g2-logo" src="/logo/posturi.svg" alt="">
      posturi<em>.gov2.ro</em>
    </a>
    <nav class="g2-nav" aria-label="Principal">
      <a href="/" aria-current="page">Acasă</a>
      <a href="/despre">Despre</a>
    </nav>
  </div>
</header>
```

- `.g2-header-in`: a flex row that wraps, at least 52px high, with `--g2-space-5` between columns and `--g2-space-2` between rows. It has `--g2-space-1` padding above and below.
  It sets no width and no side padding: add `.g2-container` to the same element, `class="g2-header-in g2-container"`.
- A wrapping header is tall on a narrow screen: about 190px at 375px with a wordmark, navigation and one more row (measured by org.gov2.ro). Do not make the whole header sticky on data pages. Make only a short toolbar sticky, such as a filter bar.
  The row wraps at narrow widths. The navigation stays visible: there is no menu button and no script.
- `.g2-wordmark`: the project name, white, 19px bold. Put the domain part in `<em>` to show it muted. On keyboard focus, both parts use ink on yellow.
- `.g2-logo`: an SVG from `logo/`, 28px high. It is decorative: use `alt=""`.
- `.g2-nav`: a flex row that wraps, with a 4px gap (`--g2-space-1`) between links.
- `.g2-nav a`: `--g2-color-on-header` (white), semibold, `--g2-font-size-meta`, at least 44px high, with `--g2-space-2` padding above and below and `--g2-space-3` at the sides. A long label wraps and is not clipped.
  Set `aria-current="page"` on the current link: it gets a blue bar below.
  A navigation link with keyboard focus shows the standard focus bars (yellow above, ink below) instead of that blue bar, and it is not underlined while hovered.
  With forced colours, the current link uses the system selection colours (`Highlight`, `HighlightText`), because forced colours remove the bar.

### Tricolour marks

Use one mark for each page. All marks are decorative: add `aria-hidden="true"`.

| Class | Where | Notes |
|---|---|---|
| `.g2-ro-corner` | First child of `.g2-header` | **Default.** A 54×6px stripe at the top right. The header keeps its brand band. |
| `.g2-ro-bar` | Before the notice bar and the header | A 6px stripe across the page. Add `.g2-tricolor` to the header to remove its brand band. |
| `.g2-ro-dots` | Next to the wordmark | Three 7px dots. Markup: `<span class="g2-ro-dots" aria-hidden="true"><i></i></span>`. |

### Title sweep

`.g2-ro-sweep` is the only tricolour text (ADR 0010). A narrow blue, yellow and red band crosses the site title, then the title rests.
It is opt-in, and it has two deliberate deviations from WCAG. Read the list below before you use it.

```html
<a class="g2-wordmark" href="/"><span class="g2-ro-sweep">Instituții publice</span></a>
```

- Put it on one inline element that contains only the title text. The element sits in `.g2-wordmark` or in a title heading inside `.g2-header`.
  Use it once for each page. Do not use it on body text, on a content link or on a status. The sweep never carries information.
- At rest, the glyphs have the colour of the host (`currentColor`), so the title follows the header and the colour scheme.
  The band reads `--g2-color-ro-blue`, `--g2-color-ro-yellow` and `--g2-color-ro-red`. The class adds no token.
- Timing: the cycle is 9s (`animation: g2-ro-sweep 9s linear infinite`). The band sweeps for 3s of each cycle and is over the glyphs for about 2s of that. The title rests for the other 6s.
- The title is plain text, with no band, in six cases: with `prefers-reduced-motion: reduce`, in forced colours, in print, in a browser without `background-clip: text`, with the animation removed, and while the host link has keyboard focus.
  A focused host link shows the standard focus colours with ink text on yellow. The focus rule is in `gov2.states`.
- The technique is a gradient background, clipped to the text, with a transparent text fill. The text stays real text: the accessible name does not change, and the reader can select it.
  Selected text stays visible, but with less contrast than plain text, because the browser draws the selection over the transparent glyphs.
- **Deviation 1, WCAG 2.2.2 Pause, Stop, Hide (level A).** The sweep starts by itself, loops and has no pause control. `prefers-reduced-motion: reduce` is the only stop.
  The owner accepted this, because the sweep is slow and small.
- **Deviation 2, WCAG 1.4.3 Contrast (Minimum) (level AA).** While the band crosses a glyph, that glyph can fall below 4.5:1.
  On the header (`#0b0c0c`) the blue segment has 1.54:1 and the red segment 3.48:1; the yellow segment has 13.31:1. On a white page the yellow segment has 1.47:1.
- A project that must conform to WCAG 2.1 or 2.2 level AA does not use `.g2-ro-sweep`. A project that uses it lists both deviations in its accessibility statement.
  Suggested wording: "The title of this site shows a tricolour band that crosses the text every nine seconds. The user cannot pause the band; the system setting for reduced motion stops it.
  While the band crosses a letter, the contrast of that letter can be below 4.5:1. This deviates from WCAG 2.2 success criteria 2.2.2 (level A) and 1.4.3 (level AA)."

## Notice bar

A grey bar above the header for a short message. The user can close it.

```html
<div class="g2-notice-bar" role="region" aria-label="Anunț">
  <p>Site în test. Datele pot fi incomplete.</p>
  <button type="button" aria-label="Închide anunțul">×</button>
</div>
```

- `.g2-notice-bar`: a flex row on the sunken surface, with text at `--g2-font-size-meta` and a 1px rule below. A direct `<p>` child fills the row with no outer margin. A direct `<button>` child is the close control, 44×36px, at the right edge.
- The `hidden` attribute hides the bar. Closing the bar can set `hidden` on it directly.
- The project stores the choice to close it, for example in `localStorage`.

## Footer

```html
<footer class="g2-footer">
  <div class="g2-footer-in g2-container">
    <div>…</div>
    <nav aria-label="Subsol">…</nav>
  </div>
</footer>
```

- `.g2-footer`: the surface. A grey footer with a 10px brand rule on top. Links in the footer are ink, not blue. It has no padding and no layout.
- `.g2-footer-in`: the content. A flex row that wraps, with `--g2-space-4` between rows, `--g2-space-6` between groups and `--g2-space-5` padding above and below.
  Each direct child has no margin and can shrink. Add `.g2-container` to the same element for the side gutters.
- The footer does not require a language switch, an account link or a fixed list of links.

## Section dash

A short 48×4px tricolour mark above a section title.

```html
<span class="g2-dash" aria-hidden="true"></span>
<h2>Posturi noi</h2>
```

`.g2-dash.g2-red` is a red dash, without the tricolour.

## Buttons

```html
<button class="g2-btn" type="submit">Caută</button>
<a class="g2-btn g2-secondary" href="/export">Exportă CSV</a>
<button class="g2-btn g2-danger" type="button">Șterge contul</button>
```

| Class | Use |
|---|---|
| `.g2-btn` | The primary action. Use one for each page or form. Green. |
| `.g2-btn.g2-secondary` | Other actions. Grey. |
| `.g2-btn.g2-danger` | A destructive action. Red. Before 0.11.0 the class was `.g2-warning`. |

- The button is at least 44px high and has a 2px shadow below it. The text colour is `--g2-color-on-solid`. The secondary button reads `--g2-color-action-secondary-hover` on hover. Buttons, chips and inputs set `box-sizing:border-box` without requiring a project reset.
- On keyboard focus, the button is yellow with ink text, including when hovered. The focus rule is in `gov2.states`; hover is in `gov2.components`.
- `:disabled` shows the button at 50% opacity and the `not-allowed` cursor. On a link, `:disabled` does not apply.
- A project class next to the component class, for example `class="g2-btn btn-compact"`, can change the size. Put its rule in the `app` layer.
  Colour changes need care: see *Layers and project CSS*.

## Tags

`.g2-tag` is a square label for a state. The text must name the state: do not use the colour alone.

```html
<strong class="g2-tag" data-tone="success">Activ</strong>
```

The attribute value and the token names use the same six status names. A tag with any other value looks neutral.

| `data-tone` | Tokens | Use |
|---|---|---|
| (none) or `neutral` | `--g2-color-neutral-bg`, `--g2-color-neutral-line`, `--g2-color-neutral-ink` | No state, or a category. |
| `info` | `--g2-color-info-bg`, `--g2-color-info-line`, `--g2-color-info-ink` | Information. |
| `progress` | `--g2-color-progress-bg`, `--g2-color-progress-line`, `--g2-color-progress-ink` | In progress. |
| `warning` | `--g2-color-warning-bg`, `--g2-color-warning-line`, `--g2-color-warning-ink` | Needs attention. |
| `success` | `--g2-color-success-bg`, `--g2-color-success-line`, `--g2-color-success-ink` | Done, valid, active. |
| `danger` | `--g2-color-danger-bg`, `--g2-color-danger-line`, `--g2-color-danger-ink` | Error, closed, rejected. |

The destructive button `.g2-btn.g2-danger` uses the same name as the `danger` status and reads `--g2-color-danger-solid`.

## Fields

```html
<div class="g2-field g2-field-error">
  <label class="g2-label" for="email">Adresa de e-mail</label>
  <p class="g2-hint" id="email-hint">Pe această adresă primiți confirmarea.</p>
  <p class="g2-error-msg" id="email-error">Eroare: scrieți o adresă de e-mail completă, de exemplu nume@institutie.ro.</p>
  <input class="g2-input" id="email" type="email" aria-describedby="email-hint email-error" aria-invalid="true" autocomplete="email">
</div>
```

| Class | Role |
|---|---|
| `.g2-field` | Stacks the parts of one field: label, hint, error message and control. The gap is `--g2-space-1`. A direct `.g2-input` fills the width of the field. A word that is wider than the field breaks (`overflow-wrap: anywhere`), so that a long address or code does not overflow a narrow screen. The field sets no outer margin: the form sets the space between fields with the spacing tokens. |
| `.g2-label` | The field label. Block, `--g2-font-size-label`, semibold. Use `<label for="…">`. |
| `.g2-hint` | Help before the control: format, example, why the field is locked. Muted, `--g2-font-size-meta`. Connect it with `aria-describedby`. |
| `.g2-input` | The text control: at least 40px high, 2px border (`--g2-color-control-border`), background `--g2-color-control-bg`, text at `--g2-font-size-body`. The focus style is in `gov2.states`. |
| `.g2-field-error` | Wraps a field that has an error. It adds a red bar on the left and makes the input border red. The input keeps the red border on hover and on focus. |
| `.g2-error-msg` | The error text, red and bold. Start it with "Eroare:", so that the colour does not carry the meaning. |

- Order in the field: label, hint, error message, control.
- An invalid control has `aria-invalid="true"` and an `aria-describedby` that lists the hint and the error message.
- Use `autocomplete` tokens for personal data (`name`, `email`, `organization`). Do not set `organization` for a field that is not about the reader's own organization.
- `.g2-input` works for `type="text"`, `"email"` and `"search"`. A project decides the width of a field with its own rule in the `app` layer.
- Disabled: the native `disabled` attribute. The control shows the sunken surface and muted text, it is not focusable, and it is skipped by Tab. The rule is in `gov2.states`.
  A disabled control is not submitted. Say in the hint why the value is locked. Use `readonly` when the reader must be able to select the value.
- `textarea`, `select`, checkboxes and radios are outside this slice. They have no DS class and no documented sizing. Use the native controls and keep your own styles local.
  Do not apply `.g2-input` to them and expect a complete result.

### Recovery from an error

An error summary lists each problem with a link to its field. `href="#email"` moves keyboard focus to the control with that `id`, with no script.
`.g2-field>.g2-input` has a 12rem top `scroll-margin`. Browsers align the target to the top of the window, so this margin keeps the label, the hint and the error message in view after the jump.
Measured in Chrome 155: a field head of up to 186px (label, two-line hint and three-line error at 320px) stays in view. A longer hint or error can still push the label above the edge.
The summary itself is a local composition: see `ex-summary` in `docs/examples/examples.css` and the form in `docs/examples/form.html`. It is not a core component.
A page must not move focus away from its heading on load. Move focus to the summary only after a submission, in the application.

## Panels

### Inset

```html
<div class="g2-inset"><p>Termenul se calculează în zile lucrătoare.</p></div>
```

`.g2-inset`: text set apart with a grey 5px bar on the left. Use it for a note that adds to the text around it.

### Notice

```html
<div class="g2-notice" role="region" aria-labelledby="n1">
  <h2 id="n1">Important</h2>
  <p>Înscrierile se închid pe 30 noiembrie.</p>
</div>
```

A boxed message with a blue title band. The panel must have exactly two children: the first child is the title, the last child is the body. The title text reads `--g2-color-on-solid`. The body background is `--g2-color-surface`.

### Tile

```html
<div class="g2-tile">
  <h3>1.204</h3>
  <p>posturi active</p>
</div>
```

`.g2-tile`: a box with a 1px border and a 5px brand rule on top. Use it for a figure, a link group or a summary.

## Skip link

```html
<a class="g2-skip-link" href="#continut">Sari la conținut</a>
<header class="g2-header">…</header>
<main id="continut" tabindex="-1">…</main>
```

`.g2-skip-link`: a link that jumps past the header to the main content. Put it first in `body`, so that it is the first focusable element.

- It is invisible until it has keyboard focus. Then it shows the standard focus treatment: yellow fill, ink text and a black bar.
- The target needs an `id` and `tabindex="-1"`. Activating the link moves focus to the target.
- A target with `tabindex="-1"` does not get the yellow fill when it receives focus. See *Focus* below.
- The hidden state uses `clip-path` and a 1px box. It adds no page overflow.

### Focus on a `tabindex="-1"` target

The general `:focus-visible` rule fills a focused element with yellow. A container that receives focus from a skip link or a script is not a control, so the rule in `gov2.states` removes the fill, the bar and the outline for `[tabindex="-1"]`.
A link, a button, a field, `summary` and a `contenteditable` element keep the standard treatment. So does an element with a widget role (`button`, `link`, `tab`, `menuitem`, `option`, `treeitem`, `gridcell`, `checkbox`, `radio`, `switch`): a roving-focus widget needs its indicator.

## Breadcrumbs

```html
<nav class="g2-breadcrumbs" aria-label="Navigare">
  <ol>
    <li><a class="g2-link-quiet" href="/">Acasă</a></li>
    <li><a class="g2-link-quiet" href="/surse/">Surse</a></li>
    <li aria-current="page">ICCJ — Comunicate de presă</li>
  </ol>
</nav>
```

`.g2-breadcrumbs` goes on a `<nav>` that contains an `<ol>`. Give the `<nav>` an accessible name.

- The current item has `aria-current="page"` and is not a link. It is bold. A long current item wraps; the component never truncates it.
- The separator is `/` in `--g2-color-text-faint`. It is generated content with an empty text alternative (`content: "/" / ""`), so a screen reader does not announce it. A browser without the alternative syntax shows the same `/` and may announce it.
- A link has about 39px of height (padding in `--g2-space-2`), above the 24px minimum of WCAG 2.2 (2.5.8).

## Pagination

```html
<nav class="g2-pagination" aria-label="Paginare">
  <p>Pagina <span class="g2-mono">2</span> din <span class="g2-mono">12</span></p>
  <ul>
    <li><a rel="prev" href="?pagina=1">Înapoi</a></li>
    <li><a href="?pagina=1" aria-label="Pagina 1">1</a></li>
    <li><a href="?pagina=2" aria-current="page" aria-label="Pagina 2">2</a></li>
    <li><a rel="next" href="?pagina=3">Înainte</a></li>
  </ul>
</nav>
```

`.g2-pagination` goes on a `<nav>`. It has a 2px rule on top, a position line and a row of links.

- The links are plain links, not buttons. Each has a target of at least 44px by 44px.
- The current numbered link has `aria-current="page"`. It shows a border and bold text. In forced colours it shows the system selection colours. `aria-current="false"` and an empty value do not select a link.
- Leave out an absent previous or next link. Do not show a disabled link.
- The position line is optional. A page with only previous and next links can use `<p><a rel="prev">…</a> <a rel="next">…</a></p>`; the links keep the 44px target.

## Data table

```html
<div class="g2-table-wrap" role="region" aria-label="Instituții și posturi" tabindex="0">
  <table class="g2-table">
    <caption>Instituții și posturi vacante</caption>
    <thead><tr><th scope="col">Instituție</th><th scope="col" class="g2-cell-num">Posturi</th></tr></thead>
    <tbody><tr><th scope="row">Casa de Pensii Bacău</th><td class="g2-cell-num" data-label="Posturi">3</td></tr></tbody>
  </table>
</div>
```

- `.g2-table` is on a `<table>`. It needs a `<caption>` or an accessible name (`aria-label`, `aria-labelledby`). Every header cell has `scope="col"` or `scope="row"`.
- The header row has the sunken surface and the label size (`--g2-font-size-label`). Each cell has a 1px rule in `--g2-color-line` below it.
- `.g2-cell-num` is on a numeric cell, and on its header cell. The text is aligned to the right and the figures are tabular (`font-variant-numeric: tabular-nums`).
- `.g2-table-wrap` scrolls a wide table inside the page; the page itself does not scroll sideways. A scrollable region needs a keyboard way to scroll: document `tabindex="0"`, `role="region"` and an accessible name. When the wrapper has focus, it shows a yellow outline and an inner ink ring, and no fill.
- `.g2-table-stacked` is a modifier of `.g2-table`. Below 45em (720px at a 16px root) every row becomes a block. The header row is hidden visually and stays in the accessibility tree. Each cell with `data-label` shows the label above its value. A `.g2-cell-num` cell aligns to the left.
  Chrome 156 keeps the table semantics (table, rowgroup, row, columnheader, rowheader, cell) when the elements are `display: block`; the test reads them in the accessibility tree. Other engines can drop them, so write the explicit roles on the stacked table: `role="table"` on `<table>`, `role="rowgroup"` on `<thead>` and `<tbody>`, `role="row"` on `<tr>`, `role="columnheader"`, `role="rowheader"` and `role="cell"` on the cells. The roles change nothing in Chrome.
  The cell name includes the label (for example "Posturi 12"). A screen reader can read the label twice.

## Summary list

```html
<dl class="g2-summary-list">
  <div><dt>Cod înregistrare</dt><dd class="g2-mono">DEMO-BC-0156</dd></div>
  <div><dt>Verificat la</dt><dd>17 octombrie 2026</dd></div>
</dl>
```

`.g2-summary-list` goes on a `<dl>`, with one `<div>` for each row. The `dt` and the `dd` stay associated.

- The label is at the label size, bold and muted. A 1px rule in `--g2-color-line` separates the rows; there is none above the first row.
- A row has two columns (a 14rem label and a value) when the list is wide enough. It stacks, label above value, when the list is narrower than about 27rem. It follows the width of the list, not the viewport.
- A long value wraps (`overflow-wrap: anywhere`).

## Highlight

```html
<p>Casa Județeană de Pensii <mark>Bacău</mark> publică datele lunar.</p>
```

The base rule for `mark` needs no class: background `--g2-color-highlight-bg`, text `--g2-color-text`. The text has at least 4.5:1 in both schemes (18.01:1 light, 7.46:1 dark). The highlight is not the focus yellow. In forced colours the rule uses the system `Mark` and `MarkText` colours.

## Codes and numbers

`.g2-mono` sets Fragment Mono with tabular figures. Use it for codes (CAEN, CUI, IDs) and for numbers in columns.

## Not in the DS yet

These parts are missing. Build a local version with the project prefix, and open a `ds-proposal` issue when another project needs it too.

- A grid inside the container (columns, sidebars).
- Classes for `textarea`, `select`, checkboxes and radios. They are outside the page-foundation slice.
- Tabs.
- A core error summary. The example form has a local composition.
- Icon buttons, complex filters and charts.
- A hover state for `.g2-btn.g2-danger`.
- A sequential colour ramp for maps, in either scheme.
