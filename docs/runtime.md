# Optional rendered checks with Playwright

This interface is available in the current source checkout and next release. It is
not part of the published Usual UI 0.3.0 package.

Use `@usualui/lint/playwright` to measure an already prepared Playwright page or
frame. Usual reuses lintapple's rendered checker, then adds explicit state/theme
labels, actual viewport and media preference, frame coverage, grouped findings,
and a JSON attachment on every assertion, including passing checks.

The normal `usual-ui check`, `audit`, wizard, and agent hooks remain source-only.
They do not load lintapple, launch browsers, or run project components. Runtime
findings do not activate source categories or clear unresolved static findings.

## Install and prepare

In a project with the new Usual package and an existing Playwright test setup:

```sh
npm install -D lintapple@0.1.20 playwright@1.63.0
```

These are optional peers, not automatic dependencies for static users. The
source checkout installs them as development dependencies for type/adapter tests.
Browser provisioning belongs to the project's existing Playwright setup; this
adapter does not download Chromium, start an app, navigate, or authenticate.

The reviewed upstream source declares 0.1.23, but npm currently publishes 0.1.20.
This integration deliberately uses the verified installable version. Its published
page interface lacks types, grouped reporting, and frame coverage, so the Usual
adapter supplies those pieces. Newer upstream source behavior, including its SVG
contrast extensions, must not be assumed to exist in this pinned engine.

Align the Playwright version used by your existing test runner with 1.63.0 when
adopting this integration. Review dependency upgrades in your project normally.

## Review an explicit runtime policy

Copy [the complete example policy](../examples/runtime/policy.json) and adapt every
choice to the project. All fields are required, including empty arrays when a
contract is deliberately unused. This prevents silently adopting upstream font,
copy, spacing, or control-size defaults. Validation still belongs to lintapple.

Runtime policy is separate from `usual.design.json`: allowed class names,
variables and contextual source rules cannot be translated losslessly into
computed pixel values. No automatic policy translation or approval is performed.
The resolved policy is included in each report for review.

The example's 24px custom control minimum is a chosen design threshold, not a
complete accessibility guarantee. axe's target-size check has its own scope.

## Check an entered state

```ts
import { test, expect } from 'playwright/test';
import { expectDesign, type RuntimePolicy } from '@usualui/lint/playwright';
import policy from './ui-policy.json' with { type: 'json' };

test('review dialog', async ({ page }, testInfo) => {
  // Your existing test owns the app, authentication, navigation and readiness.
  await page.goto('http://localhost:3000/settings');
  await page.getByRole('button', { name: 'Review settings' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expectDesign(page, testInfo, {
    policy: policy as RuntimePolicy,
    state: 'review dialog',
    theme: 'light',
  });
});
```

`expectDesign` attaches `usual-ui rendered audit` JSON and returns the report
on success. Confirmed failures and unresolved findings both fail the assertion.
Operational/configuration errors throw; they never become clean reports. Missing
optional dependencies produce an installation instruction.

For a report without an assertion, call `auditPage(pageOrFrame, options)`. It returns
the same report without attaching or throwing for findings. The call still throws
for operational errors. Use `expectDesign(frame, testInfo, options)` to audit a
specific frame; its children are reported as omitted.

## Interpret the scope

- `state` and `theme` are descriptive labels supplied by your test. `colorScheme`
  separately records the browser's actual `prefers-color-scheme`; a custom theme
  toggle need not match that media setting.
- `viewport` records the checked document's actual inner dimensions. The adapter
  checks only the current page/frame. Policy `viewports` and `colorSchemes` do not
  resize or iterate the page; use Playwright projects to run the matrix.
- `frameCoverage` lists the checked document and omitted child frames, including
  nested frames. Omissions are visible in passing attachments but do not by
  themselves fail an assertion. Check each required frame explicitly.
- Counts of controls/numeric cells/alignment/radius contracts describe observed
  markup. Zero contracts does not prove those relationships were checked.
- `accessibilityCoverage` retains the engine's page-rule list and explicitly
  untested interaction scope. Driving a dialog in your test does not prove all
  keyboard behavior. Keep your ordinary focus/keyboard assertions.
- Findings retain selector, actual/expected values, suggested fixes, additional
  measurements, and suppressed exceptions with reasons. Summary groups preserve
  every occurrence. Runtime findings have no invented source-file locations.
- A document replacement, URL, viewport, media preference or frame-tree change during measurement is an
  operational error. Stabilize the page and retry. Stable metadata alone does not
  prove that every DOM update or animation stopped.

The engine measures a bounded rendered document, not every route/state or the
complete accessibility of an application. Its custom DOM scan does not traverse
shadow roots. Some geometric contracts require `data-ui-*` markup. See the
[upstream source documentation](https://github.com/gholtzap/lintapple/blob/0d12b8ae46a8d412cb818522f9a7ee5cdf1da860/README.md)
for further context; it covers a newer upstream commit, so distinguish it from
the pinned package.

Measurement can temporarily mutate page styles/DOM, and the app executes normally
inside its own runtime. Use a prepared test environment; the adapter does not
sandbox application network writes or undo actions performed by the test.

## Example and verification

The source checkout includes a self-contained HTML fixture, a light/dark and
narrow/wide Playwright matrix, entered-dialog checks, and a seeded font-size defect:

```sh
npm run build:core
# Only when browser execution is explicitly intended and Chromium is provisioned:
npx playwright test --config examples/runtime/playwright.config.ts
```

These browser examples are opt-in and are not part of `npm test`. They were
prepared but not executed during implementation under this workspace's standing
no-browser instruction. Non-browser adapter tests cover policy validation, raw
evidence retention, grouping, frames, attachments, failure semantics and optional
dependency loading; they do not establish engine accuracy in a real browser.

No model key, application environment variable, database migration, or hosted
service is required. Source-only users need no configuration changes.
