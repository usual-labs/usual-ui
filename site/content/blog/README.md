# Blog authoring

Add a Markdown file named `lowercase-post-slug.md` here. The filename becomes
`/blog/lowercase-post-slug/`; no registry or route edit is needed. `README.md` is
not an article. Use this frontmatter:

```md
---
title: "A concrete article title"
description: "A short summary for the listing and page metadata."
date: "2026-10-23"
draft: true
---

Write the article in Markdown. Start sections at `##` because the page already
renders the title as its heading.
```

`title`, `description`, and a quoted, real `YYYY-MM-DD` date are required. Unknown fields,
invalid slugs, empty bodies and invalid metadata fail the build. `draft` is
optional and defaults to false. Drafts and future-dated articles are excluded
from both dev and built output. Set `draft: false` only when the article is ready
for its authorized release. Dates use UTC; a future article appears on the next
build after its date, not from a scheduled runtime job.

The renderer supports headings, emphasis, links, images, lists, quotes, fenced
code and tables. Raw HTML is escaped, unsafe link protocols are rejected, and MDX
is unsupported. Put images in `site/public/images/blog/` and use `/images/blog/image-name.webp`
paths with descriptive alt text. An HTML file, script or React component in this
folder is not a post.

From the repository root:

```sh
npm run dev:site
npx tsc --project site/tsconfig.json
npm run test:site
npx vite build --config site/vite.config.ts
```

Refresh `/blog/` after editing. The build creates `dist/site/blog/index.html` and
one static `index.html` per published post, with the shared navigation/theme and
article metadata. Blog pages work without JavaScript. Deploy the complete
`dist/site` directory through the site's separately authorized release flow.
Dropping a file changes the next build; it does not by itself deploy the site.

This website is still a development preview. Its existing banner, robots
exclusion and `noindex,nofollow` metadata are preserved. Production hostname,
canonical URLs and sitemap belong to the eventual site launch, not an invented
domain. No environment variables, CMS, database or server runtime are needed.

For product claims, release isolation, provider prerequisites, live checks and rollback, follow the [blog publishing runbook](../../docs/agents/blog-publishing.md).
