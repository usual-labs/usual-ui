import React, { type ReactNode } from 'react';
import type { Post } from '../blog-types';

function PostDate({ date }: { date: string }) {
  return (
    <time dateTime={date} className="font-mono text-xs text-muted">
      {new Date(`${date}T00:00:00Z`).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      })}
    </time>
  );
}

export function Blog({
  posts,
  post,
  children,
}: {
  posts: Post[];
  post?: Post;
  children?: ReactNode;
}) {
  return (
    <section className="mx-auto max-w-3xl px-6 pb-16 pt-16">
      {post ? (
        <article>
          <a href="/blog/" className="text-sm text-accent hover:underline">
            ← All posts
          </a>
          <header className="mb-10 mt-8">
            <PostDate date={post.date} />
            <h1 className="mt-4 text-title font-semibold tracking-tight">{post.title}</h1>
            <p className="mt-6 text-xl leading-relaxed text-muted">{post.description}</p>
          </header>
          <div className="text-lg leading-relaxed [&>div]:space-y-6 [&_h1]:mt-8 [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:mt-8 [&_h3]:text-xl [&_h3]:font-semibold [&_h4]:font-semibold [&_a]:text-accent [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mt-2 [&_blockquote]:border-l [&_blockquote]:border-line [&_blockquote]:pl-8 [&_blockquote]:text-muted [&_code]:font-mono [&_code]:text-sm [&_pre]:overflow-x-auto [&_pre]:rounded-panel [&_pre]:bg-code [&_pre]:p-6 [&_pre]:text-code-ink [&_table]:block [&_table]:overflow-x-auto [&_th]:border [&_th]:border-line [&_th]:px-4 [&_th]:py-2 [&_td]:border [&_td]:border-line [&_td]:px-4 [&_td]:py-2 [&_hr]:border-line">
            {children}
          </div>
          <footer className="mt-8 border-t border-line pt-5 text-sm">
            <a href="/ui/" className="text-accent hover:underline">
              Explore Usual UI →
            </a>
          </footer>
        </article>
      ) : (
        <>
          <p className="mb-6 font-mono text-xs uppercase tracking-widest text-accent">Usual UI</p>
          <h1 className="text-title font-semibold tracking-tight">From the workshop.</h1>
          <p className="mt-6 text-xl leading-relaxed text-muted">
            Notes on design consistency, coding agents, and the everyday craft of building software.
          </p>
          {posts.length ? (
            <ul className="mt-8">
              {posts.map((entry) => (
                <li key={entry.slug} className="border-t border-line py-8">
                  <PostDate date={entry.date} />
                  <h2 className="mt-3 text-2xl font-medium tracking-tight">
                    <a href={`/blog/${entry.slug}/`} className="hover:text-accent">
                      {entry.title}
                    </a>
                  </h2>
                  <p className="mt-3 leading-relaxed text-muted">{entry.description}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-8 border-t border-line pt-5 text-muted">
              No posts yet. More from the workshop soon.
            </p>
          )}
        </>
      )}
    </section>
  );
}
