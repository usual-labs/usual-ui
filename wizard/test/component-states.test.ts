import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ComponentSamples } from '../src/ComponentSamples';
import { DesignSystemSample } from '../src/DesignSystemSample';

test('component state specimens keep accessible targets unique and linked across instances', () => {
  const html = renderToStaticMarkup(
    createElement('div', null, createElement(ComponentSamples), createElement(ComponentSamples)),
  );
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(ids.length, new Set(ids).size, 'IDs must be unique across preview instances');
  const targets = [
    ...html.matchAll(
      /\s(?:for|aria-controls|aria-labelledby|aria-describedby|popovertarget)="([^"]+)"/gi,
    ),
  ].flatMap((match) => match[1].split(' '));
  for (const target of targets)
    assert.ok(ids.includes(target), `Missing accessible target: ${target}`);
});

test('native overlay and form specimens start safely closed without external destinations', () => {
  const html = renderToStaticMarkup(createElement(ComponentSamples));
  assert.match(html, /<dialog\b[^>]*aria-labelledby=/);
  assert.doesNotMatch(html, /<dialog\b[^>]*\sopen(?:=|\s|>)/);
  assert.match(html, /popover="auto"/);
  assert.match(html, /<form novalidate=""/i);
  assert.match(html, /type="email"[^>]*required=""[^>]*aria-invalid="false"/);
  assert.match(html, /type="date"/);
  assert.match(html, /readOnly=""/i);
  assert.match(html, /role="tab"[^>]*aria-selected="true"/);
  assert.match(html, /aria-label="Example invoice pages"/);
  assert.match(html, /aria-current="page"/);
  assert.doesNotMatch(html, /<script|<iframe|\s(?:src|href|action|formaction)=/i);
});

test('shape specimen exposes an operable pressed state', () => {
  const html = renderToStaticMarkup(createElement(DesignSystemSample, { values: {} }));
  assert.match(html, /<button type="button" aria-pressed="false">Try control<\/button>/);
});
