# Usual Labs site: practical source map

## Implemented today

- `src/App.tsx` — route selection
- `src/pages/Design.tsx` — design product page
- `src/pages/Docs.tsx` — documentation page
- `ui/` — canonical product and documentation HTML entry points
- `design/` — compatible entry points for links from before the rename
- `src/components/Layout.tsx` — shared shell
- `blog/content.ts` — post validation
- `blog/plugin.ts` — build integration
- `blog/render.ts` — static renderer
- `vite.config.ts` — build config

No local database schema/migration files were found in this layer; that does not imply dependencies or remote systems lack persistence.

Build output, dependencies and caches are not source owners. Do not introduce assumed API, jobs, migrations or shared-package folders merely because another product has them. Put new behavior next to the relevant source owner above; update the map when introducing a necessary new boundary.
