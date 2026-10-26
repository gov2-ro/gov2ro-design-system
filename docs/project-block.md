# Project block

Add this block to `AGENTS.md` and `CLAUDE.md` in each project that uses the DS. Replace the values in `<…>`. Keep the rest as it is, so that the rules are the same in each project.

When this block changes, the DS maintainer tells the projects.

---

```markdown
## Design system (gov2 DS)

This project uses the gov2 design system (DS), version <X.Y.Z>.
DS repo: gov2-ro/gov2ro-design-system (local copy: ~/devbox/gov2/gov2ro-design-system).

- Read `COMPONENTS.md` in the DS before you build UI. Use a DS component when one fits.
- Do not edit the copy of the DS in this project: `<path to gov2.css>`.
- To update the DS, copy `gov2.css` from a DS tag. Then set the version above.
- Before you update, read `CHANGELOG.md` in the DS back to the version above. The DS is 0.x, so a minor version can break. Look for **Breaking**.
- Put the project styles in `<path>`, with the class prefix `<prefix>-`. Use the DS tokens. Keep consumer adapters here, not in the DS. Prefer DS defaults; document useful local variations and preserve accessible behaviour.
- When the project needs a component, a variant or a token that other projects can use, open an issue in the DS:
  `gh issue create -R gov2-ro/gov2ro-design-system --label ds-proposal --title "[proposal] …" --body-file <file>`.
  Use the sections of `.github/ISSUE_TEMPLATE/ds-proposal.md`.
- Open an issue for a DS defect too, with the type "fix".
- Do not wait for the DS. Build a local version with the project prefix, and put the issue URL in a comment next to it.
- When the DS has the component, replace the local version.
```
