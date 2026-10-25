import { useEffect, useId, useRef, useState } from 'react';
import { BusinessMetric, BusinessShell, businessMoney as money } from './BusinessShell';

const contacts = [
  {
    name: 'Maya Chen',
    company: 'Arc Studio',
    initials: 'MC',
    stage: 'Qualified',
    value: 12400,
    owner: 'Leo',
    next: 'Discovery call · Tomorrow, 2:00 PM',
  },
  {
    name: 'Oliver Reed',
    company: 'Northstar',
    initials: 'OR',
    stage: 'Proposal',
    value: 18600,
    owner: 'Ava',
    next: 'Proposal review · Tomorrow, 10:00 AM',
  },
  {
    name: 'Amara Okafor',
    company: 'Form & Field',
    initials: 'AO',
    stage: 'New lead',
    value: 8200,
    owner: 'Leo',
    next: 'Introductory call · Friday, 11:00 AM',
  },
  {
    name: 'Sofia Rossi',
    company: 'Kindred',
    initials: 'SR',
    stage: 'Qualified',
    value: 15400,
    owner: 'Maya',
    next: 'Scope workshop · Monday, 9:30 AM',
  },
  {
    name: 'Noah Kim',
    company: 'Paper Plane',
    initials: 'NK',
    stage: 'Proposal',
    value: 9800,
    owner: 'Ava',
    next: 'Proposal follow-up · Friday, 3:00 PM',
  },
];
const stages = ['New lead', 'Qualified', 'Proposal'];

export function CRMSample() {
  const searchId = useId();
  const stageId = useId();
  const detailId = useId();
  const search = useRef<HTMLInputElement>(null);
  const focusAfterPipeline = useRef(false);
  const [section, setSection] = useState('Overview');
  const [query, setQuery] = useState('');
  const [stage, setStage] = useState('All stages');
  const [selectedName, setSelectedName] = useState('Oliver Reed');
  useEffect(() => {
    if (section === 'Opportunities' && focusAfterPipeline.current) {
      focusAfterPipeline.current = false;
      search.current?.focus();
    }
  }, [section]);
  const selected = contacts.find((contact) => contact.name === selectedName)!;
  const visible = contacts.filter(
    (contact) =>
      (stage === 'All stages' || contact.stage === stage) &&
      `${contact.name} ${contact.company}`.toLowerCase().includes(query.trim().toLowerCase()),
  );
  return (
    <BusinessShell
      title="CRM"
      sections={['Overview', 'Opportunities', 'Follow-ups']}
      active={section}
      onChange={setSection}
    >
      <div className="biz-page">
        <header className="biz-header">
          <div>
            <span className="biz-eyebrow">RELATIONSHIPS THAT MATTER</span>
            <h2>Good relationships. Great work.</h2>
            <p>Every conversation is a chance to build something together.</p>
          </div>
          <span className="biz-pill">5 open opportunities</span>
        </header>
        {section === 'Overview' && (
          <>
            <div className="biz-metrics">
              <BusinessMetric label="Open pipeline" value="$64,400" note="5 active opportunities" />
              <BusinessMetric
                label="Proposal value"
                value="$28,400"
                note="2 conversations moving forward"
                trend={1}
              />
              <BusinessMetric
                label="Average opportunity"
                value="$12,880"
                note="Across your current pipeline"
                trend={2}
              />
            </div>
            <section className="sample-card biz-pipeline-overview">
              <div className="biz-section-heading">
                <div>
                  <h3>A healthy pipeline</h3>
                  <p>From the first hello to the next big project.</p>
                </div>
                <span className="biz-pill">This month</span>
              </div>
              <div className="biz-pipeline-stages">
                {stages.map((name, index) => {
                  const matches = contacts.filter((contact) => contact.stage === name);
                  const value = matches.reduce((sum, contact) => sum + contact.value, 0);
                  return (
                    <button
                      type="button"
                      key={name}
                      className="biz-stage-card"
                      onClick={() => {
                        focusAfterPipeline.current = true;
                        setStage(name);
                        setSection('Opportunities');
                      }}
                    >
                      <span className="biz-stage-title">
                        <span>0{index + 1}</span>
                        {name}
                        <span aria-hidden="true">↗</span>
                      </span>
                      <strong>{money(value)}</strong>
                      <span className="biz-note">
                        {matches.length} {matches.length === 1 ? 'opportunity' : 'opportunities'}
                      </span>
                      <span className="biz-stage-track">
                        <span style={{ width: `${(value / 28400) * 100}%` }} />
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          </>
        )}
        {section !== 'Follow-ups' && (
          <section className="sample-card">
            <div className="biz-section-heading">
              <div>
                <h3>Your opportunities</h3>
                <p>Select a contact to see the next step.</p>
              </div>
              <span className="biz-muted">Pipeline overview</span>
            </div>
            <div className="biz-filters">
              <div className="biz-field biz-search">
                <label htmlFor={searchId}>Find a contact or company</label>
                <input
                  id={searchId}
                  ref={search}
                  type="search"
                  placeholder="Search relationships…"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>
              <div className="biz-field">
                <label htmlFor={stageId}>Stage</label>
                <select
                  id={stageId}
                  value={stage}
                  onChange={(event) => setStage(event.target.value)}
                >
                  <option>All stages</option>
                  {stages.map((name) => (
                    <option key={name}>{name}</option>
                  ))}
                </select>
              </div>
            </div>
            <p className="biz-result-count" role="status">
              {visible.length} of {contacts.length} opportunities
            </p>
            <div
              className="biz-table-scroll"
              tabIndex={0}
              role="region"
              aria-label="Opportunities table"
            >
              <table className="biz-table">
                <caption className="sr-only">Fictional sales opportunities</caption>
                <thead>
                  <tr>
                    <th scope="col">Contact</th>
                    <th scope="col">Stage</th>
                    <th scope="col" className="biz-number">
                      Value
                    </th>
                    <th scope="col">Owner</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((contact) => (
                    <tr
                      key={contact.name}
                      className={selectedName === contact.name ? 'biz-row-selected' : undefined}
                    >
                      <td>
                        <button
                          className="biz-contact-button"
                          type="button"
                          aria-pressed={selectedName === contact.name}
                          aria-controls={detailId}
                          onClick={() => setSelectedName(contact.name)}
                        >
                          <span className="biz-avatar" aria-hidden="true">
                            {contact.initials}
                          </span>
                          <span>
                            <strong>{contact.name}</strong>
                            <span>{contact.company}</span>
                          </span>
                        </button>
                      </td>
                      <td>
                        <span className="biz-pill">{contact.stage}</span>
                      </td>
                      <td className="biz-number">{money(contact.value)}</td>
                      <td>
                        <span className="biz-owner">{contact.owner}</span>
                      </td>
                    </tr>
                  ))}
                  {visible.length === 0 && (
                    <tr>
                      <td colSpan={4} className="biz-empty">
                        No matches. Try another name or choose a different stage.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
        <aside
          className="sample-card biz-contact-detail"
          id={detailId}
          aria-label="Selected opportunity"
        >
          <div className="biz-detail-profile">
            <span className="biz-avatar" aria-hidden="true">
              {selected.initials}
            </span>
            <div>
              <span className="biz-eyebrow">NEXT CONVERSATION</span>
              <h3>{selected.name}</h3>
              <p>
                {selected.company} · {selected.stage}
              </p>
            </div>
            <strong className="biz-number">{money(selected.value)}</strong>
          </div>
          <div className="biz-next-step">
            <span aria-hidden="true">◷</span>
            <div>
              <strong>{selected.next}</strong>
              <span>{selected.owner} is leading this conversation.</span>
            </div>
          </div>
        </aside>
        {section === 'Follow-ups' && (
          <section className="sample-card">
            <h3>Coming up</h3>
            <ul className="biz-follow-up-list">
              {contacts
                .filter((contact) => contact.name !== selectedName)
                .map((contact) => (
                  <li key={contact.name}>
                    <div>
                      <strong>{contact.name}</strong>
                      <span>{contact.next}</span>
                    </div>
                    <button
                      type="button"
                      className="sample-secondary"
                      onClick={() => setSelectedName(contact.name)}
                    >
                      View {contact.company}
                    </button>
                  </li>
                ))}
            </ul>
          </section>
        )}
      </div>
    </BusinessShell>
  );
}
