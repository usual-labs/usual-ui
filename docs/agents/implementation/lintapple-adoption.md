# lintapple recommendations adopted

Date: 2026-10-22. User authorization: “do all the recommendations,” following the
[source comparison](../research/lintapple-comparison.md). Changes are local and
unreleased, based on Usual commit `271657b49b783344c35d083079966e101fe41f16`.

## Delivered

| Recommendation                                       | Implementation                                                                                                                                                                                                                                                                    | Boundary preserved                                                                                                                                                                                  |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Summarize problems and provide guidance              | Shared `src/reporting.ts` derives CLI/JSON/wizard groups, totals by category/rule/kind, occurrence IDs, and structured remediation. Wizard supports group and individual selection.                                                                                               | Raw findings, selected/deferred IDs, exit codes, snapshots, and persisted record schemas retain authority. Exact legacy generated audit Markdown can refresh; edited notes remain protected.        |
| Numeric semantic rules and typography conflict fixes | Numeric font-variant utilities belong to typography; text size/alignment/wrapping coexist. Existing Tailwind merge semantics handle numeric and font groups, with project token evidence for custom fonts/weights. An explicit marked-cell recipe uses existing semantic targets. | No global numeric rule; missing numeric requirements follow typography activation. Unknown source evidence still blocks.                                                                            |
| Rendered educational examples                        | Four before/after specimens with matching source diagnostics and code, light/dark and compact/fluid controls.                                                                                                                                                                     | Script-free sandboxed owned fixtures, labeled illustrative; the site policy is unchanged.                                                                                                           |
| Evaluate the runtime companion                       | Inspected and installed the published package, validated policy/report contracts, assessed the existing page API and optional install footprint, prepared opt-in consumer examples.                                                                                               | Browser engine accuracy and visual acceptance remain unverified.                                                                                                                                    |
| Minimal optional integration                         | `@usualui/lint/playwright` exports typed `auditPage` and `expectDesign` for existing pages/frames, explicit policy, state/theme/context, failed/unresolved groups, omitted-frame coverage, and JSON attachments.                                                                  | No browser launch/download, app startup, navigation, action DSL, automatic policy translation, or fabricated source positions. Runtime results cannot clear source findings or activate categories. |

## Reuse decision

The reviewed upstream commit `0d12b8ae46a8d412cb818522f9a7ee5cdf1da860` declares
0.1.23, while the registry published only 0.1.20 at implementation time. The
adapter therefore pins installable `lintapple@0.1.20` and its compatible
`playwright@1.63.0`. The engine also uses `axe-core@4.14.0`.

Direct `lintapple/playwright` reuse was assessed first. The published page API
lacks usable root declarations, grouped reports, and omitted-frame reporting.
The small Usual adapter owns these missing presentation/scope guarantees and
requires every runtime policy choice explicitly; upstream owns measurements and
detailed policy validation. No rendering engine was copied into Usual. Newer
upstream SVG behavior is not claimed for this version.

Both browser packages are optional peers and development dependencies, outside
the normal source-check import graph. Consumers opting in accept the additional
Playwright/axe footprint and maintain their own test/browser setup. Dependency
attribution is recorded in `THIRD_PARTY_NOTICES.md`.

Review caught and fixed same-URL document replacement and frame replacement with
identical descriptors: the adapter now verifies document and frame identity,
disposes its document handle on all completed/error paths, and rejects changed
context. The seeded browser example uses an explicit style override so formatting
cannot silently remove the defect.

## Verification

- `npm run format:check`: passed.
- `npm run typecheck`: passed, including runtime examples via `examples/tsconfig.json`.
- Full core/wizard/site production build: passed.
- `npm test`: 191 passed (167 core, 21 wizard, 3 site), zero failed/skipped.
- Eleven runtime adapter tests use controlled page/measurement doubles and the
  real installed policy validator. They cover raw evidence, failures/unresolved
  findings, attachments, frames, policy errors, optional dependencies, navigation
  stability, and handle cleanup. They do not execute a browser.
- `npm run audit:site`: 13 source files, zero findings/errors, no exceptions. The
  full audit examines all categories even though the site's active list is empty.
- Clean package installation smoke: passed. The packed CLI, skills and wizard
  HTTP assets work; the optional entry point imports without its engine and
  reports a useful dependency error before accessing a page. `lintapple`,
  `playwright`, `playwright-core` and `axe-core` are absent from the static install.

Package installation proof is recorded separately in the ignored
`.usual-ui/artifacts/package-smoke.json`. npm reports missing optional peers
as empty tree entries; the smoke check distinguishes these from installed packages
and additionally verifies module resolution from the installed adapter fails.

## Running and remaining acceptance

Source development uses `npm ci`, `npm run typecheck`, `npm run build`, and
`npm test`. Ordinary static users need no policy migration or new configuration.
No environment variables, database migration, or hosted service are introduced.

Rendered users install the two pinned optional peers and supply an explicit
runtime policy to their existing Playwright tests. See [runtime setup](../../runtime.md)
and [numeric rule setup](../../numeric-rules.md). Runtime examples are type-checked
and packaged but deliberately excluded from `npm test`.

Browser/visual acceptance, including the real positive/negative matrix and
entered dialog, remains unperformed under the user's standing no-browser
instruction. The adapter is locally implemented, not browser-accepted. No npm
publication, deployment, push, or remote CI verification was performed.
