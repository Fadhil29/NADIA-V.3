import { chromium, Page } from '@playwright/test';
import 'dotenv/config';
import fs from 'fs';
import { ROLES, account, authFile, isOnLoginPage, FAMILIA_HOME, NADIA_HOME, SSO_LOGIN_URL } from './roles';

const only = process.argv[2]; // npm run auth -- staff
const targets = only ? ROLES.filter((r) => r.slug === only) : ROLES;
if (only && targets.length === 0) throw new Error(`slug "${only}" tidak ada`);

const pause = (page: Page, ms = 2000) => page.waitForTimeout(ms);

async function login(page: Page, username: string, password: string) {
  // 1. Login SSO Familia
  await page.goto(SSO_LOGIN_URL, { waitUntil: 'domcontentloaded' });
  const user = page.getByRole('textbox', { name: 'Enter your username' });
  await user.waitFor({ state: 'visible' });
  await user.fill(username);
  await page.getByRole('textbox', { name: 'Enter your password' }).fill(password);
  await pause(page, 1000);
  await page.getByRole('button', { name: 'Logo Familia Familia Single' }).click();

  // JEDA setelah login, lalu pastikan sudah di portal Familia
  await pause(page, 5000);
  await page.waitForURL(/\/u\//, { timeout: 30000 }).catch(() => page.goto(FAMILIA_HOME, { waitUntil: 'domcontentloaded' }));
  await pause(page, 2000);

  // 2. Tutup popup di home (tidak selalu muncul)
  await page.getByRole('button', { name: 'Tutup' }).click({ timeout: 5000 }).catch(() => {});
  await pause(page, 1000);

  // 3. Klik app NADIA (selector dari rekaman codegen)
  // PERHATIAN: nth-child(8) bergantung urutan app di akun itu. Kalau akun lain gagal di sini, ganti dengan locator berbasis teks.
  await page.locator('.hover\\:scale-120').first().click();
  await page.locator('.flex-1.overflow-y-auto > div:nth-child(8) > div').first().click();

  // JEDA setelah klik app NADIA, lalu pastikan sudah di NADIA
  await pause(page, 5000);
  await page.waitForURL(/\/f\/nadia\//, { timeout: 30000 }).catch(() => page.goto(NADIA_HOME, { waitUntil: 'domcontentloaded' }));
  await pause(page, 3000); // beri waktu token NADIA tertulis ke IndexedDB sebelum session disimpan
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
    try {
      await login(page, acc.username, acc.password);
      if (await isOnLoginPage(page)) throw new Error('login gagal, masih di halaman login');
      // token NADIA disimpan di IndexedDB, bukan cookie, jadi ikut disimpan
      await context.storageState({ path: authFile(role.slug), indexedDB: true });
      console.log(`OK ${role.slug} -> ${authFile(role.slug)}`);
    } catch (e) {
      const shot = `playwright/.auth/${role.slug}-error.png`;
      await page.screenshot({ path: shot, fullPage: true }).catch(() => {});
      console.log(`FAIL ${role.slug}: ${(e as Error).message.split('\n')[0]} (screenshot: ${shot}, url: ${page.url()})`);
      process.exitCode = 1;
    }
    await context.close();
  }

  // cek identitas: semua session dibuka bareng, tiap akun harus tetap login sebagai dirinya
  const existing = ROLES.filter((r) => fs.existsSync(authFile(r.slug)));
  const checks = await Promise.all(
    existing.map(async (role) => {
      const acc = account(role.slug);
      const context = await browser.newContext({ storageState: authFile(role.slug) });
      const page = await context.newPage();
      await page.goto(NADIA_HOME, { waitUntil: 'domcontentloaded' }); // bukan networkidle: NADIA tidak pernah benar-benar sepi
      // .first() saja bisa kena elemen tersembunyi (mis. dropdown profil) yang lebih awal di DOM, jadi filter yang visible dulu
      const nameOk = acc.displayName
        ? await page.getByText(acc.displayName).filter({ visible: true }).first().waitFor({ state: 'visible', timeout: 30000 }).then(() => true, () => false)
        : null;
      const loggedIn = !page.url().includes('/login') && !(await isOnLoginPage(page));
      const match = acc.displayName ? await page.getByText(acc.displayName).count() : null; // 0 = teks tidak ada di DOM sama sekali
      await page.screenshot({ path: `playwright/.auth/${role.slug}-check.png` }).catch(() => {});
      const url = page.url();
      await context.close();
      return { role: role.slug, loggedIn, nama: acc.displayName ?? '(NAME belum diisi)', nameOk, match, url };
    }),
  );
  console.table(checks);
  if (checks.some((c) => !c.loggedIn || c.nameOk === false)) process.exitCode = 1;

  await browser.close();
}

main();