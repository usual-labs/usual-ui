# Blog publishing

The Usual Labs site is the marketing/docs/blog surface for Usual UI. Read
[the authoring contract](../../content/blog/README.md),
[site README](../../README.md), and the repository's
[product/CLI overview](../../../docs/agents/cli-and-runtime.md) before writing.

## Reader, claims and CTA

The primary reader is a developer or team maintaining UI consistency while using
coding agents. Demonstrate a specific problem, such as unreviewed utility classes
or drifting spacing, and show how a project-owned design manifest, audit, review
and activation make the intended rules explicit. An article should teach useful
steps even before the reader adopts the tool, then link to `/ui/docs/` as the
single clear next step. Use source-backed examples from `src/cli.ts`, `schema/`,
`docs/usage.md` and the current site docs page. Check examples against the version
readers can actually install before implying they work in the published package.

The CLI is `usual-ui`, npm package `@usualui/lint`. Manifest rules and active
categories govern static checking; an audit reports drafted categories while
`check` enforces active ones. Do not promise that source analysis proves rendered
appearance, accessibility, business results or universal framework coverage.
Optional runtime auditing and local unreleased edits must not be advertised as
released without checking registry/current release evidence. Do not invent
customers, saved-time metrics or examples said to come from real projects.

Write one focused original article: audience/problem, worked example, practical
steps, limitations and CTA. Use `##` headings, descriptive links/alt text, and
sources for external claims. Reuse the site's typography/layout; an image is
optional. No paid generation, customer data, analytics or signup service is needed.

## Author, validate and retain a reviewable artifact

Use Node `>=22.12.0` and the root pinned npm. Run from the repository root:

```sh
git status --short
git remote -v
git fetch origin
git log -1 --format='%H %s' origin/main
npm ci
npm run test:site
npx tsc --project site/tsconfig.json
npx vite build --config site/vite.config.ts
```

The recorded remote is `https://github.com/usual-labs/usual-ui.git`, default
branch `main`; verify current provider state before releasing. The October 23
local tree had unrelated CLI/wizard changes and uncommitted blog prerequisites.
Use a current clean release checkout and apply only the reviewed site/blog
prerequisites, KB and article; do not reset or publish the whole working tree.
Confirm `site/blog/`, `site/src/pages/Blog.tsx`, the Layout navigation, Vite plugin,
content tests, lockfile dependencies and site TypeScript config are present in the
release checkout. `dist/site` is generated output, not the authoring source.

Add `site/content/blog/<slug>.md` with required `title`, `description`, quoted
`date: "YYYY-MM-DD"` and initially `draft: true`. Filename is the URL slug. Once
reviewed for factual claims, examples, CTA and private data, set `draft: false`
for the authorized test and rerun checks. Unknown metadata is rejected; future
UTC dates and drafts are excluded. Dates do not schedule a deployment. Inspect
`dist/site/blog/<slug>/index.html` and `dist/site/blog/index.html` for the title,
article, link and escaped HTML. A successful static build is not publication.

For an explicit scoped source commit, substitute the actual slug and branch:

```sh
git diff --check
git add -- 'site/content/blog/<slug>.md'
git diff --cached --stat
git diff --cached --check
git diff --cached -- 'site/content/blog/<slug>.md'
git commit -m 'content: add <topic>'
git push -u origin HEAD
```

Stage reviewed prerequisites and KB explicitly when required, never `git add .`.
Check GitHub CI for the exact SHA using `gh run list --commit <sha>` / `gh run view
<run-id>`. The npm publishing workflow is **not a website deployment**; do not
create a package release/tag or invoke `npm publish` to publish a blog article.

## Current public-release dependency

Source inspection on October 23 found no website deployment workflow, provider
configuration or verified production URL. `usual.dev` in the site README is an
intended hostname, not a verified owned target. Current HTML deliberately includes
`noindex,nofollow`; `site/public/robots.txt` disallows crawlers; the shared Layout
shows a development-preview banner. Article HTML has no verified canonical host
or sitemap. Do not report a generated `dist/site` file as a public post or quietly
claim this preview is a launched marketing website.

The October 23 user request gives the owning agent finite authority to generate
and publish one marketing test post. Record that instruction in its own workspace
and use it instead of treating older approval prose as a new approval gate. A
missing provider/domain mapping is an access/target dependency, not an article
review rejection. Check existing authenticated hosting/DNS tools for a previously
configured site and read its actual project/domain/Git mapping. Do not register a
domain, incur spending, deploy a new unrelated application, or invent a hostname.

Once an existing authorized website target is verified, replace this dependency
section with provider-specific commands and record: project and account **names**,
production origin and branch, build `npx vite build --config site/vite.config.ts`,
publish directory `dist/site`, directory-index routing, credential **names**,
previous immutable artifact/deployment and rollback command. No server runtime,
DB migration or app environment variable is needed for this static website. Keep
provider tokens private. If a real target cannot be established, retain the
validated post/patch and report publication blocked with that precise reason.

Changing preview branding/indexing is a website launch change, not a prerequisite
for merely testing an existing authorized preview deployment. Do not remove those
markers or manufacture canonical/sitemap URLs without verifying the target and
that launch scope. The current finite request does not settle domain ownership.

## Verify and recover after a verified host is available

Publish the complete generated `dist/site` atomically through that host's normal
release workflow. Capture its deployment receipt and source commit. HTTP-check
`<verified-origin>/blog/`, `/blog/<slug>/`, each CTA/image, title/body and final
URL. Confirm actual HTML content, not only status 200 or a generic fallback. Use
HTTP only; browser testing is not authorized. A public preview test must be
reported as a preview, with its crawler exclusions stated.

For withdrawal set the post back to `draft: true`, build and redeploy, then verify
listing removal and the route's missing-page behavior. For an outage restore the
previous immutable site artifact through the provider's recorded mechanism after
checking no unrelated release would be lost. Never reset shared Git history.
Retain the agent's audience/hypothesis, source checks, final post path, SHA, provider
receipt, live URL/HTTP evidence and any blocker in its workspace, then finish its
claim. Publishing is not proof of indexing, traffic or acquisition.
