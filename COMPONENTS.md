# Components

This is the reference for `gov2.css`, for people and for agents. It lists each `.g2-` class, its markup and when to use it. When `gov2.css` changes, change this file in the same commit.

The style guide (`docs/index.html`) shows the components. This file is the specification.

## Before you start

- Set `<html lang="ro" data-skin="gov2">`. The tokens exist only under `[data-skin="gov2"]`.
- The `.g2-` classes are not scoped, but they use the tokens. Outside `[data-skin="gov2"]`, a `.g2-` class has no colours.
- `gov2.css` loads Inter and Fragment Mono from Google Fonts with `@import`.
- The DS has no container class. The project sets the page width and the side padding. The token `--shell` (1280px) gives the maximum width.

## Tokens

Colour tokens are RGB channels. Use them as `rgb(var(--c-ink))` or `rgb(var(--c-ink) / .5)`. The values are in `gov2.css`.

| Group | Tokens | Use |
|---|---|---|
| Surfaces | `--c-page`, `--c-sunken`, `--c-surface`, `--c-line`, `--c-line-strong` | Backgrounds and rules. `--c-sunken` for panels, footer, toolbars and tags. `--c-line-strong` for form controls. |
| Text | `--c-ink`, `--c-ink-muted`, `--c-ink-faint` | `--c-ink-faint` for metadata only. |
| Links | `--c-gov`, `--c-gov-visited`, `--c-gov-light` | `--c-gov-light` for selected rows. |
| Brand | `--c-brand`, `--c-gov-bar`, `--c-on-bar`, `--c-on-bar-muted`, `--c-on-bar-accent` | Header, header band, footer rule, tile rule. |
| Action | `--c-primary` (+ `-hover`, `-shadow`), `--c-secondary-shadow`, `--c-danger` (+ `-shadow`) | Buttons, errors. |
| Focus | `--c-focus`, `--c-focus-ink` | Focus state only. |
| Status | `--c-{neutral,info,progress,note,ok,alert}-{bg,line,ink}`, `--c-ok-solid` | Tags and status panels. `note` is "warn" and `alert` is "bad". |
| Tricolour | `--c-ro-blue`, `--c-ro-yellow`, `--c-ro-red` | Decorative marks only. Never use them for text. |
| Charts | `--c-chart-1` … `--c-chart-4`, `--c-chart-sel` | Blue series, then greys. `--c-chart-sel` marks the selection. |
| Type | `--font-sans`, `--font-display`, `--font-mono` | |
| Metrics | `--radius*` (all 0), `--border-ink` (2px), `--shadow-lift` (none), `--shell` (1280px) | |

## Base styles

Under `[data-skin="gov2"]`, these styles apply without a class:

- `body`: 17px/1.55 Inter, ink on page.
- Links: underlined, `--c-gov`; visited `--c-gov-visited`; on hover the underline is 3px.
- `:focus-visible`: yellow background, ink text, black bar below.
- `input`, `textarea`, `select` on focus: yellow 3px outline and a 2px ink inset.
- With `prefers-reduced-motion: reduce`, transitions and animations stop.

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
- `.g2-wordmark`: the project name, white, 19px bold. Put the domain part in `<em>` to show it muted.
- `.g2-logo`: an SVG from `logo/`, 28px high. It is decorative: use `alt=""`.
- `.g2-nav a`: white, 15px semibold. Set `aria-current="page"` on the current link: it gets a blue bar below. `.g2-nav` itself has no layout.

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

The project stores the choice to close it, for example in `localStorage`.

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

- The button is at least 44px high and has a 2px shadow below it.
- On focus, the button is yellow with ink text.
- `:disabled` shows the button at 50% opacity. On a link, `:disabled` does not apply.

## Tags

A square label for a state. The text must name the state: do not use the colour alone.

```html
<strong class="g2-tag" data-tone="ok">Activ</strong>
```

| `data-tone` | Tokens | Use |
|---|---|---|
| (none) | `neutral` | No state, or a category. |
| `info` | `info` | Information. |
| `progress` | `progress` | In progress. |
| `warn` | `note` | Needs attention. |
| `ok` | `ok` | Done, valid, active. |
| `bad` | `alert` | Error, closed, rejected. |

## Fields

```html
<div class="g2-field-error">
  <label for="email">Adresa de e-mail</label>
  <p class="g2-error-msg" id="email-err">Scrieți o adresă de e-mail validă.</p>
  <input class="g2-input" id="email" type="email" aria-describedby="email-err" aria-invalid="true">
</div>
```

- `.g2-input`: at least 40px high, 2px ink border, 17px text. The focus style comes from the base styles.
- `.g2-field-error`: wraps a field that has an error. It adds a red bar on the left and makes the input border red.
- `.g2-error-msg`: the error text, red and bold. Put it before the input, and connect it with `aria-describedby`.

## Panels

### Inset

```html
<div class="g2-inset"><p>Termenul se calculează în zile lucrătoare.</p></div>
```

Text set apart with a grey 5px bar on the left. Use it for a note that adds to the text around it.

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

A box with a 1px border and a 5px brand rule on top. Use it for a figure, a link group or a summary.

## Codes and numbers

`.g2-mono` sets Fragment Mono with tabular figures. Use it for codes (CAEN, CUI, IDs) and for numbers in columns.

## Not in the DS yet

These parts are missing. Build a local version with the project prefix, and open a `ds-proposal` issue when another project needs it too.

- Page container and grid (`--shell` exists, no class uses it).
- Layout for `.g2-nav` and `.g2-footer`.
- Classes for `textarea`, `select`, checkboxes and radios.
- Tables, pagination, breadcrumbs, tabs and summary lists.
- A hover state for `.g2-btn.g2-warning`.
- Dark mode.
