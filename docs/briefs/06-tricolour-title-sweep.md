# Brief 06: Tricolour title sweep

Status: Ready for implementation after brief 05 lands. ADR 0010 records the decision and its two deliberate WCAG deviations. Issue #2.
The sweep reads the text colour of its surface, which brief 05 makes scheme-dependent. Start from the commit that releases brief 05.

## Problem and outcome

org.gov2.ro and civtech.gov2.ro animate a tricolour band across their site title.
Provide one shared, opt-in class, `.g2-ro-sweep`, with the mitigations that ADR 0010 requires.

## Scope

Change:

- `gov2.css`: `.g2-ro-sweep` and its keyframes in `gov2.components`; its focus rule in `gov2.states`.
- `COMPONENTS.md`, `GUIDELINES.md` (the tricolour rule and the review checklist), `CLAUDE.md` and `AGENTS.md` (the "never text" line only).
- `docs/index.html`: a demonstration in the header section, with the deviations stated in Romanian.
- `tests/contract.html` and the suite.
- `docs/testing.md`, `CHANGELOG.md` (`## Unreleased`), `docs/BACKLOG.md` and `docs/ACTIVITY.md`.

Do not edit `docs/decisions/`, `docs/briefs/`, consumer repositories or the archive snapshot.

## Decided API

```html
<a class="g2-wordmark" href="/"><span class="g2-ro-sweep">Instituții publice</span></a>
```

- Class name `.g2-ro-sweep`. Keyframes name `g2-ro-sweep`. No new token.
- The element contains only text. The documented hosts are `.g2-wordmark` and a title heading inside `.g2-header`.
- The rest colour is `currentColor` of the host, so it follows the header and, after brief 05, the scheme.
- The band uses `--g2-color-ro-blue`, `--g2-color-ro-yellow` and `--g2-color-ro-red`.

## Implementation defaults

- Technique: a gradient background clipped to the text (`background-clip: text` with the `-webkit-` form), with `-webkit-text-fill-color: transparent` only inside `@supports`.
- The gradient is the rest colour, then a narrow tricolour band, then the rest colour again. Animate `background-position`.
- The band crosses the title in at most 3 s. The full cycle is at least 9 s. The rest of the cycle shows plain text.
- The non-animated frame (animation removed) shows the band outside the glyphs, so the text is plain.
- Forced colours: no background, `-webkit-text-fill-color` restored, system text colour.
- Print: plain text.
- Focus: when the host link has `:focus-visible`, the text fill follows the standard focus text colour. Test that every glyph is visible.

## Acceptance checks

1. At rest and with the animation removed, every glyph has the normal text colour and contrast of its surface.
2. Under `prefers-reduced-motion: reduce`, no band appears at any time.
3. The measured band crossing time is 3 s or less; the measured cycle is 9 s or more.
4. Keyboard focus on the host link shows the standard focus treatment with readable text (4.5:1).
5. Forced-colours emulation and print emulation show plain text.
6. Without `background-clip: text` support (simulate by removing the `@supports` block), the text is plain.
7. The accessible name of the host link is unchanged, and the text can be selected.
8. Hover, focus and hover plus focus of `.g2-wordmark` keep their current behaviour, apart from the sweep.
9. The documentation states both deviations (WCAG 2.2.2 and 1.4.3), the scope of the exception and the accessibility statement note. "Never text" changes to "never text, except `.g2-ro-sweep` (ADR 0010)" everywhere it appears.
10. The new class appears in `COMPONENTS.md`, the guide and the fixture in the same change. The existing suite stays green; the archive bytes stay unchanged.

## Handoff prompt

Implement this brief after brief 05 has landed. Read ADRs 0001–0010 first, especially ADR 0010.
Use the decided names. Measure contrast at rest, during the band and on focus, in both schemes.
Report each acceptance check, the measured timings and ratios, commands, browser version and screenshots.
Stop and ask if a step needs a name, a token or a file that this brief does not list.
Do not commit, tag, publish or edit consumers.
