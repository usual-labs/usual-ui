import { resolve } from 'node:path';
import type { Plugin } from 'vite';
import { readPosts } from './content';
import { renderBlog } from './render';

export function blogPages(root: string): Plugin {
  const contentDirectory = resolve(root, 'content/blog');
  return {
    name: 'markdown-blog',
    configureServer(server) {
      server.watcher.add(contentDirectory);
      server.middlewares.use((request, response, next) => {
        const path = new URL(request.url ?? '/', 'http://localhost').pathname;
        if (path !== '/blog' && !path.startsWith('/blog/')) return next();
        try {
          const posts = readPosts(contentDirectory);
          const slug = path.replace(/^\/blog\/?/, '').replace(/\/$/, '');
          const post = posts.find((entry) => entry.slug === slug);
          if (slug && !post) {
            response.statusCode = 404;
            response.end('Post not found');
            return;
          }
          response.setHeader('Content-Type', 'text/html; charset=utf-8');
          response.end(renderBlog(posts, ['/src/style.css'], post));
        } catch (error) {
          next(error);
        }
      });
    },
    generateBundle(_options, bundle) {
      const posts = readPosts(contentDirectory);
      const styles = Object.keys(bundle)
        .filter((file) => file.endsWith('.css'))
        .map((file) => `/${file}`);
      this.emitFile({
        type: 'asset',
        fileName: 'blog/index.html',
        source: renderBlog(posts, styles),
      });
      for (const post of posts) {
        this.emitFile({
          type: 'asset',
          fileName: `blog/${post.slug}/index.html`,
          source: renderBlog(posts, styles, post),
        });
      }
    },
  };
}
