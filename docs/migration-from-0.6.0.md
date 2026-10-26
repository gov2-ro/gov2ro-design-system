# Migration from 0.6.0

This document tells a project how to move from `gov2.css` 0.6.0 or 0.7.0 to 0.8.0.
The runtime API of 0.7.0 is the same as 0.6.0: version 0.7.0 changed documentation, tests and four fixes only.
This document therefore covers both versions.

The DS changes its API on purpose. ADR 0002 (activation), ADR 0003 (names) and ADR 0004 (cascade) record the decisions.
The DS ships no alias, no dual selector and no adapter for the old names.
Each project replaces the old names in its own repository.

## Summary

| Area | 0.6.0 and 0.7.0 | 0.8.0 |
|---|---|---|
| Activation | `<html data-skin="gov2">` | Load the stylesheet. No attribute and no wrapper. |
| Tokens | `--c-*`, `--font-*`, `--radius*`, `--border-ink`, `--shadow-lift` and `--shell`, under `[data-skin="gov2"]` | `--g2-*`, on `:root` |
| Status markup | `data-tone` is `warn`, `ok` or `bad` | `warning`, `success` or `danger` |
| Status tokens | `note`, `ok` and `alert` | `warning`, `success` and `danger` |
| Cascade | No layers | Layers `reset, gov2, utilities, app` |
| Classes | `.g2-*` | The same. No class is renamed or removed. |

## Steps

1. Remove `data-skin="gov2"` from `<html>`. The stylesheet ignores the attribute now.
2. Replace each old token with its new name. Use the token tables below.
3. Replace `data-tone="warn"`, `"ok"` and `"bad"` with `"warning"`, `"success"` and `"danger"`.
   A tag with an old value shows the neutral tone. No alias exists.
4. Put your reset in the `reset` layer. Put your utility classes in `utilities`. Put your other CSS in `app`.
5. Declare the layer order before any other stylesheet that creates layers.
6. Check the pages. Use the checklist at the end of this document.

The old skin checker for posturi (`check-skins.php`) is retired for this core.
`gov2.css` does not pass it and does not try to pass it. Consumer checks belong in the consumer repository.

## Activation

Loading `gov2.css` applies the base styles to the whole page. These are the page text and background, the links, the keyboard focus and the reduced-motion rule.
The tokens are on `:root`. The components stay opt-in through their `.g2-*` classes.

A page does not need an attribute or a wrapper. A minimal page is the first verified example below.

## Status vocabulary

One set of six names is used in tokens, markup, documentation and tests.

| Old token group | Old `data-tone` | New name (token and markup) |
|---|---|---|
| `neutral` | absent or `neutral` | `neutral` (also the default when the attribute is absent) |
| `info` | `info` | `info` |
| `progress` | `progress` | `progress` |
| `note` | `warn` | `warning` |
| `ok` | `ok` | `success` |
| `alert` | `bad` | `danger` |

Each group has `-bg`, `-line` and `-ink` tokens. For example, `--c-note-bg` becomes `--g2-color-warning-bg`.

## Tokens

Every token keeps its value, with one exception: `--g2-container-max` was `1280px` and is now `80rem` (see *Changes after 0.8.0*).
The tables show the current value.
The tests compare each value in these tables with `gov2.css`, so the tables cannot drift from the stylesheet.
Colour tokens stay bare RGB channels: `rgb(var(--g2-color-text))`, or `rgb(var(--g2-color-text) / .5)`.

The DS had 62 tokens. Version 0.8.0 has 57. Five tokens are removed, each with a reason in the table.
Tokens added after 0.8.0 have no 0.6.0 name, so they have no row. See *Changes after 0.8.0*.

#### Surfaces

| 0.6.0 token | New token | Value | Note |
|---|---|---|---|
| `--c-page` | `--g2-color-page` | `255 255 255` | Page background. |
| `--c-surface` | `--g2-color-surface` | `255 255 255` | Raised surface: card, panel, demonstration area. |
| `--c-sunken` | `--g2-color-surface-sunken` | `243 242 241` | Secondary surface: panel, footer, toolbar, notice bar, tag. |
| `--c-line` | `--g2-color-line` | `177 180 182` | Rule and card border. |
| `--c-line-strong` | `--g2-color-control-border` | `11 12 12` | Border of a form control. Renamed to the role it serves. `.g2-input` now reads it; before, the input read `--c-ink`. The value is equal. |

#### Text

| 0.6.0 token | New token | Value | Note |
|---|---|---|---|
| `--c-ink` | `--g2-color-text` | `11 12 12` | Body text and selected-chip border. |
| `--c-ink-muted` | `--g2-color-text-muted` | `80 90 95` | Secondary text. Also ordinary metadata on the sunken surface. |
| `--c-ink-faint` | `--g2-color-text-faint` | `111 119 123` | Faint text, on the page background only. |

#### Links and selection

| 0.6.0 token | New token | Value | Note |
|---|---|---|---|
| `--c-gov` | `--g2-color-link` | `29 79 191` | Link text. |
| `--c-gov-visited` | `--g2-color-link-visited` | `76 44 146` | Visited link text. |
| `--c-gov-light` | `--g2-color-selected-bg` | `210 226 241` | Background of a selected row. |
| `--c-on-gov` | `--g2-color-on-link` | `255 255 255` | Text or icon on a fill of the link colour. No component reads it. It stays for projects that fill a control with the link colour. |

#### Brand and header

| 0.6.0 token | New token | Value | Note |
|---|---|---|---|
| `--c-brand` | `--g2-color-brand` | `11 61 145` | Header band, footer rule, tile rule. |
| `--c-gov-bar` | `--g2-color-header-bg` | `11 12 12` | Header background; also a dark surface. |
| `--c-on-bar` | `--g2-color-on-header` | `255 255 255` | Text on the header and on dark surfaces. |
| `--c-on-bar-muted` | `--g2-color-on-header-muted` | `204 204 204` | Secondary text on the header (domain suffix). |
| `--c-on-bar-accent` | `--g2-color-header-accent` | `140 198 255` | Mark of the current navigation item. |

#### Actions

| 0.6.0 token | New token | Value | Note |
|---|---|---|---|
| `--c-primary` | `--g2-color-action` | `0 112 60` | Fill of the primary button. |
| `--c-primary-hover` | `--g2-color-action-hover` | `0 90 48` | Primary button on hover. |
| `--c-primary-shadow` | `--g2-color-action-shadow` | `0 45 24` | Lower edge of the primary button. |
| `--c-secondary-shadow` | `--g2-color-action-secondary-shadow` | `146 145 145` | Lower edge of the secondary button. |
| `--c-danger` | `--g2-color-danger-solid` | `212 53 28` | Solid danger colour: destructive button fill, error text and error bar. Keeps the colour of errors and of the destructive button. The status tint, line and ink use `--g2-color-danger-bg`, `-line` and `-ink`. |
| `--c-danger-shadow` | `--g2-color-danger-shadow` | `85 21 11` | Lower edge of the destructive button. |

#### Focus

| 0.6.0 token | New token | Value | Note |
|---|---|---|---|
| `--c-focus` | `--g2-color-focus` | `255 221 0` | Focus background. |
| `--c-focus-ink` | `--g2-color-on-focus` | `11 12 12` | Text and focus bar on the focus background. |

#### Status

| 0.6.0 token | New token | Value | Note |
|---|---|---|---|
| `--c-neutral-bg` | `--g2-color-neutral-bg` | `229 230 231` | Neutral status: tag and panel background. |
| `--c-neutral-line` | `--g2-color-neutral-line` | `80 90 95` | Neutral status: border or rule. |
| `--c-neutral-ink` | `--g2-color-neutral-ink` | `56 63 67` | Neutral status: text on the status background. |
| `--c-info-bg` | `--g2-color-info-bg` | `210 226 241` | Info status: tag and panel background. |
| `--c-info-line` | `--g2-color-info-line` | `29 112 184` | Info status: border or rule. |
| `--c-info-ink` | `--g2-color-info-ink` | `12 45 74` | Info status: text on the status background. |
| `--c-progress-bg` | `--g2-color-progress-bg` | `219 213 233` | Progress status: tag and panel background. |
| `--c-progress-line` | `--g2-color-progress-line` | `76 44 146` | Progress status: border or rule. |
| `--c-progress-ink` | `--g2-color-progress-ink` | `61 35 117` | Progress status: text on the status background. |
| `--c-note-bg` | `--g2-color-warning-bg` | `255 247 191` | Warning status: tag and panel background. |
| `--c-note-line` | `--g2-color-warning-line` | `181 136 0` | Warning status: border or rule. |
| `--c-note-ink` | `--g2-color-warning-ink` | `89 77 0` | Warning status: text on the status background. |
| `--c-ok-bg` | `--g2-color-success-bg` | `204 226 216` | Success status: tag and panel background. |
| `--c-ok-line` | `--g2-color-success-line` | `0 112 60` | Success status: border or rule. |
| `--c-ok-ink` | `--g2-color-success-ink` | `0 90 48` | Success status: text on the status background. |
| `--c-alert-bg` | `--g2-color-danger-bg` | `244 205 198` | Danger status: tag and panel background. |
| `--c-alert-line` | `--g2-color-danger-line` | `212 53 28` | Danger status: border or rule. |
| `--c-alert-ink` | `--g2-color-danger-ink` | `42 11 6` | Danger status: text on the status background. |
| `--c-ok-solid` | `--g2-color-success-solid` | `0 112 60` | Solid success fill, for an indicator that carries white text. No component reads it. It stays as a separate role from the primary action colour; the values are equal. |

#### Tricolour

| 0.6.0 token | New token | Value | Note |
|---|---|---|---|
| `--c-ro-blue` | `--g2-color-ro-blue` | `0 43 127` | Decorative only, never text. |
| `--c-ro-yellow` | `--g2-color-ro-yellow` | `252 209 22` | Decorative only, never text. |
| `--c-ro-red` | `--g2-color-ro-red` | `206 17 38` | Decorative only, never text. |

#### Charts

| 0.6.0 token | New token | Value | Note |
|---|---|---|---|
| `--c-chart-1` | `--g2-color-chart-1` | `29 112 184` | First series. |
| `--c-chart-2` | `--g2-color-chart-2` | `11 61 145` | Second series. |
| `--c-chart-3` | `--g2-color-chart-3` | `80 90 95` | Third series. |
| `--c-chart-4` | `--g2-color-chart-4` | `177 180 182` | Fourth series. |
| `--c-chart-sel` | `--g2-color-chart-selected` | `11 12 12` | The selected mark. |

#### Type

| 0.6.0 token | New token | Value | Note |
|---|---|---|---|
| `--font-display` | none | `"Inter", -apple-system, "Segoe UI", Arial, sans-serif` | **Removed.** Same value as `--g2-font-sans`. No component read it, and no distinct display face is part of the shared design. Use `--g2-font-sans`. |
| `--font-sans` | `--g2-font-sans` | `"Inter", -apple-system, "Segoe UI", Arial, sans-serif` | Text family. |
| `--font-mono` | `--g2-font-mono` | `"Fragment Mono", ui-monospace, SFMono-Regular, monospace` | Family for codes and aligned numbers. |

#### Metrics

| 0.6.0 token | New token | Value | Note |
|---|---|---|---|
| `--radius` | `--g2-radius` | `0` | Corner radius of boxed components. Now read by `.g2-btn`, `.g2-chip`, `.g2-input`, `.g2-tag`, `.g2-tile` and `.g2-notice`; before, only a literal `0` on button and input. |
| `--radius-md` | none | `0` | **Removed.** A scale of equal zeros. The single role `--g2-radius` covers all boxed components. Use `--g2-radius`. |
| `--radius-lg` | none | `0` | **Removed.** Same as `--radius-md`. Use `--g2-radius`. |
| `--radius-pill` | none | `0` | **Removed.** Same as `--radius-md`. Use `--g2-radius`. |
| `--border-ink` | `--g2-border-width-control` | `2px` | Border width of buttons, chips and fields. Renamed to the role it serves. `.g2-btn`, `.g2-chip` and `.g2-input` now read it; before, each used a literal `2px`. |
| `--shadow-lift` | none | `none` | **Removed.** The value was `none` and no component has a lift state. "No decorative shadows" stays a design default (`GUIDELINES.md`). A project that needs a shadow token declares its own. |
| `--shell` | `--g2-container-max` | `80rem` | Maximum page width. The value was `1280px` and is now `80rem`: the same width at a 16px root, and it follows the root text size. `.g2-container` reads it, and so can a project container: `max-width: var(--g2-container-max)`. |

## Classes, attributes and selectors

No `.g2-*` class is renamed or removed.
The class `.g2-btn.g2-warning` keeps its meaning: a red, destructive button. It does not use the `warning` status colours.

| 0.6.0 | Now |
|---|---|
| `<html data-skin="gov2">` | Removed. No replacement. |
| `[data-skin="gov2"]` in project selectors | Remove it. The tokens are on `:root`. |
| `data-tone="warn"` | `data-tone="warning"` |
| `data-tone="ok"` | `data-tone="success"` |
| `data-tone="bad"` | `data-tone="danger"` |
| `aria-current` and `aria-pressed` on `.g2-chip` | The same. `false` and the empty value do not select a chip. |
| `aria-current="page"` on `.g2-nav a` | The same. |

### Behaviour that changed without a rename

- The focus rules were `[data-skin="gov2"] :focus-visible`. They are now `:focus-visible` in `gov2.states`.
  A layer beats specificity, so every component state is checked under the new cascade.
- A keyboard-focused link in `.g2-nav` shows the standard focus bars (yellow above, ink below). Before, the current page link kept its blue inset bar instead.
- Hovering a keyboard-focused link in `.g2-nav` no longer underlines it. Every other link already behaved this way.
- `.g2-input` reads its border colour from `--g2-color-control-border`. `.g2-btn`, `.g2-chip` and `.g2-input` read their border width from `--g2-border-width-control`. The values are equal to before.
- Boxed components read `--g2-radius` (value `0`).
- The font families are the same, Inter and Fragment Mono. `gov2.css` 0.8.0 to 0.9.1 still imports them from Google Fonts. The version after 0.9.1 does not: see *Changes after 0.9.1: fonts*.

## Layers

The public order is:

```css
@layer reset, gov2, utilities, app;
```

Inside `gov2` the order is `tokens`, `base`, `components`, `states`.

| Layer | Contents |
|---|---|
| `reset` | A project or vendor reset. |
| `gov2.tokens` | The custom properties on `:root`. |
| `gov2.base` | `body`, links and the reduced-motion rule. |
| `gov2.components` | The `.g2-*` defaults, with their hover treatment. |
| `gov2.states` | Keyboard focus, the selected chip, the disabled button and the field error. |
| `utilities` | Your utility classes. |
| `app` | Your own styles and variants. |

`gov2.css` declares this order in its first lines, before any rule.

### How the layers decide

- A normal declaration in a later layer wins over an earlier layer, whatever the specificity.
  Inside one layer, specificity and then source order decide.
- A rule outside every layer wins over all layers, `gov2.states` included.
- An `!important` declaration reverses the order of layers. The earlier layer wins.
  A project `!important` still beats a normal gov2 rule. It loses to the `!important` reduced-motion rule of gov2, which is intentional.
- Do not assume that a project class always wins. The result depends on the layer of each rule.

### How to load the stylesheets

**One stylesheet.** Link `gov2.css`. It declares the order itself. See "A standalone page" below.

**A reset and project CSS.** Declare the order first, in an inline `<style>` or on the first line of your first stylesheet.
Then link the reset, `gov2.css` and your CSS, in that order. See "A page with a reset and project CSS" below.

A later `@layer` statement cannot move a layer that earlier CSS already created.
The layer order is the order of first appearance of each name. If your first stylesheet says `@layer utilities;` before the order is declared, then `utilities` sits before `gov2` and loses to it.
A framework that declares its own layer names first (for example `@layer theme, base, components, utilities;`) has the same effect. Declare the gov2 order before the framework statement.

**`@import` into layers.** You can build the same order in one project stylesheet:

<!-- example: import-css -->
```css
@layer reset, gov2, utilities, app;
@import url("vendor-reset.css") layer(reset);
@import url("gov2.css");
@import url("app.css") layer(app);
```

An `@import` rule must come after the `@layer` statement and before other rules.
Import `gov2.css` without `layer()`. The file already names its layers.
Do not write `@import url("gov2.css") layer(gov2)`. That wrapper nests the layers as `gov2.reset`, `gov2.gov2` and so on, and it changes the public layer paths.

**Rules outside a layer.** An unlayered rule outranks every layer. Two cases matter:

- An unlayered reset such as `a { color: inherit; }` overrides the link, button and focus colours of gov2. Put the reset in `reset`.
- An unlayered project rule wins over everything in `gov2`, so it can break a state. Put project rules in `app` or `utilities`.

If your reset or framework cannot be placed in a layer, that is an integration problem in your project.
The DS has no compatibility branch for it.

## Verified examples

The tests extract the code blocks below from this file and run them in Chrome.
When you change a block, the tests run the new text.

### A standalone page

A page needs only the stylesheet link.

<!-- example: standalone-page -->
```html
<!doctype html>
<html lang="ro">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Căutare posturi</title>
  <link rel="stylesheet" href="/assets/gov2.css">
</head>
<body>
  <main>
    <h1>Căutare posturi</h1>
    <p><a href="/despre">Despre proiect</a></p>
    <p><button class="g2-btn" type="button">Caută</button></p>
  </main>
</body>
</html>
```

The tests check these results: no activation attribute; the tokens on `:root`; the page text and background; the link colour and keyboard focus; a button with keyboard focus.

### A page with a reset and project CSS

The page declares the order, then loads a reset, `gov2.css` and the project CSS.

<!-- example: layered-page -->
```html
<!doctype html>
<html lang="ro">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Căutare posturi</title>
  <style>@layer reset, gov2, utilities, app;</style>
  <link rel="stylesheet" href="/assets/reset.css">
  <link rel="stylesheet" href="/assets/gov2.css">
  <link rel="stylesheet" href="/assets/app.css">
</head>
<body>
  <div class="site-container">
    <h1>Căutare posturi</h1>
    <p><a href="/despre">Despre proiect</a></p>
    <p>
      <label for="q">Cuvinte cheie</label>
      <input class="g2-input" id="q" type="search">
    </p>
    <p>
      <button class="g2-btn btn-compact" type="submit">Caută</button>
      <a class="g2-btn btn-compact" href="/export">Exportă</a>
      <button class="g2-btn btn-compact btn-promo" type="button">Promovat</button>
    </p>
  </div>
</body>
</html>
```

The reset puts all of its rules in the `reset` layer. The layer is below `gov2`, so the gov2 defaults win over the reset.

<!-- example: reset-css -->
```css
@layer reset {
  *, ::before, ::after { box-sizing: border-box; }
  body, h1, p { margin: 0; }
  a { color: inherit; text-decoration: inherit; }
  button, input { font: inherit; }
}
```

The project CSS keeps the distributed file unchanged. It has three parts: a page-width token override, a compact component variant and a recoloured variant.

<!-- example: app-css -->
```css
@layer app {
  /* Page width: override the shared token, then read it in the project container. */
  :root { --g2-container-max: 60rem; }
  .site-container { max-width: var(--g2-container-max); margin-inline: auto; padding-inline: 1rem; }

  /* Compact density: put the project class next to the component class. */
  .btn-compact { min-height: 36px; padding: 4px 12px; font-size: 15px; }

  /* Recolour: change colours only while the control has no keyboard focus,
     so the gov2 focus treatment still applies. */
  .btn-promo:not(:focus-visible) { background: rgb(122 31 92); color: #fff; box-shadow: 0 2px rgb(60 14 46); }
  .btn-promo:not(:focus-visible):hover { background: rgb(96 24 72); }
}
```

The tests check these results:

- The reset layer applies (the paragraph margin is 0) and loses to the gov2 link colour.
- A project rule in `app` beats the gov2 component defaults: the compact buttons are 36px high, for the button and for the button-styled anchor.
- The token override in `app` beats the `gov2.tokens` value: the container is 60rem wide.
- With keyboard focus, each button is yellow with ink text and at least 4.5:1 contrast. This holds with and without hover.
- The recoloured button keeps at least 4.5:1 contrast at rest and on hover.

### What the layers do not protect

These results are also checked, so that the limits are known and not assumed.

- A project rule in `app` that sets `background` or `color` on a focusable control overrides the gov2 focus colours.
  For example, `.btn-promo { background: rgb(122 31 92); }` leaves the button without the yellow focus background.
  Keep the focus treatment with `:not(:focus-visible)`, as in the example above, or write a `:focus-visible` rule in the same layer.
- A utility class in `utilities` that sets a colour on a focusable element has the same effect.
- An unlayered rule beats every gov2 layer.
- A layer that a stylesheet created before the order declaration keeps its position.

## Customize and keep accessible behaviour

Keep the distributed file unchanged. Put project CSS in your own stylesheet.
Layout, spacing, density and useful variants are normal customization. They do not need a DS proposal.
Open a `ds-proposal` issue when a variation recurs in several projects.

**Requirements.** After customizing, check these points on the real page:

1. Keyboard focus is visible on every control, including the focus of a recoloured control.
2. Focus is still visible when the pointer hovers the same control.
3. Selected, disabled and error states still communicate their meaning, not by colour alone.
4. Text has at least 4.5:1 contrast on its actual background. Large text and essential graphics need 3:1.
5. Controls keep their accessible names, their native semantics and their keyboard behaviour.
6. The page reflows at narrow widths and with enlarged text.

**Guidance.** These points help consistency. They are not accessibility requirements:

- Prefer a shared token when its role fits. Name the departure when it does not.
- Document a significant variation next to the code that implements it.
- Keep a local class prefix for project components.

Project rules can still break accessibility. The DS cannot guarantee a result under arbitrary overrides.

## Changes after 0.8.0

These changes need no migration step. They are in the unreleased version after 0.8.0. A project that uses 0.8.0 reads this section when it updates.

- `--g2-container-max` is `80rem`, not `1280px`. The width is the same at a 16px root. A project that sets the root font size above 16px gets a wider maximum.
- New tokens, with no old name: `--g2-font-size-heading-page`, `--g2-font-size-heading-section`, `--g2-font-size-heading-item`, `--g2-font-size-body`, `--g2-font-size-meta`, `--g2-font-size-label`,
  `--g2-line-height-heading`, `--g2-line-height-body`, `--g2-gutter` and `--g2-space-1` to `--g2-space-7`. `COMPONENTS.md` documents each one.
- New classes: `.g2-container`, `.g2-heading-page`, `.g2-heading-section`, `.g2-heading-item`, `.g2-text-meta`, `.g2-field`, `.g2-label`, `.g2-hint` and `.g2-footer-in`.
  A project class with the same name in your own CSS now meets the gov2 rule: rename it or move it to the `app` layer.
- Text of `body`, `.g2-btn`, `.g2-input`, `.g2-link-title`, `.g2-nav a`, `.g2-chip`, `.g2-chip-count`, `.g2-tag` and `.g2-notice-bar` is in rem. At a 16px root the computed sizes are the same as before.
  A project that raises the browser's default font size now sees these components grow. Before, they stayed fixed.
- `.g2-header-in` wraps and has 4px padding above and below. `.g2-nav` is a wrapping flex row, and each link is at least 44px high (it was about 23px). The current-page bar is at the bottom of that taller link.
  A project that already arranged these classes with its own flex or padding rules in the `app` layer keeps winning, but check the header height.
- A disabled `.g2-input` now shows the sunken surface and muted text. Before, it looked the same as an enabled input.
- With forced colours, the current navigation link and the selected chip use the system selection colours. Before, both looked the same as the other links and chips.

Width and density customization works as before: override the tokens, or add a rule in the `app` layer. The tests run this example on the directory page:

<!-- example: foundation-css -->
```css
@layer app {
  /* Page width and side padding: .g2-container reads both tokens. */
  :root { --g2-container-max: 60rem; --g2-gutter: 1rem; }

  /* Roomier fields: more space between label, hint and control, and a taller control. */
  .g2-field { gap: var(--g2-space-2); }
  .g2-field > .g2-input { min-height: 48px; }
}
```

## Changes after 0.9.1: fonts

This change is **breaking**. `gov2.css` no longer starts with `@import url('https://fonts.googleapis.com/…')`. It makes no font request, so the DS needs no third-party service (ADR 0005).
Version 0.9.1 and earlier made that request on every page.

**What you see.** A page that loads only `gov2.css` still names Inter and Fragment Mono in `--g2-font-sans` and `--g2-font-mono`, but nothing downloads them.
The browser uses an installed Inter if the machine has one, and otherwise `-apple-system`, `Segoe UI`, Arial or the generic sans-serif font. Monospace text uses `ui-monospace`, `SFMono-Regular` or the generic monospace font.
Text widths and line breaks differ from Inter, so a layout can change.

**The fix, in one line.** Copy `fonts.css` and the `fonts/` folder from the same tag as `gov2.css`, and link `fonts.css`. This is now part of the standard installation:

```html
<link rel="stylesheet" href="/assets/gov2/gov2.css">
<link rel="stylesheet" href="/assets/gov2/fonts.css">
```

The README has the exact command for a tag, under *Install from an exact tag*. Rules for the new files:

- Keep `fonts/` next to `fonts.css`. The font URLs are relative to `fonts.css`, so the files work from the site root and from a subpath.
- The order of the two links does not matter. `fonts.css` declares `@font-face` rules only, outside every layer.
- Copy the whole `fonts/` folder. It holds the OFL licence notices that must stay with the font files, and `fonts/README.md` with the sources, versions, sizes and checksums.
- If your server sets a Content-Security-Policy, allow `style-src 'self'` and `font-src 'self'`.
- Do not edit the copies. A project that wants other families sets `--g2-font-sans` and `--g2-font-mono` in its `app` layer and supplies its own `@font-face` rules.

**Exceptions.** A quick one-off project can skip `fonts.css` and accept the system fonts. A project that already serves Inter and Fragment Mono itself does not link `fonts.css`.
If a project links both its own `@font-face` rules and `fonts.css` for the same family, the rule that is declared last wins for the characters in both `unicode-range` values. Use one source.

**Clean-up.** A build step that removes the `@import` line from a copy of `gov2.css` has no line to remove. Delete the step and use the unedited file. Remove an allowance for `fonts.googleapis.com` and `fonts.gstatic.com` from the Content-Security-Policy.

**Check.**

1. Open the browser network panel and reload. No request goes to `fonts.googleapis.com` or `fonts.gstatic.com`.
2. The font requests go only to the files in your `fonts/` folder and return 200. A page without Romanian letters needs the two *latin* files. A page with ă, ș or ț also needs the Inter *latin-ext* file.
3. In the browser developer tools, check the rendered font of a heading and of Romanian text such as "Ăă Ââ Îî Șș Țț". It is Inter, and a web font.
4. Block the font requests and reload. The text stays readable, with the system fonts, and nothing overflows horizontally.

## Checklist

1. `grep -rn 'data-skin' <project>` finds nothing outside archived files.
2. `grep -rnE -- '--(c|font|radius|border-ink|shadow-lift|shell)([^a-z0-9]|$)' <project>` finds no old token. Review each match: your own tokens may use the same prefix.
3. No `data-tone` value is `warn`, `ok` or `bad`.
4. The reset is in the `reset` layer. Project CSS is in `app` or `utilities`.
5. The layer order is declared before every other stylesheet that creates layers.
6. Tab through each page. Check focus, hover plus focus, selected chips, disabled buttons and field errors.
7. A version after 0.9.1: `fonts.css` and `fonts/` are installed and linked, or you decided to skip them. The page makes no Google Fonts request.
