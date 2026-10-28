import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';
import { ROLES, authFile } from './scripts/roles';

export default defineConfig({
  testDir: './tests',
  timeout: 180000,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }], ['./reporters/excel-reporter.ts']],
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    actionTimeout: 15000,
  },
  projects: [
    ...ROLES.map((r) => ({
      name: r.slug,
      testMatch: [`**/tests/${r.slug}/**/*.spec.ts`, `**/tests/access/**/*.spec.ts`],
      use: { ...devices['Desktop Chrome'], storageState: authFile(r.slug) },
    })),
    {
      name: 'workflow',
      testMatch: '**/tests/workflow/**/*.spec.ts',
      fullyParallel: false,
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
