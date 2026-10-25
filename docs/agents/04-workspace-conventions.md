# Usual UI: shared conventions

## Implemented today

Node >=22.12.0 and npm@10.9.8 are declared in package.json. Root scripts build core/wizard/site and test each area. Keep static manifest authority and rendered evidence distinct. Fixtures, .usual-ui wizard previews and output artifacts are not child products. Preserve canonical docs/maintaining.md, docs/publishing.md, docs/runtime.md and docs/usage.md.

Keep local changes and backlogs in the owning child. Update this layer when shared contracts, tooling, routing, boundaries or dependency direction changes. Add a project only with a clear source/build owner and an AGENTS.md + docs/agents/ entry. Existing canonical reference documents remain authoritative for their detailed topics.
