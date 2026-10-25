import { useId, useRef, useState, type ReactNode } from 'react';

export function BusinessShell({
  title,
  sections,
  active,
  onChange,
  children,
}: {
  title: string;
  sections: readonly string[];
  active: string;
  onChange: (section: string) => void;
  children: ReactNode;
}) {
  const id = useId();
  const search = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const matches = sections.filter((section) =>
    section.toLowerCase().includes(query.toLowerCase().trim()),
  );
  function choose(section: string, fromSearch = false) {
    onChange(section);
    setQuery('');
    if (fromSearch) search.current?.focus();
  }
  return (
    <div className="biz-shell">
      <aside className="biz-sidebar" aria-label={`${title} workspace`}>
        <div className="biz-workspace-brand">
          <span className="biz-workspace-logo" aria-hidden="true">
            s
          </span>
          <div>
            <strong>Studio North</strong>
            <span>Team workspace</span>
          </div>
        </div>
        <span className="biz-nav-caption">WORKSPACE</span>
        <nav aria-label={`${title} sections`}>
          {sections.map((section, index) => (
            <button
              type="button"
              className="biz-nav-item"
              key={section}
              aria-current={active === section ? 'page' : undefined}
              onClick={() => choose(section)}
            >
              <span className="biz-nav-symbol" aria-hidden="true">
                {['▦', '◷', '▤'][index % 3]}
              </span>
              {section}
              {index === 0 && <span className="biz-nav-dot" aria-hidden="true" />}
            </button>
          ))}
        </nav>
        <div className="biz-sidebar-bottom">
          <div className="biz-workspace-note">
            <strong>Made for your team</strong>
            <span>One place for the work that matters.</span>
            <div className="biz-mini-avatars" aria-hidden="true">
              <span>MC</span>
              <span>OR</span>
              <span>AL</span>
              <span>+2</span>
            </div>
          </div>
          <div className="biz-profile">
            <span className="biz-avatar" aria-hidden="true">
              AL
            </span>
            <div>
              <strong>Alex Lee</strong>
              <span>Studio administrator</span>
            </div>
          </div>
        </div>
      </aside>
      <div className="biz-shell-main">
        <header className="biz-app-toolbar">
          <div className="biz-breadcrumb">
            <span>{title}</span>
            <span aria-hidden="true">/</span>
            <strong>{active}</strong>
          </div>
          <div className="biz-section-search">
            <label className="sr-only" htmlFor={id}>
              Find a {title.toLowerCase()} section
            </label>
            <input
              id={id}
              ref={search}
              type="search"
              placeholder="Find a section…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape' && query) {
                  event.preventDefault();
                  setQuery('');
                }
              }}
            />
            {query.trim() && (
              <div className="biz-section-results" aria-label="Matching sections">
                {matches.length ? (
                  matches.map((section) => (
                    <button type="button" key={section} onClick={() => choose(section, true)}>
                      {section}
                      <span aria-hidden="true">↗</span>
                    </button>
                  ))
                ) : (
                  <p role="status">No matching section</p>
                )}
              </div>
            )}
          </div>
          <span className="biz-toolbar-avatar" aria-hidden="true">
            AL
          </span>
        </header>
        <div className="biz-shell-content" key={active}>
          {children}
        </div>
        <footer className="biz-app-footer">
          <span>Studio North</span>
          <span>Fictional workspace · Preview only</span>
        </footer>
      </div>
    </div>
  );
}

const trends = [
  '0,28 12,23 24,26 36,16 48,20 60,11 72,13 84,3',
  '0,28 12,30 24,21 36,24 48,15 60,17 72,8 84,3',
  '0,26 12,22 24,24 36,17 48,14 60,17 72,8 84,5',
];

export function BusinessMetric({
  label,
  value,
  note,
  trend = 0,
}: {
  label: string;
  value: string;
  note: string;
  trend?: number;
}) {
  return (
    <section className="sample-card biz-metric">
      <div className="biz-metric-top">
        <span className="biz-label">{label}</span>
        <span className="biz-metric-symbol" aria-hidden="true">
          ↗
        </span>
      </div>
      <div className="biz-metric-value">
        <strong>{value}</strong>
        <svg className="biz-sparkline" viewBox="0 0 84 34" aria-hidden="true">
          <polyline
            points={trends[trend % trends.length]}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <span className="biz-note">{note}</span>
    </section>
  );
}

export const businessMoney = (value: number) => `$${value.toLocaleString('en-US')}`;
