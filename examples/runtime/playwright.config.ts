import { defineConfig } from 'playwright/test';
import policy from './policy.json' with { type: 'json' };

// Explicitly invoked only. The ordinary Usual checks and test suite do not launch browsers.
export default defineConfig({
  testDir: '.',
  testMatch: 'design.spec.ts',
  outputDir: '../../.usual-ui/runtime-results',
  reporter: [['list'], ['html', { outputFolder: '../../.usual-ui/runtime-report', open: 'never' }]],
  use: { browserName: 'chromium', reducedMotion: 'reduce' },
  projects: policy.viewports.flatMap((viewport) =>
    policy.colorSchemes.map((colorScheme) => ({
      name: `${viewport.width}-${colorScheme}`,
      use: { viewport, colorScheme: colorScheme as 'light' | 'dark' },
    })),
  ),
});
