# Checking the live guide

The guide loads `../gov2.css` directly. No build or generation step is required.
`guide.css` styles documentation layout; it must not repair core component appearance.

## Run locally

Use Node.js 20 or later.

```sh
npm ci
npx playwright install chromium
npm test
npm run dev
```

Open `http://127.0.0.1:4173/docs/`.
If Chrome is already installed, use `PLAYWRIGHT_CHANNEL=chrome npm test` instead of downloading Chromium.
Generate review screenshots with `GUIDE_ARTIFACT_DIR=/tmp/gov2-guide PLAYWRIGHT_CHANNEL=chrome npm test`.
The tests start their own server on a free local port and close it when finished.

## Automated coverage

The suite checks the stylesheet through the browser, with no guide CSS in the raw component fixture.
It covers metadata, local links, IDs, component coverage, labels and descriptions, no-JavaScript reading,
copy helpers and their failure path, toggle and dismissal behaviour, live stylesheet changes,
320/390/768/1280px layouts, a 200% zoom check, component geometry with/without a reset,
keyboard focus, hover plus focus, disabled/selected/error states, text contrast, forced colours and reduced motion.

External requests are blocked during checks. This makes the system-font fallback reproducible.
The current stylesheet still imports Google Fonts. Removing that request and testing optional local fonts belongs to brief 03.

Two tests are explicitly marked TODO for brief 01: whole-site activation and the accepted layer contract.
They are not reported as passing while the current runtime still uses `data-skin` and unlayered CSS.
Brief 01 should update the existing fixtures and turn those TODOs into executable assertions.
The current guide intentionally shows the currently implemented API, alongside the approved migration status.

## Manual checks

### Visited links

1. Serve the guide and open it in a normal browser profile with history enabled.
2. Choose an unvisited in-text or title link with a distinct destination.
3. Follow the link, then return with the browser's Back action.
4. Confirm the visited colour on in-text/title links. Quiet and inverse links keep their normal colour.
5. Repeat with keyboard focus and hover; focus must remain readable.
6. Record the browser/version, destination, result and any history restrictions.

Browser privacy protections conceal visited-state information from ordinary script observations.
Do not infer success from `getComputedStyle()` alone. Hover is independently testable in headless mode.

### Assistive technology and enlargement

- Check landmark and heading navigation, names, field hints/errors and toggle state with a screen reader.
- Check browser-native 200% zoom and text enlargement, not only the automated CSS zoom fixture.
- Review forced-colour rendering on a supported operating system. Browser emulation is a useful supplement.
- Inspect keyboard focus visibility, clipping and scroll position throughout the guide.
- Verify representative pages in additional browser engines before claiming cross-browser coverage.

The automated suite does not establish full WCAG conformance. Record actual coverage and remaining gaps in `ACTIVITY.md`.

## Last recorded run

2026-10-26, Chrome 155.0.8059.85: 34 passed, 0 failed, 2 migration TODOs, approximately 29 seconds.
Command: `PLAYWRIGHT_CHANNEL=chrome GUIDE_ARTIFACT_DIR=/tmp/gov2-live-guide npm test`.
Desktop and mobile screenshots were reviewed. Manual procedures above remain unperformed.

Archive follow-up: nine focused checks passed in Chrome 155.0.8059.85, including exact snapshot checksum,
original-bundle rendering, archive navigation, no-JavaScript reading and 320/390/768/1280px reflow.
The previous full-suite run remains recorded above; the focused run did not repeat unrelated component-state checks.
