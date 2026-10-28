import { expect, test } from '@playwright/test';
import { account, NADIA_HOME } from '../../scripts/roles';

// TODO: isi dari matriks akses yang dikonfirmasi PM
const VISIBLE: Record<string, string[]> = {
  admin: ['User Admin'],
  staff: ['Compose', 'Inbox', 'Sent Item'],
};
const HIDDEN: Record<string, string[]> = {
  staff: ['User Admin'],
};
// TODO: URL halaman yang hanya boleh dibuka role tertentu
const RESTRICTED_URLS: { url: string; allowed: string[] }[] = [
  // { url: `${NADIA_HOME}#/user-admin`, allowed: ['admin'] },
];

test('login sebagai akun yang benar', async ({ page }, info) => {
  const acc = account(info.project.name);
  test.skip(!acc.displayName, `${acc.env}_NAME belum diisi di .env`);
  await page.goto(NADIA_HOME);
  await expect(page.getByText(acc.displayName!).first()).toBeVisible();
});

test('menu sesuai hak akses', async ({ page }, info) => {
  const role = info.project.name;
  test.skip(!VISIBLE[role] && !HIDDEN[role], 'matriks akses role ini belum diisi');
  await page.goto(NADIA_HOME);
  for (const menu of VISIBLE[role] ?? []) {
    await expect.soft(page.getByRole('link', { name: menu }).first(), `menu "${menu}" harus terlihat`).toBeVisible();
  }
  for (const menu of HIDDEN[role] ?? []) {
    await expect.soft(page.getByRole('link', { name: menu }), `menu "${menu}" tidak boleh terlihat`).toHaveCount(0);
  }
});

test('akses langsung URL halaman terbatas ditolak', async ({ page }, info) => {
  const role = info.project.name;
  const denied = RESTRICTED_URLS.filter((r) => !r.allowed.includes(role));
  test.skip(denied.length === 0, 'RESTRICTED_URLS belum diisi atau semua boleh untuk role ini');
  for (const { url } of denied) {
    await page.goto(url);
    await page.waitForLoadState('networkidle');
    // TODO: sesuaikan dengan perilaku NADIA (redirect / halaman 403 / toast)
    await expect.soft(page, `${url} harus ditolak untuk ${role}`).not.toHaveURL(url);
  }
});
