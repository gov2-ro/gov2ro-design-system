# Project block

Add this block to `AGENTS.md` and `CLAUDE.md` in each project that uses the DS. Replace the values in `<…>`. Keep the rest as it is, so that the rules are the same in each project.

When this block changes, the DS maintainer tells the projects.

---

```markdown
## Design system (gov2 DS)

This project uses the gov2 design system (DS), version <X.Y.Z>.
DS repo: gov2-ro/gov2ro-design-system (local copy: ~/devbox/gov2/gov2ro-design-system).

- Read `COMPONENTS.md` in the DS before you build UI. Use a DS component when one fits.
- Do not edit the copy of the DS in this project: `<path to gov2.css>`, `fonts.css` and `fonts/`.
- Install and update the DS from one exact tag. Copy `gov2.css`, `fonts.css` and the whole `fonts/` folder together (`README.md` in the DS, *Install from an exact tag*). Link `fonts.css` next to `gov2.css`. Then set the version above.
- In development only, you can link `gov2.css` and `fonts.css` from jsDelivr with an exact tag (`README.md` in the DS, *Dev mode*). For production, copy the files.
- The fonts are local files. Do not link a remote font service. Skip `fonts.css` only for a quick one-off project that accepts system fonts, or when the project already serves Inter and Fragment Mono.
- Before you update, read `CHANGELOG.md` in the DS back to the version above. The DS is 0.x, so a minor version can break. Look for **Breaking**.
- Put the project styles in `<path>`, with the class prefix `<prefix>-`. Use the DS tokens (`--g2-*`). Keep consumer adapters here, not in the DS. Prefer DS defaults; document useful local variations and preserve accessible behaviour.
- Declare `@layer reset, gov2, utilities, app;` before every other stylesheet that creates layers. Put the reset in `reset`, utility classes in `utilities` and the project styles in `app`. A rule outside a layer outranks the DS. Do not add an activation attribute. See `docs/migration-from-0.6.0.md` in the DS.
- The page is light by default. To opt in to the dark scheme, set `data-g2-scheme="auto"` on `<html>`. Do not write dark values for `--g2-color-*`. Check the project's own colours on a dark page first (`COMPONENTS.md`, *Colour scheme*).
- When the project needs a component, a variant or a token that other projects can use, open an issue in the DS:
  `gh issue create -R gov2-ro/gov2ro-design-system --label ds-proposal --title "[proposal] …" --body-file <file>`.
  Use the sections of `.github/ISSUE_TEMPLATE/ds-proposal.md`.
- Open an issue for a DS defect too, with the type "fix".
- Do not wait for the DS. Build a local version with the project prefix, and put the issue URL in a comment next to it.
- When the DS has the component, replace the local version.
```
