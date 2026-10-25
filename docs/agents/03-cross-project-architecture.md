# Usual UI: cross-project architecture

## Implemented today

Root CLI uses config/manifest validation, source discovery, static analysis and rule evaluation. audit examines every category; check enforces active categories only. Wizard is bundled by root Vite config from wizard/; site is independently compiled using site/vite.config.ts. Optional ./playwright export audits a supplied prepared page/frame with explicit runtime policy; it does not launch browsers or auto-convert source policy.



Source anchors: `package.json`, `src/cli.ts`, `src/project.ts`, `src/config.ts`, `src/records.ts`, `src/playwright.ts`.
