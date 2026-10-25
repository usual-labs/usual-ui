import { AssertionError } from 'node:assert';
import type { Frame, Page } from 'playwright';
import type { TestInfo } from 'playwright/test';
import type {
  RuntimeAudit,
  RuntimeOptions,
  RuntimePageReport,
  RuntimePolicy,
} from './runtime-types.js';
import { formatRuntimeReport, summarizeRuntime, validateRuntimeReport } from './runtime-report.js';

export type * from './runtime-types.js';

// lintapple 0.1.20's page API has no declarations. Keep its integration contract here.
type Engine = {
  validatePolicy(input: unknown): RuntimePolicy;
  checkPage(page: Page | Frame, policy: RuntimePolicy): Promise<RuntimePageReport>;
};

async function loadEngine(): Promise<Engine> {
  const name = 'lintapple';
  try {
    const engine = await import(name);
    if (typeof engine.checkPage !== 'function' || typeof engine.validatePolicy !== 'function')
      throw new Error('Unsupported lintapple interface. Install the supported lintapple@0.1.20.');
    return engine as Engine;
  } catch (error) {
    if (
      error instanceof Error &&
      'code' in error &&
      error.code === 'ERR_MODULE_NOT_FOUND' &&
      error.message.includes("package 'lintapple'")
    )
      throw new Error(
        'Rendered checks require optional dependencies: npm install -D lintapple@0.1.20 playwright@1.63.0',
        { cause: error },
      );
    throw error;
  }
}

function validateOptions(options: RuntimeOptions): void {
  if (!options || [options.state, options.theme].some((v) => typeof v !== 'string' || !v.trim()))
    throw new Error('Provide nonempty state and theme labels for the rendered check.');
  if (!options.policy || typeof options.policy !== 'object' || Array.isArray(options.policy))
    throw new Error(
      'Provide an explicit rendered policy; source tokens are not translated automatically.',
    );
  // Require every policy choice, rather than silently adopting upstream defaults.
  for (const key of [
    'fonts',
    'fontSizes',
    'typeRules',
    'minControlSize',
    'controlSizeRules',
    'minControlGap',
    'minControlInset',
    'controlContainers',
    'minLayoutGap',
    'bannedCopy',
    'viewports',
    'colorSchemes',
    'exceptions',
  ])
    if (!Object.hasOwn(options.policy, key))
      throw new Error(`Rendered policy is missing ${key}. Review all runtime choices explicitly.`);
}

function captureFrames(target: Page | Frame) {
  const frame = 'mainFrame' in target ? target.mainFrame() : target;
  const path = (f: Frame): string => {
    const parent = f.parentFrame();
    return parent ? `${path(parent)}/${parent.childFrames().indexOf(f)}` : 'main';
  };
  const describe = (f: Frame) => ({ url: f.url(), name: f.name(), path: path(f) });
  const descendants = (f: Frame): Frame[] =>
    f.childFrames().flatMap((child) => [child, ...descendants(child)]);
  const children = descendants(frame);
  return {
    identities: [frame, ...children],
    coverage: { checked: describe(frame), omitted: children.map(describe) },
  };
}

async function context(target: Page | Frame) {
  return target.evaluate(() => ({
    url: location.href,
    viewport: { width: window.innerWidth, height: window.innerHeight },
    colorScheme: matchMedia('(prefers-color-scheme: dark)').matches
      ? ('dark' as const)
      : ('light' as const),
  }));
}

/** Audit an already prepared page/frame. Never launches a browser or drives interactions. */
export async function auditPage(
  target: Page | Frame,
  options: RuntimeOptions,
): Promise<RuntimeAudit> {
  validateOptions(options);
  const { state, theme } = options;
  const input = structuredClone(options.policy);
  const engine = await loadEngine();
  const policy = engine.validatePolicy(input);
  const documentBefore = await target.evaluateHandle(() => document);
  try {
    const before = await context(target);
    const frames = captureFrames(target);
    const measured = await engine.checkPage(target, policy);
    validateRuntimeReport(measured);
    const after = await context(target);
    const framesAfter = captureFrames(target);
    if (
      !(await target.evaluate((previous) => previous === document, documentBefore)) ||
      JSON.stringify(before) !== JSON.stringify(after) ||
      JSON.stringify(frames.coverage) !== JSON.stringify(framesAfter.coverage) ||
      frames.identities.some((frame, index) => frame !== framesAfter.identities[index])
    )
      throw new Error(
        'The page context or frame tree changed during the rendered check. Wait for a stable state and retry.',
      );
    return {
      ...measured,
      version: 1,
      evidence: 'rendered',
      engine: 'lintapple',
      state,
      theme,
      ...after,
      policy,
      frameCoverage: frames.coverage,
      summary: summarizeRuntime(measured.findings),
    };
  } finally {
    await documentBefore.dispose();
  }
}

/** Attach evidence on every check, including passes with untested frames/interactions. */
export async function expectDesign(
  target: Page | Frame,
  testInfo: Pick<TestInfo, 'attach'>,
  options: RuntimeOptions,
): Promise<RuntimeAudit> {
  const report = await auditPage(target, options);
  await testInfo.attach('usual-ui rendered audit', {
    body: JSON.stringify(report, null, 2),
    contentType: 'application/json',
  });
  if (report.findings.length)
    throw new AssertionError({
      message: formatRuntimeReport(report),
      actual: report.findings,
      expected: [],
      operator: 'expectDesign',
      stackStartFn: expectDesign,
    });
  return report;
}
