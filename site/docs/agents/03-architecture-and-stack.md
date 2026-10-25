# Usual Labs site: architecture and tooling

## Implemented today

Site package declares React 19 and Tailwind 4; root usual-ui package owns scripts, Vite and TypeScript tooling. vite.config.ts and blog/plugin.ts integrate static output. usual.design.json is this site’s design policy and docs/usual-ui holds audit artifacts.

Declared relevant versions: `react` `^19.0.0`, `tailwindcss` `^4.1.0`.

Manifests/lockfiles: `package.json`, `tsconfig.json`. Package manager: see build manifest / parent tooling.

No environment-variable references were found by the direct source-reference scan; check external host configuration separately.

Test source examples: `test/examples.test.ts`, `test/blog.test.ts`.

Build/CI source: `vite.config.ts`.

Commands/configuration describe available tooling, not successful execution. No builds, tests, migrations or provider calls were run for this documentation change.

Source anchors: `src/App.tsx`, `src/pages/Design.tsx`, `src/pages/Docs.tsx`, `src/components/Layout.tsx`, `blog/content.ts`, `blog/plugin.ts`, `blog/render.ts`, `vite.config.ts`.
