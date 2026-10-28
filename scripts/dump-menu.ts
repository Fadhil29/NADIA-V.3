import { chromium } from '@playwright/test';
import 'dotenv/config';
import fs from 'fs';
import { authFile, NADIA_HOME } from './roles';

// Dump struktur aksesibilitas isi iframe NADIA supaya kelihatan role dan nama asli tiap menu.
// Pakai : npx tsx scripts/dump-menu.ts staff
// Expand: npx tsx scripts/dump-menu.ts staff Compose "Memo Intern" Others Guide   (klik menu induk dulu, supaya submenu ikut ter-dump)
const slug = process.argv[2] ?? 'staff';
const expand = process.argv.slice(3);
if (!fs.existsSync(authFile(slug))) throw new Error(`${authFile(slug)} belum ada, jalankan: npm run auth -- ${slug}`);

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ storageState: authFile(slug) });
  const page = await context.newPage();
  await page.goto(NADIA_HOME, { waitUntil: 'domcontentloaded' });
  const app = page.getByRole('main').frameLocator('iframe');
  const body = app.locator('body');
  await body.waitFor({ state: 'attached', timeout: 30000 });
  await page.waitForTimeout(8000); // beri waktu sidebar selesai render

  for (const name of expand) {
    await app.getByRole('listitem').filter({ hasText: new RegExp(`^\\W*${name}\\b`) }).first().click({ timeout: 10000 })
      .catch(() => console.log(`gagal expand "${name}"`));
    await page.waitForTimeout(1000);
  }

  const yaml = await body.ariaSnapshot();
  const out = `playwright/.auth/${slug}-menu.yml`;
  fs.writeFileSync(out, yaml);
  console.log(yaml);
  console.log(`\n(tersimpan di ${out})`);
  await browser.close();
}

main();