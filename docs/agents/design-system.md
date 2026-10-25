# Usual UI: design system

## Implemented today

The wizard’s React components and CSS live under wizard/src. GuidedOnboarding, ThemeInspector, AuditBoard and PreviewExport are feature owners; src/server.ts owns the local wizard API. The public site has its own child KB and design manifest; it does not define every target project’s visual policy.

Source anchors: `package.json`, `src/cli.ts`, `src/project.ts`, `src/config.ts`, `src/records.ts`, `src/playwright.ts`.
