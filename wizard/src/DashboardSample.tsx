import { useId, useState } from 'react';
import { BusinessMetric, BusinessShell } from './BusinessShell';

const periods = {
  week: {
    label: 'This week',
    metrics: ['12,840', '1,286', '92.4%'],
    changes: ['+8.2% from last week', '+12.6% from last week', '+2.1 points from last week'],
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    values: [42, 58, 49, 76, 65, 88, 78],
    summary: 'Activity rose through the week, reaching its highest point on Saturday.',
  },
  month: {
    label: 'This month',
    metrics: ['48,620', '4,812', '89.6%'],
    changes: ['+6.4% from last month', '+9.8% from last month', '+1.6 points from last month'],
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    values: [52, 68, 61, 88],
    summary: 'Activity grew over the month, with the fourth week recording the most activity.',
  },
};
const projects = [
  { name: 'Website refresh', team: 'Design team', progress: 78, initials: 'WR', due: 'Oct 28' },
  { name: 'Customer portal', team: 'Product team', progress: 56, initials: 'CP', due: 'Nov 04' },
  { name: 'Brand guidelines', team: 'Marketing team', progress: 92, initials: 'BG', due: 'Oct 24' },
];

function ActivityChart({ data }: { data: (typeof periods)['week'] | (typeof periods)['month'] }) {
  const id = useId();
  const [selected, setSelected] = useState(data.labels.length - 1);
  const index = Math.min(selected, data.values.length - 1);
  const points = data.values.map((value, point) => [
    32 + point * (488 / (data.values.length - 1)),
    182 - value * 1.5,
  ]);
  const line = points.map((point) => point.join(',')).join(' ');
  return (
    <figure className="biz-chart biz-line-chart">
      <div className="biz-chart-readout">
        <div>
          <span className="biz-label">Activity index</span>
          <strong>
            {data.values[index]}
            <span> / 100</span>
          </strong>
        </div>
        <span className="biz-pill">{data.labels[index]}</span>
      </div>
      <svg
        viewBox="0 0 540 202"
        role="img"
        aria-label={`${data.label} activity. ${data.labels.map((label, i) => `${label}: ${data.values[i]}`).join(', ')}.`}
      >
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--sample-primary)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--sample-primary)" stopOpacity="0.01" />
          </linearGradient>
        </defs>
        {[0, 25, 50, 75, 100].map((value) => (
          <g key={value}>
            <line
              className="biz-chart-gridline"
              x1="32"
              x2="520"
              y1={182 - value * 1.5}
              y2={182 - value * 1.5}
            />
            <text className="biz-chart-axis" x="2" y={186 - value * 1.5}>
              {value}
            </text>
          </g>
        ))}
        <polygon points={`32,182 ${line} 520,182`} fill={`url(#${id})`} />
        <polyline points={line} className="biz-chart-line" />
        <line
          className="biz-chart-marker"
          x1={points[index][0]}
          x2={points[index][0]}
          y1="18"
          y2="182"
        />
        {points.map(([x, y], point) => (
          <g key={point} onMouseEnter={() => setSelected(point)}>
            <rect x={x - 25} y="0" width="50" height="200" fill="transparent" />
            <circle cx={x} cy={y} r={point === index ? 5 : 3} className="biz-chart-point" />
          </g>
        ))}
      </svg>
      <div className="biz-chart-points" aria-label="Inspect activity by period">
        {data.labels.map((label, point) => (
          <button
            type="button"
            key={label}
            aria-pressed={point === index}
            aria-label={`${label}: activity index ${data.values[point]}`}
            onClick={() => setSelected(point)}
            onFocus={() => setSelected(point)}
          >
            {label}
          </button>
        ))}
      </div>
      <figcaption>{data.summary}</figcaption>
    </figure>
  );
}

export function DashboardSample() {
  const periodId = useId();
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const [section, setSection] = useState('Overview');
  const data = periods[period];
  return (
    <BusinessShell
      title="Dashboard"
      sections={['Overview', 'Activity', 'Projects']}
      active={section}
      onChange={setSection}
    >
      <div className="biz-page">
        <header className="biz-header">
          <div>
            <span className="biz-eyebrow">YOUR WORK, AT A GLANCE</span>
            <h2>A little progress, every day.</h2>
            <p>Welcome back, Alex. Here’s what’s moving forward.</p>
          </div>
          <div className="biz-field biz-period">
            <label htmlFor={periodId}>Reporting period</label>
            <select
              id={periodId}
              value={period}
              onChange={(event) => setPeriod(event.target.value as 'week' | 'month')}
            >
              <option value="week">This week</option>
              <option value="month">This month</option>
            </select>
          </div>
        </header>
        {section === 'Overview' && (
          <div className="biz-metrics" aria-live="polite">
            {['Total visitors', 'Active members', 'Completion rate'].map((label, index) => (
              <BusinessMetric
                key={label}
                label={label}
                value={data.metrics[index]}
                note={data.changes[index]}
                trend={index}
              />
            ))}
          </div>
        )}
        {section !== 'Projects' && (
          <div className="biz-analytics-grid">
            <section className="sample-card biz-chart-card">
              <div className="biz-section-heading">
                <div>
                  <h3>Workspace activity</h3>
                  <p>Every visit is a step toward something useful.</p>
                </div>
                <span className="biz-pill">{data.label}</span>
              </div>
              <ActivityChart data={data} key={period} />
            </section>
            <section className="sample-card biz-source-card">
              <h3>Where people find you</h3>
              <p>Your most active channels</p>
              <div className="biz-source-total">
                <strong>{data.metrics[0]}</strong>
                <span>Total visits</span>
              </div>
              <div className="biz-channel-stack" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              <ul className="biz-source-list">
                {[
                  ['Direct', 48],
                  ['Search', 34],
                  ['Referrals', 18],
                ].map(([name, value]) => (
                  <li key={name}>
                    <span>
                      <i />
                      {name}
                    </span>
                    <strong>{value}%</strong>
                  </li>
                ))}
              </ul>
              <span className="biz-note">Direct visits are your strongest channel.</span>
            </section>
          </div>
        )}
        {section !== 'Activity' && (
          <div className="biz-dashboard-bottom">
            <section className="sample-card">
              <div className="biz-section-heading">
                <h3>Recent projects</h3>
                <span className="biz-muted">3 in progress</span>
              </div>
              <ul className="biz-project-list">
                {projects.map((project) => (
                  <li key={project.name}>
                    <span className="biz-avatar" aria-hidden="true">
                      {project.initials}
                    </span>
                    <div className="biz-project-name">
                      <strong>{project.name}</strong>
                      <span>
                        {project.team} · Due {project.due}
                      </span>
                      <progress
                        value={project.progress}
                        max={100}
                        aria-label={`${project.name} progress`}
                      />
                    </div>
                    <span className="biz-number">{project.progress}%</span>
                  </li>
                ))}
              </ul>
            </section>
            <section className="sample-card">
              <h3>Team activity</h3>
              <ol className="biz-activity">
                <li>
                  <strong>Maya added a new milestone</strong>
                  <span>Customer portal · 20 minutes ago</span>
                </li>
                <li>
                  <strong>Leo shared the first concepts</strong>
                  <span>Website refresh · 1 hour ago</span>
                </li>
                <li>
                  <strong>Ava completed the color system</strong>
                  <span>Brand guidelines · 3 hours ago</span>
                </li>
              </ol>
            </section>
          </div>
        )}
      </div>
    </BusinessShell>
  );
}
