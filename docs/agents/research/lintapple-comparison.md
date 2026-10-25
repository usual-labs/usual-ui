# lintapple compared with Usual UI

Research date: 2026-10-22. This is a source-backed comparison and proposed adoption order, not an approved implementation plan.

Follow-up: the user subsequently requested all recommendations. See the
[implementation receipt](../implementation/lintapple-adoption.md) for the adopted
scope, installable upstream version, and verification. This document preserves
the original research snapshot; its proposed-status wording is historical.

Reviewed lintapple at [`0d12b8ae46a8d412cb818522f9a7ee5cdf1da860`](https://github.com/gholtzap/lintapple/tree/0d12b8ae46a8d412cb818522f9a7ee5cdf1da860), whose package manifest declares `0.1.23`; Usual UI at local commit `271657b49b783344c35d083079966e101fe41f16`, whose manifest declares `0.3.0`. These are source/package metadata, not a fresh npm-registry verification. Sources, tests, and configuration were inspected, and targeted pure-function checks verified local numeric-utility behavior. No browser, application, upstream test suite, or dependency installation was run. Only this research document was added.

## Recommendation

Borrow lintapple's reporting and concrete rule examples now. Evaluate its existing Playwright API as an optional runtime companion before writing our own rendered engine. Keep Usual's source-contract checker, policy ownership, and approved-repair workflow intact.

The products overlap in purpose but inspect different evidence. Usual asks whether source follows the project's approved values, semantics, and component choices. lintapple asks whether a particular rendered page/state satisfies measurable layout, typography, and accessibility rules. Both can find defects the other cannot. A button can use every approved token yet clip its label at a narrow viewport; a visually correct button can still bypass our required shared component. [L1], [U1], [U2]

## What it has, and where we stand

| Capability                | lintapple                                                                                                                             | Usual today                                                                                                       | Assessment                                                                                                |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Approved typography       | Computed font sizes, first CSS font-family entry, selector-specific sizes, font loading failures                                      | Source classes, variables, declarations, and semantic targets                                                     | Complementary: runtime verifies the result of cascade/inheritance; source retains policy provenance.      |
| Layout correctness        | Actual control bounds, gaps/insets, alignment, nested radii, overflow/clipping                                                        | Approved spacing/shape values and explicit class/prop requirements                                                | A substantial capability we lack. Approved values alone cannot establish geometry.                        |
| Accessibility             | Selected axe rules plus label/reference/state checks; contrast; planned keyboard/focus checks                                         | Configurable static prop/class requirements; no general accessibility engine                                      | A substantial capability we lack; neither product establishes complete accessibility.                     |
| Responsive/state coverage | Configured viewport × theme runs; named states after actions; existing-page API                                                       | Static finite branches/variants; project showcase for review                                                      | Runtime verification is missing. Our showcase is not an automated rendered audit.                         |
| Numeric typography        | Tabular-digit CSS feature checks and right alignment for numeric table cells                                                          | Existing semantic-target machinery; no dedicated numeric rule family                                              | Good small rule-pattern opportunity, with utility support checked separately.                             |
| Copy checks               | Configurable banned phrases in visible/generated/placeholder/button text                                                              | No content-copy policy                                                                                            | Optional, lower fit with our current design-contract focus.                                               |
| Finding presentation      | Distinct problems vs occurrences, per-rule totals, failed vs unresolved, `actual`, `expected`, and `fix`; state/screen/theme evidence | Source positions/spans, actual/expected, kinds, stable semantic IDs; category grouping in wizard; flat CLI output | Their report summary is better for repeated findings; our source evidence is better for targeted repairs. |
| Playwright integration    | `expectUI(page, testInfo)` attaches JSON and fails existing tests                                                                     | CLI/JSON, wizard, coding-agent hooks, npm/Git/CI integration                                                      | Reuse their small adapter pattern and the test runner's reports.                                          |
| Semantic intent           | Explicit DOM contracts such as `data-ui-stack`, `data-ui-number`, `data-ui-radius`                                                    | Element/component identity, literal prop filters, class context, required/forbidden classes/props                 | We already have the source-side foundation; geometric relationships need runtime evidence.                |
| Policy and adoption       | Small JSON policy with defaults and reasoned selector exceptions                                                                      | Discovery/proposals, guided policy decisions, active/inactive categories, used/unused exceptions                  | Usual has a more developed policy/adoption workflow.                                                      |
| Component governance      | Rendered elements/selectors                                                                                                           | Import restrictions, canonical component identity, native-to-shared replacement requirements                      | An existing Usual strength without an equivalent in the reviewed lintapple surface.                       |
| Repair workflow           | Human-readable suggested fix                                                                                                          | Saved selected/deferred repair batches, snapshot verification, protected policy, fresh activation audit           | Retain Usual's workflow; a suggested fix is not approval to change policy.                                |
| Educational demo          | Rendered before/after examples, theme switch, resizeable overflow example, fix code                                                   | Three selectable before/after code examples plus onboarding showcase                                              | Their per-rule rendered examples communicate consequences more directly.                                  |

Evidence: lintapple [rule catalog and APIs][L1], [auditor][L2], [accessibility][L3], [interaction contracts][L4], [reporting][L5], [Playwright adapter][L6], and [demo][L7]; Usual [types][U1], [project evaluator/reporting][U2], [rules][U3], [records][U4], [site examples][U5], and [README][U6]. The comparison describes implementation, not comparative performance or independently verified runtime quality.

## How lintapple works

1. **Load explicit JSON policy.** `init` creates `ui-policy.json` and adds a `lint:ui` script while keeping existing settings. The loader uses package defaults if the default policy file is absent; validation rejects unknown fields and invalid values. Defaults include two viewports, light theme only, system/Apple font names, a fixed size scale, and three banned phrases. These defaults are choices, not design-system discovery. [L8], [L9]
2. **Enter a real browser.** `checkUrl` launches Chromium and makes a fresh context per viewport/theme pair. It fixes locale, timezone, device scale, and reduced motion, loads the URL, and optionally waits for a ready selector. `checkPage` instead accepts an existing Playwright `Page` or `Frame`, useful after authentication or a test has opened a modal. It waits for fonts and two animation frames. This is DOM/CSS measurement, not an AI screenshot judge. [L1]
3. **Collect rendered evidence.** The design auditor gathers visible body elements, caches computed styles, reads element/text rectangles, and inspects fonts, CSS features, generated text, and placeholders. Custom geometry checks combine actual measurements with explicit markup describing intent. For example, nested marked surfaces must satisfy `inner radius = max(0, outer radius - inset)` under supported circular/uniform geometry. [L2]
4. **Reuse axe, then add focused checks.** Selected axe rules provide name/ARIA/target-size/contrast logic; custom checks handle gaps such as placeholder-only labels, missing ID references, and disclosure-state disagreement. Incomplete or unsupported contrast measurements become unresolved findings. Specialized SVG text contrast uses temporary hidden/black/white text screenshots, pixel sampling, stability checks, and restoration. This specialist code is not a sensible first implementation for us. [L2], [L3], [L10]
5. **Optionally drive declared interactions.** A bounded plan specifies focus targets, button activation outcomes, tooltips, dialogs, tabs, menus, and named click/fill/press/hover states with readiness witnesses. It checks outcomes and re-audits entered states. A button's expected outcome must not already be true before activation. Without a plan, interaction coverage is explicitly untested. It does not discover all possible states automatically. [L4], [L11]
6. **Preserve evidence, summarize for humans.** JSON retains every occurrence. Summary grouping uses rule, selector, expected result, status, phase, document/frame and related context; differing actual values stay attached to occurrences. CLI exit codes are 0 for no findings, 1 for findings including unresolved checks, and 2 for execution errors. The Playwright adapter uses native attachments and assertions instead of another dashboard. [L5], [L6], [L12]

## The best ideas to adopt

### 1. Summarize problems without discarding evidence

lintapple has a regression test that collapses 4,000 repeated findings into one problem while preserving all 4,000 measurements. It also ensures unrelated documents, phases, and unresolved findings stay separate. Our diagnostic finalization already removes duplicate emissions at one source location, and our wizard groups by category; neither is the same as a useful cross-occurrence problem summary. [L5], [L13], [U7]

Add a derived summary around our existing findings: rule/category totals, distinct problem groups, occurrence counts, and separate violation/coverage/decision counts. Keep all finding IDs, source locations, contexts, and repair selections. Define grouping for our source model rather than copying a DOM-selector key; avoid implying that superficially similar occurrences share one root cause. Put this in a focused reporting module used by the CLI and wizard, leaving `evaluate`, `resultExit`, and freshness semantics unchanged. [U1], [U2], [U4]

Expose structured remediation text where a rule has concrete advice, retaining project-approved values/components as the authority. We already include guidance in messages and replacement metadata; this is a structured presentation improvement, not a new automatic fixer. Do not give coverage uncertainties an invented code edit or weaken policy to remove a finding. [U3], [U4]

### 2. Reuse an existing page and existing test runner

The most valuable new capability is inspecting an already prepared page. Start by evaluating direct use of `lintapple/playwright` in a consumer's existing tests. This avoids building browser installation, app startup, authentication, navigation, and a report UI. Its adapter is 25 lines; its packed-package integration test asserts attachment/assertion/report behavior. [L6], [L14]

Do not put Playwright into the normal static execution path. lintapple's package depends on Playwright and axe; its URL launcher can download Chromium when it is absent. An optional companion has a materially different install/runtime footprint. Keep existing-page integration separate, and only add an Usual public adapter if it adds useful policy/report integration beyond a documented companion recipe. [L15], [L16]

A reuse trial must assess policy mismatch: lintapple's fonts and sizes are explicit rendered values, whereas our manifest can approve variable names, classes, patterns, and context-dependent rules. These are not losslessly interchangeable. Initially keep the runtime policy explicit and reviewable; if translation is later justified, translate only provably supported values and show unsupported mappings. A runtime pass must never cancel static coverage failures or activate a source category. [L8], [U1], [U2], [U4]

### 3. Make checked and unchecked runtime scope visible

Preserve state, viewport, theme, URL, frame, and checked-contract counts alongside findings. lintapple lists omitted child frames and separates untested interactions from failed or unresolved checks. Its API can check a supplied frame, but a passing parent page alone does not establish iframe correctness. `expectUI` attaches omitted-frame coverage but does not fail solely because frames were omitted. Zero observed alignment/radius contracts is also not proof that those relationships were checked. [L1], [L2], [L6]

Usual already reports declared source scope, exclusions, inactive categories, and used/unused exceptions. Extend those principles if runtime support is adopted; do not replace them with a generic green badge. Runtime evidence needs selectors and page context, while static evidence retains exact source spans. Do not fabricate source locations for DOM findings. [U1], [U2], [U7]

### 4. Teach practical semantic rules through concrete examples

Numeric columns, action groups, and surface relationships are useful examples of explicit design intent. Our existing semantic targets already support custom data attributes, literal props, and required classes, so no new semantic framework is needed. Source requirements such as right-aligned marked numeric cells should reuse that mechanism after fixing the utility-classification issues below. Geometry and actual font behavior remain separate runtime concerns. [L2], [U1], [U3]

Targeted pure-function checks exposed two concrete issues in our current implementation:

- `classCategory('tabular-nums')` returns `undefined`. Allowlisting it still leaves an unresolved-coverage finding. A missing semantic requirement for it is classified under components, so typography-only enforcement filters that semantic violation out.
- `utilityFamily('text-right')` and `utilityFamily('text-sm')` both return `|typography|font-size`. A semantic requirement for `text-right` therefore falsely fails when an element also uses `text-sm`.

Correct numeric utility classification and typography conflict families before shipping these examples. Reuse the existing target/evaluation machinery and add focused positive, violating, activation-category, and unknown cases. Avoid globally requiring right alignment or tabular numbers on every numeric-looking label. [U8], [U10], [U3]

Our site already has before/after code examples. Enhance those with owned rendered specimens showing the actual effect, a matching diagnostic, and the approved fix. Use our own design and fixtures; lintapple's demo is an implementation reference. Its theme and overflow-resize controls are particularly useful explanatory devices. A demo example must not be presented as a live audit unless it actually runs one. [L7], [U5]

## Limits we should account for

- **Runtime scope is finite.** The custom design scan selects visible `body, body *` elements, is bounded at 5,000, and does not traverse shadow roots. Child frames are omitted unless explicitly checked. Interaction targets must identify exactly one main-document element; iframe and shadow-root targets are excluded by its selector guard. Custom control geometry primarily measures native/ARIA buttons, not every interactive control. Selected axe rules have different coverage. [L1], [L2], [L3], [L4]
- **Some rules need markup.** Stack, alignment, nested-radius, and content-container assertions depend on declared contracts. A configured viewport matrix does not establish all responsive breakpoints; dark mode is supported but absent from the default policy. [L2], [L8]
- **Some results are heuristics.** First CSS font-family is not proof of the actual glyph font. Requested tabular features do not prove equal glyph widths. Focus detection compares styles and samples obstruction points; it is not complete perceptual focus-indicator verification. Structural `nth-of-type` selectors are useful for the current DOM but fragile across edits. [L2], [L4]
- **Runtime execution can change state.** Interaction plans issue real clicks/keys/fills; an upstream test explicitly performs a server-side save. Even some measurement paths temporarily mutate styles/DOM and restore them. Use a prepared test environment and explicit runtime invocation; do not claim the same inertness as our static scanner. [L4], [L10], [L17]
- **Defaults are not universal standards.** The default custom control-size minimum is 15px; axe's separate accessibility target-size check is a different rule. The default font scale, 8px spacing, banned phrases, and nested-radius formula should not silently become Usual policy. [L3], [L8]
- **Broader checks have maintenance cost.** SVG raster measurement, generated text, visibility, transforms, clipping and focus introduce many browser-specific edge cases. Their regression suite is useful evidence of the cases considered, not proof that their engine is exhaustive or that it outperforms ours. Prefer reuse and targeted additions over copying the full engine. [L2], [L10], [L13]

## Proposed implementation order

| Order | Deliverable                                                                                 | Ownership / smallest complete approach                                                                                                                                                      | Acceptance evidence                                                                                                                                                    |
| ----- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | Better CLI/JSON summaries and remediation presentation                                      | Derive from `AuditResult`/finalized diagnostics; reuse in wizard; preserve existing raw findings                                                                                            | Meaningful grouping tests: repeated occurrences, different rules/expectations/kinds, no evidence loss, unchanged exit/repair behavior                                  |
| 2     | Numeric semantic example, utility classification, and accurate typography conflict families | Existing `classes.ts` + semantic rules, documentation and independent fixtures                                                                                                              | `text-right text-sm` must coexist; numeric requirements must belong to typography; approved/rejected and finite/dynamic cases                                          |
| 3     | Rendered rule examples                                                                      | Extend existing site examples with owned specimens and matching source diagnostics                                                                                                          | Static/component checks first; browser/visual acceptance only when explicitly requested                                                                                |
| 4     | Optional runtime companion evaluation                                                       | First use lintapple's existing page/Playwright API in a controlled consumer; compare with direct axe plus native Playwright only if lintapple's scope/defaults obstruct the intended policy | When authorized: seeded positive/negative/unresolved cases, narrow/wide and light/dark states, omitted frames, existing auth/test setup, package/version compatibility |
| 5     | Minimal Usual runtime integration, if the evaluation supports it                            | Add only needed policy/report bridge; retain separate evidence and command boundaries; reuse existing tests to enter states                                                                 | Explicit coverage, unchanged source-check results, no implicit browser install/launch, actionable reports with no fake source mapping                                  |

Do not start with a new interaction DSL, universal design score, screenshot AI, plugin platform, or full SVG implementation. Do not add baselines, changed-files-only enforcement, watch, MCP, or LSP on the strength of this comparison: they are not the distinctive features found here, and accepted-debt baselines would change our current product contract. [U9]

No new environment variables, migrations, dependencies, deployment steps, or product behavior changes are required for this research. Browser acceptance remains unperformed. Runtime functionality above is proposed, not implemented.

## Reuse and attribution

lintapple is MIT licensed, copyright Gavin Holtzapple. Directly copied or substantially adapted code must retain the copyright and permission notice; record attribution in our existing third-party notices if we take that route. Prefer package reuse where it fits, or independently implement the small reporting/static improvements in our existing architecture. [L18]

## Primary sources

[L1]: https://github.com/gholtzap/lintapple/blob/0d12b8ae46a8d412cb818522f9a7ee5cdf1da860/src/index.ts#L19-L143
[L2]: https://github.com/gholtzap/lintapple/blob/0d12b8ae46a8d412cb818522f9a7ee5cdf1da860/src/audit.ts#L9-L480
[L3]: https://github.com/gholtzap/lintapple/blob/0d12b8ae46a8d412cb818522f9a7ee5cdf1da860/src/accessibility.ts#L4-L94
[L4]: https://github.com/gholtzap/lintapple/blob/0d12b8ae46a8d412cb818522f9a7ee5cdf1da860/src/interactions.ts#L6-L280
[L5]: https://github.com/gholtzap/lintapple/blob/0d12b8ae46a8d412cb818522f9a7ee5cdf1da860/src/report.ts#L1-L48
[L6]: https://github.com/gholtzap/lintapple/blob/0d12b8ae46a8d412cb818522f9a7ee5cdf1da860/src/playwright.ts#L1-L25
[L7]: https://github.com/gholtzap/lintapple/blob/0d12b8ae46a8d412cb818522f9a7ee5cdf1da860/demo/app.ts#L15-L120
[L8]: https://github.com/gholtzap/lintapple/blob/0d12b8ae46a8d412cb818522f9a7ee5cdf1da860/ui-policy.json#L1-L20
[L9]: https://github.com/gholtzap/lintapple/blob/0d12b8ae46a8d412cb818522f9a7ee5cdf1da860/src/project.ts#L15-L49
[L10]: https://github.com/gholtzap/lintapple/blob/0d12b8ae46a8d412cb818522f9a7ee5cdf1da860/src/svg-contrast.ts#L21-L113
[L11]: https://github.com/gholtzap/lintapple/blob/0d12b8ae46a8d412cb818522f9a7ee5cdf1da860/src/widgets.ts#L9-L235
[L12]: https://github.com/gholtzap/lintapple/blob/0d12b8ae46a8d412cb818522f9a7ee5cdf1da860/bin/lintapple.ts#L46-L63
[L13]: https://github.com/gholtzap/lintapple/blob/0d12b8ae46a8d412cb818522f9a7ee5cdf1da860/test/report-summary.test.ts#L9-L35
[L14]: https://github.com/gholtzap/lintapple/blob/0d12b8ae46a8d412cb818522f9a7ee5cdf1da860/test/playwright-integration.test.ts#L13-L83
[L15]: https://github.com/gholtzap/lintapple/blob/0d12b8ae46a8d412cb818522f9a7ee5cdf1da860/package.json
[L16]: https://github.com/gholtzap/lintapple/blob/0d12b8ae46a8d412cb818522f9a7ee5cdf1da860/src/browser.ts
[L17]: https://github.com/gholtzap/lintapple/blob/0d12b8ae46a8d412cb818522f9a7ee5cdf1da860/test/page-states.test.ts#L15-L88
[L18]: https://github.com/gholtzap/lintapple/blob/0d12b8ae46a8d412cb818522f9a7ee5cdf1da860/LICENSE
[U1]: https://github.com/usual-labs/usual-ui/blob/271657b49b783344c35d083079966e101fe41f16/src/types.ts#L5-L136
[U2]: https://github.com/usual-labs/usual-ui/blob/271657b49b783344c35d083079966e101fe41f16/src/project.ts#L14-L196
[U3]: https://github.com/usual-labs/usual-ui/blob/271657b49b783344c35d083079966e101fe41f16/src/rules.ts#L69-L322
[U4]: https://github.com/usual-labs/usual-ui/blob/271657b49b783344c35d083079966e101fe41f16/src/records.ts#L24-L273
[U5]: https://github.com/usual-labs/usual-ui/blob/271657b49b783344c35d083079966e101fe41f16/site/src/pages/Design.tsx#L6-L96
[U6]: https://github.com/usual-labs/usual-ui/blob/271657b49b783344c35d083079966e101fe41f16/README.md
[U7]: https://github.com/usual-labs/usual-ui/blob/271657b49b783344c35d083079966e101fe41f16/src/diagnostics.ts#L45-L136
[U8]: https://github.com/usual-labs/usual-ui/blob/271657b49b783344c35d083079966e101fe41f16/src/classes.ts#L45-L86
[U9]: https://github.com/usual-labs/usual-ui/blob/271657b49b783344c35d083079966e101fe41f16/docs/usage.md#L204-L221
[U10]: https://github.com/usual-labs/usual-ui/blob/271657b49b783344c35d083079966e101fe41f16/src/classes.ts#L114-L127
