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
