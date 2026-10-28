import { chromium, Page } from '@playwright/test';
import 'dotenv/config';
import fs from 'fs';
import { ROLES, account, authFile, isOnLoginPage, NADIA_HOME, SSO_LOGIN_URL } from './roles';

const only = process.argv[2]; // npm run auth -- atasan
const targets = only ? ROLES.filter((r) => r.slug === only) : ROLES;
if (only && targets.length === 0) throw new Error(`slug "${only}" tidak ada`);

const pause = (page: Page, ms = 2000) => page.waitForTimeout(ms);

async function login(page: Page, username: string, password: string) {
  await page.goto(SSO_LOGIN_URL);
  await page.waitForLoadState('networkidle');
  await pause(page);
  // TODO: kalau ada tombol "Familia Single Sign On" sebelum form, klik di sini (lihat rekaman)

  const user = page.getByRole('textbox', { name: 'Enter your username' });
  await user.waitFor({ state: 'visible' });
  await user.fill(username);
  await page.getByRole('textbox', { name: 'Enter your password' }).fill(password);
  await pause(page, 1000);
  await page.getByRole('button', { name: 'Logo Familia Familia Single' }).click();
  await page.waitForLoadState('networkidle');
  await pause(page, 3000);

  // TODO: langkah masuk ke NADIA setelah SSO (pilih aplikasi, tutup popup, dll), dari rekaman
  await page.goto(NADIA_HOME);
  await page.waitForLoadState('networkidle');
  await pause(page, 3000);
}

async function main() {
  fs.mkdirSync('playwright/.auth', { recursive: true });
  const browser = await chromium.launch({ headless: !!process.env.CI, slowMo: process.env.CI ? 0 : 500 });

  for (const role of targets) {
    const acc = account(role.slug);
    if (!acc.username || !acc.password) {
      console.log(`SKIP ${role.slug}: ${role.env}_USERNAME / _PASSWORD belum diisi di .env`);
      continue;
    }
    const context = await browser.newContext();
    const page = await context.newPage();
    await login(page, acc.username, acc.password);

    if (await isOnLoginPage(page)) throw new Error(`${role.slug}: login gagal, masih di halaman login`);
    // token NADIA disimpan di IndexedDB, bukan cookie, jadi ikut disimpan
    await context.storageState({ path: authFile(role.slug), indexedDB: true });
    console.log(`OK ${role.slug} -> ${authFile(role.slug)}`);
    await context.close();
  }

  // cek identitas: semua session dibuka bareng, tiap akun harus tetap login sebagai dirinya
  const existing = ROLES.filter((r) => fs.existsSync(authFile(r.slug)));
  const checks = await Promise.all(
    existing.map(async (role) => {
      const acc = account(role.slug);
      const context = await browser.newContext({ storageState: authFile(role.slug) });
      const page = await context.newPage();
      await page.goto(NADIA_HOME);
      await page.waitForLoadState('networkidle');
      const loggedIn = !(await isOnLoginPage(page));
      const nameOk = acc.displayName ? await page.getByText(acc.displayName).first().isVisible().catch(() => false) : null;
      await context.close();
      return { role: role.slug, loggedIn, nama: acc.displayName ?? '(NAME belum diisi)', nameOk };
    }),
  );
  console.table(checks);
  if (checks.some((c) => !c.loggedIn || c.nameOk === false)) process.exitCode = 1;

  await browser.close();
}

main();
