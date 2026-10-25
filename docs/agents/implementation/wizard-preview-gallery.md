# Wizard preview gallery

Implemented locally on 2026-10-22. Changes are uncommitted and unreleased.

## Experience

[HeroUI Themes](https://heroui.com/en/themes) informed the gallery structure:
keep a design-system reference alongside recognizable application screens, and
apply the same selected style across them. The examples are original; no HeroUI
code, assets, or dependency was copied or added.

Seven keyboard-accessible tabs replace the single reference sheet. The selected
example stays open while the user moves between wizard decisions.

| Preview       | Contents and local interactions                                                                                            |
| ------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Design system | Palette, typography, spacing, and shape specimens.                                                                         |
| Components    | Buttons, inputs, switches, range, profile, progress, invoice table, and confirmation states. Actions update example state. |
| Dashboard     | Metrics, activity chart, projects, and team activity. The period selector updates metrics and chart data.                  |
| Mail          | Searchable inbox, message selection, and a reply composer that adds a demo reply locally.                                  |
| Chat          | Channels, conversations, and a composer that adds a demo message locally.                                                  |
| CRM           | Pipeline totals and opportunities filtered by contact/company search and stage.                                            |
| Finance       | Balance, income/expense summary, cash-flow chart, and transactions with aligned amounts.                                   |

All example data is fictional. Interactions reset when switching examples;
messages are never sent, and no financial or policy action is performed.

## Boundaries

- Existing bounded preview validation applies colors, type, spacing, and shape
  through `--sample-*` variables. Unsupported values remain unavailable rather
  than entering page CSS. References use safe system font families.
- Light/dark choices use their respective preview values. Deferring a category
  removes its values and restores neutral defaults. Missing or unsupported
  coverage remains visible in the explanatory disclosure.
- Connected projects retain their exact component showcase. The source switch
  exposes the reference examples alongside it; the project iframe stays mounted
  while hidden, preserving its connection. Existing origin/channel/revision
  validation and iframe restrictions remain in place.
- Example state is local React state. No new requests, persistence, manifest
  fields, policy writes, or changes to approval/activation boundaries were added.

## Verification

The 27 wizard tests, type checking, production build, and formatting checks pass.
Package smoke passed, including packaged wizard assets and a clean installation.

Browser checks covered all seven tabs, local interactions, arrow/Home/End tab
navigation, dark theme, and removing deferred color values from the preview.
All seven scenes were captured at 1440 × 1000 and had no document horizontal
overflow at 1280 × 800 or 390 × 844. Phone screenshots of Mail and Components
were inspected and readable. Dashboard stayed selected from Colors to Typography;
Mail stayed selected through Spacing and Shape. Editorial typography rendered the
Mail body in serif at 14.4px with 23.04px line height (ratio 1.6), then Standard
was restored. The reference browser reported zero console errors or warnings.

A connected loopback showcase fixture retained its edited input across
Your project → Reference examples → Your project. While hidden, its iframe
received Dark/Cobalt (`blue`, primary `#9ab3ff`) and acknowledged “Choices applied.”
This verifies the bridge fixture, not a real consumer application. The fixture
reported one pre-existing initial `postMessage` origin warning before iframe
navigation, then connected successfully; `ProjectShowcase.tsx` is unchanged.
That warning remains an existing limitation, separate from the clean reference
browser console.

Screenshots are local review evidence in
[`output/playwright/preview-gallery/`](../../../output/playwright/preview-gallery/),
including the inspected reference and the implemented examples. They are not
published product assets.

## Running and release

Use the existing dependencies, run `npm run build`, and restart the wizard to
load the updated preview. A connected project still requires its existing local
showcase server. No new dependency, environment variable, schema change, or
database migration is required. No deployment or package publication was performed.
