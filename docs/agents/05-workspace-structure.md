# Usual UI: workspace structure

## Implemented today

- `site/` — Usual Labs marketing/docs/blog site

- `package.json` — package exports and build orchestration
- `src/cli.ts` — commands and flags
- `src/project.ts` — source analysis/evaluation
- `src/config.ts` — manifest loading/validation
- `src/records.ts` — audit/plan/activation records
- `src/playwright.ts` — optional prepared-page audit API
- `wizard` — local visual review UI
- `schema` — manifest/onboarding schemas
- `skills/usual-ui` and `skills/usual-ui-onboarding` — packaged agent guidance
- `.usual-ui/` — ignored setup and build artifacts; historical `.usual-design/` archives stay intact
- `test` — core tests
- `docs/maintaining.md` — maintenance reference

Do not treat generated copies, dependencies, fixtures, archives or sample snippets as independent shipped products. Their semantics remain with their owning source project.
