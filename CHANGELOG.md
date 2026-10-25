# Changelog

## Unreleased

- Rename the product, repository, CLI, skills and generated paths to Usual UI / `usual-ui`. Keep the npm package, policy format and old CLI alias compatible; preserve old website entry points. See [upgrade notes](docs/renaming.md) for existing records and agent integrations.

- Add a wizard theme studio with bounded light/dark exploration, undo/redo, setup comparison, canvas sizing, and reference/request export; deepen application previews and component states while keeping exploration separate from approved project policy.
- Add a themed wizard preview gallery with Design system, Components, Dashboard, Mail, Chat, CRM, and Finance examples, local interactions, and a source switch that preserves the connected project showcase.
- Polish the wizard's seven-step onboarding and repair workspace with clearer choices, contextual previews, saved-progress feedback, concise policy disclosures, and responsive layouts; verify the example onboarding and selected-repair flow in a browser while preserving explicit policy approval and activation boundaries.
- Group repeated static diagnostics in CLI output and the wizard, with counts by kind/category/rule and structured repair guidance. JSON output adds a derived summary while retaining every finding ID and source location; saved audit and repair records keep their existing schema and approval boundaries.
- Recognize numeric typography utilities and separate text size, alignment, wrapping, and numeric feature conflicts. Add explicit numeric-cell semantic examples without introducing a global numeric policy.
- Add rendered before/after specimens to the website's existing examples, paired with source diagnostics and fixes. These are illustrative specimens, not live audit results.
- Add the optional `@usualui/lint/playwright` entry point for existing pages/frames, explicit runtime policy, scoped JSON attachments, and grouped failures/unresolved checks. It uses the published `lintapple@0.1.20` and `playwright@1.63.0` as optional peers; the reviewed upstream repository declares 0.1.23. Normal source checks remain independent of the browser stack.
- Include an opt-in light/dark, narrow/wide Playwright example. Browser acceptance remains unperformed; non-browser adapter tests do not establish rendered-engine accuracy.

These changes are available in the source checkout for the next release, not in the published `@usualui/lint@0.3.0` package. No source-policy migration or new environment variables are required. Rendered checks require the optional dependencies and the consumer's existing browser/test setup; see [the runtime guide](docs/runtime.md).

## 0.3.0 — 2026-10-20

- Rebuild the wizard around Manrope, white surfaces, square neutral panels, consistent spacing, and a full-screen control rail / preview layout. Give Usual its own restrained iris accent, lighter dividers, numbered navigation, and outlined wordmark.
- Add project-owned showcases that render actual components, fonts, type scales, and themes in the project's development server. A bounded browser bridge applies selected decisions without changing the lint manifest.
- Add an onboarding showcase guide and coverage checklist, plus connection failures, reload, and theme controls. Older proposals retain a labeled, expanded reference sheet.

## 0.2.0 — 2026-10-20

- Add a dedicated `usual-design-onboarding` skill, distributed through Vercel Skills from the public GitHub repository, with a researched role guide and validated proposal format.
- Add `onboard --proposal ... [--write]` to prepare source-backed recommendations and resumable choices without writing policy.
- Guide users through scope, colors, typography, spacing, shape, components, and review, with a live reference UI and explicit theme/preview limits.
- Compile approved choices into a minimal version 1 manifest; keep evidence, recommendations, and deferred categories in separate project records.
- Reject stale source/policy/session writes, protect existing contracts, and connect approved policy to the existing audit and selected-repair prompt.
- Make README/site quick starts prompt-first. Keep `init` human output concise; full discovery remains available with `--json`.
- Bundle both skills and supporting references in npm and project-local setup. The CLI command remains `usual-design`.

## 0.1.0 — 2026-10-20

- Set the npm package name to `@usualui/lint`, retain the `usual-design` executable, and prepare explicit GitHub Actions publishing with OIDC and provenance.
- Add a versioned project-owned manifest for approved values, explicit semantic rules, component replacement, and import restrictions.
- Add read-only full audit and active-category enforcement with human/JSON diagnostics.
- Analyze React JS/TS/JSX/TSX and Tailwind v4 source, finite class helpers, selected static CVA patterns, proven component aliases/reexports, contextual semantic classes, inline/CSS declarations, and explicit unknown coverage.
- Include bounded UTF-16 source spans/context, stable evidence IDs, strict immutable policy snapshots, exclusion reports, and reviewed exception-use summaries.
- Add a local visual wizard for tokenless observations, safe token/value specimens, component catalogs, unsaved draft-impact previews, policy review, repair selection, recheck, and activation.
- Save policy decisions, audit summaries, approved repair batches, deferred work, and fresh verification evidence in project documents; verify approved batch freshness with the read-only verify-plan command.
- Add project-local Codex/Claude skills, additive setup, bounded native hook adapters, optional commit checks, and CI examples.
- Add the Usual Labs / Usual Design static website and local documentation.

Published as `@usualui/lint@0.1.0`. Registry integrity matched the CI-verified archive, and a clean registry install passed CLI version/help checks. Website deployment, browser review, native-agent lifecycle acceptance, and external pilots remain separate gates. See the compatibility guide for supported boundaries.
