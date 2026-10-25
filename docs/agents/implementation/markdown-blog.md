# Markdown website blog

Implemented locally on 2026-10-23. The existing website now serves `/blog/` and
`/blog/<filename-slug>/` from `site/content/blog/*.md`, without a post registry.
[Authoring contract](../../../site/content/blog/README.md) owns metadata and checks.

The Vite plugin reads the collection in development and emits full static HTML at
build time. It reuses the site Layout and utility tokens. The article shell lives
in `site/src/pages/Blog.tsx`; build-only parsing and HTML insertion live in
`site/blog/`. The normal source design audit covers the shell; generated Markdown
has separate content/security tests. The existing design manifest is unchanged.

Frontmatter requires title, description and a quoted calendar date; draft and
future posts are excluded. Bare YAML delimiters are required before invoking the
parser so language-tagged executable engines cannot run. Raw HTML is escaped and
unsafe URL protocols are blocked by markdown-it. No client-side Markdown runtime,
CMS, account, analytics or environment variables were introduced.

The example post is an unpublished draft. The site's existing preview banner,
robots exclusions and noindex metadata remain. Hostname/canonicals/sitemap and
production publishing still belong to the separately authorized website launch.
The blog implementation does not establish hosting, browser acceptance, public
publication or growth results.

Local proof: site TypeScript, focused site tests, static build, zero-finding source
audit, and the existing isolated site dogfood test. No browser test or deployment.

The operational [publishing runbook](../../../site/docs/agents/blog-publishing.md) adds product claims, clean source release, provider discovery, HTTP acceptance and withdrawal. Hosting remains a dependency until live provider evidence establishes the target.
