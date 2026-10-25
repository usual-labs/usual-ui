`docs/agents/` is this layer's persistent agent memory and authoritative maintained reference for how this code behaves; code is the source of truth.

## Knowledge index

- [01-workspace-overview.md](docs/agents/01-workspace-overview.md) — Usual UI: workspace overview.
- [02-project-map.md](docs/agents/02-project-map.md) — Usual UI: project routing map.
- [03-cross-project-architecture.md](docs/agents/03-cross-project-architecture.md) — Usual UI: cross-project architecture.
- [04-workspace-conventions.md](docs/agents/04-workspace-conventions.md) — Usual UI: shared conventions.
- [05-workspace-structure.md](docs/agents/05-workspace-structure.md) — Usual UI: workspace structure.
- [cli-and-runtime.md](docs/agents/cli-and-runtime.md) — Usual UI: cli and runtime.
- [design-system.md](docs/agents/design-system.md) — Usual UI: design system.
- [improvement-ideas.md](docs/agents/improvement-ideas.md) — Usual UI: cross-project improvement ideas.
- [known-issues.md](docs/agents/known-issues.md) — Usual UI: cross-project known issues.

## Operating protocol

- BEFORE thinking about or making ANY change, read the relevant `docs/agents/` files and always skim `known-issues.md`.
- Start with `02-project-map.md`, then read the target child project’s `AGENTS.md` and KB before touching it.
- AFTER any change or new learning, update the relevant KB files in the SAME turn before finishing. Record non-obvious bugs and gotchas in `known-issues.md`; deferred improvements in `improvement-ideas.md`; behavior, architecture, structure and conventions in the matching state file. Rewrite stale state rather than appending history.
- Update workspace KBs only when relationships, boundaries, project routing or shared conventions change.
- Code is the source of truth. If code and the KB disagree, fix the KB. Distinguish implemented behavior from planned/aspirational intent, and source evidence from runtime verification.
- Triggers: changed product behavior, architectural boundary, folder convention, tooling, UI direction, added/removed cross-project link, debugged issue or spotted improvement.
- Do not run browser tests unless explicitly requested. Keep changes focused, use YAGNI, and keep files below 500 lines where practical. Report meaningful behavior/setup/deployment changes after implementation.
