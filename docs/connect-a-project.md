# Connect a project to the DS

This page gives the prompts that connect an agent session in a project to the gov2 design system (DS). Paste a prompt into the project session, and replace the values in `<…>`.

## Shared system boundary

Consumers adapt to the DS. Their skin checkers, token lists and frameworks do not define the shared CSS contract.
Keep compatibility adapters in the consumer repository. Report generic defects and reusable needs to the DS.
See `decisions/0001-shared-system-boundary.md`. `COMPONENTS.md` is the shared API. `migration-from-0.6.0.md` covers the move from 0.6.0 and 0.7.0.

The prompts below describe the existing workflow. Do not interpret their compatibility analysis as a requirement to preserve a consumer skin API.

## How sessions find each other

- **The DS repo:** `~/devbox/gov2/gov2ro-design-system`, on GitHub `gov2-ro/gov2ro-design-system` (private).
- **The DS session:** a Claude session that works in the DS repo. Its name starts with `gov2ro-design-system`, for example `gov2ro-design-system-73`. The suffix changes for each session. A Claude session finds the current name with `ListAgents`, and sends a message with `SendMessage`.
- **Agents from other providers** (Codex, Gemini…) cannot use `ListAgents` or `SendMessage`. They open a GitHub issue with `gh`.
- **The record is in GitHub and git.** A message is a notification only. The DS session writes each result into the DS repo.

## Known transition issues

The DS is 0.x. These issues are known and accepted during the transition. Do not work around them in the project. Do not report them as new findings, but say if one blocks the project.

- **Google Fonts:** `gov2.css` loads Inter and Fragment Mono from Google Fonts with `@import`. Each page that loads `gov2.css` makes this external request. The DS will fix this later.
- **Before 0.6.0, link styles overrode project classes.** A project with a copy older than 0.6.0 shows all links blue and underlined, also on the dark header. Update the copy; do not add `!important` in the project. The DS has link role classes (`.g2-link-title`, `.g2-link-quiet`, `.g2-link-inverse`, `.g2-chip`).
- **Layers decide which rule wins.** `gov2.css` declares `@layer reset, gov2, utilities, app;`. A project class wins over a DS rule when it is in `utilities` or `app`. A rule outside every layer outranks the DS, focus included. Put the reset in `reset`. Declare the order before other stylesheets that create layers. See `migration-from-0.6.0.md`.
- **Links stay underlined.** The DS underline is in the base layer, so it wins over an element reset in `reset`, such as Tailwind preflight. To remove the underline on a project link, use a class in `app` (for example `no-underline`), and only where `GUIDELINES.md` permits it.

## Prompt 1: Compatibility report

Use this prompt first, before a project adopts the DS. The agent reads only; it does not change files.

````text
You work in <project repo>, the code for <domain>. The gov2 design system (DS) is at
~/devbox/gov2/gov2ro-design-system. Write a compatibility report for the DS.
Do not change files in this project or in the DS.

1. In the DS, read CLAUDE.md, COMPONENTS.md, GUIDELINES.md, gov2.css, the section
   "Compatibility analysis" in docs/BACKLOG.md, and the section "Known transition issues"
   in docs/connect-a-project.md.
2. Find the live code for <domain>: the repo, the branch or worktree, and how it deploys.
   If there are several worktrees, say which one is live and how you know.
3. Write the report with these sections:
   - Live code: repo, branch or worktree, deploy.
   - Stack: framework, CSS method (Tailwind, plain CSS, other), build, how the CSS loads.
   - Tokens and classes: the CSS variables and class names that exist. List each conflict
     with the --g2-* tokens and the .g2- classes: same names, CSS resets, layers, specificity.
   - Look: fonts, header, footer, skins or themes, dark mode.
   - Constraints: rules that a DS file must follow here, for example scoping, CSP,
     external requests (gov2.css loads Google Fonts with @import), build steps.
   - Candidates: components in this project that the DS does not have, and that another
     gov2 project can use.
   - Adoption: the changes in this project and the changes in the DS. Give each change
     a size: S, M or L.
   Mark each finding "measured" or "assumed". Keep the report under 80 lines.
4. Send the report to the DS session. Run ListAgents, find the session whose name starts
   with "gov2ro-design-system", and send the report with SendMessage.
   If there is no DS session, or you cannot send messages, open an issue:
   gh issue create -R gov2-ro/gov2ro-design-system --title "[compat] <domain>" --body-file <report file>
5. Tell me where the report went.
````

## Prompt 2: Adopt the DS

Use this prompt after the DS session has the compatibility report.

````text
Adopt the gov2 design system (DS) in this project, at version <X.Y.Z>.
The DS is at ~/devbox/gov2/gov2ro-design-system.

1. In the DS, read docs/project-block.md, COMPONENTS.md, GUIDELINES.md, CHANGELOG.md,
   the section for this project in docs/compat-analysis.md, and the section
   "Known transition issues" in docs/connect-a-project.md.
2. Add the block from docs/project-block.md to AGENTS.md and CLAUDE.md in this project.
   Fill in the values. Keep the rest of the block as it is.
3. Copy gov2.css from the DS tag v<X.Y.Z> into <path>:
   git -C ~/devbox/gov2/gov2ro-design-system show v<X.Y.Z>:gov2.css > <path>
   Do not edit the copy.
4. Use a DS component where one fits. Where the DS has no component, build a local version
   with the class prefix <prefix>- and open a ds-proposal issue, as the block says.
5. Make a screenshot of each main page. Check each page against the "Review checklist"
   in GUIDELINES.md. Measure the contrast in the browser, not only in the tokens.
6. Follow the process of this project for the backlog, the activity log and commits.
7. Send a short summary to the DS session (ListAgents, then SendMessage): the version,
   the issues that you opened, the checklist items that fail, and the problems that you found.
````

## Prompt 3: Propose a DS change

Use this prompt when a project needs something that the DS does not have.

````text
Propose a change to the gov2 design system (DS): <need>.
1. Check COMPONENTS.md in ~/devbox/gov2/gov2ro-design-system. If a component fits,
   use it, and stop here.
2. Open an issue with the sections of .github/ISSUE_TEMPLATE/ds-proposal.md in the DS:
   gh issue create -R gov2-ro/gov2ro-design-system --label ds-proposal --title "[proposal] …" --body-file <file>
3. Build a local version with the project prefix, and put the issue URL in a comment next to it.
4. Send the issue URL to the DS session (ListAgents, then SendMessage).
````

## Prompt 4: Update to a new DS version

````text
Update the gov2 design system (DS) in this project to version <X.Y.Z>.
1. Read CHANGELOG.md in ~/devbox/gov2/gov2ro-design-system, from the version in the
   "Design system (gov2 DS)" block of AGENTS.md up to <X.Y.Z>. List each Breaking change.
2. Copy gov2.css from the tag v<X.Y.Z> into the path that the block gives. Do not edit the copy.
3. Fix the project for each Breaking change. Replace local versions of components
   that the DS now has. When the old version is 0.6.0 or 0.7.0, follow
   docs/migration-from-0.6.0.md.
4. Set the version in the block, in AGENTS.md and in CLAUDE.md.
5. Run the checks of the project. Report what you measured and what you assumed.
````
