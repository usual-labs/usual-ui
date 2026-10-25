import { readdirSync, readFileSync } from 'node:fs';
import { join, basename } from 'node:path';
import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';

import type { Post } from '../src/blog-types';
export type { Post } from '../src/blog-types';

// Markdown is content, never executable HTML or MDX. The parser also rejects
// unsafe link protocols (javascript:, data:, vbscript: and their encodings).
const markdown = new MarkdownIt({ html: false, linkify: false });
const allowedFields = new Set(['title', 'description', 'date', 'draft']);

export function parsePost(filename: string, source: string): Post {
  const slug = basename(filename, '.md');
  const fail = (message: string): never => {
    throw new Error(`${filename}: ${message}`);
  };
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) fail('Use a lowercase, hyphenated filename.');
  // gray-matter supports language-tagged engines, including JavaScript. Never
  // dispatch to those engines: a post must begin with bare YAML frontmatter.
  if (!/^---\r?\n/.test(source)) fail('Start with a bare --- YAML frontmatter delimiter.');
  const { data, content } = matter(source);
  for (const key of Object.keys(data)) {
    if (!allowedFields.has(key)) fail(`Unknown frontmatter field: ${key}`);
  }
  const text = (field: string): string => {
    const value: unknown = data[field];
    if (typeof value !== 'string' || !value.trim())
      return fail(`${field} must be a nonempty string.`);
    return value.trim();
  };
  const date: unknown = data.date;
  if (
    typeof date !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    Number.isNaN(Date.parse(date)) ||
    new Date(date).toISOString().slice(0, 10) !== date
  ) {
    return fail('date must be a quoted, real calendar date in YYYY-MM-DD format.');
  }
  if (data.draft !== undefined && typeof data.draft !== 'boolean')
    fail('draft must be true or false.');
  if (!content.trim()) fail('Post body must not be empty.');
  return {
    slug,
    title: text('title'),
    description: text('description'),
    date,
    draft: data.draft ?? false,
    html: markdown.render(content),
  };
}

export function readPosts(directory: string, now = new Date()): Post[] {
  const today = now.toISOString().slice(0, 10);
  return readdirSync(directory, { withFileTypes: true })
    .filter((file) => file.isFile() && file.name.endsWith('.md') && file.name !== 'README.md')
    .map((file) => parsePost(file.name, readFileSync(join(directory, file.name), 'utf8')))
    .filter((post) => !post.draft && post.date <= today)
    .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}
