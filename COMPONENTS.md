# Components

This is the reference for `gov2.css`, for people and for agents. It lists each `.g2-` class, its markup and when to use it. When `gov2.css` changes, change this file in the same commit.

This file is the current API specification. The live guide (`docs/index.html`) loads the shipped stylesheet and demonstrates every core class.
A project that uses 0.6.0 or 0.7.0 reads `docs/migration-from-0.6.0.md`.

## Before you start

- Load `gov2.css` with a `<link>`. Write `<html lang="ro">`. The page needs no activation attribute and no wrapper element.
- Loading the file applies the base styles to the whole page and publishes the tokens on `:root`.
- The `.g2-` classes are opt-in. A component appears only where the markup has its class.
- `gov2.css` declares four layers, in this order: `reset`, `gov2`, `utilities`, `app`. See *Layers and project CSS*.
- `gov2.css` loads Inter and Fragment Mono from Google Fonts with `@import`. Optional local fonts are approved (ADR 0005) but not implemented yet.
- The DS has no container class. The project sets the page width and the side padding. The token `--g2-container-max` (1280px) gives the maximum width.

## Layers and project CSS

The public layer order is declared in the first lines of `gov2.css`:

```css
@layer reset, gov2, utilities, app;
```

Inside `gov2`, the sublayers are `tokens`, `base`, `components` and `states`.

| Layer | Contents |
|---|---|
| `reset` | A reset from the project or from a vendor. Put it here. |
| `gov2.tokens` | The custom properties on `:root`. |
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

Colour tokens are RGB channels. Use them as `rgb(var(--g2-color-text))` or `rgb(var(--g2-color-text) / .5)`. The values are in `gov2.css`.
Override a token in your own `app` layer. Check contrast and focus after each change.

| Group | Tokens | Use |
|---|---|---|
| Surfaces | `--g2-color-page`, `--g2-color-surface`, `--g2-color-surface-sunken`, `--g2-color-line`, `--g2-color-control-border` | Backgrounds and rules. `--g2-color-page` is the page background and `--g2-color-surface` is a raised surface such as a card. `--g2-color-surface-sunken` is for panels, footer, toolbars, the notice bar and tags. `--g2-color-control-border` is the border of form controls. |
| Text | `--g2-color-text`, `--g2-color-text-muted`, `--g2-color-text-faint` | `--g2-color-text-faint` for text on the page background only (about 4.57:1); it fails ordinary-text contrast on `--g2-color-surface-sunken`. |
| Links and selection | `--g2-color-link`, `--g2-color-link-visited`, `--g2-color-selected-bg`, `--g2-color-on-link` | `--g2-color-selected-bg` for selected rows. `--g2-color-on-link` is the text colour on a fill of the link colour. No component reads it. |
| Brand and header | `--g2-color-brand`, `--g2-color-header-bg`, `--g2-color-on-header`, `--g2-color-on-header-muted`, `--g2-color-header-accent` | Header, header band, footer rule, tile rule, and other dark surfaces. `--g2-color-header-accent` marks the current navigation item. |
| Actions | `--g2-color-action`, `--g2-color-action-hover`, `--g2-color-action-shadow`, `--g2-color-action-secondary-shadow`, `--g2-color-danger-solid`, `--g2-color-danger-shadow` | Buttons. `--g2-color-danger-solid` is also the colour of error text and the error bar. |
| Focus | `--g2-color-focus`, `--g2-color-on-focus` | Focus state only. |
| Status | `--g2-color-success-solid` and the 18 tone tokens in the table under *Tags* | Tags and status panels. `--g2-color-success-solid` is a solid success fill; no component reads it. |
| Tricolour | `--g2-color-ro-blue`, `--g2-color-ro-yellow`, `--g2-color-ro-red` | Decorative marks only. Never use them for text. |
| Charts | `--g2-color-chart-1`, `--g2-color-chart-2`, `--g2-color-chart-3`, `--g2-color-chart-4`, `--g2-color-chart-selected` | Blue series, then greys. `--g2-color-chart-selected` marks the selection. |
| Type | `--g2-font-sans`, `--g2-font-mono` | Text family. Family for codes and aligned numbers. |
| Metrics | `--g2-radius` (0), `--g2-border-width-control` (2px), `--g2-container-max` (1280px) | `--g2-radius` is read by buttons, chips, fields, tags, tiles and notices. `--g2-border-width-control` is the border width of buttons, chips and fields. `--g2-container-max` is for the project container. |

## Base styles

On every page that loads the stylesheet, these styles apply without a class. They are in the `gov2.base` layer, except focus, which is in `gov2.states`:

- `body`: 17px/1.55 Inter, text colour on page background.
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
| `.g2-link-title` | Item title, to a detail page | Blue, bold, 19px, underlined, visited colour. |
| `.g2-link-quiet` | Secondary link in metadata | Ink, underlined, no visited colour. |
| `.g2-link-inverse` | Link on the dark bar | White, underlined, no visited colour. For the header navigation, use `.g2-nav`. |

On hover, the underline of each link is 3px. On focus, each link is yellow with ink text.

## Chips

A chip is a shortcut link or a toggle button. Use an anchor for navigation and a button for an action. A tag displays a state.

```html
<a class="g2-chip" href="/?ocupatie=medic-specialist">Medic specialist <span class="g2-chip-count">76</span></a>
<a class="g2-chip" href="/?stare=active" aria-current="true">Active</a>
```

- `.g2-chip`: grey background, ink text, no underline, at least 36px high. On hover, the background is darker.
- `.g2-chip-count`: the count, in muted mono.
- `aria-current="false"`, an empty `aria-current`, and `aria-pressed="false"` do not select a chip.
- Mark the selected chip with `aria-current="true"` (a link) or `aria-pressed="true"` (a button). It gets a 2px ink border. The rule is in `gov2.states`.
- On keyboard focus, a chip is yellow with ink text, also when hovered and also when selected. The selected border stays.

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

- `.g2-header-in`: a flex row, at least 52px high, with a 24px gap. It has no width or padding; put it in the project container.
- `.g2-wordmark`: the project name, white, 19px bold. Put the domain part in `<em>` to show it muted. On keyboard focus, both parts use ink on yellow.
- `.g2-logo`: an SVG from `logo/`, 28px high. It is decorative: use `alt=""`.
- `.g2-nav a`: white, 15px semibold. Set `aria-current="page"` on the current link: it gets a blue bar below. `.g2-nav` itself has no layout.
  A navigation link with keyboard focus shows the standard focus bars (yellow above, ink below) instead of that blue bar, and it is not underlined while hovered.

### Tricolour marks

Use one mark for each page. All marks are decorative: add `aria-hidden="true"`.

| Class | Where | Notes |
|---|---|---|
| `.g2-ro-corner` | First child of `.g2-header` | **Default.** A 54×6px stripe at the top right. The header keeps its brand band. |
| `.g2-ro-bar` | Before the notice bar and the header | A 6px stripe across the page. Add `.g2-tricolor` to the header to remove its brand band. |
| `.g2-ro-dots` | Next to the wordmark | Three 7px dots. Markup: `<span class="g2-ro-dots" aria-hidden="true"><i></i></span>`. |

## Notice bar

A grey bar above the header for a short message. The user can close it.

```html
<div class="g2-notice-bar" role="region" aria-label="Anunț">
  <p>Site în test. Datele pot fi incomplete.</p>
  <button type="button" aria-label="Închide anunțul">×</button>
</div>
```

- `.g2-notice-bar`: a flex row on the sunken surface, with 15px text and a 1px rule below. A direct `<button>` child is the close control, 44×36px.
- The project stores the choice to close it, for example in `localStorage`.

## Footer

```html
<footer class="g2-footer">…</footer>
```

A grey footer with a 10px brand rule on top. Links in the footer are ink, not blue. The footer has no padding and no layout; the project adds them.

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
<button class="g2-btn g2-warning" type="button">Șterge contul</button>
```

| Class | Use |
|---|---|
| `.g2-btn` | The primary action. Use one for each page or form. Green. |
| `.g2-btn.g2-secondary` | Other actions. Grey. |
| `.g2-btn.g2-warning` | A destructive action. Red. |

- The button is at least 44px high and has a 2px shadow below it. Buttons, chips and inputs set `box-sizing:border-box` without requiring a project reset.
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

The class `.g2-btn.g2-warning` is not a status. It is the red destructive button and uses `--g2-color-danger-solid`.

## Fields

```html
<div class="g2-field-error">
  <label for="email">Adresa de e-mail</label>
  <p class="g2-error-msg" id="email-err">Scrieți o adresă de e-mail validă.</p>
  <input class="g2-input" id="email" type="email" aria-describedby="email-err" aria-invalid="true">
</div>
```

- `.g2-input`: at least 40px high, 2px border (`--g2-color-control-border`), 17px text. The focus style is in `gov2.states`.
- `.g2-field-error`: wraps a field that has an error. It adds a red bar on the left and makes the input border red. The input keeps the red border on hover and on focus.
- `.g2-error-msg`: the error text, red and bold. Put it before the input, and connect it with `aria-describedby`.

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

A boxed message with a blue title band. The panel must have exactly two children: the first child is the title, the last child is the body.

### Tile

```html
<div class="g2-tile">
  <h3>1.204</h3>
  <p>posturi active</p>
</div>
```

`.g2-tile`: a box with a 1px border and a 5px brand rule on top. Use it for a figure, a link group or a summary.

## Codes and numbers

`.g2-mono` sets Fragment Mono with tabular figures. Use it for codes (CAEN, CUI, IDs) and for numbers in columns.

## Not in the DS yet

These parts are missing. Build a local version with the project prefix, and open a `ds-proposal` issue when another project needs it too.

- Page container and grid (`--g2-container-max` exists, no class uses it).
- Layout for `.g2-nav` and `.g2-footer`.
- Classes for `textarea`, `select`, checkboxes and radios.
- Tables, pagination, breadcrumbs, tabs and summary lists.
- A hover state for `.g2-btn.g2-warning`.
- Dark mode.
