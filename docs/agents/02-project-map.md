# Usual UI: project routing map

## Implemented today

| Project | Path | Responsibility / change here when | Boundary |
|---|---|---|---|
| site | [site](../../site/AGENTS.md) | Usual Labs marketing/docs/blog site | Separate source and manifest; root scripts build it |
| CLI and analysis engine | src/ | Commands, manifest validation, discovery, rule evaluation and audit/activation records | Root @usualui/lint package |
| Visual review wizard | wizard/ | Guided design review, theme preview and local wizard UI | Root package builds wizard; server API is src/server.ts |
| Schemas and integration skills | schema/ and skills/ | Manifest/onboarding JSON contracts and agent installation guidance | Keep CLI/schema/skill contracts synchronized |

Read the chosen child AGENTS.md and KB before editing. Child docs own detailed APIs and local conventions.
