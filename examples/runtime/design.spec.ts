import { test, expect } from 'playwright/test';
import { readFile } from 'node:fs/promises';
import { auditPage, expectDesign, type RuntimePolicy } from '@usualui/lint/playwright';
import input from './policy.json' with { type: 'json' };

const policy = input as RuntimePolicy;
const html = await readFile(new URL('./fixture.html', import.meta.url), 'utf8');

test('audit an initial page and an entered dialog', async ({ page }, info) => {
  await page.setContent(html);
  const theme = info.project.use.colorScheme ?? 'light';
  await expectDesign(page, info, { policy, state: 'settings', theme });
  await page.getByRole('button', { name: 'Review settings' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expectDesign(page, info, { policy, state: 'review dialog', theme });
});

test('the report retains a deliberately broken typography measurement', async ({ page }, info) => {
  await page.setContent(html);
  await page.addStyleTag({ content: 'h1 { font-size: 37px !important; }' });
  const report = await auditPage(page, {
    policy,
    state: 'seeded typography defect',
    theme: info.project.use.colorScheme ?? 'light',
  });
  expect(report.findings.some((f) => f.rule === 'font-size')).toBe(true);
  expect(report.summary.failed).toBeGreaterThan(0);
});
