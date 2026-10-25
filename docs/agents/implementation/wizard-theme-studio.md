# Wizard theme studio

Implemented locally on 2026-10-22 as a follow-up to the
[preview gallery](wizard-preview-gallery.md). This extends the seven example
screens with theme exploration, a larger canvas, and more realistic component
states. It is an unreleased source-checkout change.

## HeroUI revisit

The browser review of [HeroUI Themes](https://heroui.com/en/themes) showed more
than a row of example tabs. Its dashboard, components, mail, chat, CRM, and
finance views place a theme in recognizable application layouts. The inspected
views use full-width canvases with sidebars and headers, varied card densities,
and controls that expose both neutral surfaces and accent colors.

The inspected theme controls included Default, Sky, Lavender, Mint, and brand
styles; Accent hue and Base chroma controls; a font chooser; independent card
and form radius; undo, redo, reset, and shuffle icons; light/dark selection; and
code export containing light/dark semantic CSS variables. These are observations
of the reference, not a claim that every HeroUI feature was reproduced.

We adapted the preview structure and useful control patterns. All examples and
styles are original. No HeroUI code, assets, fonts, or dependencies were copied
or added.

## What changed for users

| Area | Experience |
| --- | --- |
| Canvas | Expand preview temporarily gives the examples the setup workspace. Back to setup restores the decision rail. Fit, Tablet · 768, and Phone · 390 constrain the reference canvas to the available width; they are layout previews, not device emulation. |
| Theme controls | Customize theme exposes supported colors, system font families, body/heading sizes, line height, spacing, and separate card/control radii. Color values have text entry and a native picker when represented as hex; numeric values have bounded inputs and sliders. |
| Exploration | Light and dark maintain separate adjustments. Undo/redo share a bounded history of 40 snapshots. Reset clears the current theme's adjustments. Compare with setup temporarily shows the selected proposal values. |
| Proposed styles | Start from proposed styles offers the actual project proposal options. These selectors change setup choices and use the normal save/review flow; they do not manufacture new enforceable rules. |
| Export | Export theme provides a copyable agent change request or reference CSS for both themes. Copy failure selects the text for manual copying. The request carries selected option IDs, deferred categories, and supported changed values. |
| Application context | Dashboard, CRM, and Finance now use a shared sidebar, header, section search, profile area, and local section navigation. The selected theme applies throughout the app canvas. |

The dashboard adds an inspectable activity chart, metric trends, acquisition
sources, and dedicated activity/project sections. CRM adds selected opportunity
details and follow-up views while retaining contact/stage filtering. Finance adds
an account card, expense breakdown, dedicated cash-flow/transaction views, and
search/type filters with an empty state. Mail and Chat retain their local inbox,
channel, and composer interactions.

The Components gallery keeps its six compact cards and adds states that help
judge a theme in use:

- Actions: a native popover, local action feedback, hover/focus help, disabled
  and loading examples. The spinner respects reduced-motion preferences.
- Inputs: native email validation with linked helper/error text, date input,
  read-only and disabled fields, and the existing selection controls. The date
  picker popup uses the browser's own appearance.
- Profile: themed Overview/Activity tabs with arrow, Home, and End navigation.
- Feedback: progress states and a dismissible local notification.
- Data: six sample invoices over two pages, page totals, and working navigation.
- Confirmation: a native modal with Cancel, Escape, confirm/restore behavior,
  and focus returned to its trigger.

The Design system shape specimen also has an operable pressed state. Example
interactions remain local and reset when changing example screens. No messages,
financial transactions, or project mutations are performed.

## Policy and preview boundaries

Preview customization is deliberately separate from choosing and approving a
project contract. An adjustment can explore only a supported slot already
present in the selected proposal for that theme. Missing values stay unavailable;
deferred categories stay disabled. Existing primitive validation rejects unsafe
CSS, arbitrary fonts, external resources, and out-of-range values.

Changing a real proposal selection or deferring a category clears related
adjustments in both themes and starts a new history, so undo cannot revive values
from an obsolete choice. Unrelated category adjustments remain available.

Explorations live in memory and are discarded on page reload. They do not write
the manifest, mark categories active, update application sources, or enter the
connected project showcase. Export the request before leaving if the direction
should be carried into the project.

The exported CSS uses reference-only `--sample-*` variables. The agent request
asks for source inspection and explicit proposal options with matching rules,
then review through the existing approval flow. Neither export is approval or an
automatic mapping from a preview color to a project token.

The project showcase remains separate, using its existing allowed themes and
bridge restrictions. Reference edits do not alter messages sent to the connected
project. Existing policy approval, source/session freshness, category activation,
and repair approval boundaries remain in place.

This change does not add hosted sharing, AI theme generation, random theme
generation, external font loading, or HeroUI's complete semantic token model.
It does not introduce success/warning/danger colors without project proposal
coverage.

## Verification

The production build, typecheck, formatting, wizard tests, and package smoke
checks were rerun successfully after the focus fixes:

- `npm run typecheck` passes.
- All 37 wizard tests pass, including accessible IDs and overlay/form semantics,
  safe preview values, bounded history, separate-theme adjustments, deferral and
  choice-change invalidation, and export boundaries.
- Formatting, production build, and package smoke checks pass, including the
  packaged wizard assets and clean-install verification.

Current browser acceptance covered all seven scenes at 1280 × 900 and 390 × 844.
For each scene, document width matched viewport width: no horizontal document
overflow was detected at either size. This is responsive browser evidence, not
physical-device or exhaustive browser compatibility testing.

The business interactions passed:

- Dashboard: reporting-period changes, weekly chart-point selection, section
  navigation, and section search.
- CRM: contact selection, contact/company search, stage filtering and its empty
  state, Follow-ups navigation, and focus on the pipeline destination.
- Finance: transaction search, type filtering and its empty state, and section
  navigation.
- Inspector: closing theme controls returns focus to the opener.

The connected loopback showcase retained an unsaved field value when switching
to reference examples and back. Changing reference overrides in both light and
dark left the bridge JSON unchanged. Selecting the actual Cobalt proposal sent
option ID `blue` and primary `#315de8`; Graphite was restored afterward. This
verifies the bridge fixture rather than a real consumer application.

The fixture still has its existing initial connection-origin warning; the
project bridge implementation was not changed. The final reference-console
check in the in-app browser returned no errors or warnings.

A final CSS-only adjustment lets the compact inspector grow to
`min(50dvh, 420px)` so its first color field is visible on a phone. The production
build, formatting, whitespace check, and focused 390 × 844 browser geometry and
screenshot check passed afterward: document width was 390px and inspector height
was 420px. The 37-test wizard suite and package smoke had passed immediately
before this final CSS-only adjustment.

The local [screenshot gallery](../../../output/playwright/theme-studio/index.html)
collects the final studio, component, application, mobile, and dark-theme captures.
It is a static review artifact, not the running wizard.

## Running and release

Use the existing dependencies, run `npm run build`, and restart the wizard to
load the new controls and scenes. An existing connected project still needs its
own local showcase server. No new dependency, environment variable, schema
change, or database migration is required. No deployment or package publication
is part of this implementation.
