# Usual Labs site: conventions and ownership

## Implemented today

Use src/pages for page content, src/components for reusable site UI, and content/blog for Markdown posts. Blog metadata accepts only title, description, date and draft; dates must be quoted valid YYYY-MM-DD strings.

Preserve the source patterns at the anchors below. Treat placeholder/sample data as such; do not convert it to a product guarantee. Keep secrets out of client bundles and documentation.

## Maintenance rule

Changes belong in their existing owning module. Add a top-level abstraction only when the current structure cannot clearly own the behavior; update this KB in the same turn.

Source anchors: `src/App.tsx`, `src/pages/Design.tsx`, `src/pages/Docs.tsx`, `src/components/Layout.tsx`, `blog/content.ts`, `blog/plugin.ts`, `blog/render.ts`, `vite.config.ts`.
