import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import type {
  RuntimeFinding,
  RuntimeOptions,
  RuntimePageReport,
  RuntimePolicy,
} from '../src/runtime-types';

type Adapter = typeof import('../src/playwright.js');
type Target = Parameters<Adapter['auditPage']>[0];
type Attachment = { name: string; body?: string | Buffer; contentType?: string };
type DocumentHandle = { document: object; disposals: number; dispose(): Promise<void> };
let adapter: Adapter;
const fixtures: string[] = [];

async function isolatedAdapter(engine?: string): Promise<Adapter> {
  const root = await mkdtemp(join(tmpdir(), 'usual-rendered-api-'));
  fixtures.push(root);
  await writeFile(join(root, 'package.json'), '{"type":"module"}');
  for (const name of ['playwright', 'runtime-report', 'runtime-types']) {
    const source = await readFile(new URL(`../src/${name}.ts`, import.meta.url), 'utf8');
    await writeFile(
      join(root, `${name}.js`),
      ts.transpileModule(source, {
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
      }).outputText,
    );
  }
  if (engine) {
    const dependency = join(root, 'node_modules/lintapple');
    await mkdir(dependency, { recursive: true });
    await writeFile(join(dependency, 'package.json'), '{"type":"module","exports":"./index.js"}');
    await writeFile(join(dependency, 'index.js'), engine);
  }
  return import(pathToFileURL(join(root, 'playwright.js')).href);
}

before(async () => {
  // Real policy validation, fake measurements: no browser or application is run by this suite.
  adapter = await isolatedAdapter(`
    export { validatePolicy } from ${JSON.stringify(import.meta.resolve('lintapple'))};
    export async function checkPage(page, policy) { return page.measure(policy); }
    export function checkUrl() { throw Error('Must not launch a browser'); }
    export function checkInteractions() { throw Error('Must not drive interactions'); }
  `);
});
after(async () => {
  await Promise.all(fixtures.map((root) => rm(root, { recursive: true, force: true })));
});

function options(): RuntimeOptions {
  return {
    state: 'signed-in overview',
    theme: 'project night palette',
    policy: {
      fonts: ['Arial'],
      fontSizes: [14, 16],
      typeRules: [],
      minControlSize: 24,
      controlSizeRules: [],
      minControlGap: 8,
      minControlInset: 8,
      controlContainers: ['[data-ui-container]'],
      minLayoutGap: 8,
      bannedCopy: [],
      viewports: [
        { width: 390, height: 844 },
        { width: 1280, height: 900 },
      ],
      colorSchemes: ['light', 'dark'],
      exceptions: [],
    },
  };
}

function report(findings: RuntimeFinding[] = []): RuntimePageReport {
  return {
    findings,
    suppressed: [],
    accessibilityCoverage: { pageRules: ['accessible-name'], interactionRules: 'not tested' },
    elements: 10,
    controls: 2,
    insetControls: 0,
    numericElements: 0,
    alignmentGroups: 0,
    radiusContracts: 0,
  };
}

function finding(detail: Partial<RuntimeFinding> = {}): RuntimeFinding {
  return {
    rule: 'text-contrast',
    selector: '#total',
    message: 'Text contrast is too low.',
    actual: '2:1',
    expected: '4.5:1',
    fix: 'Use the approved higher-contrast text color.',
    ...detail,
  };
}

class PreparedFrame {
  children: PreparedFrame[] = [];
  document = {};
  documentHandles: DocumentHandle[] = [];
  identityError?: Error;
  current = {
    url: 'http://127.0.0.1:5173/overview',
    viewport: { width: 800, height: 600 },
    colorScheme: 'dark' as const,
  };
  measure: (policy: RuntimePolicy) => unknown = () => report();
  constructor(
    public label = '',
    public parent: PreparedFrame | null = null,
  ) {
    parent?.children.push(this);
  }
  parentFrame() {
    return this.parent;
  }
  childFrames() {
    return this.children;
  }
  url() {
    return this.current.url;
  }
  name() {
    return this.label;
  }
  async evaluate(_callback?: unknown, document?: DocumentHandle) {
    if (document) {
      if (this.identityError) throw this.identityError;
      return document.document === this.document;
    }
    return structuredClone(this.current);
  }
  async evaluateHandle() {
    const handle: DocumentHandle = {
      document: this.document,
      disposals: 0,
      async dispose() {
        this.disposals++;
      },
    };
    this.documentHandles.push(handle);
    return handle;
  }
  asFrame() {
    return this as unknown as Target;
  }
  asPage() {
    return {
      mainFrame: () => this,
      evaluate: (callback: unknown, document?: DocumentHandle) => this.evaluate(callback, document),
      evaluateHandle: () => this.evaluateHandle(),
      measure: (policy: RuntimePolicy) => this.measure(policy),
    } as unknown as Target;
  }
}

function attachments() {
  const saved: Attachment[] = [];
  return {
    saved,
    info: {
      async attach(name: string, value: { body?: string | Buffer; contentType?: string }) {
        saved.push({ name, ...value });
      },
    },
  };
}

test('passing existing-page checks attach actual context and nested unchecked frame coverage', async () => {
  const main = new PreparedFrame();
  const child = new PreparedFrame('embedded chart', main);
  child.current.url = 'http://127.0.0.1:5173/chart';
  const nested = new PreparedFrame('legend', child);
  nested.current.url = 'http://127.0.0.1:5173/legend';
  const unrelated = new PreparedFrame('account', main);
  const { info, saved } = attachments();
  const settings = options();
  const snapshot = structuredClone(settings);
  let calls = 0;
  main.measure = (policy) => {
    calls++;
    assert.deepEqual(policy, settings.policy);
    policy.fonts.push('Mutated by engine');
    return report();
  };
  const actual = await adapter.expectDesign(main.asPage(), info, settings);
  assert.equal(calls, 1, 'An explicit policy matrix must not cause navigation or extra runs.');
  assert.deepEqual(settings, snapshot, 'The caller policy stays unchanged.');
  assert.equal(actual.evidence, 'rendered');
  assert.equal(actual.state, settings.state);
  assert.equal(actual.theme, settings.theme);
  assert.equal(actual.colorScheme, 'dark');
  assert.deepEqual(actual.viewport, { width: 800, height: 600 });
  assert.deepEqual(actual.frameCoverage, {
    checked: { path: 'main', url: main.url(), name: '' },
    omitted: [
      { path: 'main/0', url: child.url(), name: child.name() },
      { path: 'main/0/0', url: nested.url(), name: nested.name() },
      { path: 'main/1', url: unrelated.url(), name: unrelated.name() },
    ],
  });
  assert.equal(actual.accessibilityCoverage.interactionRules, 'not tested');
  assert.equal(actual.alignmentGroups, 0);
  assert.equal(actual.radiusContracts, 0);
  assert.equal(actual.summary.problems, 0);
  assert.equal(saved.length, 1);
  assert.equal(saved[0].contentType, 'application/json');
  assert.deepEqual(JSON.parse(String(saved[0].body)), actual);
  assert.equal(main.documentHandles.length, 1);
  assert.equal(main.documentHandles[0].disposals, 1);
});

test('explicit child-frame auditing includes only that document and its omitted descendants', async () => {
  const main = new PreparedFrame();
  const checked = new PreparedFrame('chart', main);
  checked.current.url = 'http://127.0.0.1:5173/chart';
  const omitted = new PreparedFrame('legend', checked);
  new PreparedFrame('unrelated', main);
  main.measure = () => {
    throw Error('Parent document must not be measured');
  };
  const actual = await adapter.auditPage(checked.asFrame(), options());
  assert.equal(actual.url, checked.url());
  assert.deepEqual(actual.frameCoverage, {
    checked: { path: 'main/0', url: checked.url(), name: checked.name() },
    omitted: [{ path: 'main/0/0', url: omitted.url(), name: omitted.name() }],
  });
});

test('summary preserves each measurement and separates expectations, statuses and phases', async () => {
  const findings = [
    finding({ contrastRatio: 2, foreground: '#777', phase: 'page' }),
    finding({ actual: '3:1', contrastRatio: 3, foreground: '#888', phase: 'page' }),
    finding({ expected: '3:1', phase: 'page' }),
    finding({ status: 'unresolved', actual: 'image background', phase: 'page' }),
    finding({ phase: 'focus' }),
    finding({ relatedSelector: '#background' }),
  ];
  const upstream = {
    ...report(findings),
    suppressed: [{ rule: 'control-size', selector: '#logo', reason: 'Reviewed decorative mark' }],
    engineDetail: { measuredPixels: [1, 2, 3] },
  };
  const main = new PreparedFrame();
  main.measure = () => upstream;
  const actual = await adapter.auditPage(main.asPage(), options());
  assert.deepEqual(actual.findings, findings);
  assert.deepEqual(actual.suppressed, upstream.suppressed);
  assert.deepEqual(Reflect.get(actual, 'engineDetail'), upstream.engineDetail);
  assert.equal(actual.summary.problems, 5);
  assert.equal(actual.summary.occurrences, 6);
  assert.equal(actual.summary.failed, 5);
  assert.equal(actual.summary.unresolved, 1);
  assert.deepEqual(actual.summary.groups[0].occurrences, findings.slice(0, 2));
  assert.deepEqual(
    actual.summary.groups.flatMap((group) => group.occurrences),
    findings,
  );
});

test('failed and unresolved findings attach full evidence before assertion failure', async () => {
  for (const status of ['failed', 'unresolved'] as const) {
    const main = new PreparedFrame();
    const issue = finding({ status });
    main.measure = () => report([issue]);
    const { info, saved } = attachments();
    await assert.rejects(adapter.expectDesign(main.asPage(), info, options()), (error: unknown) => {
      assert.ok(error instanceof assert.AssertionError);
      assert.equal(error.operator, 'expectDesign');
      assert.deepEqual(error.actual, [issue]);
      assert.match(error.message, new RegExp(status));
      assert.match(error.message, /source-policy compliance is checked separately/);
      return true;
    });
    assert.equal(saved.length, 1);
    assert.deepEqual(JSON.parse(String(saved[0].body)).findings, [issue]);
  }
});

test('missing choices and malformed explicit policies fail before measuring the page', async () => {
  const main = new PreparedFrame();
  main.measure = () => {
    throw Error('Invalid policy must not reach the measurement engine');
  };
  const invalid: unknown[] = [
    { ...options(), state: ' ' },
    { ...options(), theme: '' },
    { ...options(), policy: null },
    { ...options(), policy: {} },
    { ...options(), policy: { ...options().policy, unknown: true } },
    { ...options(), policy: { ...options().policy, fonts: [] } },
    { ...options(), policy: { ...options().policy, minControlSize: -1 } },
    { ...options(), policy: { ...options().policy, colorSchemes: ['auto'] } },
    {
      ...options(),
      policy: {
        ...options().policy,
        exceptions: [{ selector: '#x', rules: ['fake'], reason: 'No' }],
      },
    },
  ];
  for (const input of invalid)
    await assert.rejects(
      adapter.auditPage(main.asPage(), input as RuntimeOptions),
      (error: Error) => {
        assert.doesNotMatch(error.message, /measurement engine/);
        return true;
      },
    );
});

test('malformed reports, engine errors and attachment errors cannot become a pass', async () => {
  const main = new PreparedFrame();
  for (const value of [
    null,
    {},
    { ...report(), findings: [finding({ status: 'passed' as 'failed' })] },
    { ...report(), findings: [{ ...finding(), actual: 2 }] },
    { ...report(), suppressed: [{}] },
    { ...report(), controls: -1 },
    { ...report(), elements: 1.5 },
    { ...report(), accessibilityCoverage: { pageRules: [123], interactionRules: 'not tested' } },
  ]) {
    main.measure = () => value;
    const { info, saved } = attachments();
    const previousHandles = main.documentHandles.length;
    await assert.rejects(adapter.expectDesign(main.asPage(), info, options()), /invalid/i);
    assert.equal(saved.length, 0);
    assert.equal(main.documentHandles.length, previousHandles + 1);
    assert.ok(main.documentHandles.every((handle) => handle.disposals === 1));
  }
  main.measure = () => {
    throw Error('Engine execution failed');
  };
  const previousHandles = main.documentHandles.length;
  await assert.rejects(adapter.auditPage(main.asPage(), options()), /Engine execution failed/);
  assert.equal(main.documentHandles.length, previousHandles + 1);
  assert.ok(main.documentHandles.every((handle) => handle.disposals === 1));
  main.measure = () => report();
  await assert.rejects(
    adapter.expectDesign(
      main.asPage(),
      {
        async attach() {
          throw Error('Attachment failed');
        },
      },
      options(),
    ),
    /Attachment failed/,
  );
  assert.equal(main.documentHandles.length, previousHandles + 2);
  assert.ok(main.documentHandles.every((handle) => handle.disposals === 1));
});

test('navigation, viewport changes and frame-tree changes reject stale measurements', async () => {
  const mutations = [
    (main: PreparedFrame) => {
      main.current.url += '/next';
    },
    (main: PreparedFrame) => {
      main.current.viewport.width = 1024;
    },
    (main: PreparedFrame) => {
      new PreparedFrame('late-frame', main);
    },
  ];
  for (const mutate of mutations) {
    const main = new PreparedFrame();
    main.measure = () => {
      mutate(main);
      return report();
    };
    await assert.rejects(
      adapter.auditPage(main.asPage(), options()),
      /context or frame tree changed/,
    );
  }
});

test('the optional adapter imports without a browser engine and gives actionable dependency errors', async () => {
  const noEngine = await isolatedAdapter();
  await assert.rejects(
    noEngine.auditPage(new PreparedFrame().asPage(), options()),
    /npm install -D lintapple@0\.1\.20 playwright@1\.63\.0/,
  );
  const incompatible = await isolatedAdapter('export const checkPage = null;');
  await assert.rejects(
    incompatible.auditPage(new PreparedFrame().asPage(), options()),
    /Unsupported lintapple interface/,
  );
});

test('same-URL document replacements reject measurements for pages and explicit frames', async () => {
  for (const asFrame of [false, true]) {
    const checked = new PreparedFrame();
    const unchangedContext = structuredClone(checked.current);
    checked.measure = () => {
      checked.document = {};
      return report();
    };
    const { info, saved } = attachments();
    await assert.rejects(
      adapter.expectDesign(asFrame ? checked.asFrame() : checked.asPage(), info, options()),
      /changed|stable/i,
    );
    assert.deepEqual(checked.current, unchangedContext);
    assert.equal(saved.length, 0);
    assert.equal(checked.documentHandles.length, 1);
    assert.equal(checked.documentHandles[0].disposals, 1);
  }
});

test('replacing a child frame with identical URL, name and path invalidates frame coverage', async () => {
  const main = new PreparedFrame();
  const original = new PreparedFrame('chart', main);
  main.measure = () => {
    const replacement = new PreparedFrame(original.name(), main);
    replacement.current = structuredClone(original.current);
    main.children = [replacement];
    return report();
  };
  await assert.rejects(adapter.auditPage(main.asPage(), options()), /changed|stable/i);
  assert.equal(main.documentHandles.length, 1);
  assert.equal(main.documentHandles[0].disposals, 1);
});

test('an invalidated document handle cannot produce a pass and is always disposed', async () => {
  const main = new PreparedFrame();
  main.measure = () => {
    main.identityError = new Error('Execution context was destroyed during navigation');
    return report();
  };
  await assert.rejects(adapter.auditPage(main.asPage(), options()), /context|changed|stable/i);
  assert.equal(main.documentHandles.length, 1);
  assert.equal(main.documentHandles[0].disposals, 1);
});
