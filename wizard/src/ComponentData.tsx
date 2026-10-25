import { useId, useState } from 'react';

export function ComponentProfile() {
  const id = useId();
  const [tab, setTab] = useState(0);
  const tabs = ['Overview', 'Activity'];
  return (
    <section className="sample-card component-card component-profile-card">
      <span className="component-eyebrow">03 / Profile</span>
      <div className="component-profile">
        <span className="component-avatar" aria-hidden="true">
          AL
        </span>
        <div>
          <h3>Alex Lee</h3>
          <p>Product designer · Studio North</p>
        </div>
      </div>
      <div className="component-profile-tags">
        <span className="component-status">Pro member</span>
        <span className="component-meta">Joined October 2024</span>
      </div>
      <div className="component-profile-tabs" role="tablist" aria-label="Example profile sections">
        {tabs.map((label, index) => (
          <button
            key={label}
            id={`${id}-tab-${index}`}
            type="button"
            role="tab"
            aria-selected={tab === index}
            aria-controls={`${id}-panel`}
            tabIndex={tab === index ? 0 : -1}
            className="sample-secondary"
            onClick={() => setTab(index)}
            onKeyDown={(event) => {
              const next =
                event.key === 'ArrowRight' || event.key === 'ArrowLeft'
                  ? 1 - index
                  : event.key === 'Home'
                    ? 0
                    : event.key === 'End'
                      ? 1
                      : null;
              if (next === null) return;
              event.preventDefault();
              setTab(next);
              document.getElementById(`${id}-tab-${next}`)?.focus();
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <div
        className="component-profile-panel"
        role="tabpanel"
        id={`${id}-panel`}
        aria-labelledby={`${id}-tab-${tab}`}
        tabIndex={0}
      >
        {tab === 0 ? (
          <>
            <dl className="component-profile-stats">
              <div>
                <dt>Projects</dt>
                <dd>12</dd>
              </div>
              <div>
                <dt>Teammates</dt>
                <dd>24</dd>
              </div>
              <div>
                <dt>Collections</dt>
                <dd>8</dd>
              </div>
            </dl>
            <p className="component-profile-bio">
              Making useful things feel simple. Focused on thoughtful details and collaborative
              design.
            </p>
          </>
        ) : (
          <ul className="component-profile-activity">
            <li>
              <strong>Updated the design system</strong>
              <span>Today · Studio North</span>
            </li>
            <li>
              <strong>Shared a new collection</strong>
              <span>Yesterday · 8 resources</span>
            </li>
            <li>
              <strong>Joined the website project</strong>
              <span>October 19 · Design team</span>
            </li>
          </ul>
        )}
      </div>
    </section>
  );
}

const invoices = [
  { id: 'INV-008', status: 'Paid', amount: 1280 },
  { id: 'INV-007', status: 'Paid', amount: 840 },
  { id: 'INV-006', status: 'Pending', amount: 320 },
  { id: 'INV-005', status: 'Paid', amount: 960 },
  { id: 'INV-004', status: 'Pending', amount: 480 },
  { id: 'INV-003', status: 'Paid', amount: 720 },
];
const currency = (value: number) => `$${value.toLocaleString('en-US')}`;

export function ComponentInvoices() {
  const [page, setPage] = useState(0);
  const rows = invoices.slice(page * 3, page * 3 + 3);
  return (
    <section className="sample-card component-card">
      <div className="component-card-heading">
        <span className="component-eyebrow">05 / Data</span>
        <h3>The details at a glance</h3>
        <p>A compact view of recent invoices.</p>
      </div>
      <table className="component-table">
        <caption className="sr-only">Example invoices</caption>
        <thead>
          <tr>
            <th scope="col">Invoice</th>
            <th scope="col">Status</th>
            <th scope="col">Amount</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <th scope="row">{row.id}</th>
              <td>
                <span
                  className={`component-status${row.status === 'Pending' ? ' component-status-outline' : ''}`}
                >
                  {row.status}
                </span>
              </td>
              <td>{currency(row.amount)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row" colSpan={2}>
              Page total
            </th>
            <td>{currency(rows.reduce((sum, row) => sum + row.amount, 0))}</td>
          </tr>
        </tfoot>
      </table>
      <nav className="component-pagination" aria-label="Example invoice pages">
        <button
          type="button"
          className="sample-secondary"
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </button>
        {[0, 1].map((index) => (
          <button
            key={index}
            type="button"
            className="sample-secondary"
            aria-label={`Invoice page ${index + 1}`}
            aria-current={page === index ? 'page' : undefined}
            onClick={() => setPage(index)}
          >
            {index + 1}
          </button>
        ))}
        <button
          type="button"
          className="sample-secondary"
          disabled={page === 1}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </nav>
      <p className="component-footnote" role="status">
        Invoices {page * 3 + 1}–{page * 3 + rows.length} of {invoices.length} · Sample data
      </p>
    </section>
  );
}
