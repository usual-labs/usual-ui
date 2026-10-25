export type SpecimenTheme = 'light' | 'dark';
export type SpecimenSide = 'before' | 'after';

export interface DesignExample {
  title: string;
  before: string;
  after: string;
  explanation: string;
  policy: string;
  diagnostics: { rule: string; message: string }[];
  specimen: Record<SpecimenSide, string>;
}

const numericTable = (classes: string) =>
  `<table><caption>Monthly usage</caption><thead><tr><th scope="col">Project</th><th scope="col" class="${classes}">Requests</th></tr></thead><tbody>${[
    ['Atlas', '1,111'],
    ['Ember', '888'],
    ['North', '24,560'],
  ]
    .map(
      ([name, value]) =>
        `<tr><th scope="row">${name}</th><td data-ui-number="true" class="${classes}">${value}</td></tr>`,
    )
    .join('')}</tbody></table>`;

export const designExamples: DesignExample[] = [
  {
    title: 'Approved values',
    before: '<div className="bg-fuchsia-500 p-7">\n  Project overview\n</div>',
    after: '<div className="bg-surface p-6">\n  Project overview\n</div>',
    explanation:
      'Use the colors and spacing approved by this project. A valid Tailwind class can still violate its design contract.',
    policy: 'This project approves bg-surface and p-6 for this surface.',
    diagnostics: [
      { rule: 'allowed.colors', message: 'bg-fuchsia-500 is outside the approved colors policy.' },
      { rule: 'allowed.spacing', message: 'p-7 is outside the approved spacing policy.' },
    ],
    specimen: {
      before: '<div class="sample-panel bg-fuchsia-500 p-7">Project overview</div>',
      after: '<div class="sample-panel bg-surface p-6">Project overview</div>',
    },
  },
  {
    title: 'Semantic usage',
    before: '<a data-intent="primary"\n   className="bg-muted text-surface">\n  Get started\n</a>',
    after: '<a data-intent="primary"\n   className="bg-accent text-surface">\n  Get started\n</a>',
    explanation:
      'Both colors may be approved. An explicit semantic rule requires the action color for primary actions.',
    policy: 'Primary links require bg-accent and text-surface.',
    diagnostics: [{ rule: 'primary-action', message: 'The primary action requires bg-accent.' }],
    specimen: {
      before:
        '<p class="sample-title">Make room for your next idea.</p><a aria-disabled="true" data-intent="primary" class="sample-action bg-muted text-surface">Get started</a>',
      after:
        '<p class="sample-title">Make room for your next idea.</p><a aria-disabled="true" data-intent="primary" class="sample-action bg-accent text-surface">Get started</a>',
    },
  },
  {
    title: 'Shared components',
    before: '<button onClick={save}>\n  Save changes\n</button>',
    after:
      'import { Button } from "./components/Button";\n\n<Button onClick={save}>\n  Save changes\n</Button>',
    explanation:
      'Require the approved component for a configured native element. Its own implementation can be explicitly excluded.',
    policy: 'Buttons in this scope must use the shared Button component.',
    diagnostics: [
      { rule: 'shared-button', message: 'Use the approved Button component instead of <button>.' },
    ],
    specimen: {
      before:
        '<p class="sample-title">Your changes are ready.</p><button type="button">Save changes</button>',
      after:
        '<p class="sample-title">Your changes are ready.</p><button type="button" class="shared-button">Save changes</button>',
    },
  },
  {
    title: 'Numeric columns',
    before: '<td data-ui-number="true"\n    className="text-left text-sm">\n  1,111\n</td>',
    after:
      '<td data-ui-number="true"\n    className="text-right text-sm tabular-nums">\n  1,111\n</td>',
    explanation:
      'A project can require right alignment and tabular digits for explicitly marked numeric cells. Other text stays outside this rule. The source check verifies the classes; actual glyph widths depend on the rendered font.',
    policy: 'Numeric cells marked data-ui-number="true" require text-right and tabular-nums.',
    diagnostics: [
      { rule: 'numeric-cell', message: 'This numeric cell requires text-right and tabular-nums.' },
    ],
    specimen: {
      before: numericTable('text-left text-sm'),
      after: numericTable('text-right text-sm tabular-nums'),
    },
  },
];

// These owned, static documents illustrate rules. They never import or execute an application.
export function specimenDocument(
  example: DesignExample,
  side: SpecimenSide,
  theme: SpecimenTheme,
): string {
  return `<!doctype html>
<html lang="en" data-theme="${theme}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'">
<title>${example.title} — ${side === 'before' ? 'Before' : 'Approved repair'}</title>
<style>
:root { color-scheme: light; --paper: #f5f2e9; --surface: #fffdf7; --ink: #25271f; --muted: #606255; --line: #d2d2c4; --accent: #a53e2b; }
[data-theme="dark"] { color-scheme: dark; --paper: #20241c; --surface: #2e3328; --ink: #ebeddb; --muted: #aeb39c; --line: #505744; --accent: #f0a08d; }
* { box-sizing: border-box; }
body { margin: 0; padding: 24px; background: var(--paper); color: var(--ink); font: 16px/1.5 "Helvetica Neue", Arial, sans-serif; }
.sample-title { margin: 0 0 24px; font-size: 20px; line-height: 1.3; }
.sample-panel { border: 1px solid var(--line); border-radius: 6px; }
.sample-action { display: inline-block; padding: 12px 20px; border-radius: 6px; font-weight: 500; }
.bg-fuchsia-500 { background: #d946ef; }
.bg-surface { background: var(--surface); }
.bg-muted { background: var(--muted); }
.bg-accent { background: var(--accent); }
.text-surface { color: var(--surface); }
.p-7 { padding: 28px; }
.p-6 { padding: 24px; }
.shared-button { border: 1px solid var(--ink); border-radius: 6px; background: var(--ink); color: var(--surface); padding: 8px 16px; font: 500 14px/1.5 "Helvetica Neue", Arial, sans-serif; }
table { width: 100%; border-collapse: collapse; }
caption { margin-bottom: 12px; text-align: left; font-weight: 500; }
th, td { padding: 6px 0; border-bottom: 1px solid var(--line); text-align: left; font-weight: 400; }
thead th { font-size: 12px; color: var(--muted); }
.text-left { text-align: left; }
.text-right { text-align: right; }
.text-sm { font-size: 14px; }
.tabular-nums { font-variant-numeric: tabular-nums; }
</style></head><body>${example.specimen[side]}</body></html>`;
}
