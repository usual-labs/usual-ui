import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ComponentSamples } from '../src/ComponentSamples';
import { DashboardSample, CRMSample, FinanceSample } from '../src/BusinessSamples';
import { MailSample, ChatSample } from '../src/MessageSamples';

test('application examples render useful labeled content without external resources or form destinations', () => {
  for (const [Scene, expected] of [
    [ComponentSamples, ['Workspace name', 'role="switch"', '<progress', '<table']],
    [DashboardSample, ['Reporting period', 'role="img"', 'Workspace activity']],
    [CRMSample, ['Find a contact or company', 'Fictional sales opportunities', 'scope="col"']],
    [FinanceSample, ['Cash flow', 'role="img"', 'Transactions table']],
    [MailSample, ['Search inbox', 'Reply to Maya', 'nothing is sent']],
    [ChatSample, ['Example channels', 'role="log"', 'Add demo message', 'nothing is sent']],
  ] as const) {
    const html = renderToStaticMarkup(createElement(Scene));
    for (const label of expected) assert.ok(html.includes(label), `${Scene.name}: ${label}`);
    assert.doesNotMatch(html, /<script|<iframe|<img|\s(?:src|href|action|formaction)=/i);
  }
});
