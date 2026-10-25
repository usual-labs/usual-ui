# Usual UI: cross-project known issues

## Implemented today

Legacy setup uses owned paths and hashes under `.usual-design/` and legacy
instruction/hook markers. Installing renamed integrations alongside it could
duplicate hooks or bypass user edits. Setup reports a conflict before applying
such a plan; follow [upgrade notes](../renaming.md). Generated audit Markdown in
either brand is accepted only when it exactly matches the saved audit; manual
notes remain protected. Historical generated directories stay excluded from
source analysis. Do not equate local checks with deployment or publication.

For new issues record symptom → source-supported cause → verified fix or explicitly unverified recommendation → prevention and status.

## GitHub protections and security checks (set 2026-10-25)

- The repository settings, rulesets and workflows match usual-bot's; `docs/maintaining.md`
  lists them. Gotchas: the CI job keeps `name: verify` because that is the required status check
  on `main` (renaming it means updating the "main: pull requests and CI" ruleset); every action
  must be pinned to a full commit SHA or the run fails (`sha_pinning_required`); a new third-party
  action must be added to the repository's Actions allow-list; `publish.yml` deliberately has no
  npm cache and an exact `npm@11.5.1` install (zizmor `adhoc-packages` ignored inline).
