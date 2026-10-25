import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { parsePost, readPosts } from '../blog/content';
import { renderBlog } from '../blog/render';
import { blogPages } from '../blog/plugin';

const article = (fields = '', body = '## A heading\n\nA **useful** note.') => `---
title: "A useful note"
description: "A short summary"
date: "2026-10-20"
${fields}---
${body}
`;

test('Markdown produces semantic content without executable HTML or unsafe URLs', () => {
  const post = parsePost(
    'useful-note.md',
    article(
      '',
      `## A heading

A **useful** note and [documentation](/ui/docs/).

<script>alert('no')</script>

[bad](javascript:alert(1))

![bad](data:text/html;base64,AAAA)

| Rule | Value |
| --- | --- |
| Spacing | 4 |

\`\`\`js
const ok = true;
\`\`\`
`,
    ),
  );
  assert.match(post.html, /<h2>A heading<\/h2>/);
  assert.match(post.html, /<strong>useful<\/strong>/);
  assert.match(post.html, /href="\/ui\/docs\/"/);
  assert.match(post.html, /<table>/);
  assert.match(post.html, /class="language-js"/);
  assert.doesNotMatch(post.html, /<script|href="javascript:|src="data:/);
  assert.match(post.html, /&lt;script&gt;/);
});

test('invalid metadata fails at the collection boundary', () => {
  for (const source of [
    article().replace('title: "A useful note"', 'title: 12'),
    article().replace('date: "2026-10-20"', 'date: "2026-02-31"'),
    article().replace('date: "2026-10-20"', 'date: 2026-02-31'),
    article().replace('description: "A short summary"', ''),
    article('draft: "false"\n'),
    '---javascript\n({ title: "never execute" })\n---\nBody',
    article('drafft: true\n'),
    article('', ''),
  ])
    assert.throws(() => parsePost('valid-slug.md', source));
  assert.throws(() => parsePost('Invalid_slug.md', article()));
});

test('file discovery orders published posts, excludes drafts and future dates, and needs no registry', () => {
  const directory = mkdtempSync(join(tmpdir(), 'usual-blog-'));
  try {
    writeFileSync(join(directory, 'older.md'), article());
    writeFileSync(join(directory, 'newer.md'), article().replace('2026-10-20', '2026-10-21'));
    writeFileSync(join(directory, 'draft.md'), article('draft: true\n'));
    writeFileSync(join(directory, 'future.md'), article().replace('2026-10-20', '2099-01-01'));
    writeFileSync(join(directory, 'README.md'), 'Author instructions, not a post.');
    const posts = readPosts(directory, new Date('2026-10-23T12:00:00Z'));
    assert.deepEqual(
      posts.map((post) => post.slug),
      ['newer', 'older'],
    );
    const index = renderBlog(posts, ['/assets/site.css']);
    assert.match(index, /href="\/blog\/newer\/"/);
    assert.doesNotMatch(index, /href="\/blog\/(draft|future)\//);
    const page = renderBlog(posts, ['/assets/site.css'], posts[0]);
    assert.match(page, /<h1[^>]*>A useful note<\/h1>/);
    assert.match(page, /<h2>A heading<\/h2>/);
    assert.match(page, /href="\/assets\/site.css"/);
    assert.match(page, /aria-current="page"/);
    assert.match(page, /name="robots" content="noindex, nofollow"/);
    assert.doesNotMatch(page, /<script/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('metadata is escaped and an empty collection stays useful', () => {
  const post = parsePost('safe.md', article().replace('A useful note', '<script>bad</script>'));
  const page = renderBlog([post], [], post);
  assert.doesNotMatch(page, /<script>/);
  assert.match(page, /&lt;script&gt;bad&lt;\/script&gt;/);
  assert.match(renderBlog([], []), /No posts yet/);
});

test('the build plugin emits a route for each published file and no draft route', () => {
  const root = mkdtempSync(join(tmpdir(), 'usual-blog-build-'));
  const content = join(root, 'content/blog');
  mkdirSync(content, { recursive: true });
  try {
    writeFileSync(join(content, 'first-post.md'), article().replace('2026-10-20', '2020-01-01'));
    writeFileSync(join(content, 'hidden.md'), article('draft: true\n'));
    const emitted: { fileName: string; source: string }[] = [];
    const hook = blogPages(root).generateBundle;
    assert.equal(typeof hook, 'function');
    if (typeof hook !== 'function') throw new Error('Missing build hook');
    hook.call(
      { emitFile: (asset: { fileName: string; source: string }) => emitted.push(asset) } as never,
      {} as never,
      { 'assets/site.css': {} } as never,
      false,
    );
    assert.deepEqual(
      emitted.map((asset) => asset.fileName),
      ['blog/index.html', 'blog/first-post/index.html'],
    );
    assert.match(emitted[1].source, /<h2>A heading<\/h2>/);
    assert.match(emitted[1].source, /href="\/assets\/site.css"/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
