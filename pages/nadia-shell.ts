import { expect, FrameLocator, Locator, Page, test } from '@playwright/test';

// Shell NADIA: hal yang berlaku di semua halaman (iframe, sidebar, wizard, dialog, reload).
// Page object di folder ini dibangun di atas fungsi-fungsi berikut.

export const T = { timeout: 20000 };

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// NADIA dirender di dalam <iframe> pada shell Familia (<main><iframe>).
// Semua elemen NADIA (menu, tabel, form) dicari lewat nadia(page), BUKAN lewat page langsung.
export const nadia = (page: Page): FrameLocator => page.getByRole('main').frameLocator('iframe');

// tunggu NADIA selesai termuat di iframe. Wajib sebelum cek "tidak boleh terlihat",
// kalau tidak, iframe yang belum termuat bikin test lolos palsu (count 0).
export async function waitForNadia(page: Page, timeout = 30000) {
  await expect(
    nadia(page).getByRole('link').filter({ visible: true }).first(),
    'NADIA belum termuat di iframe (atau menu sidebar bukan role "link")',
  ).toBeVisible({ timeout });
}

// menu biasa = link berikon dan berbadge: cocokkan nama tanpa ikon di depan dan angka badge di belakang ("Inbox 10")
const leafLink = (page: Page, name: string) =>
  nadia(page).getByRole('link', { name: new RegExp(`^\\W*${esc(name)}(?:\\s*\\d+)?\\W*$`) }).filter({ visible: true });

// menu induk yang punya submenu (Compose, Memo Intern, Others, Guide) BUKAN link, hanya teks di dalam listitem
const parentItem = (page: Page, name: string) =>
  nadia(page).getByRole('listitem').filter({ hasText: new RegExp(`^\\W*${esc(name)}\\b`) }).filter({ visible: true });

export const menuLink = (page: Page, name: string) => leafLink(page, name).first();

// menu apa pun di sidebar (link biasa ATAU menu induk): untuk cek terlihat / tidak terlihat
export const menuItem = (page: Page, name: string) => leafLink(page, name).or(parentItem(page, name)).first();

// buka menu sidebar; skip test kalau menu tidak ada untuk akun ini
// (tidak pakai networkidle: halaman NADIA tidak pernah benar-benar sepi; spec cukup assert hasil klik)
export async function openMenu(page: Page, name: string) {
  await waitForNadia(page);
  const link = menuLink(page, name);
  if ((await link.count()) === 0) test.skip(true, `menu "${name}" tidak ada untuk akun ini`);
  await link.click();
}

// buka submenu: klik menu induk (expand), lalu klik submenu-nya. Label submenu: lihat hasil scripts/dump-menu.ts
export async function openSubMenu(page: Page, parent: string, child: string) {
  await waitForNadia(page);
  await parentItem(page, parent).first().click();
  await leafLink(page, child).first().click();
}

// terima semua confirm() bawaan browser, catat alert DataTables sebagai error
export function watchDialogs(page: Page) {
  const dataTablesErrors: string[] = [];
  page.on('dialog', async (d) => {
    if (d.message().includes('DataTables warning')) dataTablesErrors.push(d.message());
    await d.accept().catch(() => {});
  });
  return dataTablesErrors;
}

export const expectNoDataTablesError = (errors: string[]) =>
  expect(errors, `DataTables error: ${errors.join(' | ')}`).toHaveLength(0);

// reload isi NADIA saja. page.reload() memuat ulang shell Familia dan kemungkinan mengembalikan iframe ke dashboard
export async function reloadNadia(page: Page) {
  const handle = await page.getByRole('main').locator('iframe').elementHandle();
  const frame = await handle?.contentFrame();
  await frame?.evaluate(() => location.reload());
}

// tunggu data muncul di akun lain, reload NADIA sampai batas waktu
export async function waitForText(page: Page, text: string, timeout = 60000) {
  await expect(async () => {
    await reloadNadia(page);
    await expect(nadia(page).getByText(text).filter({ visible: true }).first()).toBeVisible({ timeout: 5000 });
  }).toPass({ timeout });
}
// guidance wizard NADIA: ditutup dengan Esc (konfirmasi user 02/11), tombol "Lewati" sebagai cadangan.
// Esc hanya ditekan kalau wizard terlihat, supaya tidak ikut menutup modal lain (mis. Copy Source)
export async function tutupWizard(page: Page, tunggu = 3000) {
  const app = nadia(page);
  const lewati = app.getByRole('button', { name: 'Lewati' });
  const wizard = lewati.or(app.locator('.driver-popover, .introjs-tooltip, .shepherd-element')).first();
  if (!(await wizard.waitFor({ timeout: tunggu }).then(() => true, () => false))) return;
  await app.locator('body').press('Escape').catch(() => {}); // press di dalam iframe, bukan halaman induk
  if (await wizard.waitFor({ state: 'hidden', timeout: 2000 }).then(() => false, () => true)) await lewati.click().catch(() => {});
}

// klik dengan percobaan ulang: klik bisa terhalang wizard/animasi sidebar sesaat (CS-19, CS-24 02/11)
export async function klikUlang(page: Page, target: Locator) {
  await expect(async () => {
    await tutupWizard(page, 500);
    await target.click({ timeout: 5000 });
  }).toPass(T);
}

// buka menu sidebar untuk UAT: menu yang tidak ada = FAIL (bukan skip seperti openMenu)
export async function bukaMenu(page: Page, nama: string) {
  await waitForNadia(page);
  await tutupWizard(page);
  const link = menuLink(page, nama);
  await expect(link, `menu "${nama}" tidak ditemukan di sidebar (nama atau struktur menu berubah?)`).toBeVisible(T);
  await klikUlang(page, link);
}

// buka submenu untuk UAT: klik induk sampai submenu terlihat (klik pertama kadang jatuh saat animasi, CS-02 01/11)
export async function bukaSubMenu(page: Page, induk: string, nama: string) {
  await waitForNadia(page);
  await tutupWizard(page);
  const sub = menuLink(page, nama);
  for (let i = 0; i < 3 && !(await sub.isVisible().catch(() => false)); i++) {
    await klikUlang(page, menuItem(page, induk));
    await sub.waitFor({ timeout: 5000 }).catch(() => {});
  }
  await klikUlang(page, sub);
  await tutupWizard(page);
}
