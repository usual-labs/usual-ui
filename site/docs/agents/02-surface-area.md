# Usual Labs site: user and caller surface

## Implemented today

src/App.tsx routes /ui/docs to Docs, /ui to Design and other client paths to Labs. The old /design and /design/docs routes remain compatible entry points; navigation uses /ui. Vite builds HTML for both generations. Blog build utilities parse Markdown posts, validate restricted frontmatter, filter drafts/future posts and sort by date. Markdown raw HTML and linkify are disabled; blog plugin/render files own generated output. No runtime account/database is present here.



Source anchors: `src/App.tsx`, `src/pages/Design.tsx`, `src/pages/Docs.tsx`, `src/components/Layout.tsx`, `blog/content.ts`, `blog/plugin.ts`, `blog/render.ts`, `vite.config.ts`.
