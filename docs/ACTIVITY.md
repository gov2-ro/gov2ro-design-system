# Activity

## 2026-10-26 — Agent guidance and DS governance

**Done**
- Added `CLAUDE.md` with the structure of `gov2.css`, the governance rules, the version rules and the process notes.
- Changed the repo URLs from `gov2-ro/design-system` to `gov2-ro/gov2ro-design-system` in `README.md`, `gov2.css` and `docs/index.html`.
- Set the version to 0.2.0 in the header comment of `gov2.css`, in `CHANGELOG.md` and in the commented CDN URLs of `README.md`. Tagged `v0.2.0`.
- Created `docs/BACKLOG.md` and this file.

**Hard**
- `docs/index.html` is a generated bundle. The URL change is a plain text replacement: 5 URLs in the template. Before the change, a check showed that the template has no integrity hash. Assumed, not verified: the bundle source also has the old URLs, so a regeneration can bring them back.

- Wrong turn: first, the header of `gov2.css` changed from v0.2 to v1.0.0, to match `CHANGELOG.md`. The 1.0.0 entry in `CHANGELOG.md` was boilerplate. The style guide also shows v0.2.

**Decided**
- **The version is 0.2.0, not 1.0.0.** The DS is a proposal: only one project has a copy, the contrast ratios are not measured, and the style guide does not load `gov2.css`. A 1.0.0 promises stable names, and nothing supports that promise yet. Cost of the alternative: a 2.0.0 after the first rename, and projects that trust names that are not stable. The owner decides on 1.0.0 with the checklist in `docs/BACKLOG.md`.
- **Proposals are GitHub issues with the label `ds-proposal`.** Agents from all providers can use `gh`, and the owner sees all proposals in one place. Cost of the alternative (a `proposals/` folder): many agents write to the same repo, and the maintainer must look for new files.
- **Only the latest version is maintained.** Bigger projects include a copy and update when they choose. Cost of the alternative: backports to each maintained version.
- **The maintainer releases small fixes without approval.** The owner approves new components, variants, tokens and breaking changes. Cost of the alternative: each typo fix waits for the owner.
- **CDN delivery is deferred.** Quick projects will load the files from gov2.ro or ui.gov2.ro.
- **Remote-control messages are notifications only.** GitHub issues and git are the record, because agents from other providers do not get the messages, and a message is lost when a session closes.
