import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Layout } from '../src/components/Layout';
import { Blog } from '../src/pages/Blog';
import type { Post } from './content';

export function renderBlog(posts: Post[], styles: string[], post?: Post): string {
  const title = post ? `${post.title} — Usual UI` : 'Blog — Usual UI';
  const description =
    post?.description ??
    'Notes on design consistency, coding agents, and the everyday craft of building software.';
  const page = createElement(
    'html',
    { lang: 'en' },
    createElement(
      'head',
      null,
      createElement('meta', { charSet: 'utf-8' }),
      createElement('meta', { name: 'viewport', content: 'width=device-width, initial-scale=1' }),
      createElement('meta', { name: 'description', content: description }),
      createElement('meta', { name: 'robots', content: 'noindex, nofollow' }),
      createElement('meta', { name: 'theme-color', content: '#f5f2e9' }),
      createElement('meta', { property: 'og:title', content: title }),
      createElement('meta', { property: 'og:description', content: description }),
      createElement('meta', { property: 'og:type', content: post ? 'article' : 'website' }),
      post
        ? createElement('meta', { property: 'article:published_time', content: post.date })
        : null,
      createElement('link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }),
      ...styles.map((href) => createElement('link', { key: href, rel: 'stylesheet', href })),
      createElement('title', null, title),
    ),
    createElement(
      'body',
      null,
      createElement(Layout, {
        page: 'blog',
        children: createElement(
          Blog,
          { posts, post },
          post ? createElement('div', { dangerouslySetInnerHTML: { __html: post.html } }) : null,
        ),
      }),
    ),
  );
  return `<!doctype html>\n${renderToStaticMarkup(page)}`;
}
