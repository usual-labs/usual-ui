import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { App } from '../src/App';

test('canonical and legacy product routes show Usual UI and link to canonical documentation', () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'window');
  try {
    for (const pathname of ['/ui/', '/ui/docs/', '/design/', '/design/docs/']) {
      Object.defineProperty(globalThis, 'window', {
        configurable: true,
        value: { location: { pathname } },
      });
      const html = renderToStaticMarkup(createElement(App));
      assert.match(html, /Usual UI/);
      assert.match(html, /href="\/ui\/docs\/"/);
      assert.doesNotMatch(html, /Usual Design|href="\/design\//);
      assert.match(
        html,
        pathname.includes('/docs/') ? /Usual UI \/ documentation/ : /Keep the design\./,
      );
    }
  } finally {
    if (previous) Object.defineProperty(globalThis, 'window', previous);
    else Reflect.deleteProperty(globalThis, 'window');
  }
});
