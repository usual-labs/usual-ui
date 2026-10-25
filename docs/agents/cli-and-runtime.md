# Usual UI: cli and runtime

## Implemented today

Canonical identity: Usual UI, binary `usual-ui`, repository `usual-labs/usual-ui`.
The npm package remains `@usualui/lint`, default policy `usual.design.json`, and
script `lint:design`. `usual-design` is retained as a binary alias. New records
use `docs/usual-ui/`; setup/artifacts use `.usual-ui/`; bundled skills use
`usual-ui` and `usual-ui-onboarding`. See [upgrade notes](../renaming.md).
The rename is a source change awaiting a new npm release.

Verified locally on 25 October 2026: 215 tests (169 core, 37 wizard, 9 site),
typecheck, formatting, core/wizard/site production builds, packed installation,
and a read-only site audit (15 files, no findings or errors). The package smoke
check exercised both binary names and the renamed skill assets; its ignored
receipt is `.usual-ui/artifacts/package-smoke.json`. Tests include legacy audit
refresh/manual-note protection and refusal to duplicate legacy agent setup.
Site route checks used server rendering, with no browser execution. GitHub
metadata verified repository ID 1426910908 at `usual-labs/usual-ui`; local origin
matches. Source changes remain uncommitted; no npm publication, website deployment
or new CI verification was performed.

src/cli.ts exposes init, onboard, validate, audit, check, wizard, plan, verify-plan, activate, setup and hook. Mutating modes require their explicit --write/--save flags. Exit codes: 0 clean, 1 findings/unverifiable coverage, 2 configuration/operational error. init previews discovery by default; wizard starts a local server without opening a browser. src/playwright.ts requires complete runtime choices, state and theme; optional lintapple and Playwright dependencies must match the supported versions. No browser execution was performed for this KB.

Source anchors: `package.json`, `src/cli.ts`, `src/project.ts`, `src/config.ts`, `src/records.ts`, `src/playwright.ts`.
