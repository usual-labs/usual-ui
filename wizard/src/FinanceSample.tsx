import { useId, useState } from 'react';
import { BusinessMetric, BusinessShell, businessMoney as money } from './BusinessShell';

const cashflow = [
  { month: 'May', income: 58, expense: 38 },
  { month: 'Jun', income: 70, expense: 42 },
  { month: 'Jul', income: 64, expense: 49 },
  { month: 'Aug', income: 83, expense: 51 },
  { month: 'Sep', income: 76, expense: 45 },
  { month: 'Oct', income: 94, expense: 56 },
];
const transactions = [
  { name: 'Arc Studio', detail: 'Invoice #1048', date: 'Oct 21', amount: 4800, status: 'Received' },
  {
    name: 'Workspace subscription',
    detail: 'Software',
    date: 'Oct 20',
    amount: -128,
    status: 'Paid',
  },
  { name: 'Northstar', detail: 'Invoice #1047', date: 'Oct 18', amount: 3200, status: 'Received' },
  { name: 'Studio rent', detail: 'Office', date: 'Oct 15', amount: -1800, status: 'Paid' },
];

export function FinanceSample() {
  const id = useId();
  const [section, setSection] = useState('Overview');
  const [query, setQuery] = useState('');
  const [type, setType] = useState('All types');
  const visible = transactions.filter(
    (transaction) =>
      `${transaction.name} ${transaction.detail}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()) &&
      (type === 'All types' ||
        (type === 'Income' ? transaction.amount > 0 : transaction.amount < 0)),
  );
  return (
    <BusinessShell
      title="Finance"
      sections={['Overview', 'Cash flow', 'Transactions']}
      active={section}
      onChange={setSection}
    >
      <div className="biz-page">
        <header className="biz-header">
          <div>
            <span className="biz-eyebrow">A LITTLE MORE CLARITY</span>
            <h2>Room for what’s next.</h2>
            <p>A clear picture of your studio’s finances.</p>
          </div>
          <span className="biz-pill">October 2026</span>
        </header>
        {section === 'Overview' && (
          <div className="biz-finance-top">
            <section className="sample-card biz-account-card">
              <div className="biz-account-heading">
                <span>STUDIO OPERATING ACCOUNT</span>
                <span aria-hidden="true">◈</span>
              </div>
              <span className="biz-label">Available balance</span>
              <strong>$42,680.00</strong>
              <div className="biz-account-bottom">
                <span>•••• 2048</span>
                <span>US Dollar · USD</span>
              </div>
            </section>
            <div className="biz-account-summary">
              <BusinessMetric
                label="Income this month"
                value="$18,400"
                note="+12.4% from September"
              />
              <BusinessMetric
                label="Expenses this month"
                value="$10,960"
                note="Within your monthly budget"
                trend={1}
              />
            </div>
          </div>
        )}
        {section !== 'Transactions' && (
          <div className="biz-analytics-grid">
            <section className="sample-card biz-chart-card">
              <div className="biz-section-heading">
                <div>
                  <h3>Cash flow</h3>
                  <p>More clarity, month after month.</p>
                </div>
                <div className="biz-legend">
                  <span>
                    <i />
                    Income
                  </span>
                  <span>
                    <i />
                    Expenses
                  </span>
                </div>
              </div>
              <div className="biz-cashflow-total">
                <strong>+$7,440</strong>
                <span>Net income this month</span>
              </div>
              <figure className="biz-chart">
                <div
                  className="biz-bars"
                  role="img"
                  aria-label="Cash flow from May to October. Income exceeds expenses each month. October has the highest income at 18,400 dollars and expenses of 10,960 dollars. Earlier months show relative trends."
                >
                  {cashflow.map((month) => (
                    <div className="biz-bar-column" key={month.month} aria-hidden="true">
                      <div className="biz-bar-track biz-bar-pair">
                        <span className="biz-bar" style={{ height: `${month.income}%` }} />
                        <span
                          className="biz-bar biz-bar-expense"
                          style={{ height: `${month.expense}%` }}
                        />
                      </div>
                      <span>{month.month}</span>
                    </div>
                  ))}
                </div>
                <figcaption>Relative monthly totals · May–October 2026</figcaption>
              </figure>
            </section>
            <section className="sample-card biz-spending-card">
              <h3>Spending breakdown</h3>
              <div
                className="biz-spending-ring"
                role="img"
                aria-label="Expenses: team 52 percent, operations 30 percent, software 18 percent"
              >
                <div>
                  <strong>$10,960</strong>
                  <span>Total expenses</span>
                </div>
              </div>
              <ul className="biz-source-list">
                {[
                  ['Team', 52],
                  ['Operations', 30],
                  ['Software', 18],
                ].map(([label, value]) => (
                  <li key={label}>
                    <span>
                      <i />
                      {label}
                    </span>
                    <strong>{value}%</strong>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}
        {section !== 'Cash flow' && (
          <section className="sample-card">
            <div className="biz-section-heading">
              <div>
                <h3>Recent transactions</h3>
                <p>Every movement, in one place.</p>
              </div>
              <span className="biz-muted">All accounts</span>
            </div>
            <div className="biz-filters">
              <div className="biz-field biz-search">
                <label htmlFor={`${id}-search`}>Search transactions</label>
                <input
                  id={`${id}-search`}
                  type="search"
                  placeholder="Search name or category…"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>
              <div className="biz-field">
                <label htmlFor={`${id}-type`}>Transaction type</label>
                <select
                  id={`${id}-type`}
                  value={type}
                  onChange={(event) => setType(event.target.value)}
                >
                  <option>All types</option>
                  <option>Income</option>
                  <option>Expenses</option>
                </select>
              </div>
            </div>
            <p className="biz-result-count" role="status">
              {visible.length} of {transactions.length} transactions
            </p>
            <div
              className="biz-table-scroll"
              tabIndex={0}
              role="region"
              aria-label="Transactions table"
            >
              <table className="biz-table">
                <caption className="sr-only">Fictional studio transactions in US dollars</caption>
                <thead>
                  <tr>
                    <th scope="col">Transaction</th>
                    <th scope="col">Date</th>
                    <th scope="col">Status</th>
                    <th scope="col" className="biz-number">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((transaction) => (
                    <tr key={transaction.name}>
                      <td>
                        <div className="biz-person">
                          <span className="biz-avatar" aria-hidden="true">
                            {transaction.amount > 0 ? '↙' : '↗'}
                          </span>
                          <div>
                            <strong>{transaction.name}</strong>
                            <span>{transaction.detail}</span>
                          </div>
                        </div>
                      </td>
                      <td>{transaction.date}</td>
                      <td>
                        <span className="biz-pill">{transaction.status}</span>
                      </td>
                      <td className="biz-number">
                        {transaction.amount > 0 ? '+' : '−'}
                        {money(Math.abs(transaction.amount))}.00
                      </td>
                    </tr>
                  ))}
                  {visible.length === 0 && (
                    <tr>
                      <td colSpan={4} className="biz-empty">
                        No matching transactions. Try another search or type.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </BusinessShell>
  );
}
