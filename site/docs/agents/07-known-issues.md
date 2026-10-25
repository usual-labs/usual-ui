# Usual Labs site: known issues

## Implemented today: source-supported limitations

Open behavior boundary: invalid frontmatter fails parsing and draft/future posts are excluded → blog/content.ts intentionally validates and filters → fix metadata rather than bypassing validation → keep blog tests aligned.

Public blog publication is not configured in repository source: there is no website deployment workflow or verified production origin, and the existing preview deliberately blocks indexing. Follow [blog publishing](blog-publishing.md) to verify an existing provider/domain target; do not confuse npm publishing or generated HTML with website publication.
