# Usual UI naming and upgrades

The source checkout now uses **Usual UI**, repository `usual-labs/usual-ui`,
command `usual-ui`, and skills `usual-ui` and `usual-ui-onboarding`.
This rename is unreleased; npm `@usualui/lint@0.3.0` still exposes the old name.
Publish a new package version before asking registry users to run the new command.

The npm package remains `@usualui/lint`; imports, `usual.design.json`, manifest
version 1, and the `lint:design` npm script keep their existing contracts.
The old `usual-design` binary remains an alias in the next package so existing
scripts can continue checking the same policy. New instructions use `usual-ui`.

## Existing project records

New records live in `docs/usual-ui/`; new setup state and artifacts use `.usual-ui/`.
Keep existing records and historical archives. Before resuming an old project,
move `docs/usual-design/` to `docs/usual-ui/` only when the destination does not
exist. If both exist, preserve both and reconcile them manually; never overwrite
one tree with the other. Keep record contents and hashes intact. Old generated
audit Markdown is recognized, while manually edited audit notes remain protected.
Refresh the audit and approve current repairs after source changes; moving a
record or renaming a command does not renew a stale approval. `verify-plan`
accepts an explicit legacy record path and still checks the source and policy.
Both generations of generated directories remain excluded from source discovery.

## Existing agent setup

Setup refuses to add duplicate integrations when a legacy ownership registry,
instruction block or hook is present. Back up these project-local files first.
Review the files listed in `.usual-design/setup.json` and preserve all custom
edits. Remove only the reviewed old managed instruction blocks and hook entries,
retaining unrelated instructions, hooks and settings. Remove an old pre-commit
hook only after confirming it contains solely the generated Usual hook.
Archive the old managed skill folders and registry outside their active paths;
do not bulk-replace their contents or forge ownership hashes. Keep other
`.usual-design/` artifacts intact. Update an existing `lint:design` command to
`usual-ui check`, preserving any custom `--config` argument.

Preview `usual-ui setup --host codex` (or `claude`, `both`, `portable`), including
the same `--hooks`, `--commit-hook` and `--config` options previously selected.
Resolve reported conflicts, review the proposed changes, then rerun with
`--write`. Native hooks still require the host's usual trust review.

## Website and release

Current product links use `/ui/` and `/ui/docs/`. The build also includes the old
`/design/` and `/design/docs/` entry points, displaying the renamed product, so
existing links keep working. Publish the complete site output to carry all four
routes. No database migration or new environment variable is required.
Historical release receipts retain their original names and verification evidence.

GitHub's repository and this checkout's `origin` now use `usual-labs/usual-ui`
(verified 25 October 2026). Source edits are still local and uncommitted; the
renamed skill directories become remotely installable after those changes are
pushed. Before the next npm release, check that any configured trusted publisher
uses repository `usual-ui`, workflow `publish.yml`, environment `npm`; a GitHub
rename does not verify npm's external publisher configuration. See
[publishing](publishing.md) for the release procedure.
