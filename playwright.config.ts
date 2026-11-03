import { defineConfig, devices } from '@playwright/test';
import fs from 'fs';
import './config/env';
import { authFile, ROLES } from './config/roles';

// Struktur:
//   tests/uat/         satu test = satu case UAT = satu video evidence   -> project "uat"
//   tests/regression/  alur per BAB manual book, termasuk multi-role     -> project "regression"
//   tests/access/      hak akses menu, dijalankan sekali per role         -> project <role>
export default defineConfig({
  testDir: './tests',
  timeout: 180000,
  retries: 0,
  workers: 1, // semua test berbagi akun yang sama, jangan paralel
  reporter: [['list'], ['html', { open: 'never' }], ['./reporters/excel-reporter.ts'], ['./reporters/evidence-reporter.ts']],
  use: {
    ...devices['Desktop Chrome'],
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: process.env.EVIDENCE ? 'on' : 'off', // untuk test yang memakai fixture page bawaan
    launchOptions: { slowMo: process.env.EVIDENCE ? 400 : 0 }, // video evidence lebih mudah diikuti
    actionTimeout: 15000,
  },
  projects: [
    { name: 'uat', testDir: './tests/uat' },
    { name: 'regression', testDir: './tests/regression' },
    // role tanpa session (belum npm run auth) dilewati, supaya tidak error "storage state not found"
    ...ROLES.filter((r) => fs.existsSync(authFile(r.slug))).map((r) => ({
      name: r.slug,
      testDir: './tests/access',
      use: { storageState: authFile(r.slug) },
    })),
  ],
});
