# Backlog

Statuses: `[ ]` open, `[~]` in progress, `[x]` done, `[-]` dropped.

## Governance

- [ ] Create the label `ds-proposal` on GitHub, and an issue template in `.github/ISSUE_TEMPLATE/ds-proposal.md`.
- [ ] Write `COMPONENTS.md`: each `.g2-` class, its markup, when to use it, and its states. Agents cannot read the bundle in `docs/index.html`, so they need this reference.
- [ ] Write the DS block for the project repos (`AGENTS.md`, imported into `CLAUDE.md` with `@AGENTS.md`). Start with posturi.gov.ro.
- [ ] Decide if the shared agent rules move from `CLAUDE.md` to `AGENTS.md`, so that agents from other providers read them.

## Checklist for 1.0.0

The owner decides on 1.0.0 when all items are done.

- [ ] At least two live projects use the DS, with no overrides of `.g2-` classes.
- [ ] `COMPONENTS.md` exists and agrees with `gov2.css`.
- [ ] The style guide is regenerated from the current `gov2.css`.
- [ ] The contrast of each text and background pair is measured. The ratios in the `gov2.css` comments (19:1, 7:1, 4.6:1) are not measured yet.
- [ ] Keyboard focus is checked on each component.
- [ ] No open `ds-proposal` issue is a breaking change.

## Delivery

- [ ] Set up file delivery from gov2.ro or ui.gov2.ro for quick projects.
- [ ] Update the copy in posturi.gov.ro (`webapp-php/static/skins/gov2.css`). Only the header comment is different now.

## Style guide

- [ ] Find out which tool generates `docs/index.html`, and document how to regenerate it. The guide does not load `gov2.css`, so it can show old styles.
- [ ] Update the usage section of the guide when delivery is decided. It still shows the CDN and says that `@1` gets the fixes automatically.

## Verified limits

(none yet)
